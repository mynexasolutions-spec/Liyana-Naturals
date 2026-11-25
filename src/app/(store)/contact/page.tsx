"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, ChevronDown, CheckCircle2, AlertCircle } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { cn } from "@/lib/utils";

/**
 * High-performance, zero-latency Contact Icon Renderer
 * Utilizes the exact SVGs from public/images/icons/contactsicon/
 */
function ContactIcon({
  name,
  className = "w-5 h-5",
}: {
  name:
    | "headset"
    | "shield-check"
    | "leaf"
    | "phone"
    | "mail"
    | "map-pin"
    | "send"
    | "instagram"
    | "facebook"
    | "youtube"
    | "pinterest";
  className?: string;
}) {
  switch (name) {
    case "headset":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          aria-hidden="true"
        >
          <path d="M3 13v-1a9 9 0 0 1 18 0v1" />
          <path d="M3 13h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-5Zm18 0h-3a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-5Z" />
          <path d="M15 20a4 4 0 0 1-4 2h-1" />
        </svg>
      );
    case "shield-check":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          aria-hidden="true"
        >
          <path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z" />
          <path d="m8.5 12 2.3 2.3 4.8-5" />
        </svg>
      );
    case "leaf":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          aria-hidden="true"
        >
          <path d="M20.8 3.2C12.2 2.7 5.1 5.1 3.6 11.2c-1 4 2 7.2 5.7 7.2 6.4 0 10.8-7.1 11.5-15.2Z" />
          <path d="M3 21c3.2-5.1 7.2-8.3 12.7-11.4" />
        </svg>
      );
    case "phone":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          aria-hidden="true"
        >
          <path d="M22 16.9v3a2 2 0 0 1-2.2 2A19.8 19.8 0 0 1 11.2 19a19.4 19.4 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7l.5 3a2 2 0 0 1-.6 1.8L7.1 10.4a16 16 0 0 0 6.5 6.5l1.9-1.9a2 2 0 0 1 1.8-.6l3 .5a2 2 0 0 1 1.7 2Z" />
        </svg>
      );
    case "mail":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          aria-hidden="true"
        >
          <rect x="2" y="4" width="20" height="16" rx="2" />
          <path d="m22 7-10 7L2 7" />
        </svg>
      );
    case "map-pin":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          aria-hidden="true"
        >
          <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
          <circle cx="12" cy="10" r="2.7" />
        </svg>
      );
    case "send":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          aria-hidden="true"
        >
          <path d="m22 2-7 20-4-9-9-4Z" />
          <path d="M22 2 11 13" />
        </svg>
      );
    case "instagram":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          aria-hidden="true"
        >
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <path d="M17.5 6.5h.01" />
        </svg>
      );
    case "facebook":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className={className}
          aria-hidden="true"
        >
          <path d="M13.4 21v-8h2.7l.4-3.1h-3.1V8c0-.9.3-1.5 1.6-1.5h1.7V3.7c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2H7.2V13H10v8h3.4Z" />
        </svg>
      );
    case "youtube":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className={className}
          aria-hidden="true"
        >
          <path d="M23 7.1a3 3 0 0 0-2.1-2.2C19 4.4 12 4.4 12 4.4s-7 0-8.9.5A3 3 0 0 0 1 7.1 31 31 0 0 0 .5 12a31 31 0 0 0 .5 4.9 3 3 0 0 0 2.1 2.2c1.9.5 8.9.5 8.9.5s7 0 8.9-.5a3 3 0 0 0 2.1-2.2 31 31 0 0 0 .5-4.9 31 31 0 0 0-.5-4.9ZM9.7 15.8V8.2l6.5 3.8-6.5 3.8Z" />
        </svg>
      );
    case "pinterest":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className={className}
          aria-hidden="true"
        >
          <path
            d="M12.1 2C6.6 2 3.7 5.9 3.7 10.2c0 2 .8 4.5 2.6 5.3.2.1.4 0 .5-.2l.4-1.6c.1-.2 0-.4-.1-.6-.5-.6-.9-1.7-.9-2.8 0-3.6 2.7-6.8 7-6.8 3.8 0 5.9 2.3 5.9 5.5 0 4.1-1.8 7.6-4.5 7.6-1.5 0-2.6-1.2-2.2-2.7.4-1.8 1.3-3.8 1.3-5.1 0-1.2-.6-2.2-1.9-2.2-1.5 0-2.7 1.6-2.7 3.7 0 1.3.4 2.2.4 2.2l-1.7 7c-.5 2.1-.1 4.7 0 5 .1.2.3.2.4.1.2-.2 1.9-2.3 2.5-4.3l1-3.8c.5 1 1.9 1.9 3.4 1.9 4.5 0 7.5-4.1 7.5-9.6C22.6 5.9 18.4 2 12.1 2Z"
            transform="translate(0 -1) scale(.98)"
          />
        </svg>
      );
  }
}

