import type { Metadata } from "next";
import { CheckoutClient } from "@/components/checkout/CheckoutClient";
import { toPaymentSettings } from "@/lib/checkout/pricing";
import { getRazorpayConfig } from "@/lib/razorpay/server";
import { getStorefrontSettings } from "@/lib/supabase/storefront";

export const metadata: Metadata = {
  title: "Checkout",
  description:
    "Complete your Liyana Naturals order with fast, secure shipping and flexible payment options.",
  openGraph: {
    title: "Checkout | Liyana Naturals",
    description:
      "Fast and secure checkout for pure organic skincare and haircare essentials.",
  },
};

export default async function CheckoutPage() {
  const payment = toPaymentSettings(await getStorefrontSettings());

  return (
    <CheckoutClient
      // Online payment is offered only when it is switched on and Razorpay is set up.
      payment={{ ...payment, onlineEnabled: payment.onlineEnabled && getRazorpayConfig() !== null }}
    />
  );
}
