import "server-only";

import { createHmac, randomInt } from "node:crypto";

export const OTP_TTL_MINUTES = 10;
export const OTP_RESEND_SECONDS = 60;
export const OTP_MAX_ATTEMPTS = 5;

export function getOtpSecret(): string | null {
  const secret = process.env.OTP_SECRET;
  return secret && secret.length >= 32 ? secret : null;
}

export function generateOtp(): string {
  return randomInt(0, 1_000_000).toString().padStart(6, "0");
}

// Only this keyed hash is stored; the code itself never reaches the database.
export function hashOtp(email: string, code: string, secret: string): string {
  return createHmac("sha256", secret).update(`signup:${email}:${code}`).digest("hex");
}
