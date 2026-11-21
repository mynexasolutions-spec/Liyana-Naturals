"use client";

import React, { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { products } from "@/data/products";
import { StoreProductCard } from "@/components/products/StoreProductCard";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function BestSellers() {
  const sectionRef = useRef<HTMLElement>(null);
  const leafRef = useRef<HTMLDivElement>(null);
  const leftLineRef = useRef<HTMLDivElement>(null);
  const rightLineRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const bestsellerProducts = products.filter((p) => p.isBestSeller);

  const updateScrollState = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 15);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 15);
  };

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    updateScrollState();
    el.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);

    return () => {
      el.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 85%",
          toggleActions: "play none none none",
        },
      });

      if (leafRef.current) {
        tl.fromTo(
          leafRef.current,
          { opacity: 0, y: -20, scale: 0.7, rotate: -15 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            rotate: 0,
            duration: 0.5,
            ease: "back.out(1.6)",
          }
        );
      }

      if (leftLineRef.current && rightLineRef.current) {
        tl.fromTo(
          [leftLineRef.current, rightLineRef.current],
          { scaleX: 0, opacity: 0 },
          { scaleX: 1, opacity: 1, duration: 0.6, ease: "power2.out" },
          "-=0.3"
        );
      }

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

      if (scrollContainerRef.current) {
        const cards =
          scrollContainerRef.current.querySelectorAll("[data-product-card]");
        if (cards.length > 0) {
          tl.fromTo(
            cards,
            { opacity: 0, y: 35, scale: 0.96 },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 0.65,
              stagger: 0.08,
              ease: "power2.out",
              clearProps: "transform,opacity",
            },
            "-=0.2"
          );
        }
      }

      ScrollTrigger.refresh();
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const handleScroll = (direction: "left" | "right") => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const firstCard = el.querySelector<HTMLElement>("[data-product-card]");
    const cardWidth = firstCard ? firstCard.offsetWidth + 24 : 320;
    const scrollAmount = direction === "left" ? -cardWidth : cardWidth;

    el.scrollBy({
      left: scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <section
      ref={sectionRef}
      className="relative w-full bg-[#FAF5EC] py-12 sm:py-14 lg:py-16 overflow-hidden select-none mt-0 lg:mt-[-50px]"
      aria-label="Our Bestsellers"
    >
      <div className="max-w-[1350px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-10 sm:mb-12 lg:mb-14">
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

          <div className="flex items-center justify-center gap-3 sm:gap-6 max-w-2xl mx-auto">
            <div
              ref={leftLineRef}
              className="hidden sm:flex items-center flex-1 origin-right"
              aria-hidden="true"
            >
              <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-[#28321F]/25 to-[#28321F]/40" />
              <div className="w-1.5 h-1.5 rotate-45 bg-[#536B35] shrink-0 -ml-0.5 rounded-[1px]" />
            </div>

            <h2
              ref={titleRef}
              className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-[46px] text-[#28321F] font-normal tracking-tight whitespace-nowrap"
            >
              Our Bestsellers
            </h2>

            <div
              ref={rightLineRef}
              className="hidden sm:flex items-center flex-1 origin-left"
              aria-hidden="true"
            >
              <div className="w-1.5 h-1.5 rotate-45 bg-[#536B35] shrink-0 -mr-0.5 rounded-[1px]" />
              <div className="h-[1px] w-full bg-gradient-to-l from-transparent via-[#28321F]/25 to-[#28321F]/40" />
            </div>
          </div>

          <p
            ref={subtitleRef}
            className="text-sm sm:text-base text-[#777968] font-sans font-normal mt-2.5 max-w-md mx-auto"
          >
            — Loved by thousands, naturally —
          </p>
        </div>

        {/* Carousel Container */}
        <div className="relative group/carousel">
          <button
            type="button"
            onClick={() => handleScroll("left")}
            disabled={!canScrollLeft}
            aria-label="Previous products"
            className={`absolute -left-2 sm:-left-14 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-[5px] bg-white/95 border border-[#28321F]/15 text-[#28321F] shadow-md flex items-center justify-center transition-all duration-300 hover:bg-[#263D18] hover:text-white hover:border-[#263D18] active:scale-95 backdrop-blur-xs cursor-pointer ${
              !canScrollLeft
                ? "opacity-30 cursor-not-allowed pointer-events-none"
                : "opacity-90 hover:opacity-100"
            }`}
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          <button
            type="button"
            onClick={() => handleScroll("right")}
            disabled={!canScrollRight}
            aria-label="Next products"
            className={`absolute -right-2 sm:-right-14 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-[5px] bg-white/95 border border-[#28321F]/15 text-[#28321F] shadow-md flex items-center justify-center transition-all duration-300 hover:bg-[#263D18] hover:text-white hover:border-[#263D18] active:scale-95 backdrop-blur-xs cursor-pointer ${
              !canScrollRight
                ? "opacity-30 cursor-not-allowed pointer-events-none"
                : "opacity-90 hover:opacity-100"
            }`}
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          <div
            ref={scrollContainerRef}
            className="flex items-stretch gap-2.5 sm:gap-5 lg:gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory py-2 px-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          >
            {bestsellerProducts.map((product) => (
              <StoreProductCard
                key={product.id}
                product={product}
                dataProductCard
                className="w-[calc(50%-5px)] sm:w-[285px] lg:w-[calc(25%-18px)] shrink-0 snap-start"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
