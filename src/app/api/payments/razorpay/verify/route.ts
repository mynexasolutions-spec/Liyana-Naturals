import { after, NextResponse } from "next/server";
import { paymentVerificationSchema } from "@/lib/checkout/schema";
import { sendOrderConfirmation } from "@/lib/orders/confirmation-email";
import { confirmCapturedPayment, isPaidResult } from "@/lib/orders/payments";
import {
  ensureCaptured,
  fetchRazorpayPayment,
  getRazorpayConfig,
  isValidSignature,
} from "@/lib/razorpay/server";
import { jsonError, readJsonBody } from "@/lib/security/request";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

// Called by the browser after checkout. The signature, which only Razorpay and
// this server can produce, is what authorizes the request (guests can check out).
export async function POST(request: Request) {
  const body = await readJsonBody(request, 2_000);
  if (!body.ok) return body.response;

  const parsed = paymentVerificationSchema.safeParse(body.data);
  if (!parsed.success) return jsonError("Invalid payment details.", 400);
  const {
    razorpay_order_id: razorpayOrderId,
    razorpay_payment_id: paymentId,
    razorpay_signature: signature,
  } = parsed.data;

  const config = getRazorpayConfig();
  if (!config) return jsonError("Online payment is unavailable.", 503);
  if (!isValidSignature(`${razorpayOrderId}|${paymentId}`, signature, config.keySecret)) {
    return jsonError("Payment verification failed.", 400);
  }

  try {
    const payment = await ensureCaptured(await fetchRazorpayPayment(paymentId));
    if (payment.order_id !== razorpayOrderId) {
      return jsonError("Payment does not match this order.", 400);
    }
    if (payment.status !== "captured") {
      return NextResponse.json({ status: "processing" }, { status: 202 });
    }

    const confirmation = await confirmCapturedPayment(createSupabaseAdminClient(), payment);
    if (!isPaidResult(confirmation)) {
      return NextResponse.json({ status: "processing" }, { status: 202 });
    }
    if (confirmation.order_id) {
      const orderId = confirmation.order_id;
      after(() => sendOrderConfirmation(orderId));
    }
    return NextResponse.json({
      status: confirmation.result === "needs_attention" ? "needs_attention" : "paid",
      orderNumber: confirmation.order_number,
    });
  } catch (error) {
    // The signature was valid, so the webhook will finish the job.
    console.error("[payments] Verification deferred:", error instanceof Error ? error.message : error);
    return NextResponse.json({ status: "processing" }, { status: 202 });
  }
}
