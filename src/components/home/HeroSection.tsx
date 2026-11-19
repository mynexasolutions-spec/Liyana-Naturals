"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Leaf,
  FlaskConical,
  Heart,
} from "lucide-react";
import { Container } from "@/components/ui/Container";

const slides = [
  {
    id: 1,
    eyebrow: "NATURE'S CARE FOR YOU",
    titleLine1: "Glow Naturally,",
    titleLine2: "Live Beautifully",
    subtitle: "Pure. Gentle. Effective cosmetics for healthy skin & hair.",
    primaryBtn: { label: "Shop Now", href: "/shop" },
    secondaryBtn: { label: "Learn More", href: "/about" },
    badges: [
      { icon: Leaf, label: "100% Natural" },
      { icon: FlaskConical, label: "No Harmful Chemicals" },
      { icon: Heart, label: "Cruelty Free" },
    ],
  },
  {
    id: 2,
    eyebrow: "AYURVEDIC & BOTANICAL SCIENCE",
    titleLine1: "Cold-Pressed Purity,",
    titleLine2: "Timeless Radiance",
    subtitle: "Nutrient-dense botanicals formulated for deep barrier restoration.",
    primaryBtn: { label: "Explore Serums", href: "/shop?category=facial-care" },
    secondaryBtn: { label: "Our Story", href: "/about" },
    badges: [
      { icon: Leaf, label: "Eco-Harvested" },
      { icon: FlaskConical, label: "Zero Parabens" },
      { icon: Heart, label: "100% Vegan" },
    ],
  },
  {
    id: 3,
    eyebrow: "CERTIFIED ORGANIC CARE",
    titleLine1: "Rooted in Nature,",
    titleLine2: "Proven by Science",
    subtitle: "Dermatologically tested formulas designed for delicate & reactive skin.",
    primaryBtn: { label: "Best Sellers", href: "/shop?tag=bestseller" },
    secondaryBtn: { label: "Read Journal", href: "/blog" },
    badges: [
      { icon: Leaf, label: "Clean Ingredients" },
      { icon: FlaskConical, label: "Toxin-Free" },
      { icon: Heart, label: "Sustainable" },
    ],
  },
];

