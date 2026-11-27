import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { BlogJournalFilter } from "@/components/blog/BlogJournalFilter";
import { getStorefrontBlogs } from "@/lib/supabase/storefront";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Blog — The Botanical Journal",
  description:
    "Explore clean skincare rituals, botanical ingredient guides, and natural haircare stories from Liyana Naturals.",
  openGraph: {
    title: "The Botanical Journal | Liyana Naturals",
    images: ["/og.jpg"],
    description:
      "Insights on clean skincare rituals, active plant extracts, and holistic well-being by Liyana Naturals.",
  },
};

/* -------------------------------------------------------------------------- */
/*                             Inline Icon Helper                             */
/* -------------------------------------------------------------------------- */

interface JournalIconProps {
  name: string;
  size?: number;
  className?: string;
  alt?: string;
}

function JournalIcon({ name, size = 24, className, alt }: JournalIconProps) {
  const iconSrc = `/images/icons/aboutsIcons/${name.replace(/\.svg$/, "")}.svg`;
  return (
    <Image
      src={iconSrc}
      alt={alt || `${name} icon`}
      width={size}
      height={size}
      unoptimized
      className={cn("object-contain shrink-0", className)}
    />
  );
}

/* -------------------------------------------------------------------------- */
/*                         Editorial Pillars Dataset                          */
/* -------------------------------------------------------------------------- */

const journalPillars = [
  {
    icon: "leaf",
    title: "Pure Botanicals",
    subtitle: "Deep dives into cold-pressed herbs and plant extracts",
  },
  {
    icon: "flask",
    title: "Honest Science",
    subtitle: "Evidence-backed formulation insights made easy",
  },
  {
    icon: "heart",
    title: "Mindful Rituals",
    subtitle: "Simple daily routines for calm, glowing skin",
  },
  {
    icon: "sprout",
    title: "Holistic Wellness",
    subtitle: "Root-to-tip nourishment for skin and hair",
  },
];

/* -------------------------------------------------------------------------- */
/*                            Main Blog Page Layout                           */
/* -------------------------------------------------------------------------- */

