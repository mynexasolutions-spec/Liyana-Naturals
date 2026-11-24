import type { Metadata } from "next";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { ShopCatalog } from "@/components/shop/ShopCatalog";
import { Newsletter } from "@/components/home/Newsletter";
import { getStorefrontProducts } from "@/lib/supabase/storefront";

export const metadata: Metadata = {
  title: "Shop All Botanicals",
  description:
    "Explore Liyana Naturals pure organic skincare and haircare essentials crafted with clean, safe, and effective botanical ingredients.",
  openGraph: {
    title: "Shop All Products | Liyana Naturals",
    description:
      "Pure skincare and haircare essentials made with clean, safe, and effective natural ingredients.",
  },
};

const trustHighlights = [
  {
    icon: "/images/icons/shopicons/01-natural-leaf.svg",
    label: "100% Natural Ingredients",
  },
  {
    icon: "/images/icons/shopicons/02-no-harsh-chemicals-flask.svg",
    label: "No Harsh Chemicals",
  },
  {
    icon: "/images/icons/shopicons/03-cruelty-free-bunny.svg",
    label: "Cruelty Free",
  },
  {
    icon: "/images/icons/shopicons/04-dermatologically-tested-shield.svg",
    label: "Dermatologically Tested",
  },
  {
    icon: "/images/icons/shopicons/05-free-shipping-truck.svg",
    label: "Free Shipping Above ₹999",
  },
  {
    icon: "/images/icons/shopicons/06-easy-returns.svg",
    label: "Easy Returns",
  },
];

interface ShopPageProps {
  searchParams: Promise<{
    category?: string;
    tag?: string;
    search?: string;
  }>;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const { category, tag, search } = await searchParams;
  const storefrontProducts = await getStorefrontProducts();

  return (
    <main className="min-h-screen bg-[#FBF7EE] text-[#28321F] overflow-x-hidden">
      {/* 
        ========================================================================
        1. SHOP HERO SECTION (Using public/images/shophero/shop_hero.png)
        ========================================================================
      */}
      <section
        className="relative w-full bg-[#FBF7EE] overflow-hidden py-4 sm:py-7 md:py-0 md:min-h-[330px] lg:min-h-[380px] flex items-center"
        aria-label="Shop Hero"
      >
        {/* Mobile Atmospheric Background */}
        <div className="block md:hidden absolute inset-0 z-0 pointer-events-none">
          <Image
            src="/images/shophero/shop_hero.png"
            alt="Liyana Naturals Nourishing Face Cream and Vitamin C Serum"
            fill
            priority
            unoptimized
            sizes="100vw"
            className="object-cover object-top opacity-25"
          />
          <div
            className="absolute inset-0 bg-gradient-to-b from-[#FBF7EE]/92 via-[#FBF7EE]/85 to-[#FBF7EE]/96"
            aria-hidden="true"
          />
        </div>

        {/* Desktop / Tablet Background Image */}
        <div className="hidden md:block absolute inset-0 z-0 pointer-events-none">
          <Image
            src="/images/shophero/shop_hero.png"
            alt="Liyana Naturals Nourishing Face Cream and Vitamin C Serum"
            fill
            priority
            unoptimized
            sizes="100vw"
            className="object-cover object-top"
          />
          <div
            className="absolute inset-0 bg-gradient-to-r from-[#FBF7EE] via-[#FBF7EE]/70 to-transparent w-[55%]"
            aria-hidden="true"
          />
        </div>

        <div className="relative z-10 w-full max-w-[1350px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-lg mx-auto md:mx-0 text-center md:text-left flex flex-col items-center md:items-start">
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.2em] text-[#536B35] mb-1 sm:mb-2">
              Shop Our Natural Range
            </span>

            <h1 className="font-heading text-2xl sm:text-4xl md:text-[44px] lg:text-[50px] text-[#263D18] font-bold tracking-tight leading-[1.08] mb-1.5 sm:mb-2.5">
              Pure Skincare &amp; Haircare Essentials
            </h1>

            <p className="font-sans text-xs sm:text-[14.5px] md:text-[16px] text-[#555C4A] leading-snug sm:leading-relaxed max-w-md mb-3 sm:mb-5">
              Discover nature-powered products made with clean, safe and
              effective ingredients.
            </p>

            <a
              href="#shop-catalog"
              className="group inline-flex items-center justify-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-[5px] bg-[#263D18] hover:bg-[#1D3214] text-[#FBF7EE] text-xs sm:text-sm font-semibold shadow-xs hover:shadow-md transition-all duration-300 active:scale-95"
            >
              <span>Shop All Products</span>
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </div>
      </section>

      {/* 
        ========================================================================
        2. INFINITE TRUST & PROMISE ICON MARQUEE (With Left & Right Fade Shadows)
        ========================================================================
      */}
      <section
        className="relative w-full bg-[#F6EFE0]/80 border-y border-[#28321F]/8 py-2 sm:py-3.5 overflow-hidden select-none"
        aria-label="Liyana Naturals Quality Standards"
      >
        {/* Left Fade Shadow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-0 top-0 bottom-0 w-10 sm:w-20 lg:w-32 z-20 bg-gradient-to-r from-[#F6EFE0] via-[#F6EFE0]/90 to-transparent shadow-[inset_14px_0_22px_-12px_rgba(40,50,31,0.15)]"
        />

        {/* Right Fade Shadow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-0 top-0 bottom-0 w-10 sm:w-20 lg:w-32 z-20 bg-gradient-to-l from-[#F6EFE0] via-[#F6EFE0]/90 to-transparent shadow-[inset_-14px_0_22px_-12px_rgba(40,50,31,0.15)]"
        />

        {/* Continuous Infinite Track (4x repeated so -50% loops seamlessly at all widths) */}
        <div
          className="animate-marquee-infinite flex items-center"
          style={{ animationDuration: "26s" }}
        >
          {[
            ...trustHighlights,
            ...trustHighlights,
            ...trustHighlights,
            ...trustHighlights,
          ].map((item, idx) => (
            <div
              key={`${item.label}-${idx}`}
              className="flex items-center gap-2.5 shrink-0 pr-8 sm:pr-12 lg:pr-14"
            >
              <div className="w-7 h-7 sm:w-8 sm:h-8 shrink-0 flex items-center justify-center">
                <Image
                  src={item.icon}
                  alt={item.label}
                  width={28}
                  height={28}
                  unoptimized
                  className="w-6 h-6 sm:w-7 sm:h-7 object-contain"
                />
              </div>
              <span className="font-sans text-xs sm:text-[13px] font-semibold text-[#28321F] whitespace-nowrap">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* 
        ========================================================================
        3 & 4. INTERACTIVE SHOP CATALOG + BUILD YOUR OWN COMBO
        ========================================================================
      */}
      <ShopCatalog
        key={`${category ?? ""}|${tag ?? ""}|${search ?? ""}`}
        initialCategory={category}
        initialTag={tag}
        initialSearch={search}
        products={storefrontProducts}
      />

      {/* 
        ========================================================================
        5. EXISTING NEWSLETTER BANNER
        ========================================================================
      */}
      <Newsletter className="lg:mt-0" />
    </main>
  );
}
