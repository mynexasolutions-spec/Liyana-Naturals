import { NextResponse } from "next/server";
import { readAdminRequest } from "@/lib/security/admin-route";
import { jsonError } from "@/lib/security/request";
import { SHIPMENT_COLUMNS, syncOrderFromShiprocket, type ShipmentOrder } from "@/lib/shiprocket/orders";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

// Keeps one request within hosting time limits. Click again for the rest.
const BATCH_SIZE = 25;

export const maxDuration = 60;

// Catch-up for open shipments in case a webhook was missed.
export async function POST(request: Request) {
  const body = await readAdminRequest(request);
  if (!body.ok) return body.response;

  try {
    const admin = createSupabaseAdminClient();
    const { data, error } = await admin
      .from("orders")
      .select(SHIPMENT_COLUMNS)
      .not("shiprocket_order_id", "is", null)
      .in("status", ["pending", "confirmed", "processing", "shipped"])
      .order("shiprocket_synced_at", { ascending: true, nullsFirst: true })
      .limit(BATCH_SIZE);
    if (error) throw new Error(error.message);

    let synced = 0;
    let failed = 0;
    let firstError = "";
    const startedAt = Date.now();
    for (const order of (data ?? []) as ShipmentOrder[]) {
      if (Date.now() - startedAt > 45_000) break;
      try {
        await syncOrderFromShiprocket(admin, order);
        synced += 1;
      } catch (syncError) {
        failed += 1;
        firstError ||= syncError instanceof Error ? syncError.message : "Unknown error";
        // Move it to the back of the queue so it cannot block the others.
        await admin
          .from("orders")
          .update({ shiprocket_synced_at: new Date().toISOString() })
          .eq("id", order.id);
        if (synced === 0 && failed >= 3) break;
      }
      // Shiprocket rate-limits its API.
      await new Promise((resolve) => setTimeout(resolve, 350));
    }
    return NextResponse.json({ synced, failed, error: firstError.slice(0, 200) });
  } catch (error) {
    console.error("[admin-sync-all] Failed:", error instanceof Error ? error.message : error);
    return jsonError("Shipments could not be synced.", 500);
  }
}
