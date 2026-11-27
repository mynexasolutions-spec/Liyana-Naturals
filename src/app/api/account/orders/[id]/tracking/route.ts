import { NextResponse } from "next/server";
import { getCustomerOrder, getSignedInCustomer, trackingSnapshot } from "@/lib/account/orders";
import { jsonError } from "@/lib/security/request";

// Polled by the order page. Reads saved data only and never calls Shiprocket.
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getSignedInCustomer();
    if (!user) return jsonError("Sign in to view this order.", 401);
    const order = await getCustomerOrder(user, (await params).id);
    if (!order) return jsonError("Order not found.", 404);
    return NextResponse.json(
      { snapshot: trackingSnapshot(order) },
      { headers: { "cache-control": "private, no-store" } },
    );
  } catch (error) {
    console.error("[account] Tracking check failed:", error instanceof Error ? error.message : error);
    return jsonError("Tracking is unavailable.", 500);
  }
}
