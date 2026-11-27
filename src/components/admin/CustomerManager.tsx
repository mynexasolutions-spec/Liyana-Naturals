"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Eye, Mail, Phone, Trash2 } from "lucide-react";
import {
  adminRequest,
  ConfirmDialog,
  EmptyState,
  errorText,
  Feedback,
  FormError,
  iconButton,
  inputClass,
  Modal,
  PageHeader,
  Pager,
  panel,
  primaryButton,
  StatGrid,
  Toolbar,
  useAdminAction,
  useRealtimeRefresh,
  useViewMode,
  DataTable,
  DataView,
} from "@/components/admin/kit";
import { formatIndiaTime } from "@/lib/shiprocket/shared";

export type AdminCustomer = {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  registered: boolean;
  createdAt: string;
  spent: number;
  orders: {
    id: string;
    orderNumber: string;
    createdAt: string;
    status: string;
    paymentStatus: string;
    total: number;
  }[];
};

const FILTERS = [
  ["all", "All"],
  ["registered", "With account"],
  ["guest", "Guests"],
  ["buyers", "Has ordered"],
] as const;
const PER_PAGE = 15;
const money = (value: number) => `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

export function CustomerManager({ customers }: { customers: AdminCustomer[] }) {
  useRealtimeRefresh("admin-customers", ["customers", "orders"]);
  const [view, setView] = useViewMode("customers");
  const { run, busy, error, notice } = useAdminAction();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<(typeof FILTERS)[number][0]>("all");
  const [page, setPage] = useState(1);
  const [openId, setOpenId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<AdminCustomer | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [formError, setFormError] = useState("");

  const needle = query.trim().toLowerCase();
  const matched = customers.filter(
    (customer) =>
      (filter === "all" ||
        (filter === "registered" && customer.registered) ||
        (filter === "guest" && !customer.registered) ||
        (filter === "buyers" && customer.orders.length > 0)) &&
      (!needle || `${customer.fullName} ${customer.email} ${customer.phone ?? ""}`.toLowerCase().includes(needle)),
  );
  const pages = Math.max(1, Math.ceil(matched.length / PER_PAGE));
  const current = Math.min(page, pages);
  const visible = matched.slice((current - 1) * PER_PAGE, current * PER_PAGE);
  const open = customers.find((customer) => customer.id === openId) ?? null;

  const show = (customer: AdminCustomer) => {
    setOpenId(customer.id);
    setName(customer.fullName);
    setPhone(customer.phone ?? "");
    setFormError("");
  };

  const accountBadge = (customer: AdminCustomer) => (
    <span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${customer.registered ? "bg-[#EAF1DF] text-[#263D18]" : "bg-[#EDEDE6] text-[#555C4A]"}`}>
      {customer.registered ? "Registered" : "Guest"}
    </span>
  );
  const viewButton = (customer: AdminCustomer) => (
    <button type="button" aria-label={`View ${customer.fullName}`} onClick={() => show(customer)} className={`${iconButton} ml-auto`}>
      <Eye className="size-4" />
    </button>
  );

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!open) return;
    setFormError("");
    let failure = "";
    const saved = await run(async () => {
      try {
        await adminRequest(`/api/admin/customers/${open.id}`, "PATCH", { full_name: name, phone: phone || null });
      } catch (saveError) {
        failure = errorText(saveError);
        throw saveError;
      }
    }, "Customer saved.");
    if (!saved) setFormError(failure);
  };

  return (
    <div className="space-y-5">
      <PageHeader title="Customers" />
      <StatGrid
        items={[
          ["Customers", customers.length],
          ["With account", customers.filter((customer) => customer.registered).length],
          ["Repeat buyers", customers.filter((customer) => customer.orders.length > 1).length],
          ["Paid by customers", money(customers.reduce((total, customer) => total + customer.spent, 0))],
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
        placeholder="Search name, email or phone"
        view={view}
        onView={setView}
      />
      <Feedback error={open ? "" : error} notice={notice} />

      {visible.length === 0 ? (
        <EmptyState>{customers.length === 0 ? "No customers yet." : "No customers match."}</EmptyState>
      ) : (
        <DataView
          view={view}
          table={
            <DataTable
              rows={visible}
              columns={[
                {
                  label: "Customer",
                  cell: (customer) => (
                    <>
                      <p className="font-medium text-[#263D18]">{customer.fullName}</p>
                      <p className="text-xs text-[#777968]">{customer.email}</p>
                    </>
                  ),
                },
                { label: "Phone", cell: (customer) => customer.phone ?? "—" },
                { label: "Account", cell: accountBadge },
                { label: "Orders", cell: (customer) => <span className="tabular-nums">{customer.orders.length}</span> },
                { label: "Spent", cell: (customer) => <strong className="tabular-nums">{money(customer.spent)}</strong> },
                { label: "Actions", align: "right", cell: viewButton },
              ]}
            />
          }
          grid={
            <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {visible.map((customer) => (
                <li key={customer.id} className={`${panel} flex min-w-0 flex-col gap-3 p-4`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate font-serif text-lg text-[#263D18]">{customer.fullName}</p>
                      <p className="break-all text-xs text-[#777968]">{customer.email}</p>
                      <p className="text-xs text-[#777968]">{customer.phone ?? "No phone"}</p>
                    </div>
                    {accountBadge(customer)}
                  </div>
                  <div className="mt-auto flex items-center justify-between gap-3 border-t border-[#28321F]/8 pt-3 text-sm">
                    <span>
                      <strong>{customer.orders.length}</strong> order{customer.orders.length === 1 ? "" : "s"} ·{" "}
                      <strong>{money(customer.spent)}</strong>
                    </span>
                    {viewButton(customer)}
                  </div>
                </li>
              ))}
            </ul>
          }
        />
      )}
      <Pager page={current} pages={pages} onPage={setPage} />

      {open && !deleting && (
        <Modal title={open.fullName} wide onClose={() => !busy && setOpenId(null)}>
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <a href={`mailto:${open.email}`} className="inline-flex items-center gap-1.5 rounded-full border border-[#536B35]/30 px-3.5 py-2 text-[#263D18]">
                <Mail className="size-4" /> {open.email}
              </a>
              {open.phone && (
                <a href={`tel:${open.phone.replace(/[^+\d]/g, "")}`} className="inline-flex items-center gap-1.5 rounded-full border border-[#536B35]/30 px-3.5 py-2 text-[#263D18]">
                  <Phone className="size-4" /> {open.phone}
                </a>
              )}
              <span className="text-xs text-[#777968]">Since {formatIndiaTime(open.createdAt, false)}</span>
            </div>

            <form onSubmit={save} noValidate className="space-y-3 rounded-2xl bg-[#FBF7EE]/70 p-4">
              <FormError>{formError}</FormError>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block text-sm font-medium">
                  Name
                  <input value={name} maxLength={100} onChange={(event) => setName(event.target.value)} className={inputClass} />
                </label>
                <label className="block text-sm font-medium">
                  Phone
                  <input value={phone} maxLength={20} onChange={(event) => setPhone(event.target.value)} className={inputClass} />
                </label>
              </div>
              <button type="submit" disabled={busy} className={primaryButton}>
                {busy ? "Saving…" : "Save details"}
              </button>
              <p className="text-xs text-[#777968]">The email identifies the customer and cannot be changed here.</p>
            </form>

            <div>
              <h3 className="mb-2 font-serif text-lg text-[#263D18]">
                Orders ({open.orders.length}) · {money(open.spent)} paid
              </h3>
              <ul className="divide-y divide-[#28321F]/8 text-sm">
                {open.orders.map((order) => (
                  <li key={order.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
                    <Link href={`/admin/orders/${order.id}`} className="font-medium text-[#263D18] underline-offset-2 hover:underline">
                      {order.orderNumber}
                      <span className="block text-xs font-normal text-[#777968]">{formatIndiaTime(order.createdAt)}</span>
                    </Link>
                    <span className="text-xs capitalize text-[#555C4A]">
                      {order.status} · {order.paymentStatus}
                    </span>
                    <strong className="tabular-nums">{money(order.total)}</strong>
                  </li>
                ))}
              </ul>
              {open.orders.length === 0 && <p className="py-3 text-sm text-[#777968]">No orders yet.</p>}
            </div>

            {!open.registered && (
              <button type="button" onClick={() => setDeleting(open)} className="inline-flex items-center gap-1.5 text-sm font-semibold text-red-600">
                <Trash2 className="size-4" /> Delete this guest record
              </button>
            )}
          </div>
        </Modal>
      )}

      {deleting && (
        <ConfirmDialog
          title="Delete customer"
          busy={busy}
          onCancel={() => setDeleting(null)}
          onConfirm={() =>
            void run(() => adminRequest(`/api/admin/customers/${deleting.id}`, "DELETE"), "Customer deleted.").then((deleted) => {
              setDeleting(null);
              if (deleted) setOpenId(null);
            })
          }
        >
          Delete <strong>{deleting.fullName}</strong>? Their {deleting.orders.length} order(s) stay, but will no longer be linked to a customer.
        </ConfirmDialog>
      )}
    </div>
  );
}
