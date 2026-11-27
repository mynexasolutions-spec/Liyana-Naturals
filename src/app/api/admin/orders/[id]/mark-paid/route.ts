import { NextResponse } from "next/server";
import { orderIdSchema, readAdminRequest } from "@/lib/security/admin-route";
import { jsonError } from "@/lib/security/request";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const REFUSALS: Record<string, [string, number]> = {
  not_found: ["Order not found.", 404],
  cash_order: ["This is a Cash on Delivery order. Change its payment status on the order page.", 409],
  already_paid: ["This order is already paid.", 409],
  closed: ["This order is cancelled or returned. Change its status first.", 409],
};

/** The admin confirms that money for an unpaid online order was received. */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const body = await readAdminRequest(request);
  if (!body.ok) return body.response;
  const id = orderIdSchema.safeParse((await params).id);
  if (!id.success) return jsonError("Invalid order.", 400);

  const { data, error } = await createSupabaseAdminClient().rpc("mark_order_paid", { p_order_id: id.data });
  const result = String(data);
  if (!error && (result === "paid" || result === "paid_no_stock")) {
    return NextResponse.json({ ok: true, result });
  }
  if (!error && REFUSALS[result]) return jsonError(...REFUSALS[result]);

  console.error("[admin-orders] Mark paid failed:", error?.message ?? result);
  return jsonError("The order could not be marked as paid.", 500);
}
