import { NextResponse } from "next/server";
import { couponCreateSchema, couponDatabaseError } from "@/lib/coupons/admin";
import { readAdminRequest } from "@/lib/security/admin-route";
import { jsonError } from "@/lib/security/request";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getAdminSession } from "@/lib/supabase/admin-auth";

export async function GET() {
  // The signed-in admin's own client, so database access rules apply too.
  const session = await getAdminSession();
  if (!session) return jsonError("Forbidden", 403);

  const [{ data, error }, usage] = await Promise.all([
    session.supabase.from("coupons").select("*").order("created_at", { ascending: false }),
    createSupabaseAdminClient().rpc("coupon_usage_counts"),
  ]);
  if (error) return couponDatabaseError(error, "loaded");
  if (usage.error) return couponDatabaseError(usage.error, "loaded");

  const counts = (usage.data ?? {}) as Record<string, number>;
  return NextResponse.json({
    coupons: (data ?? []).map((coupon) => ({ ...coupon, times_used: counts[coupon.code] ?? 0 })),
  });
}

export async function POST(request: Request) {
  const body = await readAdminRequest(request);
  if (!body.ok) return body.response;
  const parsed = couponCreateSchema.safeParse(body.data);
  if (!parsed.success) return jsonError(parsed.error.issues[0]?.message ?? "Check the coupon details.", 400);

  const session = await getAdminSession();
  if (!session) return jsonError("Forbidden", 403);
  const { data, error } = await session.supabase.from("coupons").insert(parsed.data).select("*").single();
  if (error) return couponDatabaseError(error, "saved");
  return NextResponse.json({ coupon: data }, { status: 201 });
}
