"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AlertTriangle, Check, Download, ExternalLink, Eye, Phone, Trash2 } from "lucide-react";
import {
  adminRequest,
  ConfirmDialog,
  dangerIconButton,
  DataTable,
  DataView,
  EmptyState,
  Feedback,
  iconButton,
  PageHeader,
  Pager,
  panel,
  secondaryButton,
  StatGrid,
  Toolbar,
  useAdminAction,
  useRealtimeRefresh,
  useViewMode,
} from "@/components/admin/kit";
import { markPaid, MarkPaidButton, MarkPaidDialog, UNPAID_MESSAGE } from "@/components/admin/orders/MarkPaid";
import { SyncShipmentsButton } from "@/components/admin/orders/SyncShipmentsButton";
import { downloadCsv } from "@/lib/admin/csv";
import { codFeeOf } from "@/lib/checkout/pricing";
import { awaitsPayment, isPlaced, isReadyToShip, isSale } from "@/lib/orders/rules";
import { itemLabel } from "@/lib/products/variants";
import { formatIndiaTime, trackingUrl } from "@/lib/shiprocket/shared";

export type AdminOrderRow = {
  id: string;
  order_number: string;
  created_at: string;
  status: string;
  payment_method: string | null;
  payment_status: string;
  subtotal: number | string;
  discount: number | string;
  coupon_code: string | null;
  shipping: number | string;
  total: number | string;
  shipping_address: Record<string, string | undefined> | null;
  shiprocket_order_id: string | null;
  awb_code: string | null;
  courier_name: string | null;
  shiprocket_status: string | null;
  attention_note: string | null;
  stock_released: boolean;
  order_items: { product_name: string; variant_name: string | null; quantity: number }[];
};

const FILTERS = [
  ["all", "All"],
  ["toship", "To ship"],
  ["shipped", "Shipped"],
  ["delivered", "Delivered"],
  ["unpaid", "Unpaid online"],
] as const;
type Filter = (typeof FILTERS)[number][0];

const MATCHES: Record<Filter, (order: AdminOrderRow) => boolean> = {
  // Every order, including online ones that were never paid.
  all: () => true,
  toship: isReadyToShip,
  shipped: (order) => order.status === "shipped",
  delivered: (order) => order.status === "delivered",
  unpaid: (order) => !isPlaced(order),
};

const PER_PAGE = 15;
const STATUS_STYLE: Record<string, string> = {
  pending: "bg-amber-50 text-amber-800",
  confirmed: "bg-[#EAF1DF] text-[#263D18]",
  processing: "bg-[#EAF1DF] text-[#263D18]",
  shipped: "bg-sky-50 text-sky-800",
  delivered: "bg-emerald-50 text-emerald-800",
  paid: "bg-emerald-50 text-emerald-800",
  refunded: "bg-[#EDEDE6] text-[#555C4A]",
  failed: "bg-red-50 text-red-700",
  "not paid": "bg-red-100 text-red-700",
  cancelled: "bg-red-50 text-red-700",
  returned: "bg-red-50 text-red-700",
};
const selectClass = "h-11 rounded-xl border border-[#28321F]/10 bg-white px-3 text-sm outline-none focus:border-[#536B35]";

