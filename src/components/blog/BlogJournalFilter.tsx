"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Clock, Search, Sparkles, User, X } from "lucide-react";
import { BlogPost } from "@/types";
import { BlogCard } from "./BlogCard";
import { Container } from "@/components/ui/Container";
import { cn } from "@/lib/utils";

interface BlogJournalFilterProps {
  posts: BlogPost[];
}

export function BlogJournalFilter({ posts }: BlogJournalFilterProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const categories = useMemo(() => {
    const unique = Array.from(new Set(posts.map((post) => post.category)));
    return ["All", ...unique];
  }, [posts]);

  const featuredPost = useMemo(
    () => posts.find((post) => post.featured) ?? posts[0],
    [posts]
  );

  const filteredPosts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return posts.filter((post) => {
      const matchesCategory =
        selectedCategory === "All" || post.category === selectedCategory;
      if (!matchesCategory) return false;
      if (!query) return true;

      return (
        post.title.toLowerCase().includes(query) ||
        post.excerpt.toLowerCase().includes(query) ||
        post.category.toLowerCase().includes(query) ||
        post.author.name.toLowerCase().includes(query) ||
        (post.tags ?? []).some((tag) => tag.toLowerCase().includes(query))
      );
    });
  }, [posts, selectedCategory, searchQuery]);

  const handleReset = () => {
    setSelectedCategory("All");
    setSearchQuery("");
  };

  return (
    <>
      {/* 
        ========================================================================
        2. FEATURED JOURNAL STORY (Mobile-First Compact Sage Card)
        ========================================================================
      */}
      {featuredPost && (
        <section
          className="relative w-full bg-[#FBF7EE] py-4 sm:py-6 md:py-8 overflow-hidden"
          aria-label="Featured Article"
        >
          <Container>
            <div className="relative bg-[#EAF1DF]/95 border border-[#A8B88A]/45 rounded-[5px] p-4 sm:p-6 lg:p-8 shadow-xs hover:shadow-sm transition-all duration-300 overflow-hidden">
              {/* Subtle Botanical Sprig Corner */}
              <div
                className="hidden sm:block absolute -right-4 -top-4 w-24 h-24 lg:w-32 lg:h-32 pointer-events-none opacity-80"
                aria-hidden="true"
              >
                <Image
                  src="/images/about/Glossy_Green.png"
                  alt=""
                  fill
                  className="object-contain object-right-top rotate-12"
                  unoptimized
                />
              </div>

              <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 lg:gap-8 items-center">
                {/* Left Image */}
                <div className="lg:col-span-6">
                  <Link
                    href={`/blog/${featuredPost.slug}`}
                    className="block relative w-full aspect-[16/10] rounded-[5px] overflow-hidden shadow-xs border border-[#28321F]/10 group"
                  >
                    <Image
                      src={featuredPost.coverImage}
                      alt={featuredPost.title}
                      fill
                      sizes="(min-width: 1024px) 45vw, 100vw"
                      className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                      unoptimized
                    />
                    <div className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 z-10 bg-[#263D18] text-[#FBF7EE] text-[10px] sm:text-[11px] font-semibold px-2.5 sm:px-3 py-1 rounded-full inline-flex items-center gap-1.5 shadow-xs">
                      <Sparkles className="w-3 h-3 text-[#A8B88A]" />
                      <span>Featured Story</span>
                    </div>
                  </Link>
                </div>

                {/* Right Editorial Summary */}
                <div className="lg:col-span-6 text-left">
                  <div className="flex flex-wrap items-center gap-2 text-[11px] sm:text-xs font-medium text-[#536B35] mb-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-white/85 border border-[#A8B88A]/40 font-semibold text-[#263D18]">
                      {featuredPost.category}
                    </span>
                    <span>{featuredPost.publishedAt}</span>
                    <span aria-hidden="true">•</span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {featuredPost.readTime}
                    </span>
                  </div>

                  <h2 className="font-heading text-xl sm:text-2xl md:text-3xl lg:text-[34px] font-bold text-[#263D18] tracking-tight leading-[1.15] mb-2 sm:mb-2.5">
                    <Link
                      href={`/blog/${featuredPost.slug}`}
                      className="hover:text-[#536B35] transition-colors"
                    >
                      {featuredPost.title}
                    </Link>
                  </h2>

                  <p className="font-sans text-[13px] sm:text-[14px] md:text-[15px] text-[#28321F]/85 leading-relaxed mb-4">
                    {featuredPost.subtitle || featuredPost.excerpt}
                  </p>

                  {/* Author + Read CTA */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 pt-3.5 border-t border-[#28321F]/10">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#263D18] text-[#FBF7EE] flex items-center justify-center text-xs font-bold shrink-0">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="block text-xs sm:text-sm font-bold text-[#263D18] leading-tight">
                          {featuredPost.author.name}
                        </span>
                        {featuredPost.author.role && (
                          <span className="block text-[11px] text-[#555C4A]">
                            {featuredPost.author.role}
                          </span>
                        )}
                      </div>
                    </div>

                    <Link
                      href={`/blog/${featuredPost.slug}`}
                      className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2.5 rounded-full bg-[#263D18] hover:bg-[#1D3214] text-[#FBF7EE] text-xs sm:text-sm font-medium shadow-xs hover:shadow-md transition-all duration-300 active:scale-95"
                    >
                      <span>Read Full Guide</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </Container>
        </section>
      )}

      {/* 
        ========================================================================
        3. ALL BLOG ARTICLES WITH RESPONSIVE CATEGORY FILTER & SEARCH
        ========================================================================
      */}
      <section
        id="articles"
        className="relative w-full bg-[#FBF7EE] py-6 sm:py-8 md:py-10 overflow-hidden"
        aria-label="Botanical Journal Articles"
      >
        <Container className="relative z-10">
          {/* Ornate Centered Title */}
          <div className="text-center mb-5 sm:mb-7">
            <div className="flex items-center justify-center gap-3 sm:gap-5 max-w-2xl mx-auto">
              <span
                className="flex-1 max-w-[36px] sm:max-w-[90px] h-[1.5px] bg-[#28321F]/20 rounded-full"
                aria-hidden="true"
              />
              <h2 className="font-heading text-2xl sm:text-3xl md:text-[36px] font-bold text-[#263D18] tracking-tight text-center">
                Latest Articles &amp; Guides
              </h2>
              <span
                className="flex-1 max-w-[36px] sm:max-w-[90px] h-[1.5px] bg-[#28321F]/20 rounded-full"
                aria-hidden="true"
              />
            </div>
            <p className="font-sans text-[13px] sm:text-[14px] md:text-[15px] text-[#777968] mt-1.5 max-w-lg mx-auto">
              Clean beauty tips, botanical ingredient science, and everyday self-care rituals.
            </p>
          </div>

          {/* Filter Bar: Category Pills + Live Search */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 mb-6 sm:mb-8 bg-white/80 border border-[#28321F]/10 rounded-[5px] p-3 sm:p-3.5 shadow-2xs">
            {/* Category Pills */}
            <div
              className="flex items-center gap-1.5 sm:gap-2"
              role="tablist"
              aria-label="Filter blog articles by category"
            >
              {categories.map((category) => {
                const active = selectedCategory === category;
                return (
                  <button
                    key={category}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setSelectedCategory(category)}
                    className={cn(
                      "px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-[13px] font-medium transition-all duration-200 cursor-pointer",
                      active
                        ? "bg-[#263D18] text-[#FBF7EE] shadow-xs"
                        : "bg-[#FBF7EE] text-[#28321F] hover:bg-[#EAF1DF] border border-[#28321F]/10"
                    )}
                  >
                    {category}
                  </button>
                );
              })}
            </div>

            {/* Search Input */}
            <div className="relative max-w-8xl md:w-68 lg:w-76">
              <Search className="w-4 h-4 text-[#777968] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search aloe, hair, routine..."
                aria-label="Search blog articles"
                className="w-full pl-9 pr-8 py-2 rounded-full bg-white text-[13px] sm:text-sm text-[#28321F] placeholder:text-[#777968]/80 border border-[#28321F]/15 focus:outline-none focus:border-[#536B35] focus:ring-2 focus:ring-[#536B35]/20 transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#777968] hover:text-[#263D18] cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Blog Cards Grid */}
          {filteredPosts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-7">
              {filteredPosts.map((post) => (
                <BlogCard key={post.id} post={post} variant="detailed" />
              ))}
            </div>
          ) : (
            <div className="bg-[#EAF1DF]/70 border border-[#A8B88A]/40 rounded-[5px] p-6 sm:p-8 text-center max-w-lg mx-auto">
              <h3 className="font-heading text-xl sm:text-2xl font-bold text-[#263D18] mb-1.5">
                No Matching Articles Found
              </h3>
              <p className="text-xs sm:text-sm text-[#555C4A] mb-4">
                We couldn&apos;t find any journal stories matching &ldquo;{searchQuery}&rdquo; in {selectedCategory}.
              </p>
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#263D18] text-[#FBF7EE] text-xs sm:text-sm font-medium hover:bg-[#1D3214] transition-colors cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          )}
        </Container>
      </section>
    </>
  );
}
