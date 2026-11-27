"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { sendAdminRequest } from "@/components/admin/orders/post-admin";

export function SyncShipmentsButton() {
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);

  const sync = async () => {
    setBusy(true);
    setResult(null);
    const response = await sendAdminRequest<{ synced: number; failed: number; error: string }>(
      "/api/admin/orders/sync-shipments",
    );
    setBusy(false);
    if (!response.ok) {
      setResult({ ok: false, text: response.error });
      return;
    }
    const { synced, failed, error } = response.data;
    setResult({
      ok: failed === 0,
      text: `Synced ${synced} shipment${synced === 1 ? "" : "s"}${failed ? `, ${failed} failed: ${error}` : ""}.`,
    });
  };

  return (
    <div className="flex flex-wrap items-center justify-end gap-3">
      {result && <p role="status" className={`text-xs font-medium ${result.ok ? "text-[#3C6E26]" : "text-red-600"}`}>{result.text}</p>}
      <button
        type="button"
        onClick={() => void sync()}
        disabled={busy}
        title="Fetch the latest courier status for open shipments"
        className="inline-flex h-11 items-center gap-2 rounded-full border border-[#536B35]/30 bg-white px-5 text-sm font-semibold text-[#263D18] disabled:opacity-60"
      >
        <RefreshCw className={`size-4 ${busy ? "animate-spin" : ""}`} />
        {busy ? "Syncing…" : "Sync with Shiprocket"}
      </button>
    </div>
  );
}
