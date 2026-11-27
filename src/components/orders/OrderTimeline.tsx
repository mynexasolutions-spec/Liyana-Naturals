import { CheckCircle2, Package, PackageCheck, Truck, XCircle } from "lucide-react";
import { formatIndiaTime, type OrderStatus } from "@/lib/shiprocket/shared";
import { cn } from "@/lib/utils";

const STEPS = [
  { title: "Order Placed", icon: Package },
  { title: "Processing", icon: PackageCheck },
  { title: "Shipped", icon: Truck },
  { title: "Delivered", icon: CheckCircle2 },
];

const STEP_OF: Record<OrderStatus, number> = {
  pending: 0,
  confirmed: 1,
  processing: 1,
  shipped: 2,
  delivered: 3,
  cancelled: 0,
  returned: 0,
};

interface OrderTimelineProps {
  status: OrderStatus;
  placedAt: string;
  processingAt: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
}

export function OrderTimeline({ status, placedAt, processingAt, shippedAt, deliveredAt }: OrderTimelineProps) {
  if (status === "cancelled" || status === "returned") {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-red-300/60 bg-red-50 p-5">
        <XCircle className="w-6 h-6 shrink-0 text-red-600" />
        <p className="font-heading text-lg font-bold text-red-800">
          This order was {status}
        </p>
      </div>
    );
  }

  const current = STEP_OF[status];
  const times = [placedAt, processingAt, shippedAt, deliveredAt];

  return (
    <div className="rounded-2xl border border-[#28321F]/10 bg-white p-4 sm:p-6 shadow-card">
      <div className="relative">
        {/* Wider screens: one line across the steps. */}
        <div className="hidden sm:block absolute left-[12.5%] right-[12.5%] top-5 h-1 rounded-full bg-[#EAF1DF]">
          <div className="h-full rounded-full bg-[#536B35] transition-all duration-700" style={{ width: `${(current / (STEPS.length - 1)) * 100}%` }} />
        </div>
        {/* Phones show the steps from top to bottom. */}
        <ol className="relative flex flex-col sm:grid sm:grid-cols-4">
          {STEPS.map((step, index) => {
            const reached = index <= current;
            const Icon = step.icon;
            return (
              <li
                key={step.title}
                aria-current={index === current ? "step" : undefined}
                className="relative flex items-start gap-4 pb-6 last:pb-0 sm:flex-col sm:items-center sm:gap-0 sm:px-0.5 sm:pb-0 sm:text-center"
              >
                {index < STEPS.length - 1 && (
                  <span
                    aria-hidden="true"
                    className={cn("absolute bottom-0 left-[18px] top-10 w-1 sm:hidden", index < current ? "bg-[#536B35]" : "bg-[#EAF1DF]")}
                  />
                )}
                <span className={cn("grid size-10 shrink-0 place-items-center rounded-full", reached ? "bg-[#263D18] text-[#FBF7EE]" : "border-2 border-[#536B35]/20 bg-white text-[#536B35]/40", index === current && "ring-4 ring-[#A8B88A]/40")}>
                  <Icon className="w-4 h-4" />
                </span>
                <div className={cn("min-w-0 sm:mt-2 sm:pt-0", reached && times[index] ? "pt-0.5" : "pt-2.5")}>
                  <span className={cn("block text-sm font-bold leading-tight", reached ? "text-[#263D18]" : "text-[#777968]/60")}>
                    {step.title}
                  </span>
                  {reached && times[index] && (
                    <span className="mt-1 block text-xs leading-snug text-[#536B35]">
                      {formatIndiaTime(times[index])}
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
