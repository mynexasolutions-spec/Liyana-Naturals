"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Truck, ShieldCheck, Phone } from "lucide-react";
import { siteConfig } from "@/config/site";

export function AnnouncementBar() {
  const perks = [
    {
      icon: Truck,
      text: "Free Shipping on orders above ₹999",
      href: "/shop",
    },
    {
      icon: ShieldCheck,
      text: "100% Natural & Safe",
      href: "/about#standards",
    },
    {
      icon: Phone,
      text: siteConfig.contact.phone,
      href: `tel:${siteConfig.contact.phone.replace(/[^0-9+]/g, "")}`,
    },
  ];

  // Mobile perk rotation
  const [activePerkIndex, setActivePerkIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActivePerkIndex((prev) => (prev + 1) % perks.length);
    }, 3800);
    return () => clearInterval(timer);
  }, [perks.length]);

  return (
    <div className="bg-[#263D18] text-[#FBF7EE] text-[11px] sm:text-xs tracking-wide py-2 px-4 border-b border-[#FBF7EE]/10 select-none z-50 relative">
      <div className="max-w-7xl mx-auto">
        {/* Desktop View: All three items spaced across the header */}
        <div className="hidden md:flex items-center justify-between font-normal">
          {/* Left: Free Shipping */}
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 hover:text-[#A8B88A] transition-colors group"
          >
            <Truck className="w-3.5 h-3.5 text-[#A8B88A] group-hover:scale-110 transition-transform" />
            <span>Free Shipping on orders above ₹999</span>
          </Link>

          {/* Center: 100% Natural & Safe */}
          <div className="inline-flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-[#A8B88A]" />
            <span>100% Natural &amp; Safe</span>
          </div>

          {/* Right: Phone Number */}
          <a
            href={`tel:${siteConfig.contact.phone.replace(/[^0-9+]/g, "")}`}
            className="inline-flex items-center gap-2 hover:text-[#A8B88A] transition-colors group"
          >
            <Phone className="w-3.5 h-3.5 text-[#A8B88A] group-hover:rotate-12 transition-transform" />
            <span className="font-medium">{siteConfig.contact.phone}</span>
          </a>
        </div>

        {/* Mobile View: Animated smooth ticker showing all three items */}
        <div className="flex md:hidden items-center justify-between">
          <div className="flex-1 overflow-hidden py-0.5">
            {perks.map((perk, index) => {
              const Icon = perk.icon;
              const isActive = index === activePerkIndex;
              return (
                <div
                  key={perk.text}
                  className={`flex items-center justify-center gap-2 transition-all duration-500 text-center ${
                    isActive ? "opacity-100 translate-y-0" : "hidden opacity-0 -translate-y-2"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 text-[#A8B88A] shrink-0" />
                  <span className="truncate">{perk.text}</span>
                </div>
              );
            })}
          </div>

          {/* Quick Call Icon on Mobile */}
          <a
            href={`tel:${siteConfig.contact.phone.replace(/[^0-9+]/g, "")}`}
            aria-label="Call Liyana Naturals"
            className="p-1 text-[#A8B88A] hover:text-white transition-colors ml-2 shrink-0"
          >
            <Phone className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
