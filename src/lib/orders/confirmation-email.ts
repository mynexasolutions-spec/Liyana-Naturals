import "server-only";

import { sendEmail } from "@/lib/email/brevo";
import { orderConfirmationEmail } from "@/lib/email/templates";
import { itemLabel } from "@/lib/products/variants";
import { getSupportContact } from "@/lib/settings/support";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

/**
 * Sends the confirmation at most once. The order is claimed first, so the verify
 * request and the webhook cannot both send it; a failed send releases the claim.
 */
export async function sendOrderConfirmation(orderId: string): Promise<void> {
  try {
    const admin = createSupabaseAdminClient();
    const { data: order, error } = await admin
      .from("orders")
      .update({ confirmation_email_sent_at: new Date().toISOString() })
      .eq("id", orderId)
      .is("confirmation_email_sent_at", null)
      .select(
        "order_number,payment_method,attention_note,subtotal,discount,shipping,total,shipping_address,order_items(product_name,variant_name,quantity,total)",
      )
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!order) return;

    const address = (order.shipping_address ?? {}) as Record<string, string | undefined>;
    const support = await getSupportContact();
    const sent = address.email
      ? await sendEmail({
          to: address.email,
          ...orderConfirmationEmail({
            support,
            orderNumber: order.order_number,
            customerName: address.fullName ?? "there",
            paymentMethod: order.payment_method === "cod" ? "cod" : "razorpay",
            needsAttention: Boolean(order.attention_note),
            items: order.order_items.map((item) => ({
              name: itemLabel(item.product_name, item.variant_name),
              quantity: item.quantity,
              total: Number(item.total),
            })),
            subtotal: Number(order.subtotal),
            discount: Number(order.discount),
            shipping: Number(order.shipping),
            total: Number(order.total),
            addressLines: [
              address.street,
              [address.city, address.state, address.pinCode].filter(Boolean).join(", "),
              address.phone ? `Phone: ${address.phone}` : undefined,
            ].filter((line): line is string => Boolean(line)),
          }),
        })
      : false;

    if (!sent) {
      await admin.from("orders").update({ confirmation_email_sent_at: null }).eq("id", orderId);
    }
  } catch (error) {
    console.error(
      `[orders] Confirmation email failed for order ${orderId}:`,
      error instanceof Error ? error.message : error,
    );
  }
}
