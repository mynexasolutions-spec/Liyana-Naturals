"use client";

import { useState } from "react";

type Day = { date: string; revenue: number; orders: number };

const money = (value: number) => `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

// Short axis labels in Indian units.
function axisMoney(value: number): string {
  if (value >= 10_000_000) return `₹${+(value / 10_000_000).toFixed(1)}Cr`;
  if (value >= 100_000) return `₹${+(value / 100_000).toFixed(1)}L`;
  if (value >= 1_000) return `₹${+(value / 1_000).toFixed(1)}K`;
  return `₹${value}`;
}

// The next round number above the tallest bar.
function axisTop(max: number): number {
  if (max <= 0) return 1000;
  const unit = 10 ** Math.floor(Math.log10(max));
  const step = [1, 2, 4, 5, 10].find((multiple) => multiple * unit >= max) ?? 10;
  return step * unit;
}

const dayLabel = (date: string) =>
  new Date(`${date}T00:00:00Z`).toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: "UTC" });

export function SalesChart({ days }: { days: Day[] }) {
  const [active, setActive] = useState<number | null>(null);
  const top = axisTop(Math.max(0, ...days.map((day) => day.revenue)));
  const hasSales = days.some((day) => day.revenue > 0);
  const selected = active === null ? null : days[active];
  const position = active === null ? 0 : ((active + 0.5) / days.length) * 100;

  return (
    <div>
      <div className="flex gap-2">
        <div className="flex h-52 w-12 shrink-0 flex-col justify-between text-right text-[11px] tabular-nums text-[#777968]">
          {[top, top / 2, 0].map((value) => (
            <span key={value} className="leading-none">
              {axisMoney(value)}
            </span>
          ))}
        </div>

        <div className="relative h-52 min-w-0 flex-1">
          <div aria-hidden="true" className="absolute inset-0 flex flex-col justify-between">
            <span className="border-t border-[#28321F]/8" />
            <span className="border-t border-[#28321F]/8" />
            <span className="border-t border-[#28321F]/20" />
          </div>

          <div className="relative flex h-full items-end gap-[2px]" onMouseLeave={() => setActive(null)}>
            {days.map((day, index) => (
              // The whole column is the hover target, not just the bar.
              <button
                key={day.date}
                type="button"
                aria-label={`${dayLabel(day.date)}: ${money(day.revenue)}, ${day.orders} paid orders`}
                onMouseEnter={() => setActive(index)}
                onFocus={() => setActive(index)}
                onBlur={() => setActive(null)}
                onClick={() => setActive(index)}
                className={`flex h-full min-w-0 flex-1 items-end justify-center rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-[#536B35] ${active === index ? "bg-[#EAF1DF]/70" : ""}`}
              >
                {day.revenue > 0 && (
                  <span
                    className={`w-full max-w-5 rounded-t-[4px] ${active === index ? "bg-[#263D18]" : "bg-[#536B35]"}`}
                    style={{ height: `${Math.max(1.5, (day.revenue / top) * 100)}%` }}
                  />
                )}
              </button>
            ))}
          </div>

          {selected && (
            <div
              role="status"
              className="pointer-events-none absolute top-0 z-10 whitespace-nowrap rounded-lg border border-[#28321F]/10 bg-white px-3 py-2 text-xs shadow-[0_8px_24px_rgba(38,61,24,0.14)]"
              // Shifting by the same percentage keeps the box inside the chart near either edge.
              style={{ left: `${position}%`, transform: `translateX(-${position}%)` }}
            >
              <p className="text-[#777968]">{dayLabel(selected.date)}</p>
              <p className="text-sm font-semibold text-[#263D18]">{money(selected.revenue)}</p>
              <p className="text-[#777968]">
                {selected.orders} paid order{selected.orders === 1 ? "" : "s"}
              </p>
            </div>
          )}

          {!hasSales && (
            <p className="pointer-events-none absolute inset-0 grid place-items-center text-sm text-[#777968]">
              No sales in the last {days.length} days.
            </p>
          )}
        </div>
      </div>

      <div className="ml-14 mt-2 flex justify-between text-[11px] text-[#777968]">
        {[0, Math.floor(days.length / 2), days.length - 1].map((index) => (
          <span key={index}>{days[index] ? dayLabel(days[index].date) : ""}</span>
        ))}
      </div>

      {hasSales && (
        <details className="mt-3 text-xs">
          <summary className="cursor-pointer font-medium text-[#536B35]">View as table</summary>
          <table className="mt-2 w-full text-left tabular-nums">
            <thead className="text-[#777968]">
              <tr>
                <th className="py-1 font-medium">Date</th>
                <th className="py-1 font-medium">Paid orders</th>
                <th className="py-1 text-right font-medium">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {days
                .filter((day) => day.revenue > 0)
                .map((day) => (
                  <tr key={day.date} className="border-t border-[#28321F]/8">
                    <td className="py-1">{dayLabel(day.date)}</td>
                    <td className="py-1">{day.orders}</td>
                    <td className="py-1 text-right">{money(day.revenue)}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </details>
      )}
    </div>
  );
}
