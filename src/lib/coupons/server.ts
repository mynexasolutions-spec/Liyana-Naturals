import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { CouponRule } from "@/lib/coupons/shared";

const COLUMNS =
  "code,label,discount_type,value,max_discount,min_subtotal,starts_on,expires_on,usage_limit,is_active";

type CouponRow = {
  code: string;
  label: string;
  discount_type: "percent" | "fixed";
  value: number | string;
  max_discount: number | string | null;
  min_subtotal: number | string;
  starts_on: string | null;
  expires_on: string | null;
  usage_limit: number | null;
  is_active: boolean;
};

export const COUPON_NOT_VALID = "This coupon code is not valid.";

// Coupon dates are whole days in India time.
function isLive(row: CouponRow): boolean {
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
  return (
    row.is_active &&
    (!row.starts_on || today >= row.starts_on) &&
    (!row.expires_on || today <= row.expires_on)
  );
}

function toRule(row: CouponRow): CouponRule {
  return {
    code: row.code,
    label: row.label,
    discountType: row.discount_type,
    value: Number(row.value),
    maxDiscount: row.max_discount === null ? null : Number(row.max_discount),
    minSubtotal: Number(row.min_subtotal),
  };
}

async function usedUp(admin: SupabaseClient, row: CouponRow): Promise<boolean> {
  if (row.usage_limit === null) return false;
  const { data, error } = await admin.rpc("coupon_use_count", { p_code: row.code });
  if (error) throw new Error(`Coupon usage could not be checked: ${error.message}`);
  return Number(data) >= row.usage_limit;
}

/** Looks up a code for a cart. The per-customer limit is checked when the order is placed. */
export async function findRedeemableCoupon(
  admin: SupabaseClient,
  code: string,
  subtotal: number,
): Promise<{ ok: true; coupon: CouponRule } | { ok: false; error: string }> {
  const { data, error } = await admin.from("coupons").select(COLUMNS).eq("code", code).maybeSingle();
  if (error) throw new Error(`Coupon could not be loaded: ${error.message}`);
  const row = data as CouponRow | null;
  // One message for unknown, disabled and expired codes, so codes cannot be probed.
  if (!row || !isLive(row)) return { ok: false, error: COUPON_NOT_VALID };
  if (await usedUp(admin, row)) return { ok: false, error: "This coupon has been fully used." };

  const coupon = toRule(row);
  if (subtotal < coupon.minSubtotal) {
    const missing = Math.ceil(coupon.minSubtotal - subtotal);
    return { ok: false, error: `Add ₹${missing.toLocaleString("en-IN")} more to use ${coupon.code}.` };
  }
  return { ok: true, coupon };
}

/** Offers the admin chose to show on the checkout page. */
export async function listCheckoutCoupons(admin: SupabaseClient): Promise<CouponRule[]> {
  const { data, error } = await admin
    .from("coupons")
    .select(COLUMNS)
    .eq("is_active", true)
    .eq("show_on_checkout", true)
    .order("created_at", { ascending: true })
    .limit(10);
  if (error) throw new Error(`Coupons could not be loaded: ${error.message}`);

  const offers: CouponRule[] = [];
  for (const row of (data ?? []) as CouponRow[]) {
    if (isLive(row) && !(await usedUp(admin, row))) offers.push(toRule(row));
  }
  return offers;
}
