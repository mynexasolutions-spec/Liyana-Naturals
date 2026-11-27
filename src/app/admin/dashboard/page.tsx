import Link from "next/link";
import { redirect } from "next/navigation";
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Banknote,
  CircleHelp,
  IndianRupee,
  Package,
  PackageCheck,
  Receipt,
  ShoppingBag,
  Star,
  Tags,
  Ticket,
  Truck,
  Users,
} from "lucide-react";
import { AdminDashboardRealtime } from "@/components/admin/AdminDashboardRealtime";
import { SalesChart } from "@/components/admin/SalesChart";
import { getDashboardData, LOW_STOCK_LIMIT } from "@/lib/admin/dashboard";
import { formatIndiaTime } from "@/lib/shiprocket/shared";
import { getAdminSession } from "@/lib/supabase/admin-auth";

export const dynamic = "force-dynamic";

const money = (value: number) => `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? "" : "s"}`;
const methodLabel = (method: string | null) => (method === "cod" ? "COD" : method === "razorpay" ? "Online" : "—");
const surface = "min-w-0 rounded-2xl border border-[#28321F]/8 bg-white shadow-soft";
const card = `${surface} p-4 sm:p-5`;
const cardHeader = "flex items-center justify-between gap-3 border-b border-[#28321F]/8 px-4 py-4 sm:px-5";
const heading = "font-serif text-lg text-[#263D18] sm:text-xl";
const textLink = "inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-[#536B35] hover:text-[#263D18]";

// Badge and bar colour for each order status.
const STATUS_STYLES: Record<string, { badge: string; bar: string }> = {
  pending: { badge: "bg-amber-50 text-amber-800", bar: "bg-amber-500" },
  confirmed: { badge: "bg-[#EAF1DF] text-[#263D18]", bar: "bg-[#8CA567]" },
  processing: { badge: "bg-[#EAF1DF] text-[#263D18]", bar: "bg-[#536B35]" },
  shipped: { badge: "bg-sky-50 text-sky-800", bar: "bg-sky-600" },
  delivered: { badge: "bg-emerald-50 text-emerald-800", bar: "bg-emerald-600" },
  cancelled: { badge: "bg-red-50 text-red-700", bar: "bg-red-500" },
  returned: { badge: "bg-red-50 text-red-700", bar: "bg-red-300" },
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-block whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium capitalize ${STATUS_STYLES[status]?.badge ?? ""}`}>
      {status}
    </span>
  );
}

function Change({ current, previous }: { current: number; previous: number }) {
  if (previous === 0) {
    return <span className="text-[#777968]">No earlier data yet</span>;
  }
  const percent = Math.round(((current - previous) / previous) * 100);
  const Icon = percent < 0 ? ArrowDownRight : ArrowUpRight;
  return (
    <span className="flex flex-wrap items-center gap-1.5">
      <span
        className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 font-semibold ${
          percent < 0 ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-800"
        }`}
      >
        <Icon className="size-3.5" />
        {percent > 0 ? "+" : ""}
        {percent}%
      </span>
      <span className="text-[#777968]">vs previous 30 days</span>
    </span>
  );
}

