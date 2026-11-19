"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { blogPosts } from "@/data/blog";

export function BlogSection() {
  return (
    <section
      className="relative w-full bg-[#FAF6EE] py-14 sm:py-16 lg:py-20 lg:mt-[-70px] overflow-hidden select-none"
      aria-label="Latest from Our Blog"
    >
      {/* 
        ========================================================================
        ORGANIC BACKGROUND ACCENT
        Soft undulating botanical shape on left edge matching reference
        ========================================================================
      */}
      <div
        aria-hidden="true"
        className="absolute left-0 top-0 bottom-0 w-[220px] sm:w-[320px] lg:w-[440px] pointer-events-none opacity-40 z-0"
      >
        <svg
          viewBox="0 0 440 600"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full object-cover"
        >
          <path
            d="M0 0C160 60 280 180 250 340C220 480 120 540 0 600V0Z"
            fill="#E2EBD8"
          />
        </svg>
      </div>

      <div className="relative z-10 max-w-[1350px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* 
          ======================================================================
          HEADER SECTION
          Pagination dots + Ornate headline + Subtitle
          ======================================================================
        */}
        <div className="text-center mb-6">
    

          {/* Ornate Headline with Left & Right Finial Lines */}
          <div className="flex items-center justify-center gap-3 sm:gap-6 max-w-2xl mx-auto">
            {/* Left Ornate Line */}
            <div
              className="hidden sm:flex items-center flex-1 origin-right"
              aria-hidden="true"
            >
              <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-[#28321F]/25 to-[#28321F]/40" />
              <div className="w-1.5 h-1.5 rotate-45 bg-[#536B35] shrink-0 -ml-0.5 rounded-[1px]" />
            </div>

            {/* Headline using brand fonts & colors */}
            <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-[44px] text-[#28321F] font-bold tracking-tight whitespace-nowrap">
              Latest from Our Blog
            </h2>

            {/* Right Ornate Line */}
            <div
              className="hidden sm:flex items-center flex-1 origin-left"
              aria-hidden="true"
            >
              <div className="w-1.5 h-1.5 rotate-45 bg-[#536B35] shrink-0 -mr-0.5 rounded-[1px]" />
              <div className="h-[1px] w-full bg-gradient-to-l from-transparent via-[#28321F]/25 to-[#28321F]/40" />
            </div>
          </div>

          {/* Subtitle */}
          <p className="text-sm sm:text-base text-[#777968] font-sans font-normal mt-2 max-w-md mx-auto">
            Tips, Trends &amp; Natural Beauty Care
          </p>
        </div>

        {/* 
          ======================================================================
          BLOG CARDS (Full-width 3-Column Responsive Grid)
          ======================================================================
        */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-7 lg:gap-8">
          {blogPosts.map((post) => (
            <article
              key={post.id}
              className="bg-white rounded-[5px] p-4 sm:p-4.5 border border-[#28321F]/8 shadow-[0_4px_20px_rgba(40,50,31,0.05)] hover:shadow-[0_12px_32px_rgba(40,50,31,0.1)] hover:border-[#536B35]/25 transition-all duration-300 flex flex-col group cursor-pointer"
            >
              {/* Image Container with Floating Date Pill */}
              <div className="relative w-full aspect-[16/8] rounded-[5px] overflow-hidden mb-4 bg-[#F2ECE0]">
                <Image
                  src={post.coverImage}
                  alt={post.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                  unoptimized
                />

                {/* Date Pill Badge (Top Left of Image) */}
                <div className="absolute top-2.5 left-2.5 z-10 bg-white/95 backdrop-blur-xs text-[#28321F] text-xs font-semibold px-3 py-1 rounded-full shadow-xs flex items-center gap-1.5 border border-white/60">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#536B35]" />
                  <span>{post.publishedAt}</span>
                </div>
              </div>

              {/* Card Body */}
              <div className="px-1 flex-1 flex flex-col justify-between">
                {/* Blog Title */}
                <h3 className="font-sans font-bold text-[16.5px] sm:text-[17px] text-[#28321F] group-hover:text-[#536B35] transition-colors line-clamp-2 leading-snug">
                  <Link href={`/blog#${post.slug}`}>{post.title}</Link>
                </h3>

                {/* Read More Link */}
                <div className="mt-3.5 pt-1">
                  <Link
                    href={`/blog#${post.slug}`}
                    className="inline-flex items-center gap-1.5 text-[16px] font-semibold text-[#536B35] group-hover:text-[#263D18] group-hover:translate-x-1 transition-all"
                  >
                    <span>Read More</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* 
          ======================================================================
          VIEW ALL BLOGS BUTTON (Dedicated Bottom Action Row / Section)
          ======================================================================
        */}
        <div className="mt-10 sm:mt-12 flex justify-center">
          <Link
            href="/blog"
            className="inline-flex items-center justify-center gap-2.5 px-8 sm:px-10 py-3.5 sm:py-4 rounded-[5px] bg-[#1D3214] text-white font-sans font-semibold text-[15px] sm:text-base hover:bg-[#263D18] shadow-[0_6px_20px_rgba(29,50,20,0.2)] hover:shadow-[0_10px_28px_rgba(29,50,20,0.3)] hover:scale-105 active:scale-95 transition-all duration-300 group/btn"
            aria-label="View All Blogs"
          >
            <span>View All Blogs</span>
            <ArrowRight className="w-4 h-4 sm:w-4.5 sm:h-4.5 group-hover/btn:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}