// Subject dropdown options
const SUBJECT_OPTIONS = [
  "Select a Subject",
  "Order Inquiry & Tracking",
  "Product Recommendation & Consultation",
  "Shipping & Delivery Questions",
  "Returns, Replacements & Refunds",
  "Wholesale & Retail Collaboration",
  "Feedback & Other Inquiries",
];

export default function ContactPage() {
  // Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "Select a Subject",
    message: "",
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Newsletter State
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterStatus, setNewsletterStatus] = useState<"idle" | "success" | "error">("idle");
  const [newsletterMsg, setNewsletterMsg] = useState("");

  // Handle Contact Form Input Change
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  // Form Validation & Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(false);
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = "Please enter your name";
    }

    if (!formData.email.trim()) {
      errors.email = "Please enter your email";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }

    if (!formData.subject || formData.subject === "Select a Subject") {
      errors.subject = "Please select a subject";
    }

    if (!formData.message.trim()) {
      errors.message = "Please write your message";
    } else if (formData.message.trim().length < 10) {
      errors.message = "Message must be at least 10 characters";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);
    setFormErrors({});

    try {
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Unable to send your message.");

      setIsSubmitting(false);
      setIsSubmitted(true);
      setFormData({
        name: "",
        email: "",
        subject: "Select a Subject",
        message: "",
      });
    } catch (submissionError) {
      setFormErrors({
        form: submissionError instanceof Error ? submissionError.message : "Unable to send your message.",
      });
      setIsSubmitting(false);
    }
  };

  // Handle Newsletter Submission
  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newsletterEmail)) {
      setNewsletterStatus("error");
      setNewsletterMsg("Please enter a valid email address.");
      return;
    }

    setNewsletterStatus("success");
    setNewsletterMsg("Thank you! You have subscribed to our newsletter.");
    setNewsletterEmail("");
  };

  return (
    <main className="min-h-screen bg-[#FBF7EE] text-[#28321F] relative overflow-hidden select-none">
      {/* 
        ========================================================================
        PAGE-LEVEL BOTANICAL DECORATIVE ACCENTS (Matches Reference Design)
        ========================================================================
      */}
      {/* Top Left Organic Blurred Botanical Leaves */}
      <div
        className="hidden md:block absolute -top-8 -left-8 w-44 h-44 lg:w-56 lg:h-56 pointer-events-none opacity-45 z-0 blur-[1px]"
        aria-hidden="true"
      >
        <Image
          src="/images/about/Glossy_Green.png"
          alt=""
          fill
          className="object-contain -rotate-45"
          unoptimized
        />
      </div>

      {/* Center-Left Botanical Sprig beside the Contact Form */}
      <div
        className="hidden lg:block absolute left-0 top-[52%] -translate-y-1/2 w-32 h-32 lg:w-44 lg:h-44 pointer-events-none opacity-80 z-0 -translate-x-[20%]"
        aria-hidden="true"
      >
        <Image
          src="/images/about/Glossy_Green.png"
          alt=""
          fill
          className="object-contain rotate-12 scale-110"
          unoptimized
        />
      </div>

      {/* Bottom-Left Lush Botanical Sprig */}
      <div
        className="hidden sm:block absolute bottom-12 left-0 w-36 h-36 lg:w-48 lg:h-48 pointer-events-none opacity-85 z-0 -translate-x-[25%] translate-y-[20%]"
        aria-hidden="true"
      >
        <Image
          src="/images/about/Glossy_Green.png"
          alt=""
          fill
          className="object-contain rotate-[35deg]"
          unoptimized
        />
      </div>

      {/* Bottom-Right Fresh Cut Aloe Vera Leaf with crystal water droplets */}
      <div
        className="hidden md:block absolute -bottom-10 right-0 w-64 h-64 lg:w-80 lg:h-80 pointer-events-none opacity-90 z-0 translate-x-[15%] translate-y-[10%]"
        aria-hidden="true"
      >
        <Image
          src="/images/aboutuspage/Aloe_vera.png"
          alt=""
          fill
          className="object-contain object-bottom-right"
          unoptimized
        />
      </div>

      {/* 
        ========================================================================
        1. HERO SECTION: PREMIUM BOTANICAL HERO
        - Compact height matching About Us page
        - Desktop: Left text hierarchy + Right full-height uncropped product scene
        - Mobile: Modern compact centered hero with soft atmospheric background
        ========================================================================
      */}
      <section
        className="relative w-full bg-[#FBF7EE] overflow-hidden min-h-[300px] sm:min-h-[340px] md:min-h-[390px] lg:min-h-[440px] md:max-h-[500px] flex items-center justify-center md:justify-start"
        aria-label="Contact Us Hero"
      >
        {/* Mobile Background Image: sleek, modern atmospheric backdrop */}
        <div className="block md:hidden absolute inset-0 z-0 pointer-events-none">
          <Image
            src="/images/contactspage/contacts_hero.png"
            alt="Liyana Naturals Botanical Skincare Podium"
            fill
            priority
            unoptimized
            sizes="100vw"
            className="object-cover object-center opacity-30"
          />
          {/* Atmospheric gradient overlay on mobile for high readability */}
          <div
            className="absolute inset-0 bg-gradient-to-b from-[#FBF7EE]/90 via-[#FBF7EE]/80 to-[#FBF7EE]/95"
            aria-hidden="true"
          />
        </div>

        {/* Desktop / Tablet Background Image: 100% height object-contain, pinned to right */}
        <div className="hidden md:block absolute inset-0 z-0 pointer-events-none">
          <Image
            src="/images/contactspage/contacts_hero.png"
            alt="Liyana Naturals Botanical Skincare Podium"
            fill
            priority
            unoptimized
            sizes="100vw"
            className="object-contain object-right"
          />

          {/* Soft atmospheric gradient wash on the far left for crisp typography contrast */}
          <div
            className="absolute inset-0 bg-gradient-to-r from-[#FBF7EE] via-[#FBF7EE]/60 to-transparent w-[48%]"
            aria-hidden="true"
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
              <span className="text-[#263D18] font-semibold">Contact Us</span>
            </nav>

            {/* Main Heading */}
            <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-[54px] text-[#263D18] font-bold tracking-tight leading-[1.06] mb-2.5 sm:mb-3 text-center md:text-left">
              Contact Us
            </h1>

            {/* Subtitle / Description: 16px desktop, 13-14px mobile */}
            <p className="font-sans text-[13px] sm:text-[14px] md:text-[16px] text-[#555C4A] leading-relaxed max-w-md mb-5 sm:mb-6 md:mb-7 font-normal text-center md:text-left mx-auto md:mx-0">
              We&apos;d love to hear from you! Whether you have a question, need
              support, or want to share feedback, our team is here to help.
            </p>

            {/* 3 Service Highlights with subtle vertical dividers */}
            <div className="w-full max-w-md flex flex-wrap sm:flex-nowrap items-center justify-center md:justify-start gap-3 sm:gap-4 lg:gap-6 pt-1 sm:pt-2">
              {/* Highlight 1: Quick Response */}
              <div className="flex flex-col items-center md:items-start text-center md:text-left group min-w-[95px]">
                <div className="w-7 h-7 sm:w-8 sm:h-8 mb-1.5 flex items-center justify-center text-[#263D18] group-hover:scale-110 transition-transform">
                  <ContactIcon name="headset" className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <span className="font-sans text-[11px] sm:text-xs md:text-[13px] font-bold text-[#263D18] leading-tight block">
                  Quick Response
                </span>
                <span className="font-sans text-[10px] sm:text-[11px] text-[#777968] block mt-0.5">
                  (Within 24 Hours)
                </span>
              </div>

              {/* Vertical Divider */}
              <div
                className="hidden sm:block w-[1px] h-9 bg-[#28321F]/15 shrink-0 self-center"
                aria-hidden="true"
              />

              {/* Highlight 2: Customer Support */}
              <div className="flex flex-col items-center md:items-start text-center md:text-left group min-w-[95px]">
                <div className="w-7 h-7 sm:w-8 sm:h-8 mb-1.5 flex items-center justify-center text-[#263D18] group-hover:scale-110 transition-transform">
                  <ContactIcon name="shield-check" className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <span className="font-sans text-[11px] sm:text-xs md:text-[13px] font-bold text-[#263D18] leading-tight block">
                  Customer
                </span>
                <span className="font-sans text-[10px] sm:text-[11px] text-[#777968] block mt-0.5">
                  Support
                </span>
              </div>

              {/* Vertical Divider */}
              <div
                className="hidden sm:block w-[1px] h-9 bg-[#28321F]/15 shrink-0 self-center"
                aria-hidden="true"
              />

              {/* Highlight 3: Help with Orders */}
              <div className="flex flex-col items-center md:items-start text-center md:text-left group min-w-[95px]">
                <div className="w-7 h-7 sm:w-8 sm:h-8 mb-1.5 flex items-center justify-center text-[#263D18] group-hover:scale-110 transition-transform">
                  <ContactIcon name="leaf" className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <span className="font-sans text-[11px] sm:text-xs md:text-[13px] font-bold text-[#263D18] leading-tight block">
                  Help with
                </span>
                <span className="font-sans text-[10px] sm:text-[11px] text-[#777968] block mt-0.5">
                  Orders &amp; Products
                </span>
              </div>
            </div>
          </div>
        </section>
      </section>

      {/* 
        ========================================================================
        2. MAIN CONTACT SECTION: 2 COLUMNS
        Left: "Get in Touch" Form Card (soft sage green)
        Right: "Other Ways to Reach Us" & "Follow Us"
        ========================================================================
      */}
      <section
        className="relative w-full bg-[#FBF7EE] py-8 sm:py-10 md:py-14 overflow-hidden"
        aria-label="Contact Information and Form"
      >
        <Container className="relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 lg:gap-12 items-start">
            {/* 
              ------------------------------------------------------------------
              LEFT COLUMN: "Get in Touch" Form Card
              ------------------------------------------------------------------
            */}
            <div className="lg:col-span-7">
              <div className="relative bg-[#EAF1DF] border border-[#A8B88A]/40 rounded-[5px] p-6 sm:p-8 lg:p-10 shadow-xs hover:shadow-sm transition-all duration-300 overflow-hidden">
                {/* Botanical Leaves Decor in Top-Right Corner */}
                <div
                  className="absolute right-0 top-0 w-28 h-28 sm:w-36 sm:h-36 pointer-events-none opacity-85 translate-x-4 -translate-y-4"
                  aria-hidden="true"
                >
                  <Image
                    src="/images/about/Glossy_Green.png"
                    alt=""
                    fill
                    className="object-contain object-right-top"
                    unoptimized
                  />
                </div>

                <div className="relative z-10">
                  <h2 className="font-heading text-2xl sm:text-3xl lg:text-[34px] font-bold text-[#263D18] tracking-tight leading-tight mb-1.5">
                    Get in Touch
                  </h2>
                  <p className="font-sans text-[13px] sm:text-[14px] md:text-[15px] text-[#555C4A] leading-relaxed mb-6 sm:mb-8">
                    Fill out the form below and we&apos;ll get back to you as
                    soon as possible.
                  </p>

                  {/* Submission Success Alert */}
                  {isSubmitted && (
                    <div
                      role="alert"
                      className="mb-6 p-4 rounded-2xl bg-white border border-[#536B35]/40 text-[#263D18] flex items-start gap-3 shadow-2xs"
                    >
                      <CheckCircle2 className="w-5 h-5 text-[#536B35] shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-sm">
                          Message sent successfully!
                        </h4>
                        <p className="text-xs text-[#555C4A] mt-0.5">
                          Thank you for reaching out to Liyana Naturals. Our
                          skincare team will review your message and reply
                          within 24 hours.
                        </p>
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} noValidate className="space-y-4 sm:space-y-5">
                    {formErrors.form && (
                      <div role="alert" className="rounded-xl border border-[#DC2626]/25 bg-red-50 px-4 py-3 text-sm text-[#B91C1C]">
                        {formErrors.form}
                      </div>
                    )}
                    {/* Row 1: Name & Email */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Your Name */}
                      <div>
                        <label
                          htmlFor="name"
                          className="block text-xs sm:text-[13px] font-medium text-[#28321F] mb-1.5"
                        >
                          Your Name <span className="text-[#C2652B]">*</span>
                        </label>
                        <input
                          id="name"
                          name="name"
                          type="text"
                          value={formData.name}
                          onChange={handleChange}
                          maxLength={120}
                          placeholder=""
                          className={cn(
                            "w-full px-4 py-2.5 sm:py-3 rounded-xl bg-white text-[#28321F] text-sm font-normal border transition-all duration-200 focus:outline-none shadow-2xs",
                            formErrors.name
                              ? "border-[#DC2626] focus:ring-2 focus:ring-[#DC2626]/20"
                              : "border-[#28321F]/15 hover:border-[#536B35]/50 focus:border-[#536B35] focus:ring-2 focus:ring-[#536B35]/20"
                          )}
                        />
                        {formErrors.name && (
                          <p className="mt-1 text-xs text-[#DC2626] flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5" />
                            <span>{formErrors.name}</span>
                          </p>
                        )}
                      </div>

                      {/* Email Address */}
                      <div>
                        <label
                          htmlFor="email"
                          className="block text-xs sm:text-[13px] font-medium text-[#28321F] mb-1.5"
                        >
                          Email Address <span className="text-[#C2652B]">*</span>
                        </label>
                        <input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          maxLength={254}
                          placeholder=""
                          className={cn(
                            "w-full px-4 py-2.5 sm:py-3 rounded-xl bg-white text-[#28321F] text-sm font-normal border transition-all duration-200 focus:outline-none shadow-2xs",
                            formErrors.email
                              ? "border-[#DC2626] focus:ring-2 focus:ring-[#DC2626]/20"
                              : "border-[#28321F]/15 hover:border-[#536B35]/50 focus:border-[#536B35] focus:ring-2 focus:ring-[#536B35]/20"
                          )}
                        />
                        {formErrors.email && (
                          <p className="mt-1 text-xs text-[#DC2626] flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5" />
                            <span>{formErrors.email}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Row 2: Subject */}
                    <div>
                      <label
                        htmlFor="subject"
                        className="block text-xs sm:text-[13px] font-medium text-[#28321F] mb-1.5"
                      >
                        Subject <span className="text-[#C2652B]">*</span>
                      </label>
                      <div className="relative">
                        <select
                          id="subject"
                          name="subject"
                          value={formData.subject}
                          onChange={handleChange}
                          className={cn(
                            "w-full px-4 py-2.5 sm:py-3 rounded-xl bg-white text-sm font-normal border appearance-none transition-all duration-200 focus:outline-none pr-10 shadow-2xs cursor-pointer",
                            formData.subject === "Select a Subject"
                              ? "text-[#777968]"
                              : "text-[#28321F]",
                            formErrors.subject
                              ? "border-[#DC2626] focus:ring-2 focus:ring-[#DC2626]/20"
                              : "border-[#28321F]/15 hover:border-[#536B35]/50 focus:border-[#536B35] focus:ring-2 focus:ring-[#536B35]/20"
                          )}
                        >
                          {SUBJECT_OPTIONS.map((opt, i) => (
                            <option
                              key={opt}
                              value={opt}
                              disabled={i === 0}
                              className={i === 0 ? "text-[#777968]" : "text-[#28321F]"}
                            >
                              {opt}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="w-4 h-4 text-[#28321F]/70 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                      {formErrors.subject && (
                        <p className="mt-1 text-xs text-[#DC2626] flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>{formErrors.subject}</span>
                        </p>
                      )}
                    </div>

                    {/* Row 3: Your Message */}
                    <div>
                      <label
                        htmlFor="message"
                        className="block text-xs sm:text-[13px] font-medium text-[#28321F] mb-1.5"
                      >
                        Your Message <span className="text-[#C2652B]">*</span>
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        rows={4}
                        value={formData.message}
                        onChange={handleChange}
                        maxLength={5000}
                        placeholder="Type your message here..."
                        className={cn(
                          "w-full px-4 py-2.5 sm:py-3 rounded-xl bg-white text-[#28321F] text-sm font-normal border transition-all duration-200 focus:outline-none shadow-2xs resize-y min-h-[110px]",
                          formErrors.message
                            ? "border-[#DC2626] focus:ring-2 focus:ring-[#DC2626]/20"
                            : "border-[#28321F]/15 hover:border-[#536B35]/50 focus:border-[#536B35] focus:ring-2 focus:ring-[#536B35]/20"
                        )}
                      />
                      {formErrors.message && (
                        <p className="mt-1 text-xs text-[#DC2626] flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>{formErrors.message}</span>
                        </p>
                      )}
                    </div>

                    {/* Submit Button */}
                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="group inline-flex items-center gap-2.5 px-7 sm:px-8 py-3 sm:py-3.5 rounded-[5px] bg-[#263D18] hover:bg-[#1D3214] text-[#FBF7EE] text-xs sm:text-sm md:text-[15px] font-medium shadow-xs hover:shadow-md transition-all duration-300 hover:scale-[1.02] active:scale-95 disabled:opacity-75 cursor-pointer"
                      >
                        <ContactIcon
                          name="send"
                          className="w-4 h-4 text-[#FBF7EE] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300"
                        />
                        <span>{isSubmitting ? "Sending..." : "Send Message"}</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>

            {/* 
              ------------------------------------------------------------------
              RIGHT COLUMN: "Other Ways to Reach Us" & "Follow Us"
              ------------------------------------------------------------------
            */}
            <div className="lg:col-span-5 flex flex-col justify-between h-full space-y-8 sm:space-y-10 lg:pl-3">
              {/* Other Ways to Reach Us */}
              <div>
                <h2 className="font-heading text-2xl sm:text-3xl lg:text-[32px] font-bold text-[#263D18] tracking-tight leading-tight mb-5 sm:mb-6">
                  Other Ways to Reach Us
                </h2>

                <div className="space-y-6 sm:space-y-8 mt-12">
                  {/* Item 1: Call Us */}
                  <div className="flex items-center gap-6 group">
                    <div className="w-12 h-12 sm:w-13 sm:h-13 rounded-[5px] bg-[#EAF1DF] border border-[#A8B88A]/35 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 group-hover:bg-[#E2ECCD] transition-all duration-300">
                      <ContactIcon
                        name="phone"
                        className="w-5 h-5 text-[#263D18]"
                      />
                    </div>
                    <div>
                      <h3 className="font-heading text-base sm:text-lg font-bold text-[#263D18] leading-tight mb-1">
                        Call Us
                      </h3>
                      <a
                        href="tel:+919106972400"
                        className="font-sans text-sm sm:text-[15px] font-semibold text-[#28321F] hover:text-[#536B35] transition-colors block"
                      >
                        +91 91069 72400
                      </a>
                      <span className="font-sans text-xs sm:text-[13px] text-[#777968] block mt-0.5">
                        Mon – Sat, 10:00 AM – 7:00 PM
                      </span>
                    </div>
                  </div>

                  {/* Item 2: Email Us */}
                  <div className="flex items-center gap-6 group">
                    <div className="w-12 h-12 sm:w-13 sm:h-13 rounded-[5px] bg-[#EAF1DF] border border-[#A8B88A]/35 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 group-hover:bg-[#E2ECCD] transition-all duration-300">
                      <ContactIcon
                        name="mail"
                        className="w-5 h-5 text-[#263D18]"
                      />
                    </div>
                    <div>
                      <h3 className="font-heading text-base sm:text-lg font-bold text-[#263D18] leading-tight mb-1">
                        Email Us
                      </h3>
                      <a
                        href="mailto:info@liyananaturals.com"
                        className="font-sans text-sm sm:text-[15px] font-semibold text-[#28321F] hover:text-[#536B35] transition-colors block"
                      >
                        info@liyananaturals.com
                      </a>
                      <span className="font-sans text-xs sm:text-[13px] text-[#777968] block mt-0.5">
                        We usually reply within 24 hours
                      </span>
                    </div>
                  </div>

                  {/* Item 3: Our Office */}
                  <div className="flex items-center gap-6 group">
                    <div className="w-12 h-12 sm:w-13 sm:h-13 rounded-[5px] bg-[#EAF1DF] border border-[#A8B88A]/35 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 group-hover:bg-[#E2ECCD] transition-all duration-300">
                      <ContactIcon
                        name="map-pin"
                        className="w-5 h-5 text-[#263D18]"
                      />
                    </div>
                    <div>
                      <h3 className="font-heading text-base sm:text-lg font-bold text-[#263D18] leading-tight mb-1">
                        Our Office
                      </h3>
                      <address className="not-italic font-sans text-sm sm:text-[15px] font-semibold text-[#28321F] block">
                        India
                      </address>
                      <span className="font-sans text-xs sm:text-[13px] text-[#777968] block mt-0.5">
                        Headquarters &amp; Operations
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Follow Us Social Links */}
              <div className="pt-2 sm:pt-4">
                <h3 className="font-heading text-xl sm:text-2xl font-bold text-[#263D18] tracking-tight leading-tight mb-3.5">
                  Follow Us
                </h3>
                <div className="flex items-center gap-3">
                  {/* Instagram */}
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Follow Liyana Naturals on Instagram"
                    className="w-11 h-11 sm:w-12 sm:h-12 rounded-full border border-[#28321F]/20 flex items-center justify-center text-[#28321F] hover:bg-[#263D18] hover:text-white hover:border-[#263D18] transition-all duration-300 shadow-2xs hover:scale-105 active:scale-95"
                  >
                    <ContactIcon name="instagram" className="w-5 h-5" />
                  </a>

                  {/* Facebook */}
                  <a
                    href="https://facebook.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Follow Liyana Naturals on Facebook"
                    className="w-11 h-11 sm:w-12 sm:h-12 rounded-full border border-[#28321F]/20 flex items-center justify-center text-[#28321F] hover:bg-[#263D18] hover:text-white hover:border-[#263D18] transition-all duration-300 shadow-2xs hover:scale-105 active:scale-95"
                  >
                    <ContactIcon name="facebook" className="w-5 h-5" />
                  </a>

                  {/* YouTube */}
                  <a
                    href="https://youtube.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Follow Liyana Naturals on YouTube"
                    className="w-11 h-11 sm:w-12 sm:h-12 rounded-full border border-[#28321F]/20 flex items-center justify-center text-[#28321F] hover:bg-[#263D18] hover:text-white hover:border-[#263D18] transition-all duration-300 shadow-2xs hover:scale-105 active:scale-95"
                  >
                    <ContactIcon name="youtube" className="w-5 h-5" />
                  </a>

                  {/* Pinterest */}
                  <a
                    href="https://pinterest.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Follow Liyana Naturals on Pinterest"
                    className="w-11 h-11 sm:w-12 sm:h-12 rounded-full border border-[#28321F]/20 flex items-center justify-center text-[#28321F] hover:bg-[#263D18] hover:text-white hover:border-[#263D18] transition-all duration-300 shadow-2xs hover:scale-105 active:scale-95"
                  >
                    <ContactIcon name="pinterest" className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* 
        ========================================================================
        3. STAY CONNECTED BANNER (Full Width Dark Green Card)
        ========================================================================
      */}
      <section
        className="relative w-full bg-[#FBF7EE] pb-10 sm:pb-14 md:pb-16 overflow-hidden"
        aria-label="Stay Connected Newsletter"
      >
        <Container className="relative z-10">
          <div className="relative bg-[#1D3214] rounded-[5px] px-6 py-8 sm:px-10 sm:py-10 lg:px-12 lg:py-12 shadow-elevated overflow-hidden">
            {/* Subtle botanical glow & background leaf texture */}
            <div
              className="absolute inset-0 pointer-events-none overflow-hidden"
              aria-hidden="true"
            >
              <div className="absolute top-0 right-0 w-80 h-80 bg-[#536B35]/20 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-10 left-10 w-44 h-44 opacity-15 pointer-events-none">
                <Image
                  src="/images/about/Glossy_Green.png"
                  alt=""
                  fill
                  className="object-contain -rotate-45"
                  unoptimized
                />
              </div>
            </div>

            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6 sm:gap-8 lg:gap-10">
              {/* Left Content with Mail Icon Badge */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 sm:gap-5 max-w-xl">
                <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-[5px] bg-white/10 border border-white/15 flex items-center justify-center text-[#FBF7EE] shrink-0 shadow-2xs">
                  <ContactIcon name="mail" className="w-6 h-6 sm:w-7 sm:h-7 text-[#FBF7EE]" />
                </div>
                <div>
                  <h2
                    style={{ color: "#ffffff" }}
                    className="font-heading text-2xl sm:text-3xl lg:text-[34px] font-normal !text-white tracking-tight leading-tight mb-1 sm:mb-1.5"
                  >
                    Stay Connected
                  </h2>
                  <p className="font-sans text-[13px] sm:text-[14px] md:text-[16px] text-[#FBF7EE]/80 font-light leading-relaxed">
                    Get updates on new products, offers and skincare tips.
                  </p>
                </div>
              </div>

              {/* Right Input Form */}
              <div className="w-full lg:w-auto lg:min-w-[420px]">
                <form
                  onSubmit={handleNewsletterSubmit}
                  noValidate
                  className="relative flex flex-col sm:flex-row items-center gap-2 sm:gap-0 bg-white rounded-[5px] p-1.5 shadow-md w-full"
                >
                  <input
                    type="email"
                    value={newsletterEmail}
                    onChange={(e) => {
                      setNewsletterEmail(e.target.value);
                      if (newsletterStatus !== "idle") setNewsletterStatus("idle");
                    }}
                    placeholder="Enter your email address"
                    className="w-full px-4 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm text-[#28321F] placeholder:text-[#777968]/80 bg-transparent focus:outline-none rounded-full"
                  />
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 rounded-[5px] bg-[#65853B] hover:bg-[#526F2D] text-[#FBF7EE] text-xs sm:text-sm font-semibold tracking-wide transition-all duration-300 hover:scale-[1.02] active:scale-95 shrink-0 shadow-xs cursor-pointer"
                  >
                    Subscribe
                  </button>
                </form>

                {newsletterStatus === "error" && (
                  <p className="mt-2 text-xs text-[#FFC107] text-center sm:text-left flex items-center gap-1 justify-center sm:justify-start">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{newsletterMsg}</span>
                  </p>
                )}

                {newsletterStatus === "success" && (
                  <p className="mt-2 text-xs text-[#A8B88A] text-center sm:text-left flex items-center gap-1 justify-center sm:justify-start">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{newsletterMsg}</span>
                  </p>
                )}
              </div>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}
