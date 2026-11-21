import React from "react";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";

interface PageLoaderProps {
  isVisible: boolean;
  brandName?: string;
  subtitle?: string;
  className?: string;
}

export function PageLoader({
  isVisible,
  brandName = siteConfig.name,
  subtitle = "Pure Botanical Care",
  className,
}: PageLoaderProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy={isVisible}
      className={cn(
        "absolute inset-0 z-30 bg-[#FBF7EE] transition-opacity duration-300 ease-out",
        isVisible ? "opacity-100" : "opacity-0 pointer-events-none",
        className
      )}
    >
      {/* Centered Viewport Stage between Header & Footer */}
      <div className="sticky top-[80px] sm:top-[84px] h-[calc(100dvh-118px)] w-full flex flex-col items-center justify-center px-4 sm:px-6 overflow-hidden select-none">
        {/* Subtle Ambient Botanical Glow */}
        <div
          aria-hidden="true"
          className="absolute w-56 h-56 sm:w-72 sm:h-72 rounded-full bg-[#A8B88A]/15 blur-3xl pointer-events-none"
        />

        {/* Animated Centerpiece */}
        <div
          className={cn(
            "relative z-10 flex flex-col items-center text-center transition-all duration-300 ease-out",
            isVisible ? "scale-100 opacity-100" : "scale-95 opacity-0"
          )}
        >
          {/* Logo + Rotating Circular Ring */}
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 flex items-center justify-center">
            {/* Static Subtle Outer Guide Ring */}
            <div
              aria-hidden="true"
              className="absolute inset-0 rounded-full border border-[#A8B88A]/35"
            />

            {/* Primary Smooth Rotating Gradient Ring */}
            <svg
              aria-hidden="true"
              viewBox="0 0 120 120"
              fill="none"
              className="absolute inset-0 w-full h-full animate-[spin_1.35s_linear_infinite] motion-reduce:animate-none"
            >
              <defs>
                <linearGradient
                  id="liyanaLoaderRingGrad"
                  x1="12"
                  y1="12"
                  x2="108"
                  y2="108"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop offset="0%" stopColor="#C5A265" />
                  <stop offset="55%" stopColor="#536B35" />
                  <stop offset="100%" stopColor="#263D18" stopOpacity="0.1" />
                </linearGradient>
              </defs>
              <circle
                cx="60"
                cy="60"
                r="56"
                stroke="url(#liyanaLoaderRingGrad)"
                strokeWidth="2.75"
                strokeLinecap="round"
                strokeDasharray="245 110"
              />
            </svg>

            {/* Secondary Delicate Counter-Rotating Accent Arc */}
            <svg
              aria-hidden="true"
              viewBox="0 0 120 120"
              fill="none"
              className="absolute inset-1.5 w-[calc(100%-12px)] h-[calc(100%-12px)] animate-[spin_2.4s_linear_infinite_reverse] motion-reduce:animate-none opacity-45"
            >
              <circle
                cx="60"
                cy="60"
                r="54"
                stroke="#C5A265"
                strokeWidth="1.25"
                strokeLinecap="round"
                strokeDasharray="65 275"
              />
            </svg>

            {/* Centered Brand Logo Emblem Medallion */}
            <div className="relative w-[72px] h-[72px] sm:w-[84px] sm:h-[84px] md:w-[96px] md:h-[96px] rounded-full bg-white/95 border border-[#28321F]/8 shadow-[0_8px_28px_rgba(38,61,24,0.08)] flex items-center justify-center p-2.5 sm:p-3">
              <svg
                viewBox="0 0 70 70"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full"
                aria-hidden="true"
              >
                <defs>
                  <linearGradient
                    id="loaderGoldGrad"
                    x1="10"
                    y1="10"
                    x2="60"
                    y2="60"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop offset="0%" stopColor="#DFBF7A" />
                    <stop offset="50%" stopColor="#C5A265" />
                    <stop offset="100%" stopColor="#A37E3E" />
                  </linearGradient>
                  <linearGradient
                    id="loaderLeafGrad"
                    x1="20"
                    y1="40"
                    x2="55"
                    y2="65"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop offset="0%" stopColor="#536B35" />
                    <stop offset="100%" stopColor="#263D18" />
                  </linearGradient>
                </defs>

                {/* Inner Emblem Ring */}
                <circle
                  cx="35"
                  cy="35"
                  r="31"
                  stroke="url(#loaderGoldGrad)"
                  strokeWidth="1.6"
                  opacity="0.85"
                />

                {/* Central Lotus Bud */}
                <path
                  d="M35 12 C38 19 42 27 35 44 C28 27 32 19 35 12 Z"
                  fill="url(#loaderGoldGrad)"
                  opacity="0.92"
                />
                <path
                  d="M35 17 C36.5 22 38.5 29 35 39 C31.5 29 33.5 22 35 17 Z"
                  fill="#FFFDF9"
                  opacity="0.78"
                />

                {/* Left & Right Petals */}
                <path
                  d="M33.5 44 C24 37 16 29 20 20 C25 27 30 36 33.5 44 Z"
                  fill="url(#loaderGoldGrad)"
                  opacity="0.88"
                />
                <path
                  d="M36.5 44 C46 37 54 29 50 20 C45 27 40 36 36.5 44 Z"
                  fill="url(#loaderGoldGrad)"
                  opacity="0.88"
                />

                {/* Central Stem */}
                <path
                  d="M35 42 L35 58"
                  stroke="url(#loaderLeafGrad)"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />

                {/* Upper & Lower Leaves */}
                <path
                  d="M34 48 C29 45 23 46 21 50 C25 52 30 51 34 49 Z"
                  fill="url(#loaderLeafGrad)"
                />
                <path
                  d="M36 48 C41 45 47 46 49 50 C45 52 40 51 36 49 Z"
                  fill="url(#loaderLeafGrad)"
                />
                <path
                  d="M34 54 C30 52 25 53 24 56 C27 57 31 56 34 54.5 Z"
                  fill="url(#loaderLeafGrad)"
                />
                <path
                  d="M36 54 C40 52 45 53 46 56 C43 57 39 56 36 54.5 Z"
                  fill="url(#loaderLeafGrad)"
                />

                <circle cx="35" cy="60.5" r="1.25" fill="url(#loaderGoldGrad)" />
              </svg>
            </div>
          </div>

          {/* Website Name & Botanical Subtitle */}
          <p className="font-heading text-2xl sm:text-3xl md:text-[34px] font-semibold tracking-tight text-[#263D18] mt-4 sm:mt-5 leading-none">
            {brandName}
          </p>
          <span className="font-sans text-[10px] sm:text-[11px] uppercase tracking-[0.26em] text-[#536B35] font-medium mt-2">
            {subtitle}
          </span>
        </div>

        <span className="sr-only">Loading page content, please wait…</span>
      </div>
    </div>
  );
}
