"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Mail, CheckCircle2 } from "lucide-react";
import { subscribeToNewsletter } from "@/lib/newsletter/client";
import type { SubscribeSource } from "@/lib/newsletter/schema";
import { cn } from "@/lib/utils";

export function Newsletter({ className, source = "home" }: { className?: string; source?: SubscribeSource }) {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sending) return;
    setError("");
    setSending(true);
    const problem = await subscribeToNewsletter(email, source);
    setSending(false);
    if (problem) {
      setError(problem);
      return;
    }
    setSubscribed(true);
    setTimeout(() => {
      setEmail("");
      setSubscribed(false);
    }, 4000);
  };

  return (
    <section
      className={cn(
        "relative w-full bg-[#FAF6EE] py-12 overflow-hidden select-none lg:-mt-[50px]",
        className
      )}
      aria-label="Newsletter Subscription"
    >
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* 
          ======================================================================
          BOTANICAL LEAF OVERLAYS (Left & Right)
          Anchored gracefully over the capsule ends matching reference screenshot
          ======================================================================
        */}
        {/* Left Leaf Decor */}
        <div
          aria-hidden="true"
          className="absolute -left-12 sm:-left-20 top-1/2 -translate-y-1/2 w-24 h-24 sm:w-36 sm:h-36 lg:w-48 lg:h-48 xl:w-52 xl:h-52 pointer-events-none z-20"
        >
          <Image
            src="/images/about/Glossy_Green.png"
            alt="Botanical Leaves Left"
            fill
            className="object-contain -scale-x-100 rotate-[-25deg] drop-shadow-md"
            unoptimized
          />
        </div>

        {/* Right Leaf Decor */}
        <div
          aria-hidden="true"
          className="absolute -right-12 sm:-right-20 top-1/2 -translate-y-1/2 w-24 h-24 sm:w-36 sm:h-36 lg:w-48 lg:h-48 xl:w-52 xl:h-52 pointer-events-none z-20"
        >
          <Image
            src="/images/about/Glossy_Green.png"
            alt="Botanical Leaves Right"
            fill
            className="object-contain rotate-[35deg] drop-shadow-md"
            unoptimized
          />
        </div>

        {/* 
          ======================================================================
          CENTRAL CAPSULE BANNER
          ======================================================================
        */}
        <div className="relative z-10 w-full bg-[#1E3314] rounded-[5px] px-6 sm:px-8 lg:px-12 py-5 sm:py-6 lg:py-7 shadow-[0_12px_40px_rgba(29,50,20,0.22)] border border-[#385521]/30 flex flex-col lg:flex-row items-center justify-around gap-5 sm:gap-6 lg:gap-8">
          {/* Left: Envelope Icon + Heading & Subtitle */}
          <div className="flex items-center gap-3.5 sm:gap-4.5 text-left w-full lg:w-auto">
            {/* Green Circular Icon with Envelope */}
            <div className="w-12 h-12 sm:w-13 sm:h-13 lg:w-14 lg:h-14 rounded-[5px] bg-gradient-to-br from-[#4D7129] to-[#344E1C] border border-white/20 shadow-sm flex items-center justify-center shrink-0">
              <Mail className="w-6 h-6 sm:w-7 sm:h-7 text-white stroke-[1.8]" />
            </div>

            {/* Title and Subtitle */}
            <div className="min-w-0">
              <h3 className="font-sans font-bold text-white text-[17px] sm:text-[19px] lg:text-[21px] tracking-tight leading-snug">
                Join Our Natural Beauty Community
              </h3>
              <p className="text-white/85 text-[13.5px] sm:text-[14.5px] md:text-[16px] font-sans font-normal mt-0.5 leading-normal">
                Get exclusive offers, skincare tips and more!
              </p>
            </div>
          </div>

          {/* Right: Integrated Pill Form (White Input + Green Subscribe Button) */}
          <div className="w-full lg:w-[440px] xl:w-[480px]">
            {subscribed ? (
              <div className="w-full bg-white rounded-[5px] px-5 py-3 flex items-center justify-center gap-2 text-[#263D18] font-medium text-sm shadow-md animate-fadeIn">
                <CheckCircle2 className="w-5 h-5 text-[#547B25]" />
                <span>Thank you for subscribing!</span>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="w-full bg-white rounded-[5px] p-1 sm:p-1.5 flex items-center shadow-md border border-white/30"
              >
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Enter your email address"
                  className="w-full bg-transparent px-4 sm:px-5 py-2 sm:py-2.5 text-[14px] sm:text-[15px] text-[#28321F] placeholder:text-[#88907E] focus:outline-none rounded-full"
                  aria-label="Email address"
                />
                <button
                  type="submit"
                  disabled={sending}
                  className="shrink-0 rounded-[5px] bg-[#547B25] hover:bg-[#46691E] disabled:opacity-60 text-white font-sans font-semibold text-[14px] sm:text-[15px] px-6 sm:px-8 py-2.5 sm:py-3 transition-all duration-200 active:scale-95 shadow-xs"
                >
                  {sending ? "Please wait…" : "Subscribe"}
                </button>
              </form>
            )}
            {error && (
              <p role="alert" className="mt-2 text-xs font-medium text-[#FFC107]">
                {error}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
