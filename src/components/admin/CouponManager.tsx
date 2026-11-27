"use client";

import React, { useState } from "react";
import { Copy, Pencil, Trash2 } from "lucide-react";
import {
  adminRequest,
  ConfirmDialog,
  dangerIconButton,
  EmptyState,
  errorText,
  Feedback,
  FormActions,
  FormError,
  iconButton,
  inputClass,
  Modal,
  PageHeader,
  panel,
  StatGrid,
  Switch,
  Toolbar,
  useAdminAction,
  useRealtimeRefresh,
  useViewMode,
  DataTable,
  DataView,
} from "@/components/admin/kit";
import { calculateCouponDiscount } from "@/lib/coupons/shared";

export type AdminCoupon = {
  id: string;
  code: string;
  label: string;
  discount_type: "percent" | "fixed";
  value: number;
  max_discount: number | null;
  min_subtotal: number;
  starts_on: string | null;
  expires_on: string | null;
  usage_limit: number | null;
  per_customer_limit: number | null;
  show_on_checkout: boolean;
  is_active: boolean;
  uses: number;
  discountGiven: number;
};

type State = "Live" | "Scheduled" | "Expired" | "Used up" | "Off";

const FILTERS = [
  ["all", "All"],
  ["Live", "Live"],
  ["Scheduled", "Scheduled"],
  ["Expired", "Expired"],
  ["Used up", "Used up"],
  ["Off", "Off"],
] as const;

const STATE_STYLE: Record<State, string> = {
  Live: "bg-emerald-50 text-emerald-800",
  Scheduled: "bg-blue-50 text-blue-800",
  Expired: "bg-red-50 text-red-700",
  "Used up": "bg-amber-50 text-amber-800",
  Off: "bg-[#EDEDE6] text-[#555C4A]",
};

function stateOf(coupon: AdminCoupon, today: string): State {
  if (!coupon.is_active) return "Off";
  if (coupon.expires_on && today > coupon.expires_on) return "Expired";
  if (coupon.usage_limit !== null && coupon.uses >= coupon.usage_limit) return "Used up";
  if (coupon.starts_on && today < coupon.starts_on) return "Scheduled";
  return "Live";
}

