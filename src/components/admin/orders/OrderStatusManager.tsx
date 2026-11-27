"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { sendAdminRequest } from "@/components/admin/orders/post-admin";

const ORDER_STATUSES = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "returned"];
const PAYMENT_STATUSES = ["pending", "paid", "failed", "refunded"];

interface OrderStatusManagerProps {
  orderId: string;
  status: string;
  paymentStatus: string;
  attentionNote: string | null;
}

export function OrderStatusManager({ orderId, status, paymentStatus, attentionNote }: OrderStatusManagerProps) {
  const router = useRouter();
  const [nextStatus, setNextStatus] = useState(status);
  const [nextPayment, setNextPayment] = useState(paymentStatus);
  const [clearAttention, setClearAttention] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loaded, setLoaded] = useState({ status, paymentStatus });

  // Follow changes made by the courier webhook or a sync.
  if (loaded.status !== status || loaded.paymentStatus !== paymentStatus) {
    setLoaded({ status, paymentStatus });
    setNextStatus(status);
    setNextPayment(paymentStatus);
  }

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");
    const result = await sendAdminRequest(
      `/api/admin/orders/${orderId}`,
      { status: nextStatus, paymentStatus: nextPayment, clearAttention },
      "PATCH",
    );
    setSaving(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setClearAttention(false);
    setMessage("Order updated.");
    router.refresh();
  };

  const select = (label: string, value: string, options: string[], onChange: (value: string) => void) => (
    <label className="block text-xs font-medium text-[#28321F]">
      {label}
      <select value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 h-11 w-full rounded-xl border border-[#28321F]/10 px-3 text-sm capitalize">
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );

  return (
    <form onSubmit={save} className="rounded-2xl border border-[#28321F]/8 bg-white p-5 space-y-3">
      <h2 className="font-serif text-xl text-[#263D18]">Manage Status</h2>
      {attentionNote && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
          {attentionNote}
          <label className="mt-2 flex items-center gap-2 text-xs font-medium">
            <input type="checkbox" checked={clearAttention} onChange={(e) => setClearAttention(e.target.checked)} />
            Mark as resolved
          </label>
        </div>
      )}
      {select("Order status", nextStatus, ORDER_STATUSES, setNextStatus)}
      {select("Payment status", nextPayment, PAYMENT_STATUSES, setNextPayment)}
      {error && <p role="alert" className="text-sm font-medium text-red-600">{error}</p>}
      {message && <p role="status" className="text-sm font-medium text-[#3C6E26]">{message}</p>}
      <button type="submit" disabled={saving} className="h-11 w-full rounded-full bg-[#263D18] text-sm font-semibold text-white disabled:cursor-wait disabled:opacity-60">
        {saving ? "Saving…" : "Save status"}
      </button>
    </form>
  );
}
