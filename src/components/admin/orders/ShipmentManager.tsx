"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ExternalLink, RefreshCw, Truck } from "lucide-react";
import { ShipmentTracking } from "@/components/orders/ShipmentTracking";
import { sendAdminRequest } from "@/components/admin/orders/post-admin";
import { SHIPROCKET_NEW_ORDERS_URL, type TrackingScan } from "@/lib/shiprocket/shared";

interface ShipmentManagerProps {
  orderId: string;
  blockedReason: string | null;
  shiprocketOrderId: string | null;
  awbCode: string | null;
  courierName: string | null;
  status: string | null;
  scans: TrackingScan[];
  defaults: { weightKg: number; lengthCm: number; breadthCm: number; heightCm: number };
}

const FIELDS = [
  ["weightKg", "Weight (kg)"],
  ["lengthCm", "Length (cm)"],
  ["breadthCm", "Breadth (cm)"],
  ["heightCm", "Height (cm)"],
] as const;

export function ShipmentManager(props: ShipmentManagerProps) {
  const router = useRouter();
  const [parcel, setParcel] = useState(() => ({
    weightKg: String(props.defaults.weightKg),
    lengthCm: String(props.defaults.lengthCm),
    breadthCm: String(props.defaults.breadthCm),
    heightCm: String(props.defaults.heightCm),
  }));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const run = async (path: string, body: unknown, success: string) => {
    setBusy(true);
    setError("");
    setMessage("");
    const result = await sendAdminRequest(`/api/admin/orders/${props.orderId}/${path}`, body);
    setBusy(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setMessage(success);
    router.refresh();
  };

  const ship = (event: React.FormEvent) => {
    event.preventDefault();
    const body = Object.fromEntries(FIELDS.map(([key]) => [key, Number(parcel[key])]));
    void run("shipment", body, "Order sent to Shiprocket. Now click Ship Now there and pick a courier.");
  };

  const feedback = (
    <>
      {error && <p role="alert" className="text-sm font-medium text-red-600">{error}</p>}
      {message && <p role="status" className="text-sm font-medium text-[#3C6E26]">{message}</p>}
    </>
  );

  if (!props.shiprocketOrderId) {
    return (
      <section className="rounded-2xl border border-[#28321F]/8 bg-white p-5 space-y-3">
        <h2 className="flex items-center gap-2 font-serif text-xl text-[#263D18]">
          <Truck className="size-5" /> Ship via Shiprocket
        </h2>
        {props.blockedReason ? (
          <p className="text-sm text-[#777968]">{props.blockedReason}</p>
        ) : (
          <form onSubmit={ship} className="space-y-3">
            <p className="text-sm text-[#777968]">Enter the packed parcel&apos;s weight and size. Then pick a courier in Shiprocket.</p>
            <div className="grid grid-cols-2 gap-3">
              {FIELDS.map(([key, label]) => (
                <label key={key} className="block text-xs font-medium text-[#28321F]">
                  {label}
                  <input
                    type="number"
                    step="0.01"
                    min="0.05"
                    required
                    value={parcel[key]}
                    onChange={(e) => setParcel((current) => ({ ...current, [key]: e.target.value }))}
                    className="mt-1 h-11 w-full rounded-xl border border-[#28321F]/10 px-3 text-sm outline-none focus:border-[#536B35]"
                  />
                </label>
              ))}
            </div>
            {feedback}
            <button type="submit" disabled={busy} className="h-11 w-full rounded-full bg-[#263D18] text-sm font-semibold text-white disabled:cursor-wait disabled:opacity-60">
              {busy ? "Sending…" : "Confirm Shipment"}
            </button>
          </form>
        )}
      </section>
    );
  }

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-[#28321F]/8 bg-white p-4">
        <p className="text-xs text-[#777968]">
          Shiprocket order ID
          <span className="block select-all break-all font-mono text-sm font-bold text-[#263D18]">{props.shiprocketOrderId}</span>
        </p>
        <button
          type="button"
          disabled={busy}
          onClick={() => void run("sync", {}, "Status synced from Shiprocket.")}
          className="inline-flex items-center gap-1.5 rounded-full border border-[#536B35]/30 px-3.5 py-2 text-xs font-semibold text-[#263D18] disabled:opacity-60"
        >
          <RefreshCw className={`size-3.5 ${busy ? "animate-spin" : ""}`} /> Sync status
        </button>
      </div>
      {feedback}
      <ShipmentTracking awbCode={props.awbCode} courierName={props.courierName} status={props.status} scans={props.scans} />
      {!props.awbCode && (
        <a
          href={SHIPROCKET_NEW_ORDERS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[#263D18] text-sm font-semibold text-white"
        >
          <ExternalLink className="size-4" /> Open Shiprocket to pick a courier
        </a>
      )}
    </section>
  );
}