const money = (value: number | string) => `₹${Number(value).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
const methodLabel = (method: string | null) => (method === "cod" ? "COD" : method === "razorpay" ? "Online" : "—");
const indiaDay = (time: number | string) => new Date(time).toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });

function itemSummary(order: AdminOrderRow): string {
  const [first, ...rest] = order.order_items;
  if (!first) return "No items";
  return `${itemLabel(first.product_name, first.variant_name)} × ${first.quantity}${rest.length ? ` +${rest.length} more` : ""}`;
}

/** "not paid" when money that should have arrived has not. Cash is collected on delivery. */
const paymentLabel = (order: AdminOrderRow) =>
  order.payment_method !== "cod" && order.payment_status === "pending" ? "not paid" : order.payment_status;

function exportOrders(orders: AdminOrderRow[]) {
  const header = [
    "Order", "Date", "Customer", "Phone", "Email", "Street", "City", "State", "PIN", "Items",
    "Subtotal", "Discount", "Coupon", "Shipping", "COD fee", "Total", "Payment method", "Payment status",
    "Order status", "Courier", "AWB",
  ];
  const rows = orders.map((order) => {
    const address = order.shipping_address ?? {};
    return [
      order.order_number,
      formatIndiaTime(order.created_at),
      address.fullName ?? "",
      address.phone ?? "",
      address.email ?? "",
      address.street ?? "",
      address.city ?? "",
      address.state ?? "",
      address.pinCode ?? "",
      order.order_items.map((item) => `${itemLabel(item.product_name, item.variant_name)} × ${item.quantity}`).join("; "),
      Number(order.subtotal),
      Number(order.discount),
      order.coupon_code ?? "",
      Number(order.shipping),
      codFeeOf(order),
      Number(order.total),
      methodLabel(order.payment_method),
      order.payment_status,
      order.status,
      order.courier_name ?? "",
      order.awb_code ?? "",
    ];
  });
  downloadCsv(`orders-${indiaDay(Date.now())}.csv`, [header, ...rows]);
}

function Badge({ value }: { value: string }) {
  return (
    <span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium capitalize ${STATUS_STYLE[value] ?? "bg-[#EDEDE6] text-[#555C4A]"}`}>
      {value}
    </span>
  );
}

