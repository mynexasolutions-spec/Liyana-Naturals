"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Phone, ShieldCheck, Truck, type LucideIcon } from "lucide-react";
import { toShippingSettings } from "@/lib/checkout/pricing";
import { announcementMessages, toSecondAnnouncement } from "@/lib/settings/announcement";
import { telHref, toStoreContact } from "@/lib/settings/contact";
import type { StorefrontSettings } from "@/lib/supabase/storefront";

type Message = { id: string; icon: LucideIcon; text: string; href: string };

export function AnnouncementBar({ settings }: { settings?: StorefrontSettings | null }) {
  const { phone } = toStoreContact(settings, settings?.global);
  const { first, second } = announcementMessages({
    ownMessageOn: Boolean(settings?.announcement_enabled),
    ownMessage: settings?.announcement_text,
    secondMessage: toSecondAnnouncement(settings?.global),
    shipping: toShippingSettings(settings),
  });
  // Phones and larger screens show the same messages.
  const messages: Message[] = [
    ...(first ? [{ id: "first", icon: Truck, text: first, href: "/shop" }] : []),
    ...(second ? [{ id: "second", icon: ShieldCheck, text: second, href: "/about" }] : []),
    ...(phone ? [{ id: "phone", icon: Phone, text: phone, href: telHref(phone) }] : []),
  ];

  const [turn, setTurn] = useState(0);

  // A narrow screen has room for one message, so they take turns.
  useEffect(() => {
    if (messages.length < 2) return;
    const timer = setInterval(() => setTurn((previous) => previous + 1), 3800);
    return () => clearInterval(timer);
  }, [messages.length]);

  if (messages.length === 0) return null;
  const activeIndex = turn % messages.length;

  return (
    <div className="bg-[#263D18] text-[#FBF7EE] text-[11px] sm:text-xs tracking-wide py-2 px-4 border-b border-[#FBF7EE]/10 select-none z-50 relative">
      <div className="max-w-[1300px] mx-auto">
        <div
          className={`hidden md:flex items-center gap-4 font-normal ${messages.length > 1 ? "justify-between" : "justify-center"}`}
        >
          {messages.map(({ id, icon: Icon, text, href }) => (
            <Link
              key={id}
              href={href}
              className="inline-flex items-center gap-2 hover:text-[#A8B88A] transition-colors group"
            >
              <Icon className="w-3.5 h-3.5 text-[#A8B88A] shrink-0 group-hover:scale-110 transition-transform" />
              <span>{text}</span>
            </Link>
          ))}
        </div>

        <div className="md:hidden py-0.5">
          {messages.map(({ id, icon: Icon, text, href }, index) => (
            <Link
              key={id}
              href={href}
              className={`items-center justify-center gap-2 text-center ${index === activeIndex ? "flex" : "hidden"}`}
            >
              <Icon className="w-3.5 h-3.5 text-[#A8B88A] shrink-0" />
              <span className="min-w-0 break-words">{text}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
