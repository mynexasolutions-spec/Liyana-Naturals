import { NextResponse } from "next/server";
import { z } from "zod";
import {
  generateOtp,
  getOtpSecret,
  hashOtp,
  OTP_RESEND_SECONDS,
  OTP_TTL_MINUTES,
} from "@/lib/auth/otp";
import { authEmailSchema } from "@/lib/auth/schema";
import { isEmailConfigured, sendEmail } from "@/lib/email/brevo";
import { existingAccountEmail, otpEmail } from "@/lib/email/templates";
import { withinRateLimits } from "@/lib/security/rate-limit";
import { getClientIp, jsonError, readJsonBody } from "@/lib/security/request";
import { getSupportContact } from "@/lib/settings/support";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const requestSchema = z.object({ email: authEmailSchema.max(254) });

// Sends a signup verification code.
export async function POST(request: Request) {
  const body = await readJsonBody(request, 2_000);
  if (!body.ok) return body.response;

  const parsed = requestSchema.safeParse(body.data);
  if (!parsed.success) return jsonError("Enter a valid email address.", 400);
  const email = parsed.data.email.toLowerCase();

  const secret = getOtpSecret();
  if (!secret || !isEmailConfigured()) {
    console.error("[otp] OTP_SECRET or Brevo settings are missing.");
    return jsonError("Email verification is unavailable right now. Please try again later.", 503);
  }

  try {
    const admin = createSupabaseAdminClient();
    const allowed = await withinRateLimits(admin, [
      { scope: "otp-ip", identifier: getClientIp(request), limit: 10, windowSeconds: 3600 },
      { scope: "otp-email", identifier: email, limit: 5, windowSeconds: 3600 },
    ]);
    if (!allowed) return jsonError("Too many code requests. Please try again later.", 429);

    const code = generateOtp();
    const { data: stored, error: storeError } = await admin.rpc("store_email_otp", {
      p_email: email,
      p_otp_hash: hashOtp(email, code, secret),
      p_ttl_seconds: OTP_TTL_MINUTES * 60,
      p_cooldown_seconds: OTP_RESEND_SECONDS,
    });
    if (storeError) throw new Error(storeError.message);
    if (stored !== true) {
      return jsonError("Please wait a minute before requesting another code.", 429);
    }

    const { data: existing, error: lookupError } = await admin
      .from("profiles")
      .select("id")
      .eq("email", email)
      .limit(1);
    if (lookupError) throw new Error(lookupError.message);

    // Same response either way, so this endpoint cannot reveal who has an account.
    const support = await getSupportContact();
    const message = existing?.length ? existingAccountEmail(support) : otpEmail(code, OTP_TTL_MINUTES, support);
    if (!(await sendEmail({ to: email, ...message }))) {
      await admin.from("email_otps").delete().eq("email", email);
      return jsonError("We could not send the email. Please try again.", 502);
    }

    return NextResponse.json({ ok: true, resendSeconds: OTP_RESEND_SECONDS });
  } catch (error) {
    console.error("[otp] Sending failed:", error instanceof Error ? error.message : error);
    return jsonError("We could not send a code. Please try again shortly.", 500);
  }
}