const money = (value: number) => `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
const dateText = (value: string) =>
  new Date(`${value}T00:00:00Z`).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

const EMPTY = {
  code: "",
  label: "",
  discount_type: "percent" as "percent" | "fixed",
  value: "",
  max_discount: "",
  min_subtotal: "",
  starts_on: "",
  expires_on: "",
  usage_limit: "",
  per_customer_limit: "",
  show_on_checkout: false,
  is_active: true,
};

const optionalNumber = (value: string) => (value.trim() === "" ? null : Number(value));
const asText = (value: number | null) => (value === null ? "" : String(value));

export function CouponManager({ coupons, today }: { coupons: AdminCoupon[]; today: string }) {
  useRealtimeRefresh("admin-coupons", ["orders"]);
  const [view, setView] = useViewMode("coupons");
  const { run, busy, locked, error, notice } = useAdminAction();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<(typeof FILTERS)[number][0]>("all");
  const [editing, setEditing] = useState<AdminCoupon | "new" | null>(null);
  const [deleting, setDeleting] = useState<AdminCoupon | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState("");

  const needle = query.trim().toLowerCase();
  const visible = coupons.filter(
    (coupon) =>
      (filter === "all" || stateOf(coupon, today) === filter) &&
      (!needle || `${coupon.code} ${coupon.label}`.toLowerCase().includes(needle)),
  );

  const set = <K extends keyof typeof EMPTY>(key: K, value: (typeof EMPTY)[K]) =>
    setForm((current) => ({ ...current, [key]: value }));

  const openForm = (coupon: AdminCoupon | "new") => {
    setEditing(coupon);
    setFormError("");
    setForm(
      coupon === "new"
        ? EMPTY
        : {
            code: coupon.code,
            label: coupon.label,
            discount_type: coupon.discount_type,
            value: String(coupon.value),
            max_discount: asText(coupon.max_discount),
            min_subtotal: coupon.min_subtotal ? String(coupon.min_subtotal) : "",
            starts_on: coupon.starts_on ?? "",
            expires_on: coupon.expires_on ?? "",
            usage_limit: asText(coupon.usage_limit),
            per_customer_limit: asText(coupon.per_customer_limit),
            show_on_checkout: coupon.show_on_checkout,
            is_active: coupon.is_active,
          },
    );
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editing) return;
    if (!form.code.trim() || !form.label.trim() || !(Number(form.value) > 0)) {
      setFormError("Enter the code, title and a discount value above 0.");
      return;
    }
    const payload = {
      code: form.code.trim().toUpperCase(),
      label: form.label.trim(),
      discount_type: form.discount_type,
      value: Number(form.value),
      max_discount: form.discount_type === "percent" ? optionalNumber(form.max_discount) : null,
      min_subtotal: Number(form.min_subtotal) || 0,
      starts_on: form.starts_on || null,
      expires_on: form.expires_on || null,
      usage_limit: optionalNumber(form.usage_limit),
      per_customer_limit: optionalNumber(form.per_customer_limit),
      show_on_checkout: form.show_on_checkout,
      is_active: form.is_active,
    };
    setSaving(true);
    setFormError("");
    let failure = "";
    const saved = await run(async () => {
      try {
        await adminRequest(
          editing === "new" ? "/api/admin/coupons" : `/api/admin/coupons/${editing.id}`,
          editing === "new" ? "POST" : "PATCH",
          payload,
        );
      } catch (saveError) {
        failure = errorText(saveError);
        throw saveError;
      }
    }, `${payload.code} ${editing === "new" ? "created" : "saved"}.`);
    setSaving(false);
    if (saved) setEditing(null);
    else setFormError(failure);
  };

  const toggle = (coupon: AdminCoupon, key: "is_active" | "show_on_checkout") =>
    run(() => adminRequest(`/api/admin/coupons/${coupon.id}`, "PATCH", { [key]: !coupon[key] }), `${coupon.code} updated.`);

  const codeButton = (coupon: AdminCoupon) => (
    <button
      type="button"
      onClick={() => void copy(coupon.code)}
      title="Copy code"
      className="inline-flex max-w-full items-center gap-2 rounded-lg border border-dashed border-[#536B35]/45 bg-[#EAF1DF]/60 px-3 py-1.5 font-mono text-sm font-bold text-[#263D18]"
    >
      <span className="truncate">{coupon.code}</span>
      <Copy className="size-3.5 shrink-0" />
    </button>
  );
  const stateBadge = (coupon: AdminCoupon) => {
    const state = stateOf(coupon, today);
    return (
      <span className={`shrink-0 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${STATE_STYLE[state]}`}>
        {copied === coupon.code ? "Copied" : state}
      </span>
    );
  };
  const discountText = (coupon: AdminCoupon) =>
    coupon.discount_type === "percent" ? `${coupon.value}% off` : `${money(coupon.value)} off`;
  const validity = (coupon: AdminCoupon) =>
    coupon.starts_on || coupon.expires_on
      ? `${coupon.starts_on ? dateText(coupon.starts_on) : "Now"} – ${coupon.expires_on ? dateText(coupon.expires_on) : "no end date"}`
      : "No end date";
  const activeSwitch = (coupon: AdminCoupon, label: string) => (
    <Switch checked={coupon.is_active} label={label} disabled={locked} onChange={() => void toggle(coupon, "is_active")} />
  );
  const checkoutSwitch = (coupon: AdminCoupon, label: string) => (
    <Switch checked={coupon.show_on_checkout} label={label} disabled={locked} onChange={() => void toggle(coupon, "show_on_checkout")} />
  );
  const actions = (coupon: AdminCoupon) => (
    <div className="flex justify-end gap-1">
      <button type="button" aria-label={`Edit ${coupon.code}`} onClick={() => openForm(coupon)} className={iconButton}>
        <Pencil className="size-4" />
      </button>
      <button type="button" aria-label={`Delete ${coupon.code}`} onClick={() => setDeleting(coupon)} className={dangerIconButton}>
        <Trash2 className="size-4" />
      </button>
    </div>
  );

  const copy = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(code);
      window.setTimeout(() => setCopied(""), 1500);
    } catch {
      // Copying is optional; the code is visible on screen.
    }
  };

  // Worked example for the form.
  const sample = Math.max(1000, Number(form.min_subtotal) || 0);
  const saving1000 = calculateCouponDiscount(
    {
      code: "",
      label: "",
      discountType: form.discount_type,
      value: Number(form.value) || 0,
      maxDiscount: form.discount_type === "percent" ? optionalNumber(form.max_discount) : null,
      minSubtotal: Number(form.min_subtotal) || 0,
    },
    sample,
  );

  const field = (
    key: "label" | "value" | "max_discount" | "min_subtotal" | "starts_on" | "expires_on" | "usage_limit" | "per_customer_limit",
    label: string,
    type: "text" | "number" | "date",
    placeholder = "",
  ) => (
    <label className="block min-w-0 text-sm font-medium">
      {label}
      <input
        type={type}
        {...(type === "number" ? { min: 0, step: key.endsWith("limit") ? 1 : 0.01 } : {})}
        value={form[key]}
        placeholder={placeholder}
        onChange={(event) => set(key, event.target.value)}
        className={inputClass}
      />
    </label>
  );

  return (
    <div className="space-y-5">
      <PageHeader title="Coupons" addLabel="New coupon" onAdd={() => openForm("new")} />
      <StatGrid
        items={[
          ["Coupons", coupons.length],
          ["Live now", coupons.filter((coupon) => stateOf(coupon, today) === "Live").length],
          ["Times used", coupons.reduce((total, coupon) => total + coupon.uses, 0)],
          ["Discount given", money(coupons.reduce((total, coupon) => total + coupon.discountGiven, 0))],
        ]}
      />
      <Toolbar filters={FILTERS} filter={filter} onFilter={setFilter} query={query} onQuery={setQuery} placeholder="Search by code or title" view={view} onView={setView} />
      <Feedback error={editing ? "" : error} notice={notice} />

      {visible.length === 0 ? (
        <EmptyState>{coupons.length === 0 ? "No coupons yet. Create your first one." : "No coupons match."}</EmptyState>
      ) : (
        <DataView
          view={view}
          table={
            <DataTable
              rows={visible}
              columns={[
                { label: "Code", cell: codeButton },
                {
                  label: "Discount",
                  cell: (coupon) => (
                    <>
                      <p className="whitespace-nowrap font-semibold text-[#263D18]">{discountText(coupon)}</p>
                      <p className="text-xs text-[#777968]">{coupon.label}</p>
                    </>
                  ),
                },
                {
                  label: "Conditions",
                  cell: (coupon) => (
                    <div className="text-xs text-[#555C4A]">
                      <p>{coupon.min_subtotal > 0 ? `From ${money(coupon.min_subtotal)}` : "No minimum"}</p>
                      {coupon.max_discount !== null && <p>Up to {money(coupon.max_discount)}</p>}
                      <p>{validity(coupon)}</p>
                    </div>
                  ),
                },
                {
                  label: "Used",
                  cell: (coupon) => (
                    <div className="whitespace-nowrap tabular-nums">
                      <p>
                        <strong>{coupon.uses}</strong>
                        {coupon.usage_limit !== null ? ` / ${coupon.usage_limit}` : ""}
                      </p>
                      <p className="text-xs text-[#777968]">{money(coupon.discountGiven)} given</p>
                    </div>
                  ),
                },
                { label: "Status", cell: stateBadge },
                { label: "Active", cell: (coupon) => activeSwitch(coupon, coupon.is_active ? "On" : "Off") },
                { label: "At checkout", cell: (coupon) => checkoutSwitch(coupon, coupon.show_on_checkout ? "Shown" : "Hidden") },
                { label: "Actions", align: "right", cell: actions },
              ]}
            />
          }
          grid={
            <ul className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
              {visible.map((coupon) => (
                <li key={coupon.id} className={`${panel} flex min-w-0 flex-col gap-3 p-4`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">{codeButton(coupon)}</div>
                    {stateBadge(coupon)}
                  </div>
                  <div>
                    <p className="font-serif text-2xl text-[#263D18]">{discountText(coupon)}</p>
                    <p className="text-sm text-[#555C4A]">{coupon.label}</p>
                  </div>
                  <ul className="space-y-1 text-xs text-[#777968]">
                    <li>{coupon.min_subtotal > 0 ? `Orders from ${money(coupon.min_subtotal)}` : "No minimum order"}</li>
                    {coupon.max_discount !== null && <li>Discount up to {money(coupon.max_discount)}</li>}
                    <li>{validity(coupon)}</li>
                    {coupon.per_customer_limit !== null && <li>{coupon.per_customer_limit} use(s) per customer email</li>}
                  </ul>
                  <div>
                    <p className="flex justify-between gap-2 text-xs text-[#28321F]">
                      <span>
                        Used <strong>{coupon.uses}</strong>
                        {coupon.usage_limit !== null ? ` of ${coupon.usage_limit}` : " (no limit)"}
                      </span>
                      <span className="text-[#777968]">{money(coupon.discountGiven)} given</span>
                    </p>
                    {coupon.usage_limit !== null && (
                      <div className="mt-1 h-2 overflow-hidden rounded-full bg-[#FBF7EE]">
                        <div className="h-full rounded-full bg-[#536B35]" style={{ width: `${Math.min(100, (coupon.uses / coupon.usage_limit) * 100)}%` }} />
                      </div>
                    )}
                  </div>
                  <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-[#28321F]/8 pt-3">
                    <div className="flex flex-wrap gap-x-4 gap-y-2">
                      {activeSwitch(coupon, "Active")}
                      {checkoutSwitch(coupon, "At checkout")}
                    </div>
                    {actions(coupon)}
                  </div>
                </li>
              ))}
            </ul>
          }
        />
      )}

      {editing && (
        <Modal title={editing === "new" ? "New coupon" : `Edit ${editing.code}`} onClose={() => !saving && setEditing(null)}>
          <form onSubmit={save} noValidate className="space-y-4">
            <FormError>{formError}</FormError>
            <label className="block text-sm font-medium">
              Coupon code
              <input
                value={form.code}
                maxLength={30}
                disabled={editing !== "new"}
                placeholder="FESTIVE20"
                onChange={(event) => set("code", event.target.value.toUpperCase().replace(/\s/g, ""))}
                className={`${inputClass} font-mono`}
              />
              {editing !== "new" && <span className="mt-1 block text-xs font-normal text-[#777968]">The code cannot be changed.</span>}
            </label>
            {field("label", "Title shown to customers", "text", "20% Festive Offer")}
            <div>
              <p className="text-sm font-medium">Discount type</p>
              <div className="mt-1.5 grid grid-cols-2 gap-2">
                {(["percent", "fixed"] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    aria-pressed={form.discount_type === type}
                    onClick={() => set("discount_type", type)}
                    className={`h-11 rounded-xl border text-sm font-semibold ${form.discount_type === type ? "border-[#263D18] bg-[#EAF1DF] text-[#263D18]" : "border-[#28321F]/12 text-[#555C4A]"}`}
                  >
                    {type === "percent" ? "Percentage (%)" : "Fixed amount (₹)"}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {field("value", form.discount_type === "percent" ? "Discount (%)" : "Discount (₹)", "number")}
              {form.discount_type === "percent" && field("max_discount", "Maximum discount ₹ (optional)", "number")}
              {field("min_subtotal", "Minimum order ₹ (optional)", "number")}
              {field("starts_on", "Starts on (optional)", "date")}
              {field("expires_on", "Last valid day (optional)", "date")}
              {field("usage_limit", "Total uses (optional)", "number")}
              {field("per_customer_limit", "Uses per email (optional)", "number")}
            </div>
            {saving1000 > 0 && (
              <p className="rounded-xl bg-[#FBF7EE] px-3.5 py-2.5 text-sm text-[#28321F]">
                On a {money(sample)} order the customer saves <strong>{money(saving1000)}</strong>.
              </p>
            )}
            <div className="flex flex-wrap gap-x-6 gap-y-3">
              <Switch checked={form.is_active} label="Active" onChange={() => set("is_active", !form.is_active)} />
              <Switch checked={form.show_on_checkout} label="Show as an offer at checkout" onChange={() => set("show_on_checkout", !form.show_on_checkout)} />
            </div>
            <FormActions busy={saving} label={editing === "new" ? "Create coupon" : "Save changes"} onCancel={() => setEditing(null)} />
          </form>
        </Modal>
      )}

      {deleting && (
        <ConfirmDialog
          title="Delete coupon"
          busy={busy}
          onCancel={() => setDeleting(null)}
          onConfirm={() =>
            void run(() => adminRequest(`/api/admin/coupons/${deleting.id}`, "DELETE"), `${deleting.code} deleted.`).then(() => setDeleting(null))
          }
        >
          Delete <strong>{deleting.code}</strong>? Customers will no longer be able to use it. Past orders keep their discount.
        </ConfirmDialog>
      )}
    </div>
  );
}
