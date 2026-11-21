import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ChevronRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { WishlistClient } from "@/components/wishlist/WishlistClient";

export const metadata: Metadata = {
  title: "My Wishlist",
  description:
    "View and manage your saved Liyana Naturals organic skincare and haircare essentials.",
  openGraph: {
    title: "My Wishlist | Liyana Naturals",
    description:
      "Your curated collection of saved pure botanical skincare and haircare essentials.",
  },
};

export default function WishlistPage() {
  return (
    <main className="min-h-screen bg-[#FBF7EE] text-[#28321F] overflow-x-hidden">
      {/* 
        ========================================================================
        1. ULTRA-COMPACT HERO SECTION (About Us Style, Very Low Height)
        ========================================================================
      */}
      <section
        className="relative w-full bg-[#FBF7EE] border-b border-[#28321F]/8 overflow-hidden py-4 sm:py-5 md:py-6"
        aria-label="Wishlist Hero"
      >
        {/* Subtle Right Botanical Accent (Hidden on tiny screens to keep ultra-clean) */}
        <div
          className="hidden sm:block absolute right-0 top-1/2 -translate-y-1/2 w-32 h-32 md:w-40 md:h-40 pointer-events-none opacity-65 translate-x-[20%]"
          aria-hidden="true"
        >
          <Image
            src="/images/about/Glossy_Green.png"
            alt=""
            fill
            className="object-contain rotate-[25deg]"
            unoptimized
          />
        </div>

        <section  className="relative z-10 max-w-[1350px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-left">
              {/* Compact Breadcrumb */}
              <nav
                aria-label="Breadcrumb"
                className="flex items-center gap-1.5 text-[11px] sm:text-xs text-[#777968] mb-1 font-medium"
              >
                <Link
                  href="/"
                  className="text-[#555C4A] hover:text-[#263D18] transition-colors"
                >
                  Home
                </Link>
                <ChevronRight className="w-3 h-3 text-[#777968]/70" />
                <span className="text-[#263D18] font-semibold">Wishlist</span>
              </nav>

              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <h1 className="font-heading text-2xl sm:text-3xl md:text-[38px] text-[#263D18] font-bold tracking-tight leading-none">
                  My Wishlist
                </h1>
                <span className="inline-flex items-center gap-2 font-heading text-sm sm:text-lg text-[#536B35] font-semibold">
                  <span>Saved Botanical Care</span>
                  <span
                    className="w-6 sm:w-10 h-[1.5px] bg-[#28321F]/50 inline-block rounded-full"
                    aria-hidden="true"
                  />
                </span>
              </div>
            </div>

            <Link
              href="/shop"
              className="group self-start sm:self-auto inline-flex items-center gap-2 px-4 sm:px-5 py-2 rounded-[5px] bg-[#263D18] hover:bg-[#1D3214] text-[#FBF7EE] text-xs sm:text-sm font-medium shadow-2xs transition-all active:scale-95 shrink-0"
            >
              <span>Continue Shopping</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </section>
      </section>

      {/* 
        ========================================================================
        2. WISHLIST PRODUCTS GRID & RECOMMENDATIONS
        ========================================================================
      */}
      <WishlistClient />

      {/* 
        ========================================================================
        3. ABOUT US STYLE DARK BOTANICAL CTA BANNER
        ========================================================================
      */}
      <section
        className="relative w-full bg-[#FBF7EE] pb-8 sm:pb-10 overflow-hidden"
        aria-label="Natural Skincare Promise"
      >
        <Container size="xl">
          <div className="relative bg-[#1D3214] rounded-[5px] px-5 py-5 sm:px-8 sm:py-6 lg:px-10 lg:py-7 shadow-elevated overflow-hidden">
            <div
              className="absolute inset-0 pointer-events-none overflow-hidden"
              aria-hidden="true"
            >
              <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-[#536B35]/25 rounded-full blur-3xl -translate-y-1/2" />
              <div className="absolute -top-6 -right-6 w-28 h-28 opacity-15">
                <Image
                  src="/images/about/Glossy_Green.png"
                  alt=""
                  fill
                  className="object-contain rotate-45"
                  unoptimized
                />
              </div>
            </div>

            <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
              <div>
                <span className="inline-block text-[10px] sm:text-xs font-semibold uppercase tracking-[0.2em] text-[#A8B88A] mb-1">
                  Natural &amp; Conscious Skincare
                </span>
                <h2
                  style={{ color: "#ffffff" }}
                  className="font-heading text-xl sm:text-2xl lg:text-3xl font-normal !text-white tracking-tight leading-tight"
                >
                  Pure Botanical Care, Crafted for Daily Glow
                </h2>
              </div>

              <Link
                href="/shop"
                className="group shrink-0 inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 rounded-[5px] bg-[#FBF7EE] hover:bg-white text-[#1D3214] font-semibold text-xs sm:text-sm shadow-xs transition-all active:scale-95 whitespace-nowrap"
              >
                <span>Shop All Products</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}