export function OrderManager({ orders, initialFilter }: { orders: AdminOrderRow[]; initialFilter?: string }) {
  useRealtimeRefresh("admin-orders", ["orders"]);
  const [view, setView] = useViewMode("orders");
  const { run, busy, locked, error, notice } = useAdminAction();
  const [deleting, setDeleting] = useState<AdminOrderRow | null>(null);
  const [paying, setPaying] = useState<AdminOrderRow | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>(
    () => FILTERS.find(([key]) => key === initialFilter)?.[0] ?? "all",
  );
  const [period, setPeriod] = useState("all");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);

  const needle = query.trim().toLowerCase();
  // The first day included; "1" means today only.
  const since = period === "all" ? "" : indiaDay(Date.now() - (Number(period) - 1) * 86_400_000);
  const matched = orders
    .filter((order) => {
      if (!MATCHES[filter](order)) return false;
      if (since && indiaDay(order.created_at) < since) return false;
      if (!needle) return true;
      const address = order.shipping_address ?? {};
      return [
        order.order_number,
        address.fullName,
        address.phone,
        address.email,
        address.city,
        address.pinCode,
        order.awb_code,
        order.coupon_code,
        ...order.order_items.map((item) => itemLabel(item.product_name, item.variant_name)),
      ]
        .join(" ")
        .toLowerCase()
        .includes(needle);
    })
    .sort((a, b) => {
      if (sort === "highest") return Number(b.total) - Number(a.total);
      const newestFirst = b.created_at.localeCompare(a.created_at);
      return sort === "oldest" ? -newestFirst : newestFirst;
    });
  const pages = Math.max(1, Math.ceil(matched.length / PER_PAGE));
  const current = Math.min(page, pages);
  const visible = matched.slice((current - 1) * PER_PAGE, current * PER_PAGE);

  const confirmOrder = (order: AdminOrderRow) =>
    run(
      () => adminRequest(`/api/admin/orders/${order.id}`, "PATCH", { status: "confirmed", paymentStatus: order.payment_status }),
      `${order.order_number} confirmed.`,
    );

  const orderLink = (order: AdminOrderRow) => (
    <>
      <Link href={`/admin/orders/${order.id}`} className="inline-flex items-center gap-1.5 whitespace-nowrap font-medium text-[#263D18] hover:underline">
        {order.attention_note && <AlertTriangle aria-label="Needs attention" className="size-3.5 shrink-0 text-amber-700" />}
        {order.order_number}
      </Link>
      <span className="block text-xs text-[#777968]">{formatIndiaTime(order.created_at)}</span>
    </>
  );
  const customer = (order: AdminOrderRow) => {
    const address = order.shipping_address ?? {};
    return (
      <div className="min-w-0">
        <p className="break-words font-medium">{address.fullName ?? "—"}</p>
        {address.phone && (
          <a href={`tel:${address.phone.replace(/[^+\d]/g, "")}`} className="inline-flex items-center gap-1 text-xs text-[#536B35] hover:underline">
            <Phone className="size-3" /> {address.phone}
          </a>
        )}
        <p className="text-xs text-[#777968]">{[address.city, address.pinCode].filter(Boolean).join(" · ")}</p>
      </div>
    );
  };
  const shipment = (order: AdminOrderRow) =>
    order.awb_code ? (
      <a href={trackingUrl(order.awb_code)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 break-all text-xs text-[#536B35] hover:underline">
        {order.shiprocket_status ?? order.awb_code} <ExternalLink className="size-3 shrink-0" />
      </a>
    ) : order.shiprocket_status ? (
      <span className="text-xs text-[#777968]">{order.shiprocket_status}</span>
    ) : null;
  const unpaidHelp = (order: AdminOrderRow) =>
    awaitsPayment(order) ? (
      <div className="max-w-[15rem] space-y-1.5">
        <p className="text-xs text-red-700">{UNPAID_MESSAGE}</p>
        <MarkPaidButton disabled={locked} onClick={() => setPaying(order)} />
      </div>
    ) : null;
  const attention = (order: AdminOrderRow) =>
    order.attention_note ? <p className="max-w-xs text-xs text-amber-800">{order.attention_note}</p> : null;
  const actions = (order: AdminOrderRow) => (
    <div className="flex items-center justify-end gap-1.5">
      {order.payment_method === "cod" && order.status === "pending" && !order.stock_released && (
        <button type="button" disabled={locked} onClick={() => void confirmOrder(order)} className="inline-flex h-9 items-center gap-1.5 rounded-full bg-[#263D18] px-3.5 text-xs font-semibold text-white disabled:opacity-50">
          <Check className="size-3.5" /> Confirm
        </button>
      )}
      <Link href={`/admin/orders/${order.id}`} aria-label={`Open order ${order.order_number}`} className={iconButton}>
        <Eye className="size-4" />
      </Link>
      <button type="button" disabled={locked} aria-label={`Delete order ${order.order_number}`} onClick={() => setDeleting(order)} className={dangerIconButton}>
        <Trash2 className="size-4" />
      </button>
    </div>
  );

  return (
    <div className="space-y-5">
      <PageHeader title="Orders" />
      <StatGrid
        items={[
          ["To ship", orders.filter(MATCHES.toship).length],
          ["In transit", orders.filter(MATCHES.shipped).length],
          ["Needs attention", orders.filter((order) => order.attention_note).length],
          ["Money received", money(orders.filter(isSale).reduce((total, order) => total + Number(order.total), 0))],
        ]}
      />
      <Toolbar
        filters={FILTERS}
        filter={filter}
        onFilter={(key) => {
          setFilter(key);
          setPage(1);
        }}
        query={query}
        onQuery={(value) => {
          setQuery(value);
          setPage(1);
        }}
        placeholder="Search order, name, phone, city, AWB"
        view={view}
        onView={setView}
      />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <select
            aria-label="Order date"
            value={period}
            onChange={(event) => {
              setPeriod(event.target.value);
              setPage(1);
            }}
            className={selectClass}
          >
            <option value="all">All dates</option>
            <option value="1">Today</option>
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
          </select>
          <select
            aria-label="Sort orders"
            value={sort}
            onChange={(event) => {
              setSort(event.target.value);
              setPage(1);
            }}
            className={selectClass}
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="highest">Highest amount</option>
          </select>
          <span className="text-xs text-[#777968]">
            {matched.length} order{matched.length === 1 ? "" : "s"}
          </span>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <button type="button" disabled={matched.length === 0} onClick={() => exportOrders(matched)} className={secondaryButton}>
            <Download className="size-4" /> Export CSV
          </button>
          <SyncShipmentsButton />
        </div>
      </div>
      <Feedback error={error} notice={notice} />

      {visible.length === 0 ? (
        <EmptyState>{orders.length === 0 ? "No orders yet." : "No orders match."}</EmptyState>
      ) : (
        <DataView
          view={view}
          table={
            <DataTable
              rows={visible}
              columns={[
                { label: "Order", cell: orderLink },
                { label: "Customer", cell: customer },
                { label: "Items", cell: (order) => <p className="max-w-[14rem] text-xs text-[#555C4A]">{itemSummary(order)}</p> },
                {
                  label: "Amount",
                  cell: (order) => (
                    <>
                      <strong className="tabular-nums">{money(order.total)}</strong>
                      <span className="block text-xs text-[#777968]">{methodLabel(order.payment_method)}</span>
                    </>
                  ),
                },
                {
                  label: "Payment",
                  cell: (order) => (
                    <div className="space-y-1.5">
                      <Badge value={paymentLabel(order)} />
                      {unpaidHelp(order)}
                    </div>
                  ),
                },
                {
                  label: "Status",
                  cell: (order) => (
                    <div className="space-y-1.5">
                      <Badge value={order.status} />
                      <div>{shipment(order)}</div>
                      {attention(order)}
                    </div>
                  ),
                },
                { label: "Actions", align: "right", cell: actions },
              ]}
            />
          }
          grid={
            <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {visible.map((order) => (
                <li key={order.id} className={`${panel} flex min-w-0 flex-col gap-3 p-4`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">{orderLink(order)}</div>
                    <Badge value={order.status} />
                  </div>
                  {customer(order)}
                  <p className="text-xs text-[#555C4A]">{itemSummary(order)}</p>
                  {shipment(order)}
                  {attention(order)}
                  {unpaidHelp(order)}
                  <div className="mt-auto flex items-center justify-between gap-2 border-t border-[#28321F]/8 pt-3">
                    <div>
                      <strong className="tabular-nums">{money(order.total)}</strong>
                      <span className="mt-1 flex items-center gap-1.5 text-xs text-[#777968]">
                        {methodLabel(order.payment_method)} <Badge value={paymentLabel(order)} />
                      </span>
                    </div>
                    {actions(order)}
                  </div>
                </li>
              ))}
            </ul>
          }
        />
      )}
      <Pager page={current} pages={pages} onPage={setPage} />

      {paying && (
        <MarkPaidDialog
          orderNumber={paying.order_number}
          amount={money(paying.total)}
          busy={busy}
          onCancel={() => setPaying(null)}
          onConfirm={() =>
            void run(() => markPaid(paying.id), `${paying.order_number} marked as paid.`).then(() => setPaying(null))
          }
        />
      )}

      {deleting && (
        <ConfirmDialog
          title="Delete order"
          busy={busy}
          onCancel={() => setDeleting(null)}
          onConfirm={() =>
            void run(() => adminRequest(`/api/admin/orders/${deleting.id}`, "DELETE"), `${deleting.order_number} deleted.`).then(() => setDeleting(null))
          }
        >
          <p>
            Delete order <strong>{deleting.order_number}</strong> of <strong>{money(deleting.total)}</strong>
            {deleting.shipping_address?.fullName ? ` for ${deleting.shipping_address.fullName}` : ""}? This cannot be undone.
          </p>
          <p className="mt-2">Items that were never shipped go back into stock.</p>
          {isSale(deleting) || deleting.payment_status === "paid" ? (
            <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 font-medium text-red-700">
              Money was received for this order. Deleting it removes it from your sales records and does not refund the customer.
            </p>
          ) : null}
        </ConfirmDialog>
      )}
    </div>
  );
}
