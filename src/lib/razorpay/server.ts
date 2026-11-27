import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

const API_BASE = "https://api.razorpay.com/v1";

export type RazorpayPayment = {
  id: string;
  order_id: string | null;
  amount: number;
  amount_refunded?: number;
  currency: string;
  status: "created" | "authorized" | "captured" | "refunded" | "failed";
};

export function getRazorpayConfig() {
  const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  return keyId && keySecret ? { keyId, keySecret } : null;
}

async function razorpayRequest<T>(path: string, body?: Record<string, unknown>): Promise<T> {
  const config = getRazorpayConfig();
  if (!config) throw new Error("Razorpay is not configured.");

  const response = await fetch(`${API_BASE}${path}`, {
    method: body ? "POST" : "GET",
    headers: {
      authorization: `Basic ${Buffer.from(`${config.keyId}:${config.keySecret}`).toString("base64")}`,
      ...(body ? { "content-type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
    signal: AbortSignal.timeout(10_000),
  });

  const result = (await response.json().catch(() => null)) as
    | (T & { error?: { description?: string } })
    | null;
  if (!response.ok || !result) {
    throw new Error(
      `Razorpay request failed (${response.status}): ${result?.error?.description ?? "no details"}`,
    );
  }
  return result;
}

export function createRazorpayOrder(input: { amountPaise: number; receipt: string; orderId: string }) {
  return razorpayRequest<{ id: string; amount: number; currency: string }>("/orders", {
    amount: input.amountPaise,
    currency: "INR",
    receipt: input.receipt,
    notes: { internal_order_id: input.orderId },
  });
}

export function fetchRazorpayPayment(paymentId: string) {
  return razorpayRequest<RazorpayPayment>(`/payments/${encodeURIComponent(paymentId)}`);
}

/**
 * Captures an authorized payment (needed when auto-capture is off). If another
 * request captured it first, the latest state is returned instead.
 */
export async function ensureCaptured(payment: RazorpayPayment): Promise<RazorpayPayment> {
  if (payment.status !== "authorized") return payment;
  try {
    return await razorpayRequest<RazorpayPayment>(
      `/payments/${encodeURIComponent(payment.id)}/capture`,
      { amount: payment.amount, currency: payment.currency },
    );
  } catch (error) {
    const latest = await fetchRazorpayPayment(payment.id);
    if (latest.status === "captured") return latest;
    throw error;
  }
}

/** Constant-time check of a hex HMAC-SHA256 signature. */
export function isValidSignature(payload: string, signature: string, secret: string): boolean {
  const expected = createHmac("sha256", secret).update(payload).digest();
  if (!/^[a-f0-9]{64}$/i.test(signature)) return false;
  return timingSafeEqual(expected, Buffer.from(signature, "hex"));
}
