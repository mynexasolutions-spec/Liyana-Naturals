import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { itemLabel } from "@/lib/products/variants";
import {
  createAdhocOrder,
  fetchShiprocketOrder,
  ShiprocketError,
  trackByAwb,
} from "@/lib/shiprocket/client";
import {
  mapShiprocketStatus,
  nextOrderStatus,
  shipmentNotice,
  type OrderStatus,
  type TrackingScan,
} from "@/lib/shiprocket/shared";

export const SHIPMENT_COLUMNS =
  "id,status,awb_code,shiprocket_order_id,shiprocket_status,attention_note";

export type ShipmentOrder = {
  id: string;
  status: OrderStatus;
  awb_code: string | null;
  shiprocket_order_id: string | null;
  shiprocket_status: string | null;
  attention_note: string | null;
};

export type ShipmentUpdate = {
  status: string | null;
  awbCode?: string | null;
  courierName?: string | null;
  scans?: TrackingScan[];
};

/** The single place courier data is written to an order (webhook and sync). */
export async function applyShipmentUpdate(
  admin: SupabaseClient,
  order: ShipmentOrder,
  update: ShipmentUpdate,
  attempt = 0,
): Promise<void> {
  const incoming = mapShiprocketStatus(update.status);
  const status = nextOrderStatus(order.status, incoming);
  // A late "in transit" event must not replace the status of a delivered order.
  const isStale = order.status === "delivered" && incoming === "shipped";
  const notice = shipmentNotice(update.status);

  const patch: Record<string, unknown> = { shiprocket_synced_at: new Date().toISOString() };
  if (update.status && !isStale) patch.shiprocket_status = update.status.slice(0, 100);
  if (update.awbCode) patch.awb_code = update.awbCode;
  if (update.courierName) patch.courier_name = update.courierName.slice(0, 100);
  if (update.scans?.length) patch.tracking_scans = update.scans;
  if (status !== order.status) patch.status = status;
  // Never overwrite an existing note, for example a payment problem.
  if (notice && !order.attention_note) patch.attention_note = notice;

  // Only write if nobody changed the order status since it was read.
  const { data, error } = await admin
    .from("orders")
    .update(patch)
    .eq("id", order.id)
    .eq("status", order.status)
    .select("id");
  if (error) throw new Error(`Shipment update failed: ${error.message}`);
  if (data?.length) return;

  if (attempt >= 2) throw new Error("Shipment update kept conflicting.");
  const { data: latest, error: readError } = await admin
    .from("orders")
    .select(SHIPMENT_COLUMNS)
    .eq("id", order.id)
    // Must be a fresh read, not one Next.js remembered earlier in this request.
    .abortSignal(AbortSignal.timeout(10_000))
    .maybeSingle();
  if (readError) throw new Error(readError.message);
  if (latest) await applyShipmentUpdate(admin, latest as ShipmentOrder, update, attempt + 1);
}

/** Pulls the latest courier data for one order and saves it. */
export async function syncOrderFromShiprocket(
  admin: SupabaseClient,
  order: ShipmentOrder,
): Promise<void> {
  if (!order.shiprocket_order_id) return;

  const update: ShipmentUpdate = { status: null, awbCode: order.awb_code };
  if (!update.awbCode) {
    const remote = await fetchShiprocketOrder(order.shiprocket_order_id);
    Object.assign(update, remote);
  }
  if (update.awbCode) {
    const tracking = await trackByAwb(update.awbCode);
    update.status = tracking.status ?? update.status;
    update.courierName = tracking.courierName ?? update.courierName;
    update.scans = tracking.scans;
  }
  await applyShipmentUpdate(admin, order, update);
}

export type PackageDetails = {
  weightKg: number;
  lengthCm: number;
  breadthCm: number;
  heightCm: number;
};

export type ShipmentResult =
  | { ok: true; shiprocketOrderId: string }
  | { ok: false; error: string; status: number };

type OrderForShipping = {
  id: string;
  order_number: string;
  created_at: string;
  status: OrderStatus;
  payment_method: string | null;
  payment_status: string;
  stock_released: boolean;
  total: number | string;
  shipping_address: Record<string, string | undefined> | null;
  shiprocket_order_id: string | null;
  order_items: {
    product_id: string | null;
    product_name: string;
    variant_id: string | null;
    variant_name: string | null;
    quantity: number;
    unit_price: number | string;
  }[];
};

