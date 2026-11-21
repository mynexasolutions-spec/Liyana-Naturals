import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ChevronRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Rooted in Nature, Made for Your Skin. Liyana Naturals is a nature-inspired skincare brand blending the purity of traditional botanicals with modern skincare science.",
  openGraph: {
    title: "About Us | Liyana Naturals",
    description:
      "Rooted in Nature, Made for Your Skin. Liyana Naturals is a nature-inspired skincare brand blending the purity of traditional botanicals with modern skincare science.",
  },
};

/* -------------------------------------------------------------------------- */
/*                            Inline Icon Helper                              */
/* -------------------------------------------------------------------------- */

interface AboutIconProps {
  name: string;
  size?: number;
  className?: string;
  alt?: string;
}

function AboutIcon({ name, size = 24, className, alt }: AboutIconProps) {
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
/*                          Static Section Datasets                           */
/* -------------------------------------------------------------------------- */

const companyFacts = [
  { icon: "calendar", label: "Founded In", value: "2023" },
  { icon: "leaf", label: "Headquarters", value: "India" },
  { icon: "users", label: "Our Focus", value: "Natural Skincare" },
];

const coreValues = [
  {
    icon: "leaf",
    title: "Purity",
    subtitle: "Natural & safe ingredients",
  },
  {
    icon: "flask",
    title: "Transparency",
    subtitle: "Honest, clear formulations",
  },
  {
    icon: "heart",
    title: "Skin Wellness",
    subtitle: "Gentle & effective care for all skin types",
  },
  {
    icon: "recycle",
    title: "Sustainability",
    subtitle: "Eco-friendly and cruelty-free practices",
  },
];

const whyChooseFeatures = [
  "100% Natural & Herbal Ingredients",
  "Dermatologically Safe",
  "No Harsh Chemicals (Paraben & Sulphate Free)",
  "Suitable for All Skin Types",
];

const impactStats = [
  { icon: "users", number: "50,000+", label: "Happy Customers" },
  { icon: "leaf", number: "25+", label: "Natural Products" },
  { icon: "star", number: "4.8/5", label: "Average Rating" },
  { icon: "sprout", number: "90%", label: "Repeat Customers" },
];

const certifications = [
  { icon: "leaf", label: "Cruelty Free" },
  { icon: "flask", label: "Paraben Free" },
  { icon: "molecule", label: "Sulphate Free" },
  { icon: "shield-check", label: "Dermatologically Tested" },
  { icon: "recycle", label: "Eco-Friendly Packaging" },
];

/* -------------------------------------------------------------------------- */
/*                         Main About Us Page Component                       */
/* -------------------------------------------------------------------------- */

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#FBF7EE] text-[#28321F] overflow-hidden select-none">
      {/* 
        ========================================================================
        1. HERO SECTION: COMPACT, BALANCED & MODERN MOBILE HERO
        - Mobile: Centered text, compact height, image as atmospheric background
        - Desktop: Left-aligned text with full-height image pinned to the right
        ========================================================================
      */}
      <section
        className="relative w-full bg-[#FBF7EE] overflow-hidden min-h-[260px] sm:min-h-[300px] md:min-h-[380px] lg:min-h-[420px] md:max-h-[500px] flex items-center justify-center md:justify-start"
        aria-label="About Us Hero"
      >
        {/* Mobile Background Image: sleek, modern atmospheric backdrop taking zero extra height */}
        <div className="block md:hidden absolute inset-0 z-0 pointer-events-none">
          <Image
            src="/images/aboutuspage/about_hero.png"
            alt="Liyana Naturals Botanical Skincare Collection"
            fill
            priority
            unoptimized
            sizes="100vw"
            className="object-cover object-center opacity-30"
          />
          {/* Soft gradient overlay to ensure text contrast and elegance */}
          <div
            className="absolute inset-0 bg-gradient-to-b from-[#FBF7EE]/90 via-[#FBF7EE]/80 to-[#FBF7EE]/95"
            aria-hidden="true"
          />
        </div>

        {/* Desktop / Tablet Background Image: 100% height object-contain, pinned to right, zero cropping */}
        <div className="hidden md:block absolute inset-0 z-0 pointer-events-none">
          <Image
            src="/images/aboutuspage/about_hero.png"
            alt="Liyana Naturals Botanical Skincare Collection"
            fill
            priority
            unoptimized
            sizes="100vw"
            className="object-contain object-right"
          />

          {/* Soft atmospheric gradient on the far left for crisp typography contrast */}
          <div
            className="absolute inset-0 bg-gradient-to-r from-[#FBF7EE] via-[#FBF7EE]/50 to-transparent w-[45%]"
            aria-hidden="true"
          />
        </div>

        {/* 
          3D Botanical Infinity Emblem:
          - Desktop: Positioned in the CENTER between left text and right product imagery
          - Tablet: Scaled down proportionally
          - Mobile (< 768px): Completely hidden (display: none)
        */}
        <div
          className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[5] items-center justify-center pointer-events-none w-[270px] lg:w-[350px] xl:w-[410px] aspect-square"
          aria-hidden="true"
        >
          <Image
            src="/images/botanical-infinity.png"
            alt="Liyana Naturals 3D Botanical Infinity Emblem"
            fill
            sizes="(min-width: 1280px) 410px, (min-width: 1024px) 350px, 270px"
            className="object-contain drop-shadow-[0_12px_28px_rgba(38,61,24,0.18)]"
            priority
            unoptimized
          />
        </div>

        <section className="relative z-10 w-full max-w-[1350px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-xl md:max-w-md lg:max-w-lg mx-auto md:mx-0 text-center md:text-left flex flex-col items-center md:items-start">
            {/* Breadcrumb Navigation */}
            <nav
              aria-label="Breadcrumb"
              className="flex items-center justify-center md:justify-start gap-1.5 text-xs sm:text-[13px] text-[#777968] mb-1.5 sm:mb-2.5 font-medium"
            >
              <Link
                href="/"
                className="text-[#555C4A] hover:text-[#263D18] transition-colors"
              >
                Home
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-[#777968]/70" />
              <span className="text-[#263D18] font-semibold">About Us</span>
            </nav>

            {/* Main Heading - Clean and Compact */}
            <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-[54px] text-[#263D18] font-bold tracking-tight leading-[1.06] mb-2 sm:mb-2.5 text-center md:text-left">
              About Us
            </h1>

            {/* Tagline with Horizontal Line */}
            <div className="mb-2 sm:mb-2.5 flex flex-col items-center md:items-start">
              <h2 className="font-heading text-lg sm:text-xl lg:text-[24px] font-semibold text-[#28321F] leading-[1.25] tracking-tight">
                <span className="block">Rooted in Nature,</span>
                <span className="inline-flex items-center justify-center md:justify-start gap-2 sm:gap-2.5">
                  <span>Made for Your Skin</span>
                  <span
                    className="w-8 sm:w-12 h-[2px] bg-[#28321F]/70 inline-block align-middle rounded-full"
                    aria-hidden="true"
                  />
                </span>
              </h2>
            </div>

            {/* Brand Philosophy Description: 16px desktop, 13-14px mobile */}
            <p className="font-sans text-[13px] sm:text-[14px] md:text-[16px] text-[#555C4A] leading-relaxed max-w-md mb-3.5 sm:mb-5 font-normal text-center md:text-left mx-auto md:mx-0">
              Liyana Naturals is a nature-inspired skincare brand that blends the
              purity of traditional botanicals with modern skincare science.
            </p>

            {/* CTA Button */}
            <div className="flex justify-center md:justify-start w-full md:w-auto">
              <Link
                href="/shop"
                className="group inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-[5px] bg-[#263D18] hover:bg-[#1D3214] text-[#FBF7EE] text-xs sm:text-sm md:text-[15px] font-medium shadow-xs hover:shadow-md transition-all duration-300 hover:scale-[1.02] active:scale-95"
              >
                <span>Explore Our Products</span>
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#FBF7EE] group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
            </div>
          </div>
        </section>
      </section>

      {/* 
        ========================================================================
        2. OUR STORY: THE LIYANA JOURNEY
        ========================================================================
      */}
      <section
        className="relative w-full bg-[#FBF7EE] py-6 sm:py-8 md:py-10 overflow-hidden"
        aria-label="Our Story - The Liyana Journey"
      >
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-10 items-center">
            {/* Left Column: Mortar and Herbs Image */}
            <div className="lg:col-span-5">
              <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] rounded-[5px] overflow-hidden shadow-xs border border-[#28321F]/8 group">
                <Image
                  src="/images/aboutuspage/Mortar_herbs.png"
                  alt="Herbal mortar, fresh botanical herbs, jasmine flowers and golden botanical oil"
                  fill
                  sizes="(min-width: 1024px) 40vw, (min-width: 640px) 90vw, 100vw"
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                  unoptimized
                />
              </div>
            </div>

            {/* Middle Column: Our Story Content */}
            <div className="lg:col-span-4 text-left">
              <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.2em] text-[#536B35] block mb-1.5 sm:mb-2">
                OUR STORY
              </span>
              <h2 className="font-heading text-2xl sm:text-3xl lg:text-[36px] text-[#263D18] font-bold tracking-tight leading-[1.18] mb-2.5 sm:mb-3">
                The Liyana Journey
              </h2>
              {/* p tag: 16px desktop, 13-14px mobile */}
              <p className="font-sans text-[13px] sm:text-[14px] md:text-[16px] text-[#555C4A] leading-relaxed font-normal">
                Liyana Naturals was born from a simple belief — that real beauty
                comes from nature. We started with a mission to create safe,
                effective, and honest skincare solutions using natural and
                skin-friendly ingredients.
              </p>
            </div>

            {/* Right Column: 3 Company Facts */}
            <div className="lg:col-span-3 grid grid-cols-3 lg:flex lg:flex-col gap-2 sm:gap-4 lg:space-y-4 pt-3 lg:pt-0 border-t lg:border-t-0 lg:border-l border-[#28321F]/10 lg:pl-5">
              {companyFacts.map((fact) => (
                <div
                  key={fact.label}
                  className="flex flex-col sm:flex-row items-center sm:items-start lg:items-center gap-1.5 sm:gap-3 group text-center sm:text-left"
                >
                  <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-white/80 border border-[#28321F]/10 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 group-hover:border-[#536B35]/40 transition-all duration-300">
                    <AboutIcon
                      name={fact.icon}
                      size={20}
                      className="w-4 h-4 sm:w-5 sm:h-5 text-[#183B12]"
                    />
                  </div>
                  <div>
                    <span className="font-sans text-[10px] sm:text-xs text-[#777968] font-medium block">
                      {fact.label}
                    </span>
                    <span className="font-sans text-[11px] sm:text-sm md:text-base font-bold text-[#263D18] leading-tight block">
                      {fact.value}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* 
        ========================================================================
        3. OUR MISSION AND OUR VISION
        ========================================================================
      */}
      <section
        className="relative w-full bg-[#FBF7EE] py-4 sm:py-6 md:py-8 overflow-hidden"
        aria-label="Our Mission and Our Vision"
      >
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
            {/* 1. Left Card: Our Mission */}
            <div className="group relative bg-[#EAF1DF] border border-[#A8B88A]/40 rounded-[5px] p-5 sm:p-7 lg:p-8 shadow-xs hover:shadow-sm transition-all duration-300">
              <div className="flex items-start gap-3.5 sm:gap-5">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#DCE8D0] border border-[#A8B88A]/30 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform duration-300">
                  <AboutIcon
                    name="target"
                    size={28}
                    className="w-6 h-6 sm:w-7 sm:h-7 text-[#183B12]"
                  />
                </div>
                <div className="text-left">
                  <h3 className="font-heading text-xl sm:text-2xl lg:text-[28px] font-bold text-[#263D18] tracking-tight leading-tight mb-1.5 sm:mb-2">
                    Our Mission
                  </h3>
                  {/* p tag: 16px desktop, 13-14px mobile */}
                  <p className="font-sans text-[13px] sm:text-[14px] md:text-[16px] text-[#28321F]/85 leading-relaxed font-normal">
                    To provide pure, effective, and affordable skincare products
                    that promote healthy, radiant, and confident skin.
                  </p>
                </div>
              </div>
            </div>

            {/* 2. Right Card: Our Vision */}
            <div className="group relative bg-[#F6EEDD] border border-[#E9DCC5] rounded-[5px] p-5 sm:p-7 lg:p-8 shadow-xs hover:shadow-sm transition-all duration-300">
              <div className="flex items-start gap-3.5 sm:gap-5">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#EDE1CC] border border-[#D9CDB4]/40 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform duration-300">
                  <AboutIcon
                    name="eye"
                    size={28}
                    className="w-6 h-6 sm:w-7 sm:h-7 text-[#183B12]"
                  />
                </div>
                <div className="text-left">
                  <h3 className="font-heading text-xl sm:text-2xl lg:text-[28px] font-bold text-[#263D18] tracking-tight leading-tight mb-1.5 sm:mb-2">
                    Our Vision
                  </h3>
                  {/* p tag: 16px desktop, 13-14px mobile */}
                  <p className="font-sans text-[13px] sm:text-[14px] md:text-[16px] text-[#28321F]/85 leading-relaxed font-normal">
                    To become a trusted global brand in natural skincare, known
                    for purity, transparency, and real results.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* 
        ========================================================================
        4. OUR CORE VALUES
        ========================================================================
      */}
      <section
        className="relative w-full bg-[#FBF7EE] py-6 sm:py-8 md:py-10 overflow-hidden"
        aria-label="Our Core Values"
      >
        {/* Decorative Botanical Leaf Sprig on Right Side */}
        <div
          className="hidden sm:block absolute right-0 top-1/2 -translate-y-1/2 w-28 h-28 sm:w-36 sm:h-36 lg:w-48 lg:h-48 pointer-events-none opacity-85 z-10 translate-x-[20%]"
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
          <div className="flex items-center justify-center gap-3 sm:gap-6 mb-8 sm:mb-10">
            <span
              className="w-8 sm:w-16 md:w-24 h-[1.5px] bg-[#28321F]/20 rounded-full"
              aria-hidden="true"
            />
            <h2 className="font-heading text-2xl sm:text-3xl md:text-[38px] font-bold text-[#263D18] tracking-tight text-center">
              Our Core Values
            </h2>
            <span
              className="w-8 sm:w-16 md:w-24 h-[1.5px] bg-[#28321F]/20 rounded-full"
              aria-hidden="true"
            />
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 pt-8">
            {coreValues.map((value) => (
              <div
                key={value.title}
                className="flex flex-col items-center text-center group"
              >
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#EBF1DE] border border-[#A8B88A]/35 flex items-center justify-center mb-3 sm:mb-4 shadow-2xs group-hover:scale-108 group-hover:bg-[#E2ECCD] transition-all duration-300">
                  <AboutIcon
                    name={value.icon}
                    size={26}
                    className="w-6 h-6 text-[#183B12]"
                  />
                </div>
                <h3 className="font-heading text-lg sm:text-xl lg:text-2xl font-bold text-[#263D18] tracking-tight mb-1">
                  {value.title}
                </h3>
                {/* p tag: 16px desktop, 13-14px mobile */}
                <p className="font-sans text-[13px] sm:text-[14px] md:text-[16px] text-[#777968] font-normal leading-relaxed max-w-[200px]">
                  {value.subtitle}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* 
        ========================================================================
        5. WHY CHOOSE LIYANA NATURALS?
        ========================================================================
      */}
      <section
        className="relative w-full bg-[#FBF7EE] py-6 sm:py-8 md:py-10 overflow-hidden"
        aria-label="Why Choose Liyana Naturals?"
      >
        <Container>
          <div className="relative bg-[#EAF1DF]/95 border-8 border-[#28321F]/10 rounded-[5px] p-5 sm:p-7 lg:p-9 shadow-xs hover:shadow-sm transition-all duration-300 overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 lg:gap-8 items-center">
              {/* Left Block: Heading & Subtitle */}
              <div className="lg:col-span-4 text-left">
                <h2 className="font-heading text-2xl sm:text-3xl lg:text-[36px] font-bold text-[#263D18] tracking-tight leading-[1.18] mb-1.5 sm:mb-2">
                  Why Choose
                  <br className="hidden sm:block" />
                  {" "}Liyana Naturals?
                </h2>
                {/* p tag: 16px desktop, 13-14px mobile */}
                <p className="font-sans text-[13px] sm:text-[14px] md:text-[16px] text-[#777968] font-normal leading-relaxed">
                  Because your skin deserves the goodness of nature.
                </p>
              </div>

              {/* Center Block: 4 Checkmark Bullet Points */}
              <div className="lg:col-span-4 flex flex-col justify-center space-y-2.5 sm:space-y-3">
                {whyChooseFeatures.map((feature) => (
                  <div
                    key={feature}
                    className="flex items-center gap-2.5 sm:gap-3 group"
                  >
                    <div className="w-5 h-5 rounded-full bg-[#263D18] flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-110 transition-transform duration-200">
                      <svg
                        viewBox="0 0 24 24"
                        className="w-3.5 h-3.5"
                        fill="none"
                        stroke="#FFFFFF"
                        strokeWidth={2.8}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="m5 12 5 5L20 7" />
                      </svg>
                    </div>
                    <span className="font-sans text-[13px] sm:text-[14px] md:text-[15px] font-medium text-[#28321F] tracking-tight group-hover:text-[#263D18] transition-colors">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

              {/* Vertical Divider (Desktop Only) */}
              <div className="hidden lg:flex lg:col-span-1 justify-center">
                <div
                  className="w-[1.5px] h-24 bg-[#28321F]/15 mx-auto rounded-full"
                  aria-hidden="true"
                />
              </div>

              {/* Right Block: Fresh Cut Aloe Vera Image */}
              <div className="lg:col-span-3 flex justify-center lg:justify-end w-full">
                <div className="relative w-full max-w-sm sm:max-w-[520px] aspect-[16/10] lg:aspect-[6/4] rounded-[5px] overflow-hidden group">
                  <Image
                    src="/images/aboutuspage/Aloe_vera.png"
                    alt="Fresh cut botanical aloe vera slices with pure water droplets"
                    fill
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover object-center group-hover:scale-106 transition-transform duration-700 ease-out"
                    unoptimized
                  />
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* 
        ========================================================================
        6. OUR IMPACT
        ========================================================================
      */}
      <section
        className="relative w-full bg-[#FBF7EE] py-6 sm:py-8 md:py-10 overflow-hidden"
        aria-label="Our Impact"
      >
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-10 items-center">
            {/* Left Column: Radiant Glow Woman Image */}
            <div className="lg:col-span-5">
              <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] lg:aspect-[16/11] rounded-[5px] overflow-hidden shadow-xs border border-[#28321F]/8 group">
                <Image
                  src="/images/aboutuspage/Radiant_glow.png"
                  alt="Woman touching radiant skin surrounded by botanical green leaves"
                  fill
                  sizes="(min-width: 1024px) 40vw, (min-width: 640px) 90vw, 100vw"
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                  unoptimized
                />
              </div>
            </div>

            {/* Right Column: Heading with Extended Line & 4 Impact Metrics */}
            <div className="lg:col-span-7">
              <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
                <h2 className="font-heading text-2xl sm:text-3xl lg:text-[38px] font-bold text-[#263D18] tracking-tight shrink-0">
                  Our Impact
                </h2>
                <span
                  className="flex-1 h-[1.5px] bg-[#28321F]/20 rounded-full"
                  aria-hidden="true"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-5 lg:gap-6 pt-6">
                {impactStats.map((stat) => (
                  <div
                    key={stat.label}
                    className="flex flex-col items-center text-center group"
                  >
                    <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-[#EBF1DE] border border-[#A8B88A]/35 flex items-center justify-center mb-2 shadow-2xs group-hover:scale-108 group-hover:bg-[#E2ECCD] transition-all duration-300">
                      <AboutIcon
                        name={stat.icon}
                        size={22}
                        className="w-5 h-5 text-[#183B12]"
                      />
                    </div>
                    <span className="font-heading text-xl sm:text-2xl lg:text-[30px] font-bold text-[#263D18] tracking-tight leading-none mb-1">
                      {stat.number}
                    </span>
                    {/* p tag: 16px desktop, 13-14px mobile */}
                    <p className="font-sans text-[13px] sm:text-[14px] md:text-[16px] text-[#777968] font-medium leading-tight">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* 
        ========================================================================
        7. OUR CERTIFICATIONS & COMMITMENTS
        ========================================================================
      */}
      <section
        className="relative w-full bg-[#FBF7EE] py-6 sm:py-8 md:py-10 overflow-hidden"
        aria-label="Our Certifications & Commitments"
      >
        {/* Decorative Left Botanical Leaf Sprig */}
        <div
          className="hidden sm:block absolute left-0 top-1/2 -translate-y-1/2 w-24 h-24 sm:w-32 sm:h-32 lg:w-44 lg:h-44 pointer-events-none opacity-80 z-0 -translate-x-[25%]"
          aria-hidden="true"
        >
          <Image
            src="/images/about/Glossy_Green.png"
            alt="Botanical Leaves Decor Left"
            fill
            className="object-contain object-left -rotate-[45deg] scale-110"
            unoptimized
          />
        </div>

        {/* Decorative Right Botanical Leaf Sprig */}
        <div
          className="hidden sm:block absolute right-0 top-1/2 -translate-y-1/2 w-24 h-24 sm:w-32 sm:h-32 lg:w-44 lg:h-44 pointer-events-none opacity-80 z-0 translate-x-[25%]"
          aria-hidden="true"
        >
          <Image
            src="/images/about/Glossy_Green.png"
            alt="Botanical Leaves Decor Right"
            fill
            className="object-contain object-right rotate-[45deg] scale-110"
            unoptimized
          />
        </div>

        <Container className="relative z-10">
          <div className="flex items-center justify-center gap-3 sm:gap-6 mb-8 sm:mb-16">
            <span
              className="w-8 sm:w-16 md:w-24 h-[1.5px] bg-[#28321F]/20 rounded-full"
              aria-hidden="true"
            />
            <h2 className="font-heading text-xl sm:text-3xl md:text-[36px] font-bold text-[#263D18] tracking-tight text-center">
              Our Certifications &amp; Commitments
            </h2>
            <span
              className="w-8 sm:w-16 md:w-24 h-[1.5px] bg-[#28321F]/20 rounded-full"
              aria-hidden="true"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 sm:gap-6 lg:gap-8 items-start justify-center max-w-4xl mx-auto">
            {certifications.map((item, idx) => (
              <div
                key={item.label}
                className={cn(
                  "flex flex-col items-center text-center group",
                  idx === 4 && "col-span-2 sm:col-span-1"
                )}
              >
                <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-[#EBF1DE] border border-[#A8B88A]/35 flex items-center justify-center mb-2 shadow-2xs group-hover:scale-108 group-hover:bg-[#E2ECCD] transition-all duration-300 shrink-0">
                  <AboutIcon
                    name={item.icon}
                    size={24}
                    className="w-6 sm:h-6 text-[#183B12] shrink-0"
                  />
                </div>
                {/* Label: 16px desktop, 12-13px mobile */}
                <p className="font-sans text-[12px] sm:text-[13px] md:text-[16px] font-semibold text-[#28321F] tracking-tight text-center max-w-[125px] leading-snug group-hover:text-[#263D18] transition-colors">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* 
        ========================================================================
        8. JOIN OUR NATURAL, BEAUTY COMMUNITY CTA BANNER (Compact & Modern, No Product Image)
        ========================================================================
      */}
      <section
        className="relative w-full bg-[#FBF7EE] py-4 sm:py-6 md:py-8 overflow-hidden"
        aria-label="Join Our Beauty Community"
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
              {/* Left / Center Content */}
              <div className="max-w-2xl">
                <span className="inline-block text-[10px] sm:text-xs font-semibold uppercase tracking-[0.2em] text-[#A8B88A] mb-1 sm:mb-1.5">
                  Natural &amp; Conscious Skincare
                </span>
                <h3
                  style={{ color: "#ffffff" }}
                  className="font-heading text-2xl sm:text-3xl lg:text-[36px] font-normal !text-white tracking-tight leading-tight mb-1.5 sm:mb-2"
                >
                  Join Our Natural, Beauty Community
                </h3>
                {/* p tag: 16px desktop, 13-14px mobile */}
                <p className="font-sans text-[13px] sm:text-[14px] md:text-[16px] text-[#FBF7EE]/85 font-light leading-relaxed">
                  Be a part of a growing family that chooses clean, conscious, and effective skincare.
                </p>
              </div>

              {/* Right CTA Button */}
              <div className="shrink-0 pt-1 lg:pt-0">
                <Link
                  href="/shop"
                  className="group inline-flex items-center gap-2 px-6 sm:px-8 py-2.5 sm:py-3 rounded-full bg-[#FBF7EE] hover:bg-white text-[#1D3214] font-medium text-xs sm:text-sm md:text-[15px] shadow-xs hover:shadow-md transition-all duration-300 hover:scale-105 active:scale-95 whitespace-nowrap"
                >
                  <span>Shop Now</span>
                  <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#1D3214] group-hover:translate-x-1 transition-transform duration-300" />
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}
