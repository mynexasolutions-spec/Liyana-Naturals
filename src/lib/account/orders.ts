import "server-only";

import type { User } from "@supabase/supabase-js";
import { syncOrderFromShiprocket } from "@/lib/shiprocket/orders";
import { parseScans, type OrderStatus } from "@/lib/shiprocket/shared";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// Customers have no database access to orders. These functions are the only way
// they read them, and every query is limited to the signed-in customer.

const COLUMNS =
  "id,order_number,created_at,status,payment_method,payment_status,razorpay_order_id,razorpay_payment_id,subtotal,discount,coupon_code,shipping,total,shipping_address,auth_user_id,shiprocket_order_id,awb_code,courier_name,shiprocket_status,attention_note,tracking_scans,shiprocket_synced_at,processing_at,shipped_at,delivered_at,order_items(id,product_name,variant_name,quantity,total,products(images))";

// Opening an order page refreshes courier data at most this often.
const SYNC_AFTER_MS = 5 * 60 * 1000;

export type CustomerOrder = {
  id: string;
  order_number: string;
  created_at: string;
  status: OrderStatus;
  payment_method: string | null;
  payment_status: string;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  subtotal: number | string;
  discount: number | string;
  coupon_code: string | null;
  shipping: number | string;
  total: number | string;
  shipping_address: Record<string, string | undefined> | null;
  auth_user_id: string | null;
  shiprocket_order_id: string | null;
  awb_code: string | null;
  courier_name: string | null;
  shiprocket_status: string | null;
  attention_note: string | null;
  tracking_scans: unknown;
  shiprocket_synced_at: string | null;
  processing_at: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  order_items: {
    id: string;
    product_name: string;
    variant_name: string | null;
    quantity: number;
    total: number | string;
    /** Null when the product has since been deleted. */
    products: { images: unknown } | null;
  }[];
};

export async function getSignedInCustomer(): Promise<User | null> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  return data.user;
}

/**
 * The email this account proved it owns by entering our emailed code. Only the
 * server can write app_metadata, and a later email change does not carry over.
 */
function verifiedEmail(user: User): string | null {
  const verified = user.app_metadata?.verified_email;
  return typeof verified === "string" && verified === user.email?.toLowerCase() ? verified : null;
}

function canView(user: User, order: CustomerOrder): boolean {
  const email = verifiedEmail(user);
  return order.auth_user_id === user.id || (email !== null && order.shipping_address?.email === email);
}

// Online orders appear only once paid, so abandoned payments stay hidden.
function isPlaced(order: CustomerOrder): boolean {
  return order.payment_method !== "razorpay" || ["paid", "refunded"].includes(order.payment_status);
}

export async function listCustomerOrders(user: User): Promise<CustomerOrder[]> {
  const admin = createSupabaseAdminClient();
  const query = (column: string, value: string) =>
    admin.from("orders").select(COLUMNS).eq(column, value).order("created_at", { ascending: false }).limit(100);

  const email = verifiedEmail(user);
  const results = await Promise.all([
    query("auth_user_id", user.id),
    ...(email ? [query("shipping_address->>email", email)] : []),
  ]);

  const orders = new Map<string, CustomerOrder>();
  for (const { data, error } of results) {
    if (error) throw new Error(`Orders could not be loaded: ${error.message}`);
    for (const order of (data ?? []) as unknown as CustomerOrder[]) {
      if (canView(user, order) && isPlaced(order)) orders.set(order.id, order);
    }
  }
  return [...orders.values()].sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export async function getCustomerOrder(user: User, orderId: string): Promise<CustomerOrder | null> {
  if (!/^[0-9a-f-]{36}$/i.test(orderId)) return null;
  const { data, error } = await createSupabaseAdminClient()
    .from("orders")
    .select(COLUMNS)
    .eq("id", orderId)
    // A request with its own signal is never reused by Next.js, so reading again
    // after a tracking refresh returns the new data.
    .abortSignal(AbortSignal.timeout(10_000))
    .maybeSingle();
  if (error) throw new Error(`Order could not be loaded: ${error.message}`);
  const order = data as unknown as CustomerOrder | null;
  return order && canView(user, order) && isPlaced(order) ? order : null;
}

/** Best effort: the page still shows saved data if Shiprocket is unavailable. */
export async function refreshTracking(user: User, order: CustomerOrder): Promise<CustomerOrder> {
  const isOpen = !["delivered", "cancelled", "returned"].includes(order.status);
  const isDue =
    !order.shiprocket_synced_at ||
    Date.now() - new Date(order.shiprocket_synced_at).getTime() > SYNC_AFTER_MS;
  if (!order.shiprocket_order_id || !isOpen || !isDue) return order;

  try {
    await syncOrderFromShiprocket(createSupabaseAdminClient(), order);
    return (await getCustomerOrder(user, order.id)) ?? order;
  } catch (error) {
    console.error("[account] Tracking refresh failed:", error instanceof Error ? error.message : error);
    return order;
  }
}

/** Changes whenever something shown on the order page changes. */
export function trackingSnapshot(order: CustomerOrder): string {
  return JSON.stringify([
    order.status,
    order.payment_status,
    order.awb_code,
    order.courier_name,
    order.shiprocket_status,
    parseScans(order.tracking_scans).length,
  ]);
}