// Shiprocket expects "YYYY-MM-DD HH:mm" in India time.
function shiprocketDate(iso: string): string {
  return new Date(iso).toLocaleString("sv-SE", { timeZone: "Asia/Kolkata" }).slice(0, 16);
}

/** Sends one order to Shiprocket. The admin then picks a courier there. */
export async function createShipment(
  admin: SupabaseClient,
  orderId: string,
  parcel: PackageDetails,
): Promise<ShipmentResult> {
  const fail = (error: string, status = 409): ShipmentResult => ({ ok: false, error, status });

  const { data, error } = await admin
    .from("orders")
    .select(
      "id,order_number,created_at,status,payment_method,payment_status,stock_released,total,shipping_address,shiprocket_order_id,order_items(product_id,variant_id,product_name,variant_name,quantity,unit_price)",
    )
    .eq("id", orderId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return fail("Order not found.", 404);
  const order = data as unknown as OrderForShipping;

  if (order.shiprocket_order_id) {
    return { ok: true, shiprocketOrderId: order.shiprocket_order_id };
  }
  if (["cancelled", "returned", "delivered"].includes(order.status) || order.stock_released) {
    return fail("This order is closed or its stock was released, so it cannot be shipped.");
  }
  const isCod = order.payment_method === "cod";
  if (!isCod && order.payment_status !== "paid") {
    return fail("This online order is not paid, so it cannot be shipped.");
  }

  const address = order.shipping_address ?? {};
  const phone = (address.phone ?? "").replace(/\D/g, "").slice(-10);
  if (!address.fullName || !address.street || !address.city || !address.state || !address.pinCode) {
    return fail("This order does not have a complete shipping address.");
  }
  if (!/^[6-9]\d{9}$/.test(phone)) return fail("The customer's phone number is not a valid 10-digit mobile number.");
  if (!order.order_items?.length) return fail("This order has no items.");

  const pickupLocation = process.env.SHIPROCKET_PICKUP_LOCATION?.trim();
  if (!pickupLocation) {
    return fail("Set SHIPROCKET_PICKUP_LOCATION to the pickup address nickname from Shiprocket.", 503);
  }

  const { data: claimed, error: claimError } = await admin.rpc("claim_shipment", { p_order_id: order.id });
  if (claimError) throw new Error(claimError.message);
  if (claimed !== true) return fail("This order is already being sent. Refresh in a moment.");

  const release = () => admin.from("orders").update({ shiprocket_claimed_at: null }).eq("id", order.id);
  let created;
  try {
    const [firstName, ...rest] = address.fullName.trim().split(/\s+/);
    created = await createAdhocOrder({
      order_id: order.order_number,
      order_date: shiprocketDate(order.created_at),
      pickup_location: pickupLocation,
      billing_customer_name: firstName,
      billing_last_name: rest.join(" "),
      billing_address: address.street,
      billing_city: address.city,
      billing_pincode: address.pinCode,
      billing_state: address.state,
      billing_country: "India",
      billing_email: address.email,
      billing_phone: phone,
      shipping_is_billing: true,
      order_items: order.order_items.map((item) => ({
        name: itemLabel(item.product_name, item.variant_name),
        // Each size needs its own code: Shiprocket rejects repeats in one order.
        sku: item.variant_id ?? item.product_id ?? itemLabel(item.product_name, item.variant_name).slice(0, 50),
        units: item.quantity,
        selling_price: Number(item.unit_price),
      })),
      payment_method: isCod ? "COD" : "Prepaid",
      // The amount after discount and shipping: what a COD courier must collect.
      sub_total: Number(order.total),
      length: parcel.lengthCm,
      breadth: parcel.breadthCm,
      height: parcel.heightCm,
      weight: parcel.weightKg,
    });
  } catch (shipError) {
    await release();
    if (shipError instanceof ShiprocketError) return fail(shipError.message, 502);
    throw shipError;
  }

  const { error: saveError } = await admin
    .from("orders")
    .update({
      shiprocket_order_id: created.orderId,
      shiprocket_shipment_id: created.shipmentId,
      shiprocket_status: created.status,
      shiprocket_claimed_at: null,
    })
    .eq("id", order.id);
  if (saveError) {
    console.error(`[shiprocket] Created ${created.orderId} but saving failed: ${saveError.message}`);
    return fail(
      `Created on Shiprocket (order ${created.orderId}) but saving it here failed. Do not send it again.`,
      500,
    );
  }
  return { ok: true, shiprocketOrderId: created.orderId };
}
