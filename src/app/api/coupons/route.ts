import { NextResponse } from "next/server";
import { z } from "zod";
import { findRedeemableCoupon, listCheckoutCoupons } from "@/lib/coupons/server";
import { withinRateLimits } from "@/lib/security/rate-limit";
import { getClientIp, jsonError, readJsonBody } from "@/lib/security/request";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const applySchema = z.object({
  code: z.string().trim().toUpperCase().regex(/^[A-Z0-9_-]{3,30}$/),
  subtotal: z.number().min(0).max(100_000_000),
});

// Offers shown on the checkout page.
export async function GET() {
  try {
    const coupons = await listCheckoutCoupons(createSupabaseAdminClient());
    return NextResponse.json({ coupons }, { headers: { "cache-control": "no-store" } });
  } catch (error) {
    console.error("[coupons] List failed:", error instanceof Error ? error.message : error);
    return jsonError("Offers could not be loaded.", 500);
  }
}

// Checks a code typed at checkout. This only previews the discount: the order
// API checks the coupon again before charging.
export async function POST(request: Request) {
  const body = await readJsonBody(request, 1_000);
  if (!body.ok) return body.response;
  const parsed = applySchema.safeParse(body.data);
  if (!parsed.success) return jsonError("This coupon code is not valid.", 400);

  try {
    const admin = createSupabaseAdminClient();
    // Limits guessing of codes.
    const allowed = await withinRateLimits(admin, [
      { scope: "coupon-ip", identifier: getClientIp(request), limit: 30, windowSeconds: 600 },
    ]);
    if (!allowed) return jsonError("Too many coupon attempts. Please wait a few minutes.", 429);

    const result = await findRedeemableCoupon(admin, parsed.data.code, parsed.data.subtotal);
    return result.ok ? NextResponse.json({ coupon: result.coupon }) : jsonError(result.error, 400);
  } catch (error) {
    console.error("[coupons] Check failed:", error instanceof Error ? error.message : error);
    return jsonError("The coupon could not be checked. Please try again.", 500);
  }
}
