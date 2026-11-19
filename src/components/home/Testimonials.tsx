"use client";

import React from "react";
import { Star, User, CheckCircle2, Quote } from "lucide-react";
import { testimonials } from "@/data/testimonials";

const avatarColorThemes = [
  { bg: "bg-[#E6EED8]", text: "text-[#2D4518]", border: "border-[#A8B88A]/40" }, // Sage Green
  { bg: "bg-[#F3EADA]", text: "text-[#664D24]", border: "border-[#D9C4A1]/40" }, // Warm Amber / Honey
  { bg: "bg-[#DEECE5]", text: "text-[#1C4736]", border: "border-[#96C2AC]/40" }, // Herbal Mint
  { bg: "bg-[#EAE4DC]", text: "text-[#4A3C2F]", border: "border-[#C9B9A6]/40" }, // Earth Warm Taupe
  { bg: "bg-[#EDE8D5]", text: "text-[#544D1E]", border: "border-[#CFC399]/40" }, // Golden Olive
  { bg: "bg-[#E2E8DC]", text: "text-[#34482B]", border: "border-[#A7BA98]/40" }, // Soft Olive
];

export function Testimonials() {
  // Duplicate testimonials array for seamless infinite right-to-left loop
  const marqueeItems = [...testimonials, ...testimonials];

  return (
    <section
      className="relative w-full bg-[#FAF6EE] py-14 sm:py-16 lg:py-20 overflow-hidden select-none"
      aria-label="What Our Customers Say"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-10 sm:mb-12 lg:mb-14">
          {/* Top Delicate Leaf Motif */}
          <div className="flex justify-center mb-3">
            <div className="w-8 h-8 rounded-[5px] bg-[#536B35]/10 flex items-center justify-center">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#536B35"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
                <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
              </svg>
            </div>
          </div>

          {/* Ornate Headline with Left & Right Finial Lines */}
          <div className="flex items-center justify-center gap-3 sm:gap-6 max-w-2xl mx-auto">
            {/* Left Ornate Line */}
            <div
              className="hidden sm:flex items-center flex-1 origin-right"
              aria-hidden="true"
            >
              <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-[#28321F]/25 to-[#28321F]/40" />
              <div className="w-1.5 h-1.5 rotate-45 bg-[#536B35] shrink-0 -ml-0.5 rounded-[1px]" />
            </div>

            {/* Headline using brand fonts & colors */}
            <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-[44px] text-[#28321F] font-bold tracking-tight whitespace-nowrap">
              What Our Customers Say
            </h2>

            {/* Right Ornate Line */}
            <div
              className="hidden sm:flex items-center flex-1 origin-left"
              aria-hidden="true"
            >
              <div className="w-1.5 h-1.5 rotate-45 bg-[#536B35] shrink-0 -mr-0.5 rounded-[1px]" />
              <div className="h-[1px] w-full bg-gradient-to-l from-transparent via-[#28321F]/25 to-[#28321F]/40" />
            </div>
          </div>

          {/* Subtitle */}
          <p className="text-sm sm:text-base text-[#777968] font-sans font-normal mt-2 max-w-md mx-auto">
            Real stories. Real results
          </p>
        </div>
      </div>

      {/* 
        ========================================================================
        INFINITE CONTINUOUS MARQUEE CONTAINER (RIGHT TO LEFT)
        With Left & Right Edge Fade Shadows
        ========================================================================
      */}
      <div className="relative w-full group/marquee overflow-hidden py-3">
        {/* Left Fade Shadow Overlay */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-0 top-0 bottom-0 w-16 sm:w-28 lg:w-44 z-20 bg-gradient-to-r from-[#FAF6EE] via-[#FAF6EE]/90 to-transparent shadow-[inset_16px_0_24px_-10px_rgba(40,50,31,0.08)]"
        />

        {/* Right Fade Shadow Overlay */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 sm:w-28 lg:w-44 z-20 bg-gradient-to-l from-[#FAF6EE] via-[#FAF6EE]/90 to-transparent shadow-[inset_-16px_0_24px_-10px_rgba(40,50,31,0.08)]"
        />

        {/* Continuous Marquee Track */}
        <div className="animate-marquee-infinite flex items-stretch gap-5 sm:gap-6 px-4">
          {marqueeItems.map((item, index) => {
            const theme = avatarColorThemes[index % avatarColorThemes.length];

            return (
              <div
                key={`${item.id}-${index}`}
                className="w-[310px] sm:w-[340px] lg:w-[360px] shrink-0 bg-white/95 rounded-[20px] p-6 sm:p-6.5 border border-[#28321F]/8 shadow-[0_4px_24px_rgba(40,50,31,0.06)] hover:shadow-[0_12px_36px_rgba(40,50,31,0.12)] hover:border-[#536B35]/30 transition-all duration-300 flex flex-col justify-between cursor-default select-none group/card"
              >
                <div>
                  {/* Top Header: Avatar + User Details + Quote Icon */}
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Person Icon in Soft Botanical Accent */}
                      <div
                        className={`w-12 h-12 rounded-full overflow-hidden shrink-0 flex items-center justify-center border ${theme.bg} ${theme.text} ${theme.border} shadow-xs transition-transform duration-300 group-hover/card:scale-105`}
                      >
                        <User className="w-6 h-6 stroke-[1.8]" />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-sans font-bold text-[16px] sm:text-[17px] text-[#28321F] tracking-tight truncate">
                            {item.author}
                          </span>
                          <CheckCircle2 className="w-4 h-4 text-[#536B35] shrink-0 fill-[#536B35]/15" />
                        </div>
                        <span className="text-[11px] sm:text-[11.5px] font-medium text-[#777968] tracking-wide">
                          Verified Buyer
                        </span>
                      </div>
                    </div>

                    {/* Decorative Modern Quote Mark */}
                    <Quote className="w-6 h-6 text-[#536B35]/25 group-hover/card:text-[#536B35]/40 transition-colors shrink-0" />
                  </div>

                  {/* 5 Gold Stars Rating */}
                  <div
                    className="flex items-center gap-1 mb-3 text-[#E5A83B]"
                    aria-label={`${item.rating} stars`}
                  >
                    {[...Array(item.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4 fill-[#E5A83B] text-[#E5A83B]"
                      />
                    ))}
                  </div>

                  {/* Customer Review Quote (16px on desktop, responsive on mobile) */}
                  <p className="font-sans text-[14.5px] sm:text-[15.5px] md:text-[16px] text-[#2B3522] leading-relaxed line-clamp-3">
                    &ldquo;{item.quote}&rdquo;
                  </p>
                </div>

                {/* Card Bottom: Product Tag */}
                {item.productName && (
                  <div className="mt-4 pt-3.5 border-t border-[#28321F]/6 flex items-center justify-between">
                    <span className="text-[12px] text-[#777968] font-normal">
                      Purchased
                    </span>
                    <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#536B35] bg-[#536B35]/10 px-2.5 py-0.5 rounded-full">
                      {item.productName}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