export function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }, []);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      nextSlide();
    }, 6000);
    return () => clearInterval(timer);
  }, [isPaused, nextSlide]);

  const slide = slides[currentSlide];

  return (
    <section
      className="relative w-full bg-[#FBF7EE] overflow-hidden min-h-[500px] sm:min-h-[540px] md:min-h-[480px] lg:min-h-[540px] xl:min-h-[620px] md:aspect-[1914/822] max-h-[822px] flex items-start md:items-start select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      aria-label="Hero Showcase"
    >
      {/* Background High-Definition Hero Image (Responsive: Desktop & Mobile) */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Desktop Image (md: 768px and up) - unoptimized prevents lossy compression / pixelation */}
        <div className="hidden md:block absolute inset-0">
          <Image
            src="/images/hero/Liyana_hero_dextop.png"
            alt="Liyana Naturals Organic Cosmetics Collection"
            fill
            priority
            unoptimized
            sizes="100vw"
            className="object-cover object-right"
          />
        </div>

        {/* Mobile Image (< 768px) - unoptimized guarantees direct raw image load without optimization failure */}
        <div className="block md:hidden absolute inset-0">
          <Image
            src="/images/hero/Liyana_hero_mobile.png"
            alt="Liyana Naturals Organic Cosmetics Collection"
            fill
            priority
            unoptimized
            sizes="100vw"
            className="object-cover object-bottom"
          />
        </div>

        {/* Soft, atmospheric cream-toned readability gradient on desktop */}
        <div
          className="hidden md:block absolute inset-0 bg-gradient-to-r from-[#FBF7EE]/60 via-[#FBF7EE]/15 to-transparent md:w-[44%] lg:w-[38%]"
          aria-hidden="true"
        />
        {/* Subtle mobile gradient at the very top only - leaves bottom products 100% visible & uncovered */}
        <div
          className="absolute top-0 left-0 right-0 h-[42%] bg-gradient-to-b from-[#FBF7EE]/85 to-transparent md:hidden"
          aria-hidden="true"
        />
      </div>

      <Container className="relative z-10 w-full pt-5 pb-8 sm:py-8 md:py-10 lg:py-14 sm:mt-16 lg:mt-18 xl:mt-20">
        <div className="max-w-lg md:max-w-[500px] lg:max-w-[620px] text-left">
          {/* Eyebrow - Modern Micro Pill */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#263D18]/10 border border-[#263D18]/15 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#536B35] animate-pulse" />
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.2em] text-[#263D18]">
              {slide.eyebrow}
            </span>
          </div>

          {/* Main Headline - Editorial Luxury Typography */}
          <h1 className="font-heading text-[35px] sm:text-[70px] text-[#263D18] font-[650] sm:leading-[1.02] leading-[1.12] tracking-tight my-[8px] sm:my-4">
            <span className="block drop-shadow-xs">{slide.titleLine1}</span>
            <span className="block drop-shadow-xs">{slide.titleLine2}</span>
          </h1>

          {/* Subtitle */}
          <p className="text-[14px] sm:text-[15px] md:text-[16px] text-[#28321F]/90 font-normal leading-relaxed line-clamp-2 sm:line-clamp-none mb-3.5 sm:mb-5 font-sans">
            {slide.subtitle}
          </p>

          {/* CTA Buttons */}
          <div className="flex items-center gap-2.5 sm:gap-3.5 mb-4 sm:mb-8">
            <Link
              href={slide.primaryBtn.href}
              className="flex items-center justify-between gap-1.5 px-4 sm:px-6 py-2 sm:py-4 rounded-[5px] bg-[#263D18] text-[#FBF7EE] text-[14px] sm:text-[18px] font-medium hover:bg-[#1D3214] shadow-sm hover:shadow-md transition-all duration-200 active:scale-95 group w-3/5 sm:!max-w-[360px] max-w-[280px]"
            >
              <span>{slide.primaryBtn.label}</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>

            {/* <Link
              href={slide.secondaryBtn.href}
              className="inline-flex items-center justify-center px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-[5px] bg-white/80 hover:bg-white backdrop-blur-md border border-[#28321F]/20 text-[#28321F] text-xs sm:text-[16px] font-medium transition-all duration-200 active:scale-95 shadow-2xs shrink-0"
            >
              {slide.secondaryBtn.label}
            </Link> */}
          </div>

          {/* Modern Micro Trust Chips */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            {slide.badges.map((badge) => {
              const Icon = badge.icon;
              return (
                <div
                  key={badge.label}
                  className="inline-flex items-center gap-1 px-4 py-1.5 rounded-full bg-white/80 backdrop-blur-xs border border-[#28321F]/10 shadow-2xs"
                >
                  <Icon className="w-4 h-4 text-[#536B35]" />
                  <span className="text-[11px] sm:text-[14px] font-medium text-[#28321F]">
                    {badge.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </Container>

      {/* Side Slider Arrows (Visible on sm+ screens) */}
      <button
        type="button"
        onClick={prevSlide}
        aria-label="Previous Slide"
        className="hidden sm:flex absolute left-3 lg:left-6 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/25 hover:bg-[#263D18] text-white items-center justify-center backdrop-blur-xs transition-all duration-200 shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#263D18]"
      >
        <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 -ml-0.5" />
      </button>

      <button
        type="button"
        onClick={nextSlide}
        aria-label="Next Slide"
        className="hidden sm:flex absolute right-3 lg:right-6 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/80 hover:bg-[#263D18] hover:text-white text-[#28321F] items-center justify-center backdrop-blur-xs transition-all duration-200 shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#263D18]"
      >
        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 -mr-0.5" />
      </button>

      {/* Bottom Center Carousel Dots */}
      <div className="absolute bottom-3 sm:bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        {slides.map((s, idx) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setCurrentSlide(idx)}
            aria-label={`Go to slide ${idx + 1}`}
            className={`transition-all duration-300 rounded-full ${
              idx === currentSlide
                ? "w-6 h-2 bg-[#263D18]"
                : "w-2 h-2 bg-white/80 hover:bg-white border border-[#28321F]/20"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
