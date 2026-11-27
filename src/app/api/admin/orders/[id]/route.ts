import { NextResponse } from "next/server";
import { z } from "zod";
import { orderIdSchema, readAdminRequest } from "@/lib/security/admin-route";
import { jsonError } from "@/lib/security/request";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getAdminSession } from "@/lib/supabase/admin-auth";

const updateSchema = z.object({
  status: z.enum(["pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "returned"]),
  paymentStatus: z.enum(["pending", "paid", "failed", "refunded"]),
  clearAttention: z.boolean().default(false),
});

const DELETE_REFUSALS: Record<string, [string, number]> = {
  not_found: ["Order not found.", 404],
  shipment_open: ["This order is booked with the courier. Cancel it in Shiprocket, set the order status to cancelled, then delete it.", 409],
  payment_open: ["The customer may still be paying for this order. Try again in a little while.", 409],
};

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getAdminSession())) return jsonError("Forbidden", 403);
  const id = orderIdSchema.safeParse((await params).id);
  if (!id.success) return jsonError("Invalid order.", 400);

  const { data, error } = await createSupabaseAdminClient().rpc("delete_order", { p_order_id: id.data });
  if (error || (data !== "deleted" && !DELETE_REFUSALS[String(data)])) {
    console.error("[admin-orders] Delete failed:", error?.message ?? data);
    return jsonError("The order could not be deleted.", 500);
  }
  if (data !== "deleted") {
    const [message, status] = DELETE_REFUSALS[String(data)];
    return jsonError(message, status);
  }
  return NextResponse.json({ ok: true });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const body = await readAdminRequest(request);
  if (!body.ok) return body.response;

  const id = orderIdSchema.safeParse((await params).id);
  const parsed = updateSchema.safeParse(body.data);
  if (!id.success || !parsed.success) return jsonError("Invalid order update.", 400);

  const { data, error } = await createSupabaseAdminClient()
    .from("orders")
    .update({
      status: parsed.data.status,
      payment_status: parsed.data.paymentStatus,
      ...(parsed.data.clearAttention ? { attention_note: null } : {}),
    })
    .eq("id", id.data)
    .select("id");
  if (error) {
    console.error("[admin-orders] Update failed:", error.message);
    return jsonError("The order could not be updated.", 500);
  }
  if (!data?.length) return jsonError("Order not found.", 404);
  return NextResponse.json({ ok: true });
}
