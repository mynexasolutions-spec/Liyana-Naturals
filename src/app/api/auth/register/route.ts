import { NextResponse } from "next/server";
import { getOtpSecret, hashOtp, OTP_MAX_ATTEMPTS } from "@/lib/auth/otp";
import { firstValidationMessage, signupVerificationSchema } from "@/lib/auth/schema";
import { withinRateLimits } from "@/lib/security/rate-limit";
import { getClientIp, jsonError, readJsonBody } from "@/lib/security/request";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const OTP_ERRORS: Record<string, string> = {
  invalid: "That code is incorrect. Check your email and try again.",
  expired: "That code has expired. Request a new one.",
  locked: "Too many wrong attempts. Request a new code.",
  missing: "No active code for this email. Request a new one.",
};

// Creates the account only after the emailed code is confirmed.
export async function POST(request: Request) {
  const body = await readJsonBody(request, 4_000);
  if (!body.ok) return body.response;

  const parsed = signupVerificationSchema.safeParse(body.data);
  if (!parsed.success) return jsonError(firstValidationMessage(parsed.error), 400);
  const { fullName, mobile, password, otp } = parsed.data;
  const email = parsed.data.email.toLowerCase();

  const secret = getOtpSecret();
  if (!secret) return jsonError("Registration is unavailable right now.", 503);

  try {
    const admin = createSupabaseAdminClient();
    const allowed = await withinRateLimits(admin, [
      { scope: "register-ip", identifier: getClientIp(request), limit: 30, windowSeconds: 3600 },
    ]);
    if (!allowed) return jsonError("Too many attempts. Please try again later.", 429);

    const { data: status, error: otpError } = await admin.rpc("verify_email_otp", {
      p_email: email,
      p_otp_hash: hashOtp(email, otp, secret),
      p_max_attempts: OTP_MAX_ATTEMPTS,
    });
    if (otpError) throw new Error(otpError.message);
    if (status !== "ok") {
      return jsonError(OTP_ERRORS[String(status)] ?? OTP_ERRORS.invalid, 400);
    }

    const { error: createError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName, phone: mobile },
      // Only the server can set this. It lets the account page show guest
      // orders placed with this proven email.
      app_metadata: { verified_email: email },
    });
    if (createError) {
      if (createError.code === "email_exists" || /already/i.test(createError.message)) {
        return jsonError("An account with this email already exists. Use Login or Forgot Password.", 409);
      }
      if (createError.code === "weak_password") {
        return jsonError("Choose a stronger password, then request a new code.", 400);
      }
      throw new Error(createError.message);
    }

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    console.error("[register] Failed:", error instanceof Error ? error.message : error);
    return jsonError("Unable to create your account. Please try again.", 500);
  }
}
