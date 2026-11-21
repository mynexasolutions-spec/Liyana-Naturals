import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock, User } from "lucide-react";
import { BlogPost } from "@/types";
import { cn } from "@/lib/utils";

interface BlogCardProps {
  post: BlogPost;
  variant?: "compact" | "detailed";
  className?: string;
}

export function BlogCard({
  post,
  variant = "compact",
  className,
}: BlogCardProps) {
  const isDetailed = variant === "detailed";

  return (
    <article
      className={cn(
        "relative bg-white rounded-[5px] p-3.5 sm:p-4.5 border border-[#28321F]/8 shadow-[0_4px_20px_rgba(40,50,31,0.05)] hover:shadow-[0_14px_34px_rgba(40,50,31,0.1)] hover:border-[#536B35]/30 transition-all duration-300 flex flex-col group",
        className
      )}
    >
      {/* Image Container with Floating Date & Category Pills */}
      <div
        className={cn(
          "relative w-full rounded-[5px] overflow-hidden mb-3 sm:mb-3.5 bg-[#F2ECE0]",
          isDetailed ? "aspect-[16/10]" : "aspect-[16/9]"
        )}
      >
        <Image
          src={post.coverImage}
          alt={post.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          unoptimized
        />

        {/* Subtle bottom gradient for polish */}
        <div
          className="absolute inset-0 bg-gradient-to-t from-[#1D3214]/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          aria-hidden="true"
        />

        {/* Date Pill Badge (Top Left of Image) */}
        <div className="absolute top-2 left-2 sm:top-2.5 sm:left-2.5 z-10 bg-white/95 backdrop-blur-xs text-[#28321F] text-[11px] sm:text-xs font-semibold px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full shadow-xs flex items-center gap-1.5 border border-white/60">
          <span className="w-1.5 h-1.5 rounded-full bg-[#536B35]" />
          <span>{post.publishedAt}</span>
        </div>

        {/* Category Pill (Top Right of Image) */}
        <div className="absolute top-2 right-2 sm:top-2.5 sm:right-2.5 z-10 bg-[#263D18]/90 backdrop-blur-xs text-[#FBF7EE] text-[10px] sm:text-[11px] font-medium px-2.5 py-0.5 sm:py-1 rounded-full shadow-xs">
          {post.category}
        </div>
      </div>

      {/* Card Body */}
      <div className="px-0.5 flex-1 flex flex-col justify-between">
        <div>
          {/* Meta row (Read time + Author) */}
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] sm:text-xs text-[#777968] font-medium mb-1.5">
            <span className="inline-flex items-center gap-1 text-[#536B35]">
              <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              {post.readTime}
            </span>
            {isDetailed && (
              <>
                <span className="text-[#28321F]/25" aria-hidden="true">
                  •
                </span>
                <span className="inline-flex items-center gap-1">
                  <User className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#536B35]" />
                  {post.author.name}
                </span>
              </>
            )}
          </div>

          {/* Blog Title with stretched link so whole card is cleanly clickable */}
          <h3
            className={cn(
              "font-heading font-bold text-[#28321F] group-hover:text-[#536B35] transition-colors leading-snug",
              isDetailed
                ? "text-lg sm:text-xl md:text-2xl mb-2 line-clamp-2"
                : "font-sans text-[16px] sm:text-[17px] mb-1.5 line-clamp-2"
            )}
          >
            <Link
              href={`/blog/${post.slug}`}
              className="after:absolute after:inset-0 focus-visible:outline-none"
            >
              {post.title}
            </Link>
          </h3>

          {/* Excerpt */}
          <p
            className={cn(
              "font-sans text-[#555C4A] font-normal leading-relaxed",
              isDetailed
                ? "text-[13px] sm:text-[14px] line-clamp-2 sm:line-clamp-3 mb-3"
                : "text-[13px] sm:text-[14px] line-clamp-2 mb-2.5"
            )}
          >
            {post.excerpt}
          </p>
        </div>

        {/* Footer Action */}
        <div
          className={cn(
            "flex items-center justify-between pt-2.5",
            isDetailed && "border-t border-[#28321F]/8 mt-auto"
          )}
        >
          <span className="inline-flex items-center gap-1.5 text-[14.5px] sm:text-[16px] font-semibold text-[#536B35] group-hover:text-[#263D18] transition-colors border-b border-[#28321F]/80">
            <span>{isDetailed ? "Read Article" : "Read More"}</span>
            <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform duration-300 group-hover:translate-x-1" />
          </span>

          {isDetailed && post.author.role && (
            <span className="text-[11px] font-medium text-[#777968] hidden sm:inline">
              {post.author.role}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
