"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2, ChevronRight, ExternalLink, LogOut, Mail, Package, Pencil, Phone, Truck, User } from "lucide-react";
import { useStore } from "@/context/StoreContext";
import { registerInputSchema } from "@/lib/auth/schema";
import { formatIndiaTime, trackingUrl, type OrderStatus } from "@/lib/shiprocket/shared";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { cn } from "@/lib/utils";

export type AccountOrder = {
  id: string;
  orderNumber: string;
  createdAt: string;
  status: OrderStatus;
  total: number;
  awbCode: string | null;
  courierName: string | null;
  items: { name: string; quantity: number }[];
};

type Profile = { fullName: string; email: string; phone: string };

const STATUS_STYLES: Record<OrderStatus, string> = {
  pending: "text-amber-800 bg-amber-50 border-amber-500/25",
  confirmed: "text-[#263D18] bg-[#EAF1DF] border-[#536B35]/30",
  processing: "text-[#263D18] bg-[#EAF1DF] border-[#536B35]/30",
  shipped: "text-blue-900 bg-blue-50 border-blue-500/30",
  delivered: "text-emerald-900 bg-emerald-50 border-emerald-500/30",
  cancelled: "text-red-800 bg-red-50 border-red-500/30",
  returned: "text-red-800 bg-red-50 border-red-500/30",
};

