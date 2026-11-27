import { createHash, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { jsonError } from "@/lib/security/request";
import { applyShipmentUpdate, SHIPMENT_COLUMNS, type ShipmentOrder } from "@/lib/shiprocket/orders";
import { parseScans } from "@/lib/shiprocket/shared";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

// Shiprocket status updates. The path avoids the words Shiprocket forbids in
// webhook URLs. Register it with the same token as SHIPROCKET_WEBHOOK_SECRET,
// which Shiprocket sends back in the `x-api-key` header.

const MAX_BODY_BYTES = 500_000;

const digest = (value: string) => createHash("sha256").update(value).digest();

function text(value: unknown): string | null {
  if (typeof value !== "string" && typeof value !== "number") return null;
  const result = String(value).trim();
  return result && result.length <= 100 ? result : null;
}

export async function POST(request: Request) {
  const secret = process.env.SHIPROCKET_WEBHOOK_SECRET;
  if (!secret) {
    console.error("[courier-webhook] SHIPROCKET_WEBHOOK_SECRET is not set.");
    return jsonError("Webhook is not configured.", 500);
  }
  const received = request.headers.get("x-api-key");
  if (!received || !timingSafeEqual(digest(received), digest(secret))) {
    return jsonError("Unauthorized.", 401);
  }

  let payload: Record<string, unknown>;
  try {
    const raw = await request.text();
    if (Buffer.byteLength(raw) > MAX_BODY_BYTES) return jsonError("Payload too large.", 413);
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("not an object");
    payload = parsed as Record<string, unknown>;
  } catch {
    return jsonError("Invalid payload.", 400);
  }

  // Payload versions differ: `order_id` may be Shiprocket's id or ours
  // (sometimes with a numeric suffix), and `sr_order_id` is Shiprocket's.
  const orderId = text(payload.order_id);
  const channelOrderId = text(payload.channel_order_id);
  const awbCode = text(payload.awb);
  const candidates: [column: string, value: string | null][] = [
    ["shiprocket_order_id", text(payload.sr_order_id)],
    ["shiprocket_order_id", orderId],
    ["order_number", channelOrderId],
    ["order_number", orderId],
    ["order_number", orderId?.replace(/_\d+$/, "") ?? null],
    ["awb_code", awbCode],
  ];

  try {
    const admin = createSupabaseAdminClient();
    let order: ShipmentOrder | null = null;
    for (const [column, value] of candidates) {
      if (!value) continue;
      const { data, error } = await admin
        .from("orders")
        .select(SHIPMENT_COLUMNS)
        .eq(column, value)
        .limit(1);
      if (error) throw new Error(error.message);
      if (data?.length) {
        order = data[0] as ShipmentOrder;
        break;
      }
    }
    // Unknown orders (including Shiprocket's test call) are acknowledged. Orders
    // never sent to Shiprocket and return shipments are left untouched.
    if (!order?.shiprocket_order_id || Number(payload.is_return) === 1) {
      return NextResponse.json({ received: true, ignored: true });
    }

    await applyShipmentUpdate(admin, order, {
      status: text(payload.current_status) ?? text(payload.shipment_status),
      awbCode,
      courierName: text(payload.courier_name),
      scans: parseScans(payload.scans),
    });
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[courier-webhook] Failed:", error instanceof Error ? error.message : error);
    return jsonError("Temporary failure.", 500);
  }
}
