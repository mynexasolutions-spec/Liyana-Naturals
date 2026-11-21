import type { Metadata } from "next";
import { CheckoutClient } from "@/components/checkout/CheckoutClient";

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

export default function CheckoutPage() {
  return <CheckoutClient />;
}
