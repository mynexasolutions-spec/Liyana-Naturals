import type { Metadata } from "next";
import { AuthPortalClient } from "@/components/auth/AuthPortalClient";

export const metadata: Metadata = {
  title: "Create Account",
  description:
    "Join Liyana Naturals and explore pure, botanically crafted skincare and haircare essentials.",
  openGraph: {
    title: "Create Account | Liyana Naturals",
    description:
      "Create your Liyana Naturals account and discover pure botanical beauty.",
  },
};

export default function RegisterPage() {
  return <AuthPortalClient initialMode="register" />;
}
