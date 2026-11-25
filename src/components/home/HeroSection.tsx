"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Leaf,
  FlaskConical,
  Heart,
} from "lucide-react";
import { Container } from "@/components/ui/Container";
import type { StorefrontBanner } from "@/lib/supabase/storefront";

const fallbackSlides = [
  {
    id: 1,
    desktopImage: undefined,
    mobileImage: undefined,
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
    desktopImage: undefined,
    mobileImage: undefined,
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
    desktopImage: undefined,
    mobileImage: undefined,
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

export function HeroSection({ banners = [] }: { banners?: StorefrontBanner[] }) {
  const slides = banners.length > 0
    ? banners.map((banner, index) => ({
        id: banner.id,
        eyebrow: "LIYANA NATURALS",
        titleLine1: banner.title,
        titleLine2: "",
        subtitle: banner.subtitle ?? "Pure botanical care for healthy skin and hair.",
        primaryBtn: { label: "Shop Now", href: banner.link_url ?? "/shop" },
        secondaryBtn: fallbackSlides[index % fallbackSlides.length].secondaryBtn,
        badges: fallbackSlides[index % fallbackSlides.length].badges,
        desktopImage: banner.desktop_image_url ?? banner.image_url,
        mobileImage: banner.mobile_image_url ?? banner.desktop_image_url ?? banner.image_url,
      }))
    : fallbackSlides;
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = window.setInterval(nextSlide, 3000);
    return () => window.clearInterval(timer);
  }, [nextSlide, slides.length]);

  useEffect(() => {
    setIsTransitioning(true);
    const timer = window.setTimeout(() => setIsTransitioning(false), 300);
    return () => window.clearTimeout(timer);
  }, [currentSlide]);

  const activeSlideIndex = Math.min(currentSlide, slides.length - 1);
  const slide = slides[activeSlideIndex];

  return (
    <section
      className="relative w-full bg-[#FBF7EE] overflow-hidden min-h-[500px] sm:min-h-[540px] md:min-h-[480px] lg:min-h-[540px] xl:min-h-[620px] md:aspect-[1914/822] max-h-[822px] flex items-start md:items-start select-none"
      aria-label="Hero Showcase"
    >
      {/* Background High-Definition Hero Image (Responsive: Desktop & Mobile) */}
      <div
        className={`absolute inset-0 z-0 pointer-events-none transition-opacity duration-300 ease-in-out ${
          isTransitioning ? "opacity-0" : "opacity-100"
        } motion-reduce:opacity-100 motion-reduce:transition-none`}
      >
        <picture className="absolute inset-0 block h-full w-full">
          <source
            media="(max-width: 767px)"
            srcSet={slide.mobileImage ?? "/images/hero/Liyana_hero_mobile.png"}
          />
          <Image
            src={slide.desktopImage ?? "/images/hero/Liyana_hero_dextop.png"}
            alt="Liyana Naturals Organic Cosmetics Collection"
            fill
            priority
            unoptimized
            sizes="100vw"
            className="object-cover object-bottom md:object-right"
          />
        </picture>

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

      <Container
        className={`relative z-10 w-full pt-5 pb-8 sm:py-8 md:py-10 lg:py-14 sm:mt-16 lg:mt-18 xl:mt-20 transition-opacity duration-300 ease-in-out ${
          isTransitioning ? "opacity-0" : "opacity-100"
        } motion-reduce:opacity-100 motion-reduce:transition-none`}
      >
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
            {slide.titleLine2 && <span className="block drop-shadow-xs">{slide.titleLine2}</span>}
          </h1>

          {/* Subtitle */}
          <p className="text-[14px] sm:text-[15px] md:text-[16px] text-[#28321F]/90 font-normal leading-relaxed line-clamp-2 sm:line-clamp-none mb-3.5 sm:mb-5 font-sans">
            {slide.subtitle}
          </p>

          {/* CTA Buttons */}
          <div className="flex items-center gap-2.5 sm:gap-3.5 mb-4 sm:mb-8">
            <Link
              href={slide.primaryBtn.href}
              className="inline-flex w-fit min-w-[180px] max-w-full items-center justify-center px-4 text-center sm:min-w-[220px] sm:max-w-[360px] sm:px-6 py-2 sm:py-4 rounded-[5px] bg-[#263D18] text-[#FBF7EE] text-[14px] sm:text-[18px] font-medium hover:bg-[#1D3214] shadow-sm hover:shadow-md transition-all duration-200 active:scale-95"
            >
              <span>{slide.primaryBtn.label}</span>
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

      {/* Bottom Center Carousel Dots */}
      <div className="absolute bottom-3 sm:bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        {slides.map((s, idx) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setCurrentSlide(idx)}
            aria-label={`Go to slide ${idx + 1}`}
            aria-current={idx === activeSlideIndex ? "step" : undefined}
            className={`relative overflow-hidden transition-all duration-300 rounded-full ${
              idx === activeSlideIndex
                ? "w-6 h-2 bg-[#263D18]/20"
                : "w-2 h-2 bg-white/80 hover:bg-white border border-[#28321F]/20"
            }`}
          >
            {idx === activeSlideIndex && (
              <span
                key={`${s.id}-${activeSlideIndex}`}
                className="absolute inset-0 origin-left rounded-full bg-[#263D18] animate-hero-dot-progress"
                aria-hidden="true"
              />
            )}
          </button>
        ))}
      </div>
    </section>
  );
}
