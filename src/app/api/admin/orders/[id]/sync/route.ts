import { NextResponse } from "next/server";
import { orderIdSchema, readAdminRequest } from "@/lib/security/admin-route";
import { jsonError } from "@/lib/security/request";
import { ShiprocketError } from "@/lib/shiprocket/client";
import { SHIPMENT_COLUMNS, syncOrderFromShiprocket, type ShipmentOrder } from "@/lib/shiprocket/orders";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const body = await readAdminRequest(request);
  if (!body.ok) return body.response;
  const id = orderIdSchema.safeParse((await params).id);
  if (!id.success) return jsonError("Invalid order.", 400);

  try {
    const admin = createSupabaseAdminClient();
    const { data, error } = await admin
      .from("orders")
      .select(SHIPMENT_COLUMNS)
      .eq("id", id.data)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) return jsonError("Order not found.", 404);
    if (!data.shiprocket_order_id) return jsonError("This order has not been sent to Shiprocket.", 409);

    await syncOrderFromShiprocket(admin, data as ShipmentOrder);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof ShiprocketError) return jsonError(error.message, 502);
    console.error("[admin-sync] Failed:", error instanceof Error ? error.message : error);
    return jsonError("Status could not be synced.", 500);
  }
}
