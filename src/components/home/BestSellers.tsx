"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ShoppingCart, Star, Check } from "lucide-react";
import { products } from "@/data/products";
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
  const [addedItems, setAddedItems] = useState<Record<string, boolean>>({});

  // Filter only best seller products or show all featured
  const bestsellerProducts = products.filter((p) => p.isBestSeller);

  // Scroll checking for disabling/enabling navigation arrows
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

  // GSAP Entrance Animations
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

      // 1. Leaf icon floating entrance
      if (leafRef.current) {
        tl.fromTo(
          leafRef.current,
          { opacity: 0, y: -20, scale: 0.7, rotate: -15 },
          { opacity: 1, y: 0, scale: 1, rotate: 0, duration: 0.5, ease: "back.out(1.6)" }
        );
      }

      // 2. Ornate divider lines expand horizontally
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

      // 4. Product cards entrance
      if (scrollContainerRef.current) {
        const cards = scrollContainerRef.current.querySelectorAll("[data-product-card]");
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

  // Handle smooth horizontal scrolling
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

  // Add to Cart handler
  const handleAddToCart = (productId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setAddedItems((prev) => ({ ...prev, [productId]: true }));

    setTimeout(() => {
      setAddedItems((prev) => ({ ...prev, [productId]: false }));
    }, 1800);
  };

  // Helper for badge color styling (strictly rounded-[5px])
  const getBadgeStyle = (badge?: string) => {
    switch (badge) {
      case "Sale":
        return "bg-[#263D18] text-white";
      case "Best Seller":
        return "bg-[#D48B38] text-white";
      case "New":
        return "bg-[#3C6E26] text-white";
      case "Organic":
        return "bg-[#536B35] text-white";
      default:
        return "bg-[#263D18] text-white";
    }
  };

  return (
    <section
      ref={sectionRef}
      className="relative w-full bg-[#FAF5EC] py-12 sm:py-14 lg:py-16 overflow-hidden select-none mt-[-50px]" 
      aria-label="Our Bestsellers"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-10 sm:mb-12 lg:mb-14">
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

            {/* Main Headline */}
            <h2
              ref={titleRef}
              className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-[46px] text-[#28321F] font-normal tracking-tight whitespace-nowrap"
            >
              Our Bestsellers
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

          {/* Subtitle */}
          <p
            ref={subtitleRef}
            className="text-sm sm:text-base text-[#777968] font-sans font-normal mt-2.5 max-w-md mx-auto"
          >
            — Loved by thousands, naturally —
          </p>
        </div>

        {/* Carousel Container with Left & Right Modern Scroll Buttons */}
        <div className="relative group/carousel">
          {/* Left Navigation Button - Strictly rounded-[5px] */}
          <button
            type="button"
            onClick={() => handleScroll("left")}
            disabled={!canScrollLeft}
            aria-label="Previous products"
            className={`absolute -left-2 sm:-left-4 lg:-left-5 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-[5px] bg-white/95 border border-[#28321F]/15 text-[#28321F] shadow-md flex items-center justify-center transition-all duration-300 hover:bg-[#263D18] hover:text-white hover:border-[#263D18] active:scale-95 backdrop-blur-xs ${
              !canScrollLeft
                ? "opacity-30 cursor-not-allowed pointer-events-none"
                : "opacity-90 hover:opacity-100"
            }`}
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          {/* Right Navigation Button - Strictly rounded-[5px] */}
          <button
            type="button"
            onClick={() => handleScroll("right")}
            disabled={!canScrollRight}
            aria-label="Next products"
            className={`absolute -right-2 sm:-right-4 lg:-right-5 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-[5px] bg-white/95 border border-[#28321F]/15 text-[#28321F] shadow-md flex items-center justify-center transition-all duration-300 hover:bg-[#263D18] hover:text-white hover:border-[#263D18] active:scale-95 backdrop-blur-xs ${
              !canScrollRight
                ? "opacity-30 cursor-not-allowed pointer-events-none"
                : "opacity-90 hover:opacity-100"
            }`}
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          {/* Scrollable Products Grid / Track */}
          <div
            ref={scrollContainerRef}
            className="flex items-stretch gap-4 sm:gap-5 lg:gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory py-2 px-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          >
            {bestsellerProducts.map((product) => {
              const isAdded = addedItems[product.id];

              return (
                <div
                  key={product.id}
                  data-product-card
                  className="w-[260px] sm:w-[280px] lg:w-[calc(25%-18px)] flex-shrink-0 snap-start bg-white rounded-[5px] border border-[#28321F]/10 shadow-[0_2px_10px_rgba(40,50,31,0.05)] hover:shadow-[0_8px_24px_rgba(40,50,31,0.12)] transition-all duration-300 flex flex-col group p-3.5 sm:p-4"
                >
                  {/* Product Image Stage - Strictly rounded-[5px] */}
                  <div className="relative w-full aspect-square rounded-[5px] overflow-hidden bg-[#FAF2E8] mb-3.5">
                    {/* Badge on Top Left - Strictly rounded-[5px] */}
                    {product.badge && (
                      <span
                        className={`absolute top-2.5 left-2.5 z-10 text-[11px] font-sans font-medium px-2.5 py-0.5 rounded-[5px] shadow-xs ${getBadgeStyle(
                          product.badge
                        )}`}
                      >
                        {product.badge}
                      </span>
                    )}

                    {/* Image with smooth hover scale */}
                    <Link
                      href={`/products/${product.slug}`}
                      className="block relative w-full h-full"
                    >
                      <Image
                        src={product.images[0]?.src || "/images/products/Fresh_Green.webp"}
                        alt={product.images[0]?.alt || product.name}
                        fill
                        sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 75vw"
                        className="object-cover object-center group-hover:scale-106 transition-transform duration-500 ease-out"
                        unoptimized
                      />
                      {/* Subtle inner border */}
                      <div className="absolute inset-0 rounded-[5px] ring-1 ring-inset ring-black/5 pointer-events-none" />
                    </Link>
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 flex flex-col">
                    {/* Product Name */}
                    <h3 className="font-sans text-base sm:text-[17px] font-semibold text-[#28321F] group-hover:text-[#263D18] transition-colors leading-snug">
                      <Link href={`/products/${product.slug}`}>
                        {product.name}
                      </Link>
                    </h3>

                    {/* Tagline / Subtitle */}
                    <p className="text-xs sm:text-sm md:text-[16px] text-[#777968] font-sans font-normal mt-1 mb-2 line-clamp-1">
                      {product.tagline || product.shortDescription}
                    </p>

                    {/* Star Ratings + Review Count */}
                    <div className="flex items-center gap-1.5 mb-2.5 text-xs text-[#777968]">
                      <div className="flex items-center text-[#E5A83B]" aria-label="5 stars rating">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className="w-3.5 h-3.5 fill-[#E5A83B] text-[#E5A83B]"
                          />
                        ))}
                      </div>
                      <span className="font-sans font-medium text-[#777968]">
                        ({product.reviewCount})
                      </span>
                    </div>

                    {/* Price Row */}
                    <div className="flex items-baseline gap-2 mb-3.5 mt-auto">
                      <span className="font-sans text-lg sm:text-xl font-bold text-[#28321F]">
                        ₹{product.price}
                      </span>
                      {product.originalPrice && (
                        <span className="font-sans text-xs sm:text-sm text-[#777968]/70 line-through">
                          ₹{product.originalPrice}
                        </span>
                      )}
                    </div>

                    {/* Full-width Add to Cart Button - Strictly rounded-[5px] */}
                    <button
                      type="button"
                      onClick={(e) => handleAddToCart(product.id, e)}
                      aria-label={`Add ${product.name} to cart`}
                      className={`w-full py-2.5 px-4 rounded-[5px] font-sans text-xs sm:text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2 active:scale-[0.98] ${
                        isAdded
                          ? "bg-[#3C6E26] text-white shadow-xs"
                          : "bg-[#263D18] hover:bg-[#1D3214] text-white shadow-xs"
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <Check className="w-4 h-4 stroke-[2.5]" />
                          <span>Added to Cart</span>
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="w-4 h-4 stroke-[2]" />
                          <span>Add to Cart 🛒</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
