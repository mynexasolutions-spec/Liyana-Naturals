"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Phone, Mail, MapPin, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { siteConfig } from "@/config/site";
import type { StorefrontSettings } from "@/lib/supabase/storefront";

export function Footer({ settings }: { settings?: StorefrontSettings | null }) {
  const globalSocial = settings?.global.social;
  const social = globalSocial && typeof globalSocial === "object" ? globalSocial as Record<string, unknown> : {};
  const facebook = typeof social.facebook === "string" ? social.facebook : siteConfig.social.facebook;
  const instagram = typeof social.instagram === "string" ? social.instagram : siteConfig.social.instagram;
  const pinterest = typeof social.pinterest === "string" ? social.pinterest : siteConfig.social.pinterest;
  const phone = settings?.support_phone ?? siteConfig.contact.phone;
  const email = settings?.support_email ?? siteConfig.contact.email;
  const address = settings?.address ?? siteConfig.contact.address;

  return (
    <footer
      className="relative w-full bg-[#1D3214] text-[#FBF7EE] pt-14 sm:pt-16 lg:pt-20 pb-24 lg:pb-10 overflow-hidden select-none"
      aria-label="Footer"
    >
      {/* 
        ========================================================================
        BOTANICAL LEAVES OVERLAYS (Left & Right - Matching Corner Style)
        Symmetrical subtle corner sprigs matching reference design
        ========================================================================
      */}
      {/* Bottom Left Leaf Sprig */}
      <div
        aria-hidden="true"
        className="absolute -left-6 sm:-left-8 lg:-left-10 -bottom-6 sm:-bottom-8 lg:-bottom-10 w-28 sm:w-36 lg:w-44 h-28 sm:h-36 lg:h-44 pointer-events-none z-0 opacity-80"
      >
        <Image
          src="/images/about/Glossy_Green.png"
          alt="Botanical Leaf Bottom Left"
          fill
          className="object-contain rotate-[65deg]"
          unoptimized
        />
      </div>

      {/* Bottom Right Leaf Sprig (Matching Left Leaf Style) */}
      <div
        aria-hidden="true"
        className="absolute -right-6 sm:-right-8 lg:-right-10 -bottom-6 sm:-bottom-8 lg:-bottom-10 w-28 sm:w-36 lg:w-44 h-28 sm:h-36 lg:h-44 pointer-events-none z-0 opacity-80"
      >
        <Image
          src="/images/about/Glossy_Green.png"
          alt="Botanical Leaf Bottom Right"
          fill
          className="object-contain -scale-x-100 rotate-[65deg]"
          unoptimized
        />
      </div>

      {/* Main Footer Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 
          ======================================================================
          TOP COLUMNS SECTION
          Brand Info (Left) + Unified 3-Links Div (Center) + Secure Payments (Right)
          ======================================================================
        */}
        <div className="flex flex-col lg:flex-row items-start justify-between gap-8 lg:gap-10 xl:gap-14 pb-10 sm:pb-12">
          {/* 
            Column 1: Header's Logo + Tagline + Social Icons
          */}
          <div className="w-full lg:w-[260px] xl:w-[280px] shrink-0 space-y-4">
            {/* Exact Logo from Header */}
            <div className="inline-block bg-white rounded-[5px] px-[20px] py-[10px]">
              <Logo size="md" />
            </div>

            <p className="font-sans text-[14px] sm:text-[15px] md:text-[16px] text-[#FBF7EE]/90 leading-relaxed max-w-xs">
              Nature&apos;s Care, Always With You.
            </p>

            {/* Social Media Circular Buttons with Modern Luxury Styling & Official Brand Colors */}
            <div className="flex items-center gap-3 pt-2">
              {/* Facebook */}
              <a
                href={facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow us on Facebook"
                className="group/fb relative w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white flex items-center justify-center shadow-[0_4px_14px_rgba(0,0,0,0.14)] border border-white/80 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_8px_22px_rgba(24,119,242,0.42)] hover:border-[#1877F2]/40 active:scale-95"
              >
                <svg
                  className="w-5 h-5 fill-[#1877F2] transition-transform duration-300 group-hover/fb:scale-110"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>

              {/* Instagram */}
              <a
                href={instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow us on Instagram"
                className="group/insta relative w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white flex items-center justify-center shadow-[0_4px_14px_rgba(0,0,0,0.14)] border border-white/80 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_8px_22px_rgba(225,48,108,0.42)] hover:border-[#E1306C]/40 active:scale-95"
              >
                <svg
                  className="w-5 h-5 transition-transform duration-300 group-hover/insta:scale-110"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <radialGradient id="instaModernGrad" cx="30%" cy="107%" r="150%">
                    <stop offset="0%" stopColor="#fdf497" />
                    <stop offset="10%" stopColor="#fdf497" />
                    <stop offset="45%" stopColor="#fd5949" />
                    <stop offset="60%" stopColor="#d6249f" />
                    <stop offset="90%" stopColor="#285AEB" />
                  </radialGradient>
                  <rect
                    x="2.5"
                    y="2.5"
                    width="19"
                    height="19"
                    rx="5.5"
                    ry="5.5"
                    fill="none"
                    stroke="url(#instaModernGrad)"
                    strokeWidth="2.2"
                  />
                  <circle
                    cx="12"
                    cy="12"
                    r="4.2"
                    fill="none"
                    stroke="url(#instaModernGrad)"
                    strokeWidth="2.2"
                  />
                  <circle cx="17.2" cy="6.8" r="1.3" fill="url(#instaModernGrad)" />
                </svg>
              </a>

              {/* YouTube */}
              <a
                href="https://youtube.com/@liyananaturals"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Subscribe to our YouTube"
                className="group/yt relative w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white flex items-center justify-center shadow-[0_4px_14px_rgba(0,0,0,0.14)] border border-white/80 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_8px_22px_rgba(255,0,0,0.42)] hover:border-[#FF0000]/40 active:scale-95"
              >
                <svg
                  className="w-5 h-5 fill-[#FF0000] transition-transform duration-300 group-hover/yt:scale-110"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>

              {/* Pinterest */}
              <a
                href={pinterest}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow us on Pinterest"
                className="group/pin relative w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white flex items-center justify-center shadow-[0_4px_14px_rgba(0,0,0,0.14)] border border-white/80 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_8px_22px_rgba(230,0,35,0.42)] hover:border-[#E60023]/40 active:scale-95"
              >
                <svg
                  className="w-5 h-5 fill-[#E60023] transition-transform duration-300 group-hover/pin:scale-110"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M12 0a12 12 0 0 0-4.37 23.18c-.03-.97 0-2.14.23-3.13l1.45-6.14s-.36-.72-.36-1.78c0-1.67.97-2.92 2.17-2.92 1.02 0 1.52.77 1.52 1.69 0 1.03-.66 2.57-1 4-.28 1.2.6 2.18 1.78 2.18 2.14 0 3.79-2.26 3.79-5.52 0-2.89-2.07-4.9-5.04-4.9a5.24 5.24 0 0 0-5.46 5.27c0 1.03.4 2.14.9 2.75.1.12.11.23.08.35l-.33 1.37c-.05.23-.18.28-.41.17-1.53-.71-2.49-2.95-2.49-4.75 0-3.87 2.81-7.42 8.11-7.42 4.26 0 7.57 3.03 7.57 7.09 0 4.23-2.67 7.64-6.37 7.64-1.24 0-2.41-.65-2.81-1.42l-.77 2.92c-.28 1.07-1.03 2.41-1.54 3.23A12 12 0 1 0 12 0z" />
                </svg>
              </a>
            </div>
          </div>

          {/* 
            Unified Middle Div: Quick Links + Customer Care + Contact Us
            Grouped into ONE cohesive responsive unit
          */}
          <div className="w-full lg:flex-1 grid grid-cols-2 md:grid-cols-3 gap-x-5 gap-y-7 sm:gap-6 lg:gap-8 xl:gap-12">
            {/* Quick Links */}
            <div>
              <h4 className="font-sans font-bold text-[16px] sm:text-[17px] text-white tracking-tight mb-4">
                Quick Links
              </h4>
              <ul className="space-y-2.5 font-sans text-[14px] text-[#E5EBD8]">
                <li>
                  <Link
                    href="/"
                    className="hover:text-white transition-colors duration-150 inline-block"
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    href="/shop"
                    className="hover:text-white transition-colors duration-150 inline-block"
                  >
                    Shop
                  </Link>
                </li>
                <li>
                  <Link
                    href="/about"
                    className="hover:text-white transition-colors duration-150 inline-block"
                  >
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    href="/blog"
                    className="hover:text-white transition-colors duration-150 inline-block"
                  >
                    Blog
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="hover:text-white transition-colors duration-150 inline-block"
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            {/* Customer Care */}
            <div>
              <h4 className="font-sans font-bold text-[16px] sm:text-[17px] text-white tracking-tight mb-4">
                Customer Care
              </h4>
              <ul className="space-y-2.5 font-sans text-[14px] text-[#E5EBD8]">
                <li>
                  <Link
                    href="/contact#faq"
                    className="hover:text-white transition-colors duration-150 inline-block"
                  >
                    FAQs
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact#shipping"
                    className="hover:text-white transition-colors duration-150 inline-block"
                  >
                    Shipping Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact#returns"
                    className="hover:text-white transition-colors duration-150 inline-block"
                  >
                    Return Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy"
                    className="hover:text-white transition-colors duration-150 inline-block"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms"
                    className="hover:text-white transition-colors duration-150 inline-block"
                  >
                    Terms &amp; Conditions
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact Us */}
            <div className="col-span-2 md:col-span-1">
              <h4 className="font-sans font-bold text-[16px] sm:text-[17px] text-white tracking-tight mb-4">
                Contact Us
              </h4>
              <ul className="space-y-3 font-sans text-[14px] text-[#E5EBD8]">
                <li>
                  <a
                    href={`tel:${phone.replace(/\s+/g, "")}`}
                    className="flex items-center gap-2.5 hover:text-white transition-colors duration-150 group"
                  >
                    <Phone className="w-4 h-4 text-[#A8B88A] shrink-0 group-hover:text-white transition-colors rotate-[-10deg]" />
                    <span>{phone}</span>
                  </a>
                </li>
                <li>
                  <a
                    href={`mailto:${email}`}
                    className="flex items-center gap-2.5 hover:text-white transition-colors duration-150 group"
                  >
                    <Mail className="w-4 h-4 text-[#A8B88A] shrink-0 group-hover:text-white transition-colors" />
                    <span className="truncate">{email}</span>
                  </a>
                </li>
                <li className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-[#A8B88A] shrink-0 mt-0.5" />
                  <span>{address}</span>
                </li>
              </ul>
            </div>
          </div>

          {/* 
            Column 3 (Right): Secure Payments
          */}
          <div className="w-full lg:w-[240px] xl:w-[260px] shrink-0 space-y-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#A8B88A]" />
              <h4 className="font-sans font-bold text-[16px] sm:text-[17px] text-white tracking-tight">
                Secure Payments
              </h4>
            </div>

            <p className="text-[13px] sm:text-[14px] md:text-[16px] text-[#E5EBD8]/75 font-sans leading-normal">
              100% Encrypted &amp; Safe Checkout
            </p>

            {/* Transparent background container with responsive large payment badges */}
            <div className="relative w-full max-w-[240px] sm:max-w-[260px] aspect-[3/1] transition-transform duration-300 hover:scale-105">
              <Image
                src="/images/upipayments.png"
                alt="Secure Payments - Visa, Mastercard, UPI"
                fill
                sizes="(max-width: 640px) 240px, 260px"
                className="object-contain object-left"
                unoptimized
              />
            </div>
          </div>
        </div>

        {/* 
          ======================================================================
          BOTTOM DIVIDER & COPYRIGHT BAR
          ======================================================================
        */}
        <div className="border-t border-white/15 pt-6 sm:pt-8 flex flex-col sm:flex-row items-center justify-between text-[13px] sm:text-[13.5px] text-[#FBF7EE]/80 gap-3 font-sans">
          <p>© 2024 Liyana Naturals. All rights reserved.</p>
          <p className="flex items-center gap-1.5">
            <span>Made with</span>
            <span className="text-red-500 inline-block animate-pulse">❤️</span>
            <span>for a naturally beautiful you</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
