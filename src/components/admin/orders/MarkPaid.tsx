"use client";

import React, { useState } from "react";
import { Check } from "lucide-react";
import { adminRequest, ConfirmDialog, Feedback, useAdminAction } from "@/components/admin/kit";

// For online orders whose payment did not arrive: used by the orders list and
// the order page.

export const UNPAID_MESSAGE = "Payment not received. Ask the customer to pay again.";

export const markPaid = (orderId: string) => adminRequest(`/api/admin/orders/${orderId}/mark-paid`, "POST", {});

export function MarkPaidButton({ disabled, onClick }: { disabled: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="inline-flex h-8 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-[#263D18]/25 bg-white px-3 text-xs font-semibold text-[#263D18] hover:bg-[#EAF1DF] disabled:opacity-50"
    >
      <Check className="size-3.5" /> Mark paid
    </button>
  );
}

export function MarkPaidDialog({
  orderNumber,
  amount,
  busy,
  onCancel,
  onConfirm,
}: {
  orderNumber: string;
  amount: string;
  busy: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <ConfirmDialog title="Mark as paid" confirmLabel="Yes, money received" busy={busy} onCancel={onCancel} onConfirm={onConfirm}>
      <p>
        Mark order <strong>{orderNumber}</strong> of <strong>{amount}</strong> as paid?
      </p>
      <p className="mt-3 rounded-xl border border-amber-300 bg-amber-50 px-3.5 py-2.5 text-amber-900">
        Do this only after you see the money in Razorpay or your bank account. A screenshot from the customer is not enough.
      </p>
    </ConfirmDialog>
  );
}

/** The banner on the order page. */
export function UnpaidOrderBanner({ orderId, orderNumber, amount }: { orderId: string; orderNumber: string; amount: string }) {
  const { run, busy, locked, error, notice } = useAdminAction();
  const [confirming, setConfirming] = useState(false);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4">
        <p className="text-sm font-semibold text-red-700">{UNPAID_MESSAGE}</p>
        <MarkPaidButton disabled={locked} onClick={() => setConfirming(true)} />
      </div>
      <Feedback error={error} notice={notice} />
      {confirming && (
        <MarkPaidDialog
          orderNumber={orderNumber}
          amount={amount}
          busy={busy}
          onCancel={() => setConfirming(false)}
          onConfirm={() =>
            void run(() => markPaid(orderId), `${orderNumber} marked as paid.`).then(() => setConfirming(false))
          }
        />
      )}
    </div>
  );
}
