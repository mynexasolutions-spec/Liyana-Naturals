import { CheckCircle2, ExternalLink, MapPin, Package, Truck } from "lucide-react";
import { formatIndiaTime, shipmentTone, trackingUrl, type TrackingScan } from "@/lib/shiprocket/shared";
import { cn } from "@/lib/utils";

const TONE = {
  green: "text-emerald-800 bg-emerald-50 border-emerald-500/35",
  red: "text-red-700 bg-red-50 border-red-500/35",
  blue: "text-blue-800 bg-blue-50 border-blue-500/35",
  gold: "text-[#263D18] bg-[#EAF1DF] border-[#536B35]/30",
};

/** A picture for what happened in a tracking entry. */
function scanIcon(activity: string | null) {
  const text = (activity ?? "").toLowerCase();
  // "Out for delivery" and "undelivered" are not a delivery.
  if (/\bdelivered\b/.test(text)) return CheckCircle2;
  return /transit|out for|dispatch|pick/.test(text) ? Truck : Package;
}

interface ShipmentTrackingProps {
  awbCode: string | null;
  courierName: string | null;
  status: string | null;
  scans: TrackingScan[];
}

// Used on both the customer order page and the admin order page.
export function ShipmentTracking({ awbCode, courierName, status, scans }: ShipmentTrackingProps) {
  // Scans arrive newest first.
  const currentLocation = scans.find((scan) => scan.location)?.location;
  const tone = shipmentTone(status);

  return (
    <section
      aria-label="Shipment tracking"
      className="rounded-3xl bg-gradient-to-br from-[#263D18] via-[#C9A961]/70 to-[#536B35] p-[2px] shadow-[0_8px_40px_-12px_rgba(38,61,24,0.35)]"
    >
      <div className="relative overflow-hidden rounded-[22px] bg-white p-4 sm:p-6">
        <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-[#536B35]/10 blur-[90px]" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-24 -left-24 size-72 rounded-full bg-[#C9A961]/15 blur-[90px]" />

        <div className="relative mb-5 flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid size-11 shrink-0 rotate-3 place-items-center rounded-2xl bg-gradient-to-br from-[#263D18] to-[#536B35] text-white shadow-lg">
              <Truck className="size-5" />
            </span>
            <div className="min-w-0">
              <h2 className="truncate font-heading text-lg sm:text-xl font-bold leading-tight text-[#263D18]">Shipment Tracking</h2>
              <p className="mt-0.5 text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-[#777968]">Powered by Shiprocket</p>
            </div>
          </div>
          {awbCode && tone !== "green" && tone !== "red" && (
            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-50 px-2.5 py-1 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-emerald-700">
              <span aria-hidden="true" className="relative flex size-1.5">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500/60" />
                <span className="relative inline-flex size-1.5 rounded-full bg-emerald-500" />
              </span>
              Live
            </span>
          )}
        </div>

        {/* Status and AWB */}
        <div className="relative flex flex-wrap items-center justify-between gap-x-4 gap-y-3 rounded-2xl border border-[#536B35]/20 bg-gradient-to-br from-[#FBF7EE] to-[#EAF1DF]/60 p-4">
          {status ? (
            <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs sm:text-sm font-bold uppercase tracking-wider", TONE[tone])}>
              {tone === "green" && <CheckCircle2 className="size-4" />}
              {status}
            </span>
          ) : (
            <span className="text-sm font-semibold text-[#777968]">Status not available yet</span>
          )}
          <p className="flex min-w-0 flex-wrap items-center gap-x-2 text-xs sm:text-sm">
            <span className="font-bold uppercase tracking-wider text-[#777968]">AWB</span>
            <span className="select-all break-all font-mono font-bold text-[#263D18]">{awbCode ?? "Not assigned yet"}</span>
            {awbCode && courierName && <span className="font-bold text-[#263D18]">· {courierName}</span>}
          </p>
        </div>

        {currentLocation && (
          <p className="relative mt-3 flex items-center gap-2 text-sm">
            <MapPin className="size-4 shrink-0 text-[#536B35]" />
            <span className="text-[#777968]">Current location:</span>
            <strong className="min-w-0 break-words text-[#263D18]">{currentLocation}</strong>
          </p>
        )}

        {awbCode && (
          <a
            href={trackingUrl(awbCode)}
            target="_blank"
            rel="noopener noreferrer"
            className="relative mt-3.5 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#263D18] to-[#536B35] px-5 py-3 text-[11px] sm:text-xs font-bold uppercase tracking-wide text-white shadow-lg shadow-[#263D18]/20 transition-all hover:shadow-xl sm:inline-flex sm:w-auto sm:hover:scale-[1.02]"
          >
            <ExternalLink className="size-3.5 shrink-0" />
            Track Shipment on Shiprocket
          </a>
        )}

        {scans.length > 0 ? (
          <div className="relative mt-6 border-t border-[#28321F]/10 pt-5">
            <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-[#777968]">Tracking Timeline</h3>
            <ol className="max-h-96 overflow-y-auto pr-1">
              {scans.map((scan, index) => {
                const isLatest = index === 0;
                const Icon = scanIcon(scan.activity);
                return (
                  <li key={`${scan.date}-${index}`} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <span className={cn("shrink-0 rounded-full", isLatest && "bg-[#536B35]/15 p-1")}>
                        <span
                          className={cn(
                            "grid size-9 place-items-center rounded-full",
                            isLatest
                              ? "bg-gradient-to-br from-[#263D18] to-[#536B35] text-white shadow-lg shadow-[#536B35]/30"
                              : "border-2 border-[#536B35]/20 bg-white text-[#777968]",
                          )}
                        >
                          <Icon className="size-4" />
                        </span>
                      </span>
                      {index !== scans.length - 1 && <span className="my-1 w-px flex-1 bg-[#536B35]/20" />}
                    </div>
                    <div
                      className={cn(
                        "min-w-0 flex-1",
                        isLatest ? "mb-4 rounded-xl border border-[#536B35]/20 bg-[#EAF1DF]/60 px-4 py-3" : "pb-5 pt-1",
                      )}
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <p className={cn("break-words text-sm font-bold", isLatest ? "text-[#263D18]" : "text-[#555C4A]")}>{scan.activity}</p>
                        {isLatest && (
                          <span className="rounded-full border border-[#536B35]/25 bg-white px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#536B35]">
                            Latest
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-[#777968]">{[scan.location, formatIndiaTime(scan.date)].filter(Boolean).join(" · ")}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        ) : (
          !awbCode && (
            <p className="relative mt-5 border-t border-[#28321F]/10 pt-4 text-sm text-[#777968]">
              Tracking details will appear here once the courier is assigned.
            </p>
          )
        )}
      </div>
    </section>
  );
}
