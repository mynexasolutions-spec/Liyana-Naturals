import React from "react";
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center" | "right";
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
  className,
}: SectionHeadingProps) {
  const alignment = {
    left: "text-left items-start",
    center: "text-center items-center mx-auto",
    right: "text-right items-end ml-auto",
  };

  return (
    <div className={cn("max-w-2xl flex flex-col mb-12", alignment[align], className)}>
      {eyebrow && (
        <span className="text-xs uppercase tracking-[0.2em] font-semibold text-[#536B35] mb-2">
          {eyebrow}
        </span>
      )}
      <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl text-[#263D18] tracking-tight leading-[1.15] mb-3">
        {title}
      </h2>
      {subtitle && (
        <p className="text-sm sm:text-base text-[#777968] font-light leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
}
