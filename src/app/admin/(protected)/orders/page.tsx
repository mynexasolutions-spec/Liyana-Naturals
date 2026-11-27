import { OrderManager, type AdminOrderRow } from "@/components/admin/orders/OrderManager";
import { fetchAll, requireAdminPage } from "@/lib/admin/server";

const COLUMNS =
  "id,order_number,created_at,status,payment_method,payment_status,subtotal,discount,coupon_code,shipping,total,shipping_address,shiprocket_order_id,awb_code,courier_name,shiprocket_status,attention_note,stock_released,order_items(product_name,variant_name,quantity)";

export default async function OrdersPage({ searchParams }: { searchParams: Promise<{ filter?: string }> }) {
  const { supabase } = await requireAdminPage();

  const [{ filter }, orders] = await Promise.all([
    searchParams,
    fetchAll<AdminOrderRow>("Orders", (from, to) =>
      supabase
        .from("orders")
        .select(COLUMNS)
        .order("created_at", { ascending: false })
        .order("id")
        .range(from, to),
    ),
  ]);

  return <OrderManager orders={orders} initialFilter={filter} />;
}
