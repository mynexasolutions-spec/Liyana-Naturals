"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { ProductCategory } from "@/types";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function CategorySection({ categories = [] }: { categories?: ProductCategory[] }) {
  const sectionRef = useRef<HTMLElement>(null);
  const leafRef = useRef<HTMLDivElement>(null);
  const leftLineRef = useRef<HTMLDivElement>(null);
  const rightLineRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const cardsRef = useRef<(HTMLAnchorElement | null)[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // Main Entrance Timeline
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 85%",
          toggleActions: "play none none none",
        },
      });

      // 1. Leaf icon floating entrance
      if (leafRef.current) {
        tl.fromTo(
          leafRef.current,
          { opacity: 0, y: -20, scale: 0.7, rotate: -15 },
          { opacity: 1, y: 0, scale: 1, rotate: 0, duration: 0.5, ease: "back.out(1.6)" }
        );
      }

      // 2. Ornate lines expand horizontally
      if (leftLineRef.current && rightLineRef.current) {
        tl.fromTo(
          [leftLineRef.current, rightLineRef.current],
          { scaleX: 0, opacity: 0 },
          { scaleX: 1, opacity: 1, duration: 0.6, ease: "power2.out" },
          "-=0.3"
        );
      }

      // 3. Headline & Subtitle fade & slide up
      if (titleRef.current) {
        tl.fromTo(
          titleRef.current,
          { opacity: 0, y: 22 },
          { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" },
          "-=0.4"
        );
      }

      if (subtitleRef.current) {
        tl.fromTo(
          subtitleRef.current,
          { opacity: 0, y: 15 },
          { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" },
          "-=0.3"
        );
      }

      // 4. Staggered category items entrance
      const validCards = cardsRef.current.filter(Boolean);
      if (validCards.length > 0) {
        tl.fromTo(
          validCards,
          { opacity: 0, y: 35, scale: 0.95 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.65,
            stagger: 0.09,
            ease: "power2.out",
            clearProps: "transform,opacity", // Allows CSS hover animations to work smoothly without GSAP conflict
          },
          "-=0.2"
        );
      }

      ScrollTrigger.refresh();
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full bg-[#FAF5EC] py-12 sm:py-14 lg:py-16 overflow-hidden select-none"
      aria-label="Shop by Category"
    >
      <div className="max-w-[1350px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-10 sm:mb-14 lg:mb-16">
          {/* Leaf Icon on Top */}
          <div ref={leafRef} className="flex justify-center mb-3">
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
              ref={leftLineRef}
              className="hidden sm:flex items-center flex-1 origin-right"
              aria-hidden="true"
            >
              <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-[#28321F]/25 to-[#28321F]/40" />
              <div className="w-1.5 h-1.5 rotate-45 bg-[#536B35] shrink-0 -ml-0.5 rounded-[1px]" />
            </div>

            {/* Main Headline - Increased Text Size */}
            <h2
              ref={titleRef}
              className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-[46px] text-[#28321F] font-normal tracking-tight whitespace-nowrap"
            >
              Shop by Category
            </h2>

            {/* Right Ornate Line */}
            <div
              ref={rightLineRef}
              className="hidden sm:flex items-center flex-1 origin-left"
              aria-hidden="true"
            >
              <div className="w-1.5 h-1.5 rotate-45 bg-[#536B35] shrink-0 -mr-0.5 rounded-[1px]" />
              <div className="h-[1px] w-full bg-gradient-to-l from-transparent via-[#28321F]/25 to-[#28321F]/40" />
            </div>
          </div>

          {/* Subtitle - Increased Text Size */}
          <p
            ref={subtitleRef}
            className="text-sm sm:text-base text-[#777968] font-sans font-normal mt-2.5 max-w-md mx-auto"
          >
            Choose what&apos;s best for your natural care
          </p>
        </div>

        {/* 5 Category Items - No Outer Box, strictly rounded-[5px], Modern & Premium */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5 lg:gap-6">
          {categories.map((category, index) => {
            const isLastOnMobile = index === categories.length - 1;

            return (
              <Link
                key={category.id}
                href={`/shop?category=${category.slug}`}
                ref={(el) => {
                  cardsRef.current[index] = el;
                }}
                className={`group block transition-all duration-300 ${
                  isLastOnMobile
                    ? "col-span-2 sm:col-span-1 w-[calc(50%-0.5rem)] sm:w-full mx-auto"
                    : "w-full"
                }`}
              >
                {/* Image Container with strictly rounded-[5px] and 1:1 square ratio matching new 1254x1254 images */}
                <div className="relative w-full aspect-square rounded-[5px] overflow-hidden bg-[#FAF2E8] shadow-xs group-hover:shadow-lg transition-all duration-300">
                  <Image
                    src={`${category.image}?v=2`}
                    alt={category.name}
                    fill
                    sizes="(min-width: 1024px) 20vw, (min-width: 640px) 33vw, 50vw"
                    className="object-cover object-center group-hover:scale-106 transition-transform duration-500 ease-out"
                    unoptimized
                  />
                  {/* Subtle inner highlight border with 5px radius */}
                  <div className="absolute inset-0 rounded-[5px] ring-1 ring-inset ring-black/5 pointer-events-none" />
                </div>

                {/* Category title */}
                <div className="mt-3 sm:mt-4 flex items-center justify-center text-[#28321F] group-hover:text-[#263D18] transition-colors">
                  <span className="font-sans text-base sm:text-lg lg:text-xl font-medium tracking-tight">
                    {category.name}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
