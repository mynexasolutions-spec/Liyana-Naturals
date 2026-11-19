import React from "react";
import { cn } from "@/lib/utils";

interface ProductBadgeProps {
  type: "Best Seller" | "New" | "Organic" | "Award Winner" | "Sale" | string;
  className?: string;
}

export function ProductBadge({ type, className }: ProductBadgeProps) {
  const styles: Record<string, string> = {
    "Best Seller": "bg-[#263D18] text-[#FBF7EE]",
    New: "bg-[#536B35] text-white",
    Organic: "bg-[#A8B88A]/30 text-[#1D3214] border border-[#536B35]/20",
    "Award Winner": "bg-[#E9DCC5] text-[#263D18]",
    Sale: "bg-red-800 text-white",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold tracking-wider uppercase shadow-xs",
        styles[type] || "bg-[#E9DCC5] text-[#28321F]",
        className
      )}
    >
      {type}
    </span>
  );
}
