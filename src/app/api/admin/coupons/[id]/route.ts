import { NextResponse } from "next/server";
import { couponDatabaseError, couponUpdateSchema } from "@/lib/coupons/admin";
import { orderIdSchema as uuidSchema, readAdminRequest } from "@/lib/security/admin-route";
import { jsonError } from "@/lib/security/request";
import { getAdminSession } from "@/lib/supabase/admin-auth";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Context) {
  const body = await readAdminRequest(request);
  if (!body.ok) return body.response;
  const id = uuidSchema.safeParse((await params).id);
  const parsed = couponUpdateSchema.safeParse(body.data);
  if (!id.success) return jsonError("Invalid coupon.", 400);
  if (!parsed.success) return jsonError(parsed.error.issues[0]?.message ?? "Check the coupon details.", 400);

  const session = await getAdminSession();
  if (!session) return jsonError("Forbidden", 403);

  const { data: current, error: readError } = await session.supabase
    .from("coupons")
    .select("code")
    .eq("id", id.data)
    .maybeSingle();
  if (readError) return couponDatabaseError(readError, "updated");
  if (!current) return jsonError("Coupon not found.", 404);
  // Past orders and usage limits are tracked by code.
  if (parsed.data.code && parsed.data.code !== current.code) {
    return jsonError("The code cannot be changed. Create a new coupon instead.", 400);
  }

  const { min_subtotal: minimum, ...changes } = parsed.data;
  const { data, error } = await session.supabase
    .from("coupons")
    .update({ ...changes, ...(minimum === undefined ? {} : { min_subtotal: minimum ?? 0 }) })
    .eq("id", id.data)
    .select("*")
    .maybeSingle();
  if (error) return couponDatabaseError(error, "updated");
  return NextResponse.json({ coupon: data });
}

export async function DELETE(_request: Request, { params }: Context) {
  const session = await getAdminSession();
  if (!session) return jsonError("Forbidden", 403);
  const id = uuidSchema.safeParse((await params).id);
  if (!id.success) return jsonError("Invalid coupon.", 400);

  const { data, error } = await session.supabase.from("coupons").delete().eq("id", id.data).select("id");
  if (error) return couponDatabaseError(error, "deleted");
  if (!data?.length) return jsonError("Coupon not found.", 404);
  return NextResponse.json({ ok: true });
}
