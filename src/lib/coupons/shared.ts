// Shared by checkout and the server. The database repeats this calculation when
// the order is placed, so the two must stay identical.

/** What a shopper may know about a coupon they can use. */
export type CouponRule = {
  code: string;
  label: string;
  discountType: "percent" | "fixed";
  value: number;
  maxDiscount: number | null;
  minSubtotal: number;
};

export function calculateCouponDiscount(coupon: CouponRule | null, subtotal: number): number {
  if (!coupon || subtotal <= 0 || subtotal < coupon.minSubtotal) return 0;
  // Percentages round to whole rupees. Integer maths avoids decimal drift.
  const raw =
    coupon.discountType === "percent"
      ? Math.round((Math.round(subtotal * 100) * Math.round(coupon.value * 100)) / 1_000_000)
      : coupon.value;
  return Math.min(raw, coupon.maxDiscount ?? subtotal, subtotal);
}
