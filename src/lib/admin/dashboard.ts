import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { isCashDue, isPlaced, isReadyToShip, isSale } from "@/lib/orders/rules";
import type { OrderStatus } from "@/lib/shiprocket/shared";

const PAGE_SIZE = 1000;
const MAX_PAGES = 50;
const DAYS = 30;
export const LOW_STOCK_LIMIT = 5;

const ORDER_COLUMNS =
  "id,order_number,created_at,status,payment_status,payment_method,total,attention_note,shiprocket_order_id,stock_released,shipping_address,order_items(product_name,quantity,total)";

type OrderRow = {
  id: string;
  order_number: string;
  created_at: string;
  status: OrderStatus;
  payment_status: string;
  payment_method: string | null;
  total: number | string;
  attention_note: string | null;
  shiprocket_order_id: string | null;
  stock_released: boolean;
  shipping_address: { fullName?: string } | null;
  order_items: { product_name: string; quantity: number; total: number | string }[] | null;
};

const indiaDate = (time: number | string) =>
  new Date(time).toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });

const sum = (orders: OrderRow[]) => orders.reduce((total, order) => total + Number(order.total), 0);

async function fetchOrders(supabase: SupabaseClient) {
  const orders: OrderRow[] = [];
  // The database returns at most 1000 rows per request.
  for (let page = 0; page < MAX_PAGES; page += 1) {
    const { data, error } = await supabase
      .from("orders")
      .select(ORDER_COLUMNS)
      .order("created_at", { ascending: false })
      .order("id")
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);
    if (error) throw new Error(`Orders: ${error.message}`);
    orders.push(...((data ?? []) as unknown as OrderRow[]));
    if ((data?.length ?? 0) < PAGE_SIZE) return { orders, complete: true };
  }
  return { orders, complete: false };
}

function checkedCount(label: string, result: { count: number | null; error: { message: string } | null }) {
  if (result.error) throw new Error(`${label}: ${result.error.message}`);
  return result.count ?? 0;
}

export async function getDashboardData(supabase: SupabaseClient) {
  const countOf = (table: string) => supabase.from(table).select("id", { count: "exact", head: true });

  const [orderData, lowStock, activeProducts, customers, categories, inquiries, reviews, coupons] =
    await Promise.all([
      fetchOrders(supabase),
      supabase
        .from("products")
        .select("id,name,stock_quantity", { count: "exact" })
        .eq("is_active", true)
        .lte("stock_quantity", LOW_STOCK_LIMIT)
        .order("stock_quantity", { ascending: true })
        .limit(6),
      countOf("products").eq("is_active", true),
      countOf("customers"),
      countOf("categories").eq("is_active", true),
      countOf("inquiries").eq("status", "new"),
      countOf("reviews").eq("status", "pending"),
      countOf("coupons").eq("is_active", true),
    ]);
  if (lowStock.error) throw new Error(`Products: ${lowStock.error.message}`);

  const now = Date.now();
  const dayKeys = (offset: number) =>
    Array.from({ length: DAYS }, (_, index) => indiaDate(now - (offset + DAYS - 1 - index) * 86_400_000));
  const currentDays = dayKeys(0);
  const previousDays = new Set(dayKeys(DAYS));
  const current = new Set(currentDays);

  const { orders } = orderData;
  const placed = orders.filter(isPlaced);
  const live = placed.filter((order) => order.status !== "cancelled");
  const sales = orders.filter(isSale);
  const inPeriod = (list: OrderRow[], days: Set<string>) =>
    list.filter((order) => days.has(indiaDate(order.created_at)));
  const recentSales = inPeriod(sales, current);
  const cashDue = orders.filter(isCashDue);

  const daily = new Map(currentDays.map((date) => [date, { date, revenue: 0, orders: 0 }]));
  const products = new Map<string, { name: string; quantity: number; amount: number }>();
  for (const order of recentSales) {
    const day = daily.get(indiaDate(order.created_at));
    if (day) {
      day.revenue += Number(order.total);
      day.orders += 1;
    }
    for (const item of order.order_items ?? []) {
      const entry = products.get(item.product_name) ?? { name: item.product_name, quantity: 0, amount: 0 };
      entry.quantity += item.quantity;
      entry.amount += Number(item.total);
      products.set(item.product_name, entry);
    }
  }

  // Cancelled and returned orders are not charted.
  const statuses: OrderStatus[] = ["pending", "confirmed", "processing", "shipped", "delivered"];

  return {
    complete: orderData.complete,
    revenue: {
      period: sum(recentSales),
      previous: sum(inPeriod(sales, previousDays)),
      allTime: sum(sales),
      salesCount: recentSales.length,
    },
    orders: {
      period: inPeriod(live, current).length,
      previous: inPeriod(live, previousDays).length,
      allTime: live.length,
    },
    cashDue: { amount: sum(cashDue), count: cashDue.length },
    actions: {
      toShip: placed.filter(isReadyToShip).length,
      inTransit: orders.filter((order) => order.status === "shipped").length,
      attention: orders.filter((order) => order.attention_note).length,
      inquiries: checkedCount("Inquiries", inquiries),
      reviews: checkedCount("Reviews", reviews),
      lowStock: lowStock.count ?? 0,
    },
    daily: [...daily.values()],
    statusCounts: statuses.map((status) => ({
      status,
      count: placed.filter((order) => order.status === status).length,
    })),
    recentOrders: placed.slice(0, 6).map((order) => ({
      id: order.id,
      orderNumber: order.order_number,
      createdAt: order.created_at,
      customer: order.shipping_address?.fullName ?? "—",
      method: order.payment_method,
      paymentStatus: order.payment_status,
      status: order.status,
      total: Number(order.total),
      attention: Boolean(order.attention_note),
    })),
    topProducts: [...products.values()].sort((a, b) => b.quantity - a.quantity || b.amount - a.amount).slice(0, 5),
    lowStock: (lowStock.data ?? []) as { id: string; name: string; stock_quantity: number }[],
    totals: {
      products: checkedCount("Products", activeProducts),
      customers: checkedCount("Customers", customers),
      categories: checkedCount("Categories", categories),
      coupons: checkedCount("Coupons", coupons),
    },
  };
}