export default async function BlogPage() {
  const blogPosts = await getStorefrontBlogs();

  return (
    <main className="min-h-screen bg-[#FBF7EE] text-[#28321F] overflow-x-hidden">
      {/* 
        ========================================================================
        1. HERO SECTION: COMPACT, RESPONSIVE & DEDICATED BOTANICAL JOURNAL HERO
        ========================================================================
      */}
      <section
        className="relative w-full bg-[#FBF7EE] overflow-hidden min-h-[240px] sm:min-h-[290px] md:min-h-[360px] lg:min-h-[410px] md:max-h-[480px] flex items-center justify-center md:justify-start"
        aria-label="Botanical Journal Hero"
      >
        {/* Mobile Background Image: soft atmospheric backdrop */}
        <div className="block md:hidden absolute inset-0 z-0 pointer-events-none">
          <Image
            src="/images/contactspage/contacts_hero.png"
            alt="Liyana Naturals Botanical Journal with pressed herbs, chamomile and aloe vera"
            fill
            priority
            unoptimized
            sizes="100vw"
            className="object-cover object-right opacity-30"
          />
          <div
            className="absolute inset-0 bg-gradient-to-b from-[#FBF7EE]/90 via-[#FBF7EE]/82 to-[#FBF7EE]/95"
            aria-hidden="true"
          />
        </div>

        {/* Desktop / Tablet Background Image: Seamless edge-to-edge right visual */}
        <div className="hidden md:block absolute inset-0 z-0 pointer-events-none">
          <Image
            src="/images/contactspage/contacts_hero.png"
            alt="Liyana Naturals Botanical Journal with pressed herbs, chamomile and aloe vera"
            fill
            priority
            unoptimized
            sizes="100vw"
            className="object-cover object-top"
          />
          {/* Smooth cream gradient wash on the left for crisp typography contrast */}
          <div
            className="absolute inset-0 bg-gradient-to-r from-[#FBF7EE] via-[#FBF7EE]/65 to-transparent w-[54%]"
            aria-hidden="true"
          />
          <div
            className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-[#FBF7EE] to-transparent"
            aria-hidden="true"
          />
        </div>

        {/* 3D Botanical Infinity Emblem (Desktop Center) */}
        <div
          className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[5] items-center justify-center pointer-events-none w-[290px] xl:w-[350px] aspect-square"
          aria-hidden="true"
        >
          <Image
            src="/images/botanical-infinity.png"
            alt="Liyana Naturals 3D Botanical Infinity Emblem"
            fill
            sizes="(min-width: 1280px) 350px, 290px"
            className="object-contain drop-shadow-[0_12px_28px_rgba(38,61,24,0.16)]"
            priority
            unoptimized
          />
        </div>

        <section className="relative z-10 w-full max-w-[1350px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-xl md:max-w-md lg:max-w-lg mx-auto md:mx-0 text-center md:text-left flex flex-col items-center md:items-start">
            {/* Breadcrumb Navigation */}
            <nav
              aria-label="Breadcrumb"
              className="flex items-center justify-center md:justify-start gap-1.5 text-xs sm:text-[13px] text-[#777968] mb-1.5 sm:mb-2 font-medium"
            >
              <Link
                href="/"
                className="text-[#555C4A] hover:text-[#263D18] transition-colors"
              >
                Home
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-[#777968]/70" />
              <span className="text-[#263D18] font-semibold">Blog</span>
            </nav>

            {/* Main Heading */}
            <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-[52px] text-[#263D18] font-bold tracking-tight leading-[1.06] mb-1.5 sm:mb-2 text-center md:text-left">
              Our Blog
            </h1>

            {/* Tagline with Signature Horizontal Accent Line */}
            <div className="mb-2 flex flex-col items-center md:items-start">
              <h2 className="font-heading text-base sm:text-xl lg:text-[23px] font-semibold text-[#28321F] leading-[1.25] tracking-tight">
                <span className="block">The Botanical Journal,</span>
                <span className="inline-flex items-center justify-center md:justify-start gap-2 sm:gap-2.5">
                  <span>Stories for Natural Glow</span>
                  <span
                    className="w-7 sm:w-12 h-[2px] bg-[#28321F]/70 inline-block align-middle rounded-full"
                    aria-hidden="true"
                  />
                </span>
              </h2>
            </div>

            {/* Description */}
            <p className="font-sans text-[12.5px] sm:text-[14px] md:text-[15.5px] text-[#555C4A] leading-relaxed max-w-md mb-4 sm:mb-5 font-normal text-center md:text-left mx-auto md:mx-0">
              Tips, botanical skincare science, and Ayurvedic self-care rituals
              crafted by our formulators and holistic estheticians.
            </p>

            {/* CTA Button */}
            <div className="flex justify-center md:justify-start w-full md:w-auto">
              <a
                href="#articles"
                className="inline-flex items-center justify-center px-4 sm:px-5 py-2.5 sm:py-3 rounded-[5px] bg-[#263D18] hover:bg-[#1D3214] text-[#FBF7EE] text-xs sm:text-sm md:text-[15px] font-medium shadow-xs hover:shadow-md transition-all duration-300 hover:scale-[1.02] active:scale-95"
              >
                <span>Browse Articles ({blogPosts.length})</span>
              </a>
            </div>
          </div>
        </section>
      </section>

      {/* 
        ========================================================================
        2 & 3. FEATURED STORY + INTERACTIVE FILTERABLE BLOG LIST
        ========================================================================
      */}
      <BlogJournalFilter posts={blogPosts} />

      {/* 
        ========================================================================
        4. JOURNAL EDITORIAL PILLARS (Matches About Us "Our Core Values")
        ========================================================================
      */}
      <section
        className="relative w-full bg-[#FBF7EE] py-6 sm:py-8 md:py-10 overflow-hidden"
        aria-label="What We Write About"
      >
        {/* Decorative Botanical Leaf Sprig on Right Side */}
        <div
          className="hidden sm:block absolute right-0 top-1/2 -translate-y-1/2 w-28 h-28 sm:w-36 sm:h-36 lg:w-44 lg:h-44 pointer-events-none opacity-85 z-10 translate-x-[20%]"
          aria-hidden="true"
        >
          <Image
            src="/images/about/Glossy_Green.png"
            alt="Botanical Leaves Decor"
            fill
            className="object-contain object-right rotate-[25deg] scale-110"
            unoptimized
          />
        </div>

        <Container className="relative z-10">
          <div className="flex items-center justify-center gap-3 sm:gap-5 mb-6 sm:mb-8">
            <span
              className="flex-1 max-w-[36px] sm:max-w-[90px] h-[1.5px] bg-[#28321F]/20 rounded-full"
              aria-hidden="true"
            />
            <h2 className="font-heading text-2xl sm:text-3xl md:text-[36px] font-bold text-[#263D18] tracking-tight text-center">
              What We Write About
            </h2>
            <span
              className="flex-1 max-w-[36px] sm:max-w-[90px] h-[1.5px] bg-[#28321F]/20 rounded-full"
              aria-hidden="true"
            />
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 pt-2">
            {journalPillars.map((pillar) => (
              <div
                key={pillar.title}
                className="flex flex-col items-center text-center group"
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#EBF1DE] border border-[#A8B88A]/35 flex items-center justify-center mb-2.5 sm:mb-3 shadow-2xs group-hover:scale-105 group-hover:bg-[#E2ECCD] transition-all duration-300">
                  <JournalIcon
                    name={pillar.icon}
                    size={24}
                    className="w-5 h-5 sm:w-6 sm:h-6 text-[#183B12]"
                  />
                </div>
                <h3 className="font-heading text-base sm:text-xl lg:text-2xl font-bold text-[#263D18] tracking-tight mb-1">
                  {pillar.title}
                </h3>
                <p className="font-sans text-[12px] sm:text-[13.5px] md:text-[15px] text-[#777968] font-normal leading-relaxed max-w-[210px]">
                  {pillar.subtitle}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* 
        ========================================================================
        5. JOIN OUR NATURAL BEAUTY COMMUNITY CTA BANNER (Matches About Us Banner)
        ========================================================================
      */}
      <section
        className="relative w-full bg-[#FBF7EE] py-5 sm:py-7 md:py-9 overflow-hidden"
        aria-label="Explore Natural Formulations"
      >
        <Container>
          <div className="relative bg-[#1D3214] rounded-[5px] px-5 py-6 sm:px-8 sm:py-7 lg:px-12 lg:py-8 shadow-elevated overflow-hidden">
            {/* Subtle botanical glow & background leaf silhouette */}
            <div
              className="absolute inset-0 pointer-events-none overflow-hidden"
              aria-hidden="true"
            >
              <div className="absolute top-1/2 right-1/4 w-72 h-72 bg-[#536B35]/25 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />
              <div className="absolute -top-6 -right-6 w-32 h-32 opacity-15 pointer-events-none">
                <Image
                  src="/images/about/Glossy_Green.png"
                  alt=""
                  fill
                  className="object-contain rotate-45"
                  unoptimized
                />
              </div>
              <div className="absolute -bottom-6 -left-6 w-32 h-32 opacity-15 pointer-events-none">
                <Image
                  src="/images/about/Glossy_Green.png"
                  alt=""
                  fill
                  className="object-contain -rotate-45"
                  unoptimized
                />
              </div>
            </div>

            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-4 sm:gap-6 lg:gap-8 text-center lg:text-left">
              <div className="max-w-2xl">
                <span className="inline-block text-[10px] sm:text-xs font-semibold uppercase tracking-[0.2em] text-[#A8B88A] mb-1">
                  From Journal to Daily Ritual
                </span>
                <h3
                  style={{ color: "#ffffff" }}
                  className="font-heading text-2xl sm:text-3xl lg:text-[34px] font-normal !text-white tracking-tight leading-tight mb-1.5"
                >
                  Bring Pure Botanical Care Home
                </h3>
                <p className="font-sans text-[13px] sm:text-[14px] md:text-[15.5px] text-[#FBF7EE]/85 font-light leading-relaxed">
                  Explore our paraben-free, cruelty-free skincare and haircare
                  formulations crafted with the natural ingredients you read about.
                </p>
              </div>

              <div className="shrink-0 w-full sm:w-auto pt-1 lg:pt-0">
                <Link
                  href="/shop"
                  className="w-full sm:w-auto inline-flex items-center justify-center px-5 sm:px-6 py-2.5 sm:py-3 rounded-full bg-[#FBF7EE] hover:bg-white text-[#1D3214] font-medium text-xs sm:text-sm md:text-[15px] shadow-xs hover:shadow-md transition-all duration-300 hover:scale-105 active:scale-95 whitespace-nowrap"
                >
                  <span>Explore Shop</span>
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}