export default async function AdminDashboardPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  let data;
  try {
    data = await getDashboardData(session.supabase);
  } catch (error) {
    console.error("[dashboard] Load failed:", error instanceof Error ? error.message : error);
    // Never show zeros for data that could not be read.
    return (
      <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
        <p className="font-semibold">The dashboard could not be loaded.</p>
        <p className="mt-1">Check the database connection, then reload this page.</p>
        <a href="/admin/dashboard" className="mt-3 inline-block font-semibold underline">
          Reload
        </a>
      </div>
    );
  }

  const { revenue, orders, cashDue, actions, totals } = data;
  const average = revenue.salesCount ? revenue.period / revenue.salesCount : 0;
  const today = data.daily[data.daily.length - 1];
  const statusTotal = data.statusCounts.reduce((total, entry) => total + entry.count, 0);
  const busiestStatus = Math.max(1, ...data.statusCounts.map((entry) => entry.count));
  const bestSeller = Math.max(1, ...data.topProducts.map((product) => product.quantity));

  const stats = [
    {
      label: "Revenue · 30 days",
      value: money(revenue.period),
      icon: IndianRupee,
      detail: <Change current={revenue.period} previous={revenue.previous} />,
      foot: `All time ${money(revenue.allTime)}`,
    },
    {
      label: "Orders · 30 days",
      value: orders.period.toLocaleString("en-IN"),
      icon: ShoppingBag,
      detail: <Change current={orders.period} previous={orders.previous} />,
      foot: `All time ${orders.allTime.toLocaleString("en-IN")}`,
    },
    {
      label: "Average order value",
      value: money(average),
      icon: Receipt,
      detail: <span className="text-[#777968]">From {plural(revenue.salesCount, "paid order")}</span>,
      foot: "Last 30 days",
    },
    {
      label: "Cash to collect",
      value: money(cashDue.amount),
      icon: Banknote,
      detail: <span className="text-[#777968]">{plural(cashDue.count, "open COD order")}</span>,
      foot: "Revenue after delivery",
    },
  ];

  const tasks = [
    { label: "Ready to ship", count: actions.toShip, href: "/admin/orders?filter=toship", icon: PackageCheck },
    { label: "In transit", count: actions.inTransit, href: "/admin/orders?filter=shipped", icon: Truck },
    { label: "Needs attention", count: actions.attention, href: "/admin/orders", icon: AlertTriangle, urgent: true },
    { label: "New inquiries", count: actions.inquiries, href: "/admin/inquiries", icon: CircleHelp },
    { label: "Reviews to approve", count: actions.reviews, href: "/admin/reviews", icon: Star },
    { label: "Low stock", count: actions.lowStock, href: "/admin/products", icon: Package, urgent: true },
  ];

  const shortcuts = [
    { count: totals.customers, label: "Customers", href: "/admin/customers", icon: Users },
    { count: totals.products, label: "Active products", href: "/admin/products", icon: Package },
    { count: totals.categories, label: "Active categories", href: "/admin/categories", icon: Tags },
    { count: totals.coupons, label: "Active coupons", href: "/admin/coupons", icon: Ticket },
  ];

  return (
    <div className="space-y-4 sm:space-y-5">
      <AdminDashboardRealtime />

      <header className="flex flex-col gap-5 rounded-2xl bg-[#263D18] p-5 text-white shadow-soft md:flex-row md:items-center md:justify-between md:p-6">
        <div className="min-w-0">
          <p className="text-sm text-[#E9DCC5]">{formatIndiaTime(new Date().toISOString(), false)}</p>
          <h1 className="font-serif text-3xl text-white">Good to see you</h1>
          <p className="mt-2 text-sm text-[#E9DCC5]">
            Today&apos;s sales: <strong className="text-white">{money(today?.revenue ?? 0)}</strong> from{" "}
            {plural(today?.orders ?? 0, "paid order")}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/orders" className="inline-flex h-10 items-center gap-2 rounded-full bg-[#FBF7EE] px-4 text-sm font-semibold text-[#263D18] hover:bg-white">
            <ShoppingBag className="size-4" /> View orders
          </Link>
          <Link href="/admin/products" className="inline-flex h-10 items-center gap-2 rounded-full border border-white/30 px-4 text-sm font-semibold text-white hover:bg-white/10">
            <Package className="size-4" /> Manage products
          </Link>
        </div>
      </header>

      {!data.complete && (
        <p className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-2.5 text-sm text-amber-900">
          There are too many orders to total here. All-time figures include only the newest ones.
        </p>
      )}

      <section aria-label="Key figures" className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, detail, foot }) => (
          <article key={label} className={`${card} flex flex-col`}>
            <div className="flex items-center gap-2.5">
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[#EAF1DF] text-[#263D18]">
                <Icon className="size-4" />
              </span>
              <p className="text-xs leading-tight text-[#777968] sm:text-sm">{label}</p>
            </div>
            <p className="mt-3 break-words text-2xl font-semibold tabular-nums text-[#263D18] sm:text-3xl">{value}</p>
            <div className="mt-2 text-xs">{detail}</div>
            <p className="mt-auto pt-2 text-xs text-[#777968]">{foot}</p>
          </article>
        ))}
      </section>

      <section className={card}>
        <h2 className={`${heading} mb-3`}>Things to do</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 2xl:grid-cols-6">
          {tasks.map(({ label, count, href, icon: Icon, urgent }) => {
            const tone = count === 0 ? "idle" : urgent ? "urgent" : "open";
            return (
              <Link
                key={label}
                href={href}
                className={`flex min-w-0 flex-col gap-2 rounded-xl border p-3.5 transition-colors ${
                  tone === "urgent"
                    ? "border-amber-300 bg-amber-50 hover:bg-amber-100/70"
                    : tone === "open"
                      ? "border-[#536B35]/35 bg-[#EAF1DF]/50 hover:bg-[#EAF1DF]"
                      : "border-[#28321F]/8 bg-white hover:border-[#536B35]/40"
                }`}
              >
                <span className="flex items-center justify-between gap-2">
                  <span className={`grid size-9 shrink-0 place-items-center rounded-lg ${tone === "urgent" ? "bg-white text-amber-800" : tone === "open" ? "bg-white text-[#263D18]" : "bg-[#FBF7EE] text-[#777968]"}`}>
                    <Icon className="size-4" />
                  </span>
                  <span className={`text-2xl font-semibold tabular-nums ${tone === "idle" ? "text-[#A3A696]" : "text-[#263D18]"}`}>{count}</span>
                </span>
                <span className="text-xs font-medium leading-tight text-[#555C4A]">{label}</span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="grid gap-4 sm:gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <article className={card}>
          <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 className={heading}>Daily revenue</h2>
              <p className="text-xs text-[#777968]">Paid and delivered COD orders, last 30 days</p>
            </div>
            <p className="text-xl font-semibold tabular-nums text-[#263D18]">{money(revenue.period)}</p>
          </div>
          <SalesChart days={data.daily} />
        </article>

        <article className={card}>
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className={heading}>Orders by status</h2>
            <span className="rounded-full bg-[#FBF7EE] px-3 py-1 text-xs font-semibold text-[#263D18]">{statusTotal} total</span>
          </div>
          <ul className="space-y-3.5">
            {data.statusCounts.map(({ status, count }) => (
              <li key={status}>
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="flex items-center gap-2 capitalize text-[#555C4A]">
                    <span aria-hidden="true" className={`size-2 rounded-full ${STATUS_STYLES[status]?.bar}`} />
                    {status}
                  </span>
                  <strong className="tabular-nums text-[#263D18]">{count}</strong>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[#F1EFE4]">
                  <div className={`h-full rounded-full ${STATUS_STYLES[status]?.bar}`} style={{ width: `${(count / busiestStatus) * 100}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </article>
      </section>

      <section className="grid items-start gap-4 sm:gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <article className={`${surface} overflow-hidden`}>
          <div className={cardHeader}>
            <h2 className={heading}>Recent orders</h2>
            <Link href="/admin/orders" className={textLink}>
              View all <ArrowRight className="size-3.5" />
            </Link>
          </div>

          {data.recentOrders.length === 0 ? (
            <p className="px-5 py-12 text-center text-sm text-[#777968]">No orders yet.</p>
          ) : (
            <>
              {/* Phones get a list; wider screens get the table. */}
              <ul className="divide-y divide-[#28321F]/8 sm:hidden">
                {data.recentOrders.map((order) => (
                  <li key={order.id}>
                    <Link href={`/admin/orders/${order.id}`} className="flex items-center justify-between gap-3 px-4 py-3">
                      <span className="min-w-0">
                        <span className="flex items-center gap-1.5 text-sm font-semibold text-[#263D18]">
                          {order.attention && <AlertTriangle aria-label="Needs attention" className="size-3.5 shrink-0 text-amber-700" />}
                          {order.orderNumber}
                        </span>
                        <span className="block truncate text-xs text-[#555C4A]">
                          {order.customer} · {methodLabel(order.method)}
                        </span>
                        <span className="block text-xs text-[#777968]">{formatIndiaTime(order.createdAt)}</span>
                      </span>
                      <span className="shrink-0 space-y-1 text-right">
                        <strong className="block text-sm tabular-nums">{money(order.total)}</strong>
                        <StatusBadge status={order.status} />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="hidden overflow-x-auto sm:block">
                <table className="w-full min-w-[620px] text-left text-sm">
                  <thead className="bg-[#FBF7EE] text-xs text-[#777968]">
                    <tr>
                      {["Order", "Customer", "Payment", "Status", "Total"].map((label) => (
                        <th key={label} className="px-5 py-3 font-medium last:text-right">
                          {label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentOrders.map((order) => (
                      <tr key={order.id} className="border-t border-[#28321F]/8 hover:bg-[#FBF7EE]/60">
                        <td className="px-5 py-3.5">
                          <Link href={`/admin/orders/${order.id}`} className="inline-flex items-center gap-1.5 whitespace-nowrap font-medium text-[#263D18] hover:underline">
                            {order.attention && <AlertTriangle aria-label="Needs attention" className="size-3.5 text-amber-700" />}
                            {order.orderNumber}
                          </Link>
                          <span className="block text-xs text-[#777968]">{formatIndiaTime(order.createdAt)}</span>
                        </td>
                        <td className="max-w-40 truncate px-5 py-3.5">{order.customer}</td>
                        <td className="px-5 py-3.5">
                          {methodLabel(order.method)}
                          <span className="block text-xs capitalize text-[#777968]">{order.paymentStatus}</span>
                        </td>
                        <td className="px-5 py-3.5">
                          <StatusBadge status={order.status} />
                        </td>
                        <td className="px-5 py-3.5 text-right font-semibold tabular-nums">{money(order.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </article>

        <div className="grid min-w-0 gap-4 sm:gap-5 md:grid-cols-2 xl:grid-cols-1">
          <article className={card}>
            <div className="flex items-center justify-between gap-3">
              <h2 className={heading}>Low stock</h2>
              <Link href="/admin/products" className={textLink}>
                Update stock <ArrowRight className="size-3.5" />
              </Link>
            </div>
            <ul className="mt-3 space-y-2">
              {data.lowStock.map((product) => (
                <li key={product.id} className="flex items-center justify-between gap-3 rounded-xl bg-[#FBF7EE] px-3.5 py-2.5">
                  <span className="min-w-0 truncate text-sm">{product.name}</span>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                      product.stock_quantity === 0 ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-800"
                    }`}
                  >
                    {product.stock_quantity === 0 ? "Out of stock" : `${product.stock_quantity} left`}
                  </span>
                </li>
              ))}
            </ul>
            {data.lowStock.length === 0 && (
              <p className="py-3 text-sm text-[#777968]">Every active product has more than {LOW_STOCK_LIMIT} in stock.</p>
            )}
            {actions.lowStock > data.lowStock.length && (
              <p className="mt-2 text-xs text-[#777968]">+{actions.lowStock - data.lowStock.length} more</p>
            )}
          </article>

          <article className={card}>
            <h2 className={heading}>Top products</h2>
            <p className="text-xs text-[#777968]">Sold in the last 30 days</p>
            <ol className="mt-3 space-y-3">
              {data.topProducts.map((product, index) => (
                <li key={product.name} className="flex items-center gap-3 text-sm">
                  <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-[#EAF1DF] text-xs font-semibold text-[#263D18]">
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between gap-3">
                      <span className="min-w-0 truncate">{product.name}</span>
                      <strong className="shrink-0 tabular-nums text-[#263D18]">{money(product.amount)}</strong>
                    </div>
                    <div className="mt-1.5 flex items-center gap-2">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#F1EFE4]">
                        <div className="h-full rounded-full bg-[#536B35]" style={{ width: `${(product.quantity / bestSeller) * 100}%` }} />
                      </div>
                      <span className="shrink-0 text-xs tabular-nums text-[#777968]">{product.quantity} sold</span>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
            {data.topProducts.length === 0 && <p className="py-3 text-sm text-[#777968]">No sales yet.</p>}
          </article>
        </div>
      </section>

      <nav aria-label="Store at a glance" className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {shortcuts.map(({ count, label, href, icon: Icon }) => (
          <Link key={label} href={href} className={`${surface} group flex items-center gap-3 p-4 hover:border-[#536B35]/40`}>
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#FBF7EE] text-[#536B35]">
              <Icon className="size-4" />
            </span>
            <span className="min-w-0 flex-1">
              <strong className="block text-xl leading-none tabular-nums text-[#263D18]">{count}</strong>
              <span className="mt-1 block text-xs leading-tight text-[#777968]">{label}</span>
            </span>
            <ArrowRight className="hidden size-4 shrink-0 text-[#A3A696] group-hover:text-[#263D18] sm:block" />
          </Link>
        ))}
      </nav>
    </div>
  );
}
