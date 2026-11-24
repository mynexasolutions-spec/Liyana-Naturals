"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Phone, ShieldCheck, Truck } from "lucide-react";
import { siteConfig } from "@/config/site";
import type { StorefrontSettings } from "@/lib/supabase/storefront";

export function AnnouncementBar({ settings }: { settings?: StorefrontSettings | null }) {
  const phone = settings?.support_phone ?? siteConfig.contact.phone;
  const threshold = settings?.free_shipping_threshold
    ? `₹${Number(settings.free_shipping_threshold).toLocaleString("en-IN")}`
    : "₹999";
  const perks = [
    {
      icon: Truck,
      text: settings?.announcement_enabled && settings.announcement_text
        ? settings.announcement_text
        : `Free Shipping on orders above ${threshold}`,
      href: "/shop",
    },
    {
      icon: ShieldCheck,
      text: "100% Natural & Safe",
      href: "/about#standards",
    },
    {
      icon: Phone,
      text: phone,
      href: `tel:${phone.replace(/[^0-9+]/g, "")}`,
    },
  ];

  const [activePerkIndex, setActivePerkIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActivePerkIndex((prev) => (prev + 1) % perks.length);
    }, 3800);
    return () => clearInterval(timer);
  }, [perks.length]);

  return (
    <div className="bg-[#263D18] text-[#FBF7EE] text-[11px] sm:text-xs tracking-wide py-2 px-4 border-b border-[#FBF7EE]/10 select-none z-50 relative">
      <div className="max-w-[1300px] mx-auto">
        <div className="hidden md:flex items-center justify-between font-normal">
          {perks.map((perk) => {
            const Icon = perk.icon;
            return (
              <Link
                key={perk.text}
                href={perk.href}
                className="inline-flex items-center gap-2 hover:text-[#A8B88A] transition-colors group"
              >
                <Icon className="w-3.5 h-3.5 text-[#A8B88A] group-hover:scale-110 transition-transform" />
                <span>{perk.text}</span>
              </Link>
            );
          })}
        </div>

        <div className="flex md:hidden items-center justify-between">
          <div className="flex-1 overflow-hidden py-0.5">
            {perks.map((perk, index) => {
              const Icon = perk.icon;
              const isActive = index === activePerkIndex;
              return (
                <Link
                  key={perk.text}
                  href={perk.href}
                  className={`flex items-center justify-center gap-2 transition-all duration-500 text-center ${
                    isActive ? "opacity-100 translate-y-0" : "hidden opacity-0 -translate-y-2"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 text-[#A8B88A] shrink-0" />
                  <span className="truncate">{perk.text}</span>
                </Link>
              );
            })}
          </div>
          <a
            href={`tel:${phone.replace(/[^0-9+]/g, "")}`}
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
