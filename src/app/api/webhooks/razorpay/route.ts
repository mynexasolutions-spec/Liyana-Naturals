import { after, NextResponse } from "next/server";
import { sendOrderConfirmation } from "@/lib/orders/confirmation-email";
import { confirmCapturedPayment, isPaidResult } from "@/lib/orders/payments";
import {
  ensureCaptured,
  fetchRazorpayPayment,
  isValidSignature,
  type RazorpayPayment,
} from "@/lib/razorpay/server";
import { jsonError } from "@/lib/security/request";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const MAX_BODY_BYTES = 500_000;

type WebhookEvent = {
  event?: string;
  payload?: { payment?: { entity?: RazorpayPayment } };
};

// Responses: 2xx stops retries; 5xx makes Razorpay deliver the event again.
// Events for orders this store does not own are acknowledged and ignored.
export async function POST(request: Request) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) {
    console.error("[webhook] RAZORPAY_WEBHOOK_SECRET is not set.");
    return jsonError("Webhook is not configured.", 500);
  }

  const signature = request.headers.get("x-razorpay-signature");
  if (!signature) return jsonError("Missing signature.", 400);
  if (Number(request.headers.get("content-length") ?? 0) > MAX_BODY_BYTES) {
    return jsonError("Payload too large.", 413);
  }

  let event: WebhookEvent;
  try {
    // The signature covers the exact bytes, so verify before parsing.
    const raw = await request.text();
    if (Buffer.byteLength(raw) > MAX_BODY_BYTES) return jsonError("Payload too large.", 413);
    if (!isValidSignature(raw, signature, secret)) return jsonError("Invalid signature.", 400);
    event = JSON.parse(raw) as WebhookEvent;
  } catch {
    return jsonError("Invalid payload.", 400);
  }

  const payment = event.payload?.payment?.entity;
  if (!payment?.id) return NextResponse.json({ received: true });

  try {
    const admin = createSupabaseAdminClient();

    switch (event.event) {
      case "payment.authorized":
      case "payment.captured":
      case "order.paid": {
        if (!payment.order_id) break;
        // Look up first: never capture a payment that belongs to another app.
        const { data: order, error } = await admin
          .from("orders")
          .select("id,payment_status")
          .eq("razorpay_order_id", payment.order_id)
          .maybeSingle();
        if (error) throw new Error(error.message);
        if (!order) break;

        // An "authorized" event can arrive late, so act on the payment's current state.
        const isAuthorized = event.event === "payment.authorized";
        if (isAuthorized && ["paid", "refunded"].includes(order.payment_status)) break;
        const captured = await ensureCaptured(
          isAuthorized ? await fetchRazorpayPayment(payment.id) : payment,
        );
        if (captured.status !== "captured") break;

        const confirmation = await confirmCapturedPayment(admin, captured);
        if (isPaidResult(confirmation) && confirmation.order_id) {
          const orderId = confirmation.order_id;
          after(() => sendOrderConfirmation(orderId));
        }
        break;
      }

      case "payment.failed": {
        if (!payment.order_id) break;
        // Only a still-pending order can fail; a success is never overwritten.
        const { error } = await admin
          .from("orders")
          .update({ payment_status: "failed" })
          .eq("razorpay_order_id", payment.order_id)
          .eq("payment_status", "pending");
        if (error) throw new Error(error.message);
        break;
      }

      case "refund.processed": {
        const refunded = payment.amount_refunded ?? 0;
        const isFull = refunded >= payment.amount;
        const { error } = await admin
          .from("orders")
          .update(
            isFull
              ? { payment_status: "refunded" }
              : { attention_note: `Partial refund: ₹${refunded / 100} of ₹${payment.amount / 100}.` },
          )
          .eq("razorpay_payment_id", payment.id);
        if (error) throw new Error(error.message);
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error(
      `[webhook] Failed to process ${event.event} for ${payment.id}:`,
      error instanceof Error ? error.message : error,
    );
    return jsonError("Temporary failure.", 500);
  }
}
