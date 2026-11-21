import type { Metadata } from "next";
import { AuthPortalClient } from "@/components/auth/AuthPortalClient";

export const metadata: Metadata = {
  title: "Login",
  description:
    "Sign in to your Liyana Naturals account to continue your natural skincare journey.",
  openGraph: {
    title: "Login | Liyana Naturals",
    description:
      "Access your Liyana Naturals account, wishlist, and organic skincare rituals.",
  },
};

export default function LoginPage() {
  return <AuthPortalClient initialMode="login" />;
}
