import { CustomerManager, type AdminCustomer } from "@/components/admin/CustomerManager";
import { fetchAll, requireAdminPage } from "@/lib/admin/server";

type CustomerRow = {
  id: string;
  auth_user_id: string | null;
  full_name: string;
  email: string;
  phone: string | null;
  created_at: string;
};

type OrderRow = {
  id: string;
  customer_id: string | null;
  order_number: string;
  created_at: string;
  status: string;
  payment_status: string;
  payment_method: string | null;
  total: number | string;
};

export default async function CustomersPage() {
  const { supabase } = await requireAdminPage();

  const [customers, orders] = await Promise.all([
    fetchAll<CustomerRow>("Customers", (from, to) =>
      supabase
        .from("customers")
        .select("id,auth_user_id,full_name,email,phone,created_at")
        .order("created_at", { ascending: false })
        .order("id")
        .range(from, to),
    ),
    fetchAll<OrderRow>("Orders", (from, to) =>
      supabase
        .from("orders")
        .select("id,customer_id,order_number,created_at,status,payment_status,payment_method,total")
        .not("customer_id", "is", null)
        .order("created_at", { ascending: false })
        .order("id")
        .range(from, to),
    ),
  ]);

  const byCustomer = new Map<string, OrderRow[]>();
  for (const order of orders) {
    // Online orders that were never paid are abandoned checkouts.
    if (order.payment_method === "razorpay" && !["paid", "refunded"].includes(order.payment_status)) continue;
    const list = byCustomer.get(order.customer_id!) ?? [];
    list.push(order);
    byCustomer.set(order.customer_id!, list);
  }

  const list: AdminCustomer[] = customers.map((customer) => {
    const own = byCustomer.get(customer.id) ?? [];
    return {
      id: customer.id,
      fullName: customer.full_name,
      email: customer.email,
      phone: customer.phone,
      registered: Boolean(customer.auth_user_id),
      createdAt: customer.created_at,
      // Paid orders, plus cash orders once delivered.
      spent: own
        .filter(
          (order) =>
            !["cancelled", "returned"].includes(order.status) &&
            order.payment_status !== "refunded" &&
            (order.payment_status === "paid" || (order.payment_method === "cod" && order.status === "delivered")),
        )
        .reduce((total, order) => total + Number(order.total), 0),
      orders: own.map((order) => ({
        id: order.id,
        orderNumber: order.order_number,
        createdAt: order.created_at,
        status: order.status,
        paymentStatus: order.payment_status,
        total: Number(order.total),
      })),
    };
  });

  return <CustomerManager customers={list} />;
}
