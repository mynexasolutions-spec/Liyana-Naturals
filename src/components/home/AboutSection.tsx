"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function AboutSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const imageFrameRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const rightFeaturesRef = useRef<HTMLDivElement>(null);
  const bottomBannerRef = useRef<HTMLDivElement>(null);

  // GSAP Entrance Animations
  useEffect(() => {
    if (typeof window === "undefined") return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
          toggleActions: "play none none none",
        },
      });

      // 1. Model Frame entrance
      if (imageFrameRef.current) {
        tl.fromTo(
          imageFrameRef.current,
          { opacity: 0, x: -35, scale: 0.95 },
          { opacity: 1, x: 0, scale: 1, duration: 0.7, ease: "power2.out" }
        );
      }

      // 2. Middle Content entrance
      if (contentRef.current) {
        tl.fromTo(
          contentRef.current,
          { opacity: 0, y: 25 },
          { opacity: 1, y: 0, duration: 0.65, ease: "power2.out" },
          "-=0.4"
        );
      }

      // 3. Right 4 features staggered entrance
      if (rightFeaturesRef.current) {
        const featureItems = rightFeaturesRef.current.children;
        tl.fromTo(
          featureItems,
          { opacity: 0, x: 25 },
          {
            opacity: 1,
            x: 0,
            duration: 0.55,
            stagger: 0.08,
            ease: "power2.out",
            clearProps: "transform,opacity",
          },
          "-=0.3"
        );
      }

      // 4. Bottom "Why Choose Us" card entrance
      if (bottomBannerRef.current) {
        tl.fromTo(
          bottomBannerRef.current,
          { opacity: 0, y: 35, scale: 0.98 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.7,
            ease: "power2.out",
            clearProps: "transform,opacity",
          },
          "-=0.2"
        );
      }

      ScrollTrigger.refresh();
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const rightFeatures = [
    {
      title: "Natural Ingredients",
      icon: "/images/icons/about_right_icon/natural-ingredients.svg",
    },
    {
      title: "Safe & Gentle",
      icon: "/images/icons/about_right_icon/safe-gentle.svg",
    },
    {
      title: "Cruelty Free",
      icon: "/images/icons/about_right_icon/cruelty-free.svg",
    },
    {
      title: "Eco-Friendly",
      icon: "/images/icons/about_right_icon/eco-friendly.svg",
    },
  ];

  const bottomPerks = [
    {
      title: "Premium Quality",
      icon: "/images/icons/why_choose_bottom_icon/premium-quality-diamond.svg",
    },
    {
      title: "100% Natural",
      icon: "/images/icons/why_choose_bottom_icon/01-natural-ingredients-leaf.svg",
    },
    {
      title: "Paraben Free",
      icon: "/images/icons/why_choose_bottom_icon/paraben-free-flask.svg",
    },
    {
      title: "Dermatologically Tested",
      icon: "/images/icons/why_choose_bottom_icon/02-safe-and-gentle-shield.svg",
    },
  ];

  return (
    <section
      ref={sectionRef}
      className="relative w-full bg-[#FAF6EE] py-12 sm:py-16 lg:py-20 overflow-hidden select-none"
      aria-label="About Liyana Naturals"
    >
      {/* 
        ========================================================================
        EXACT BACKGROUND DESIGN MATCHING REFERENCE SCREENSHOT
        ========================================================================
      */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        {/* SVG Curved Background Landscape */}
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 1440 780"
          fill="none"
          preserveAspectRatio="none"
        >
          {/* Top-Right Soft Sage Curved Organic Hill (behind 4 right features) */}
          <path
            d="M680,0 C880,50 1080,25 1250,75 C1360,110 1410,185 1440,250 L1440,0 Z"
            fill="#EBF1DE"
            opacity="0.8"
          />

          {/* Secondary soft accent curve top right */}
          <path
            d="M920,0 C1100,35 1280,15 1440,85 L1440,0 Z"
            fill="#DFE9CD"
            opacity="0.55"
          />

          {/* Bottom Soft Organic Wave flowing behind the Why Choose card */}
          <path
            d="M0,450 C220,420 480,485 760,460 C1040,435 1260,480 1440,445 L1440,780 L0,780 Z"
            fill="#E7EFD8"
            opacity="0.75"
          />

          {/* Bottom-left gentle organic slope */}
          <path
            d="M0,310 C160,295 290,340 390,410 C240,450 110,480 0,510 Z"
            fill="#E1EBCE"
            opacity="0.45"
          />
        </svg>

        {/* Soft radial atmospheric lighting */}
        <div className="absolute top-1/4 left-1/4 w-[450px] h-[450px] bg-gradient-to-tr from-[#98A878]/15 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-gradient-to-bl from-[#A8B88A]/18 to-transparent rounded-full blur-3xl" />
      </div>

      {/* Top Left Botanical Leaves (from Glossy_Green.png) - Flush to Left Edge */}
      <div className="absolute -top-3 left-0 sm:-top-6 sm:left-0 lg:-top-8 lg:left-0 w-36 h-36 sm:w-52 sm:h-52 lg:w-64 lg:h-64 pointer-events-none opacity-90 z-20 -translate-x-[10%]">
        <Image
          src="/images/about/Glossy_Green.png"
          alt="Botanical Leaves Top Left"
          fill
          className="object-contain object-left -rotate-[15deg] scale-110"
          unoptimized
        />
      </div>

      {/* 
        ========================================================================
        RIGHT BOTANICAL LEAF: PURA RIGHT EDGE ME WITH REDUCED HEIGHT
        ========================================================================
      */}
      <div className="absolute right-0 bottom-2 sm:top-6 w-32 h-32 sm:w-48 sm:h-48 lg:w-56 lg:h-56 xl:w-64 xl:h-64 pointer-events-none opacity-95 z-30 translate-x-[40%] sm:translate-x-[25%] lg:translate-x-[28%]">
        <Image
          src="/images/about/Glossy_Green.png"
          alt="Botanical Leaves Bottom Right"
          fill
          className="object-contain object-right rotate-[35deg] scale-110"
          unoptimized
        />
      </div>

      {/* Main Content Container with max-w-[1440px] allowing full-bleed left positioning */}
      <div className="relative z-10 max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* TOP SECTION: About Liyana Naturals */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-6 xl:gap-8 items-center">
          {/* 
            ====================================================================
            1. LEFT COLUMN: GIRL KI IMAGE - PURA LEFT ON DESKTOP, CENTERED & CLEAN ON MOBILE
            ====================================================================
          */}
          <div
            ref={imageFrameRef}
            className="lg:col-span-5 flex justify-center sm:justify-start -ml-0 sm:-ml-1 lg:-ml-6 xl:-ml-10"
          >
            <div className="relative w-[260px] xs:w-[280px] sm:w-[320px] md:w-[360px] lg:w-[380px] xl:w-[420px] aspect-[1/1] shrink-0">
              {/* Organic Curved Shape with Sage/Olive Gradient Backdrop matching screenshot */}
              <div className="relative w-full h-full rounded-[44%_56%_66%_34%/40%_44%_56%_60%] bg-gradient-to-tr from-[#8E9F6E] via-[#A2B383] to-[#B8C89C] shadow-[0_12px_36px_rgba(40,50,31,0.14)] overflow-hidden ring-1 ring-[#28321F]/10">
                {/* Model Image from public/images/about/Serene_Beauty.png */}
                <Image
                  src="/images/about/Serene_Beauty.png"
                  alt="Liyana Naturals Model - Nature's Beauty"
                  fill
                  sizes="(min-width: 1024px) 35vw, (min-width: 640px) 50vw, 85vw"
                  className="object-cover object-center scale-105 hover:scale-108 transition-transform duration-700 ease-out"
                  unoptimized
                />
              </div>

              {/* 'Pure by Nature' Badge - INCREASED ON DESKTOP, ULTRA-CLEAN ON MOBILE */}
              <div
                className="absolute -bottom-3 -right-3 xs:-right-4 sm:top-20 sm:-right-24 md:-right-24 lg:top-24 lg:-right-24 xl:top-28 xl:-right-28 z-30 w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 lg:w-44 lg:h-44 xl:w-48 xl:h-48 flex items-center justify-center"
                aria-label="Pure by Nature Badge"
              >
                {/* A. Infinitely Rotating Outer Ring with 8 Botanical Leaves */}
                <div
                  className="absolute inset-0 animate-[spin_18s_linear_infinite] pointer-events-none"
                  aria-hidden="true"
                >
                  <svg viewBox="0 0 160 160" className="w-full h-full" fill="none">
                    {/* Dotted orbital ring */}
                    <circle
                      cx="80"
                      cy="80"
                      r="68"
                      stroke="#536B35"
                      strokeWidth="1.2"
                      strokeDasharray="4 4"
                      opacity="0.55"
                    />
                    {/* 8 Botanical leaves orbiting the circle */}
                    {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, idx) => {
                      const rad = (angle * Math.PI) / 180;
                      const x = 80 + 68 * Math.cos(rad);
                      const y = 80 + 68 * Math.sin(rad);
                      return (
                        <g
                          key={idx}
                          transform={`translate(${x}, ${y}) rotate(${angle + 90})`}
                        >
                          {/* Leaf geometry */}
                          <path
                            d="M0,0 C-3,-6 -6,-10 0,-15 C6,-10 3,-6 0,0 Z"
                            fill={idx % 2 === 0 ? "#536B35" : "#6E8B49"}
                          />
                          {/* Delicate vein */}
                          <path
                            d="M0,0 L0,-13"
                            stroke="#FAF5EC"
                            strokeWidth="0.7"
                            opacity="0.8"
                          />
                        </g>
                      );
                    })}
                  </svg>
                </div>

                {/* B. Stationary Inner Badge: Text is Ruka Ho (Completely Static & 100% Pure White) */}
                <div className="relative z-10 w-20 h-20 sm:w-22 sm:h-22 md:w-24 md:h-24 lg:w-28 lg:h-28 xl:w-32 xl:h-32 rounded-full bg-[#263D18] border-2 border-[#FAF5EC]/35 shadow-[0_6px_20px_rgba(38,61,24,0.35)] flex flex-col items-center justify-center text-center p-2 backdrop-blur-xs select-none">
                  <span
                    style={{ color: "#ffffff" }}
                    className="font-heading text-lg sm:text-xl lg:text-2xl xl:text-[28px] font-bold !text-white leading-none tracking-tight"
                  >
                    Pure
                  </span>
                  <span
                    style={{ color: "#ffffff" }}
                    className="font-sans text-[10px] sm:text-[11px] lg:text-xs xl:text-sm font-medium tracking-wider !text-white mt-1 uppercase"
                  >
                    by Nature
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 2. CENTER COLUMN: Story, Headline, Paragraph, Know More Button - Modern Mobile Responsive */}
          <div
            ref={contentRef}
            className="lg:col-span-3 text-center sm:text-left pt-6 sm:pt-4 lg:pt-0 lg:pl-2"
          >
            {/* Eyebrow */}
            <span className="text-[11px] sm:text-xs uppercase tracking-[0.2em] font-sans font-semibold text-[#536B35] block mb-2 sm:mb-2.5">
              ABOUT LIYANA NATURALS
            </span>

            {/* Headline */}
            <h2 className="font-heading text-3xl sm:text-4xl md:text-[42px] lg:text-[44px] text-[#28321F] font-bold tracking-tight leading-[1.18] mb-4">
              Nature&apos;s Beauty,
              <br />
              Our Promise
            </h2>

            {/* Paragraph */}
            <p className="font-sans text-[14px] sm:text-[15px] md:text-[16px] text-[#555C4A] font-normal leading-relaxed max-w-md mx-auto sm:mx-0 mb-6 sm:mb-7">
              At Liyana Naturals, we believe in the power of nature. Our gentle
              and effective cosmetics are made with carefully selected natural
              ingredients to bring out your natural glow.
            </p>

            {/* Know More Button */}
            <div className="flex justify-center sm:justify-start">
              <Link
                href="/about"
                className="group inline-flex items-center gap-2.5 bg-[#263D18] hover:bg-[#1D3214] text-white font-sans text-sm font-medium px-6 sm:px-7 py-2.5 sm:py-3 rounded-full transition-all duration-300 shadow-xs hover:shadow-md active:scale-95"
              >
                <span>Know More</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
            </div>
          </div>

          {/* 3. RIGHT COLUMN: 4 Feature Rows - Sleek 2x2 on Mobile, Vertical Stack on Desktop */}
          <div
            ref={rightFeaturesRef}
            className="lg:col-span-4 grid grid-cols-2 sm:grid-cols-2 lg:flex lg:flex-col gap-3 sm:gap-4 max-w-sm sm:max-w-none lg:max-w-xs mx-auto lg:mx-0 w-full lg:ml-auto mt-4 sm:mt-6 lg:mt-0"
          >
            {rightFeatures.map((item) => (
              <div
                key={item.title}
                className="flex items-center gap-2.5 sm:gap-3.5 group bg-white/40 sm:bg-transparent p-2 sm:p-0 rounded-lg sm:rounded-none border border-[#28321F]/5 sm:border-0"
              >
                {/* Circular Icon Pill with soft sage background */}
                <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-[#E5ECCF]/85 border border-[#A8B88A]/35 flex items-center justify-center shrink-0 p-2 shadow-xs group-hover:scale-106 group-hover:bg-[#E0E9C7] transition-all duration-300">
                  <Image
                    src={item.icon}
                    alt={item.title}
                    width={22}
                    height={22}
                    className="w-4 h-4 sm:w-5 sm:h-5 object-contain"
                    unoptimized
                  />
                </div>

                {/* Label */}
                <span className="font-sans font-medium text-xs sm:text-[15px] text-[#28321F] tracking-tight group-hover:text-[#263D18] transition-colors truncate">
                  {item.title}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* BOTTOM SECTION: Why Choose Liyana Naturals? Banner */}
        <div
          ref={bottomBannerRef}
          className="relative mt-4 sm:-mt-6 bg-[#F6F8EE]/95 border-8 border-white rounded-[5px] p-6 sm:p-7 lg:p-8 shadow-[0_8px_30px_rgba(40,50,31,0.06)] backdrop-blur-xs"
        >
          <div className="flex flex-col lg:flex-row lg:items-center gap-6 lg:gap-8">
            {/* Left Header */}
            <div className="lg:max-w-xs shrink-0 text-left">
              <h3 className="font-sans font-bold text-xl sm:text-2xl text-[#28321F] tracking-tight leading-snug">
                Why Choose
                <br className="hidden sm:block" /> Liyana Naturals?
              </h3>
              <div className="flex items-center justify-start gap-2 mt-1.5 text-xs sm:text-[13px] text-[#777968]">
                <span>Because your skin deserves the best, naturally.</span>
                <span className="text-[#536B35] font-semibold text-sm">⸻</span>
              </div>
            </div>

            {/* Vertical Divider (Desktop Only) */}
            <div className="hidden lg:block w-px h-16 bg-[#28321F]/12 self-center mx-2" />

            {/* Right 4 Perks */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 flex-1">
              {bottomPerks.map((perk) => (
                <div
                  key={perk.title}
                  className="flex flex-col items-center text-center group"
                >
                  {/* Icon Circle */}
                  <div className="w-12 h-12 rounded-full bg-white border border-[#28321F]/10 flex items-center justify-center shadow-xs p-2.5 group-hover:scale-108 group-hover:border-[#536B35]/40 transition-all duration-300">
                    <Image
                      src={perk.icon}
                      alt={perk.title}
                      width={26}
                      height={26}
                      className="w-6 h-6 object-contain"
                      unoptimized
                    />
                  </div>

                  {/* Title */}
                  <span className="font-sans font-semibold text-xs sm:text-sm text-[#28321F] mt-2.5 leading-snug">
                    {perk.title}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
