import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { RazorpayPayment } from "@/lib/razorpay/server";

export type PaymentConfirmation = {
  result: "confirmed" | "already_paid" | "needs_attention" | "amount_mismatch" | "not_found";
  order_id?: string;
  order_number?: string;
};

/** Marks the matching order paid. The database function is idempotent. */
export async function confirmCapturedPayment(
  admin: SupabaseClient,
  payment: RazorpayPayment,
): Promise<PaymentConfirmation> {
  if (payment.status !== "captured" || !payment.order_id) {
    throw new Error(`Payment ${payment.id} is not a captured order payment.`);
  }
  const { data, error } = await admin.rpc("confirm_razorpay_payment", {
    p_razorpay_order_id: payment.order_id,
    p_payment_id: payment.id,
    p_amount_paise: payment.amount,
    p_currency: payment.currency,
  });
  if (error) throw new Error(`Payment confirmation failed: ${error.message}`);

  const confirmation = data as PaymentConfirmation;
  if (confirmation.result === "amount_mismatch" || confirmation.result === "needs_attention") {
    console.error(`[payments] Order ${confirmation.order_number} needs attention (${confirmation.result}).`);
  }
  return confirmation;
}

export function isPaidResult(confirmation: PaymentConfirmation): boolean {
  return ["confirmed", "already_paid", "needs_attention"].includes(confirmation.result);
}
