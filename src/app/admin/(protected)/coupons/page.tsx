import { CouponManager, type AdminCoupon } from "@/components/admin/CouponManager";
import { fetchAll, requireAdminPage } from "@/lib/admin/server";

export default async function CouponsPage() {
  const { supabase } = await requireAdminPage();

  const [coupons, orders] = await Promise.all([
    supabase.from("coupons").select("*").order("created_at", { ascending: false }),
    // Cancelled orders give their coupon use back.
    fetchAll<{ coupon_code: string; discount: number | string }>("Orders", (from, to) =>
      supabase
        .from("orders")
        .select("coupon_code,discount")
        .not("coupon_code", "is", null)
        .neq("status", "cancelled")
        .order("id")
        .range(from, to),
    ),
  ]);
  if (coupons.error) throw new Error(`Coupons could not be loaded: ${coupons.error.message}`);

  const optional = (value: unknown) => (value === null ? null : Number(value));
  const list: AdminCoupon[] = (coupons.data ?? []).map((coupon) => {
    const used = orders.filter((order) => order.coupon_code === coupon.code);
    return {
      ...(coupon as AdminCoupon),
      value: Number(coupon.value),
      max_discount: optional(coupon.max_discount),
      min_subtotal: Number(coupon.min_subtotal),
      uses: used.length,
      discountGiven: used.reduce((total, order) => total + Number(order.discount), 0),
    };
  });

  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
  return <CouponManager coupons={list} today={today} />;
}