const FILTERS = ["all", "pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "returned"] as const;

const inputClass =
  "w-full rounded-xl border border-[#28321F]/15 bg-[#FBF7EE]/55 px-3.5 py-2.5 text-sm text-[#28321F] focus:bg-white focus:outline-none focus:border-[#536B35] focus:ring-2 focus:ring-[#536B35]/15";
const primaryButton =
  "rounded-full bg-[#263D18] hover:bg-[#1D3214] px-5 py-2.5 text-xs sm:text-sm font-semibold text-[#FBF7EE] transition-colors disabled:opacity-60 cursor-pointer";

function ProfilePanel({ profile }: { profile: Profile }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState(profile.fullName);
  const [phone, setPhone] = useState(profile.phone);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    const parsed = registerInputSchema
      .pick({ fullName: true, mobile: true })
      .safeParse({ fullName, mobile: phone });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Check your details.");
      return;
    }
    setSaving(true);
    try {
      // Updates only the signed-in user's own details.
      const { error: updateError } = await createSupabaseBrowserClient().auth.updateUser({
        data: { full_name: parsed.data.fullName, phone: parsed.data.mobile },
      });
      if (updateError) {
        setError("Your profile could not be saved. Please try again.");
        return;
      }
      setEditing(false);
      setSaved(true);
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-2xl border border-[#28321F]/10 bg-white p-4 sm:p-6 shadow-card space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-heading text-2xl font-bold text-[#263D18]">My Profile</h2>
        {!editing && (
          <button
            type="button"
            onClick={() => {
              setEditing(true);
              setSaved(false);
            }}
            className="inline-flex items-center gap-1.5 rounded-full border border-[#28321F]/15 px-4 py-2 text-xs font-semibold text-[#263D18] hover:bg-[#FBF7EE] cursor-pointer"
          >
            <Pencil className="w-3.5 h-3.5" /> Edit
          </button>
        )}
      </div>

      {saved && (
        <p role="status" className="flex items-center gap-2 text-sm font-medium text-[#3C6E26]">
          <CheckCircle2 className="w-4 h-4" /> Profile saved.
        </p>
      )}

      {editing ? (
        <form onSubmit={save} className="space-y-3">
          {error && (
            <p role="alert" className="flex items-center gap-2 text-sm font-medium text-[#C2652B]">
              <AlertCircle className="w-4 h-4 shrink-0" /> {error}
            </p>
          )}
          <label className="block text-xs font-semibold text-[#28321F]">
            Full Name
            <input value={fullName} onChange={(e) => setFullName(e.target.value)} autoComplete="name" className={cn(inputClass, "mt-1.5")} />
          </label>
          <label className="block text-xs font-semibold text-[#28321F]">
            Phone Number
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" className={cn(inputClass, "mt-1.5")} />
          </label>
          <div className="flex gap-2.5 pt-1">
            <button type="submit" disabled={saving} className={primaryButton}>
              {saving ? "Saving…" : "Save Changes"}
            </button>
            <button
              type="button"
              onClick={() => {
                setEditing(false);
                setFullName(profile.fullName);
                setPhone(profile.phone);
                setError("");
              }}
              className="rounded-full border border-[#28321F]/15 px-5 py-2.5 text-xs sm:text-sm font-semibold text-[#28321F] cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <dl className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { label: "Name", value: profile.fullName, icon: User },
            { label: "Email", value: profile.email, icon: Mail },
            { label: "Phone", value: profile.phone || "Not provided", icon: Phone },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="rounded-xl border border-[#28321F]/10 bg-[#FBF7EE]/70 p-3.5">
              <dt className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#536B35]">
                <Icon className="w-3.5 h-3.5" /> {label}
              </dt>
              <dd className="mt-1 break-all text-sm font-semibold text-[#263D18]">{value}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}

export function AccountTabs({ profile, orders }: { profile: Profile; orders: AccountOrder[] }) {
  const router = useRouter();
  const { logoutUser } = useStore();
  const [tab, setTab] = useState<"orders" | "profile">("orders");
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("all");
  const visible = filter === "all" ? orders : orders.filter((order) => order.status === filter);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1 rounded-full border border-[#28321F]/10 bg-white p-1">
          {(["orders", "profile"] as const).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              aria-pressed={tab === key}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-5 py-2 text-xs sm:text-sm font-semibold transition-colors cursor-pointer",
                tab === key ? "bg-[#263D18] text-[#FBF7EE]" : "text-[#555C4A] hover:text-[#263D18]",
              )}
            >
              {key === "orders" ? <Package className="w-4 h-4" /> : <User className="w-4 h-4" />}
              {key === "orders" ? "Orders" : "My Profile"}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={async () => {
            await logoutUser();
            router.replace("/login");
          }}
          className="inline-flex items-center gap-1.5 rounded-full border border-[#28321F]/15 bg-white px-4 py-2 text-xs font-semibold text-[#C2652B] hover:bg-[#FFF5F2] cursor-pointer"
        >
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>

      {tab === "profile" ? (
        <ProfilePanel profile={profile} />
      ) : orders.length === 0 ? (
        <div className="rounded-2xl border border-[#28321F]/10 bg-white px-5 py-12 text-center shadow-card space-y-3">
          <Package className="mx-auto w-8 h-8 text-[#536B35]" />
          <h2 className="font-heading text-2xl font-bold text-[#263D18]">No orders yet</h2>
          <p className="text-sm text-[#777968]">When you place an order, you can see and track it here.</p>
          <Link href="/shop" className={cn(primaryButton, "inline-flex")}>
            Shop Now
          </Link>
        </div>
      ) : (
        <>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {FILTERS.map((key) => {
              const count = key === "all" ? orders.length : orders.filter((order) => order.status === key).length;
              if (key !== "all" && count === 0) return null;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setFilter(key)}
                  aria-pressed={filter === key}
                  className={cn(
                    "shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold capitalize cursor-pointer",
                    filter === key ? "border-[#263D18] bg-[#263D18] text-[#FBF7EE]" : "border-[#28321F]/15 bg-white text-[#555C4A]",
                  )}
                >
                  {key} ({count})
                </button>
              );
            })}
          </div>

          <ul className="space-y-3.5">
            {visible.map((order) => (
              <li key={order.id} className="rounded-2xl border border-[#28321F]/10 bg-white p-4 sm:p-5 shadow-card">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-sans text-sm sm:text-base font-bold tabular-nums tracking-wide text-[#263D18] break-all">{order.orderNumber}</p>
                    <p className="text-xs text-[#777968]">{formatIndiaTime(order.createdAt, false)}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-base sm:text-lg font-bold text-[#263D18]">₹{order.total.toLocaleString("en-IN")}</p>
                    <span className={cn("mt-1 inline-block rounded-full border px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider", STATUS_STYLES[order.status])}>
                      {order.status}
                    </span>
                  </div>
                </div>

                <ul className="mt-3 border-t border-[#28321F]/10 pt-3 text-sm text-[#555C4A] space-y-1">
                  {order.items.map((item, index) => (
                    <li key={index}>
                      {item.name} × {item.quantity}
                    </li>
                  ))}
                </ul>

                {order.awbCode && (
                  <div className="mt-3 flex items-center gap-3 rounded-xl border border-[#536B35]/20 bg-[#EAF1DF]/60 p-3">
                    <Truck className="w-4 h-4 shrink-0 text-[#263D18]" />
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#536B35]">{order.courierName ?? "Courier"}</p>
                      <p className="truncate font-mono text-sm font-bold text-[#263D18]">{order.awbCode}</p>
                    </div>
                    <a
                      href={trackingUrl(order.awbCode)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[#536B35]/30 bg-white px-3 py-1.5 text-xs font-bold text-[#263D18]"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Track
                    </a>
                  </div>
                )}

                <div className="mt-3 flex justify-end">
                  <Link href={`/account/orders/${order.id}`} className="inline-flex items-center gap-1 text-sm font-semibold text-[#536B35] hover:text-[#263D18]">
                    View Details <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
