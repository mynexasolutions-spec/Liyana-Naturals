import { createSupabaseServerClient } from "@/lib/supabase/server";
import { AdminDashboardRealtime } from "@/components/admin/AdminDashboardRealtime";
import { DollarSign, MessageSquare, Package, ShoppingBag, Star, Users } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const supabase = await createSupabaseServerClient();
  const [products, orders, customers, categories, reviews, inquiries, recentOrders, lowStock] = await Promise.all([
    supabase.from("products").select("id", { count: "exact", head: true }),
    supabase.from("orders").select("id,total,status", { count: "exact" }).order("created_at", { ascending: false }),
    supabase.from("customers").select("id", { count: "exact", head: true }),
    supabase.from("categories").select("id", { count: "exact", head: true }),
    supabase.from("reviews").select("id", { count: "exact", head: true }),
    supabase.from("inquiries").select("id", { count: "exact", head: true }),
    supabase.from("orders").select("id,order_number,total,status,created_at").order("created_at", { ascending: false }).limit(5),
    supabase.from("products").select("id,name,stock_quantity").lte("stock_quantity", 5).limit(5),
  ]);

  const orderRows = orders.data ?? [];
  const revenue = orderRows.filter((order) => order.status !== "cancelled" && order.status !== "returned").reduce((sum, order) => sum + Number(order.total ?? 0), 0);

  const cards = [
    { label: "Revenue", value: new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(revenue), icon: DollarSign },
    { label: "Orders", value: orders.count ?? 0, icon: ShoppingBag },
    { label: "Products", value: products.count ?? 0, icon: Package },
    { label: "Customers", value: customers.count ?? 0, icon: Users },
    { label: "Reviews", value: reviews.count ?? 0, icon: Star },
    { label: "Inquiries", value: inquiries.count ?? 0, icon: MessageSquare },
  ];

  return (
    <div className="space-y-6">
      <AdminDashboardRealtime />
      <div>
        <p className="text-sm text-[#777968]">Overview</p>
        <h1 className="font-serif text-3xl text-[#263D18]">Good to see you</h1>
      </div>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <article key={card.label} className="rounded-2xl border border-[#28321F]/8 bg-white p-5 shadow-soft">
              <div className="flex items-center justify-between">
                <p className="text-sm text-[#777968]">{card.label}</p>
                <span className="grid size-10 place-items-center rounded-xl bg-[#E9DCC5]/60 text-[#536B35]"><Icon className="size-5" /></span>
              </div>
              <p className="mt-5 font-serif text-3xl text-[#263D18]">{card.value}</p>
            </article>
          );
        })}
      </section>
      <section className="grid gap-5 xl:grid-cols-[1.5fr_1fr]">
        <article className="overflow-hidden rounded-2xl border border-[#28321F]/8 bg-white">
          <div className="border-b border-[#28321F]/8 px-5 py-4">
            <h2 className="font-serif text-xl">Recent orders</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#FBF7EE] text-xs text-[#777968]">
                <tr><th className="px-5 py-3 font-medium">Order</th><th className="px-5 py-3 font-medium">Status</th><th className="px-5 py-3 font-medium">Total</th></tr>
              </thead>
              <tbody>
                {(recentOrders.data ?? []).map((order) => (
                  <tr key={order.id} className="border-t border-[#28321F]/8">
                    <td className="px-5 py-4 font-medium">#{order.order_number}</td>
                    <td className="px-5 py-4 capitalize">{order.status}</td>
                    <td className="px-5 py-4">₹{Number(order.total).toLocaleString("en-IN")}</td>
                  </tr>
                ))}
                {(!recentOrders.data || recentOrders.data.length === 0) && <tr><td colSpan={3} className="px-5 py-10 text-center text-[#777968]">No orders yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </article>
        <article className="rounded-2xl border border-[#28321F]/8 bg-white p-5">
          <h2 className="font-serif text-xl">Low stock</h2>
          <div className="mt-4 space-y-3">
            {(lowStock.data ?? []).map((product) => (
              <div key={product.id} className="flex items-center justify-between rounded-xl bg-[#FBF7EE] px-4 py-3">
                <p className="text-sm">{product.name}</p>
                <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">{product.stock_quantity} left</span>
              </div>
            ))}
            {(!lowStock.data || lowStock.data.length === 0) && <p className="py-6 text-sm text-[#777968]">Inventory levels are healthy.</p>}
          </div>
        </article>
      </section>
      <p className="text-xs text-[#777968]">{categories.count ?? 0} active catalog categories</p>
    </div>
  );
}
