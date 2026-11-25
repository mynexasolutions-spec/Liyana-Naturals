import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Check,
  ChevronDown,
  ChevronRight,
  Clock,
  Leaf,
  Sparkles,
  Tag,
  User,
} from "lucide-react";
import { Container } from "@/components/ui/Container";
import { ShareArticleButton } from "@/components/blog/ShareArticleButton";
import { getStorefrontBlogs, getStorefrontProducts } from "@/lib/supabase/storefront";

interface BlogDetailPageProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({
  params,
}: BlogDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const blogPosts = await getStorefrontBlogs();
  const post = blogPosts.find((p) => p.slug === slug);

  if (!post) {
    return {
      title: "Article Not Found",
      description:
        "Read clean beauty and botanical skincare guides on Liyana Naturals.",
    };
  }

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: `${post.title} | Liyana Naturals`,
      description: post.excerpt,
      type: "article",
      images: [
        {
          url: post.coverImage,
          alt: post.title,
        },
      ],
    },
  };
}

export default async function SingleBlogPage({ params }: BlogDetailPageProps) {
  const { slug } = await params;
  const [blogPosts, products] = await Promise.all([
    getStorefrontBlogs(),
    getStorefrontProducts(),
  ]);
  const currentIndex = blogPosts.findIndex((p) => p.slug === slug);

  if (currentIndex === -1) {
    notFound();
  }

  const post = blogPosts[currentIndex];
  const prevPost = currentIndex > 0 ? blogPosts[currentIndex - 1] : null;
  const nextPost =
    currentIndex < blogPosts.length - 1 ? blogPosts[currentIndex + 1] : null;

  const relatedPosts = blogPosts.filter((p) => p.slug !== post.slug);

  const relatedProducts = (post.relatedProductSlugs ?? [])
    .map((productSlug) => products.find((item) => item.slug === productSlug))
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  const sections = post.sections ?? [];
  const contentParagraphs = (post.content ?? "")
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  return (
    <main className="min-h-screen bg-[#FBF7EE] text-[#28321F] overflow-x-hidden">
      {/* 
        ========================================================================
        1. COMPACT MODERN EDITORIAL HEADER (Split Title + Cover Image)
        Saves vertical space while staying sharp & mobile responsive
        ========================================================================
      */}
      <section
        className="relative w-full bg-[#FBF7EE] pt-4 sm:pt-6 pb-5 sm:pb-7 border-b border-[#28321F]/8 overflow-hidden"
        aria-label="Article Header"
      >
        <Container size="lg">
          {/* Compact Breadcrumb Navigation */}
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1.5 text-[11px] sm:text-xs text-[#777968] mb-3 sm:mb-4 font-medium min-w-0"
          >
            <Link
              href="/"
              className="text-[#555C4A] hover:text-[#263D18] transition-colors shrink-0"
            >
              Home
            </Link>
            <ChevronRight className="w-3 h-3 text-[#777968]/70 shrink-0" />
            <Link
              href="/blog"
              className="text-[#555C4A] hover:text-[#263D18] transition-colors shrink-0"
            >
              Blog
            </Link>
            <ChevronRight className="w-3 h-3 text-[#777968]/70 shrink-0" />
            <span className="text-[#536B35] font-medium shrink-0 hidden xs:inline">
              {post.category}
            </span>
            <ChevronRight className="w-3 h-3 text-[#777968]/70 shrink-0 hidden xs:inline" />
            <span className="text-[#263D18] font-semibold truncate">
              {post.title}
            </span>
          </nav>

          {/* Compact Split Hero Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 lg:gap-8 items-center">
            {/* Left: Title, Meta, Author & Share */}
            <div className="lg:col-span-6">
              <div className="flex flex-wrap items-center gap-2 mb-2.5 sm:mb-3">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#263D18] text-[#FBF7EE] text-[11px] font-semibold">
                  <Leaf className="w-3 h-3 text-[#A8B88A]" />
                  {post.category}
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white border border-[#28321F]/10 text-[#28321F] text-[11px] font-medium">
                  <Calendar className="w-3 h-3 text-[#536B35]" />
                  {post.publishedAt}
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white border border-[#28321F]/10 text-[#28321F] text-[11px] font-medium">
                  <Clock className="w-3 h-3 text-[#536B35]" />
                  {post.readTime}
                </span>
              </div>

              <h1 className="font-heading text-2xl sm:text-3xl md:text-4xl lg:text-[42px] text-[#263D18] font-bold tracking-tight leading-[1.1] mb-2.5">
                {post.title}
              </h1>

              <p className="font-sans text-[13.5px] sm:text-[15px] md:text-[16px] text-[#555C4A] leading-relaxed mb-4 max-w-2xl">
                {post.subtitle || post.excerpt}
              </p>

              {/* Author + Actions Row */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#28321F]/10">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-[#EAF1DF] border border-[#A8B88A]/50 flex items-center justify-center text-[#263D18] shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block text-xs sm:text-sm font-bold text-[#263D18] leading-tight">
                      {post.author.name}
                    </span>
                    {post.author.role && (
                      <span className="block text-[11px] text-[#777968]">
                        {post.author.role}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <ShareArticleButton title={post.title} />
                  <Link
                    href="/blog"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white hover:bg-[#F6EEDD] text-[#263D18] text-xs sm:text-sm font-medium border border-[#28321F]/12 transition-colors"
                  >
                    <span>All Blogs</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Right: Compact Cover Image */}
            <div className="lg:col-span-6">
              <div className="relative w-full aspect-[16/8] sm:aspect-[16/7] rounded-[5px] overflow-hidden shadow-card border border-[#28321F]/10 bg-[#E9DCC5]/40">
                <Image
                  src={post.coverImage}
                  alt={post.title}
                  fill
                  priority
                  sizes="(min-width: 1024px) 42vw, 100vw"
                  className="object-cover object-top"
                  unoptimized
                />
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* 
        ========================================================================
        2. COMPACT ARTICLE BODY + STICKY SIDEBAR
        ========================================================================
      */}
      <section className="w-full py-5 sm:py-7" aria-label="Article Content">
        <Container size="lg">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-8 items-start">
            {/* LEFT / MAIN READING COLUMN */}
            <article className="lg:col-span-8 space-y-4 sm:space-y-5">
              {/* Mobile Collapsible Quick Navigation (hidden on lg+) */}
              {sections.length > 0 && (
                <details className="lg:hidden bg-white border border-[#28321F]/10 rounded-[5px] p-3.5 shadow-2xs group">
                  <summary className="flex items-center justify-between cursor-pointer list-none font-heading text-base font-bold text-[#263D18]">
                    <span>In This Article ({sections.length} Sections)</span>
                    <ChevronDown className="w-4 h-4 text-[#536B35] group-open:rotate-180 transition-transform" />
                  </summary>
                  <nav aria-label="Mobile table of contents" className="mt-3 pt-2.5 border-t border-[#28321F]/8">
                    <ul className="space-y-2">
                      {sections.map((section) => (
                        <li key={section.id}>
                          <a
                            href={`#${section.id}`}
                            className="flex items-start gap-1.5 text-xs font-medium text-[#555C4A] hover:text-[#263D18]"
                          >
                            <ChevronRight className="w-3.5 h-3.5 text-[#536B35] shrink-0 mt-0.5" />
                            <span>{section.heading}</span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  </nav>
                </details>
              )}

              {/* Key Takeaways Card (Compact) */}
              {post.keyTakeaways && post.keyTakeaways.length > 0 && (
                <div className="bg-[#EAF1DF] border border-[#A8B88A]/45 rounded-[5px] p-4 sm:p-5 shadow-2xs">
                  <div className="flex items-center gap-2 mb-2.5">
                    <Sparkles className="w-4 h-4 text-[#536B35]" />
                    <h2 className="font-heading text-lg sm:text-xl font-bold text-[#263D18] tracking-tight">
                      Key Botanical Takeaways
                    </h2>
                  </div>
                  <ul className="space-y-2">
                    {post.keyTakeaways.map((point) => (
                      <li
                        key={point}
                        className="flex items-start gap-2 text-[13px] sm:text-[14px] text-[#28321F] leading-snug"
                      >
                        <span className="w-4 h-4 rounded-full bg-[#263D18] text-white flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-2.5 h-2.5 stroke-[2.8]" />
                        </span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Article Sections Card (Tight, Comfortable Reading Spacing) */}
              <div className="bg-white rounded-[5px] p-4 sm:p-6 lg:p-7 border border-[#28321F]/8 shadow-soft space-y-5 sm:space-y-6">
                {sections.map((section) => (
                  <div
                    key={section.id}
                    id={section.id}
                    className="scroll-mt-24 space-y-2.5 sm:space-y-3"
                  >
                    <h2 className="font-heading text-xl sm:text-2xl lg:text-[26px] font-bold text-[#263D18] tracking-tight leading-snug">
                      {section.heading}
                    </h2>

                    {section.paragraphs.map((paragraph, idx) => (
                      <p
                        key={idx}
                        className="font-sans text-[13.5px] sm:text-[14.5px] md:text-[15.5px] text-[#28321F]/85 leading-[1.7]"
                      >
                        {paragraph}
                      </p>
                    ))}

                    {section.bullets && section.bullets.length > 0 && (
                      <ul className="space-y-1.5 pl-1 pt-0.5">
                        {section.bullets.map((bullet) => (
                          <li
                            key={bullet}
                            className="flex items-start gap-2 text-[13px] sm:text-[14.5px] text-[#28321F]/85 leading-relaxed"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-[#536B35] shrink-0 mt-2" />
                            <span>{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    {section.highlightTip && (
                      <div className="bg-[#F6EEDD] border border-[#536B35]/20 rounded-[10px] px-3.5 sm:px-4 py-2.5 sm:py-3 my-2">
                        <span className="block text-[10px] font-bold uppercase tracking-[0.16em] text-[#536B35] mb-0.5">
                          Botanical Expert Tip
                        </span>
                        <p className="font-sans text-[13px] sm:text-[14px] text-[#263D18] font-medium leading-relaxed">
                          {section.highlightTip}
                        </p>
                      </div>
                    )}
                  </div>
                ))}

                {sections.length === 0 && contentParagraphs.length > 0 && (
                  <div className="space-y-4">
                    {contentParagraphs.map((paragraph, index) => (
                      <p
                        key={`${post.id}-paragraph-${index}`}
                        className="font-sans text-[13.5px] sm:text-[14.5px] md:text-[15.5px] text-[#28321F]/85 leading-[1.7]"
                      >
                        {paragraph}
                      </p>
                    ))}
                  </div>
                )}

                {/* Tags Footer */}
                {post.tags && post.tags.length > 0 && (
                  <div className="pt-4 border-t border-[#28321F]/10 flex flex-wrap items-center gap-1.5 sm:gap-2">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-[#777968] mr-1">
                      <Tag className="w-3 h-3 text-[#536B35]" />
                      Topics:
                    </span>
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2.5 py-0.5 rounded-full bg-[#FBF7EE] border border-[#28321F]/10 text-[11px] sm:text-xs font-medium text-[#28321F]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Compact Author Bio + Previous / Next Row */}
              <div className="bg-[#F6EEDD] border border-[#E9DCC5] rounded-[5px] p-4 sm:p-5 flex items-start sm:items-center gap-3.5 sm:gap-4">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#263D18] text-[#FBF7EE] flex items-center justify-center shrink-0 shadow-xs">
                  <User className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#536B35] block">
                    Written By
                  </span>
                  <h3 className="font-heading text-lg sm:text-xl font-bold text-[#263D18] leading-tight">
                    {post.author.name}
                    {post.author.role ? ` — ${post.author.role}` : ""}
                  </h3>
                  {post.author.bio && (
                    <p className="font-sans text-[12.5px] sm:text-[13.5px] text-[#555C4A] leading-relaxed mt-1">
                      {post.author.bio}
                    </p>
                  )}
                </div>
              </div>

              {/* Previous / Next Compact Switcher */}
              {(prevPost || nextPost) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {prevPost ? (
                    <Link
                      href={`/blog/${prevPost.slug}`}
                      className="group bg-white hover:bg-[#EAF1DF]/60 border border-[#28321F]/10 rounded-[5px] p-3.5 sm:p-4 transition-all duration-200 flex flex-col justify-between"
                    >
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#536B35] mb-1">
                        <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
                        Previous Article
                      </span>
                      <span className="font-heading text-base sm:text-lg font-bold text-[#263D18] group-hover:text-[#536B35] transition-colors line-clamp-1">
                        {prevPost.title}
                      </span>
                    </Link>
                  ) : (
                    <div className="hidden sm:block" />
                  )}

                  {nextPost && (
                    <Link
                      href={`/blog/${nextPost.slug}`}
                      className="group bg-white hover:bg-[#EAF1DF]/60 border border-[#28321F]/10 rounded-[5px] p-3.5 sm:p-4 transition-all duration-200 flex flex-col justify-between sm:text-right sm:items-end"
                    >
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#536B35] mb-1">
                        Next Article
                        <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                      </span>
                      <span className="font-heading text-base sm:text-lg font-bold text-[#263D18] group-hover:text-[#536B35] transition-colors line-clamp-1">
                        {nextPost.title}
                      </span>
                    </Link>
                  )}
                </div>
              )}
            </article>

            {/* RIGHT / COMPACT STICKY SIDEBAR */}
            <aside className="lg:col-span-4 space-y-4 lg:sticky lg:top-24">
              {/* Desktop Table of Contents */}
              {sections.length > 0 && (
                <div className="hidden lg:block bg-white border border-[#28321F]/10 rounded-[5px] p-4 sm:p-5 shadow-2xs">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#536B35] block mb-0.5">
                    Quick Navigation
                  </span>
                  <h3 className="font-heading text-xl font-bold text-[#263D18] mb-2.5">
                    In This Article
                  </h3>
                  <nav aria-label="Article table of contents">
                    <ul className="space-y-2">
                      {sections.map((section) => (
                        <li key={section.id}>
                          <a
                            href={`#${section.id}`}
                            className="group flex items-start gap-1.5 text-[13px] font-medium text-[#555C4A] hover:text-[#263D18] transition-colors leading-snug"
                          >
                            <ChevronRight className="w-3.5 h-3.5 text-[#536B35] shrink-0 mt-0.5 group-hover:translate-x-0.5 transition-transform" />
                            <span>{section.heading}</span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  </nav>
                </div>
              )}

              {/* Featured Botanical Products Mentioned */}
              {relatedProducts.length > 0 && (
                <div className="bg-[#EAF1DF]/85 border border-[#A8B88A]/45 rounded-[5px] p-4 sm:p-5">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#536B35] block mb-0.5">
                    Botanical Pairings
                  </span>
                  <h3 className="font-heading text-xl font-bold text-[#263D18] mb-3">
                    Recommended Rituals
                  </h3>

                  <div className="space-y-2.5">
                    {relatedProducts.map((product) => (
                      <Link
                        key={product.id}
                        href={`/products/${product.slug}`}
                        className="group flex items-center gap-3 bg-white rounded-[5px] p-2.5 border border-[#28321F]/8 hover:border-[#536B35]/35 shadow-2xs hover:shadow-xs transition-all"
                      >
                        <div className="relative w-13 h-13 sm:w-14 sm:h-14 rounded-[5px] overflow-hidden bg-[#FBF7EE] shrink-0">
                          <Image
                            src={
                              product.images[0]?.src ||
                              "/images/products/Fresh_Green.webp"
                            }
                            alt={product.name}
                            fill
                            sizes="56px"
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            unoptimized
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="text-[10px] font-medium text-[#536B35] block">
                            {product.category}
                          </span>
                          <h4 className="font-sans text-xs sm:text-sm font-bold text-[#263D18] group-hover:text-[#536B35] transition-colors truncate">
                            {product.name}
                          </h4>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-xs sm:text-sm font-bold text-[#28321F]">
                              ₹{product.price}
                            </span>
                            {product.originalPrice && (
                              <span className="text-[11px] text-[#777968] line-through">
                                ₹{product.originalPrice}
                              </span>
                            )}
                          </div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-[#536B35] shrink-0 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Compact Liyana Promise Card */}
              <div className="bg-[#1D3214] text-[#FBF7EE] rounded-[5px] p-4 sm:p-5 relative overflow-hidden">
                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#A8B88A] block mb-1">
                  Liyana Promise
                </span>
                <h3
                  style={{ color: "#ffffff" }}
                  className="font-heading text-xl font-bold !text-white leading-tight mb-1.5"
                >
                  100% Pure &amp; Botanical
                </h3>
                <p className="text-xs text-[#FBF7EE]/85 leading-relaxed mb-3.5">
                  Paraben-free, sulphate-free, and cruelty-free care crafted for
                  gentle everyday skin wellness.
                </p>
                <Link
                  href="/shop"
                  className="inline-flex items-center justify-center px-3 py-2 rounded-full bg-[#FBF7EE] hover:bg-white text-[#1D3214] text-xs font-semibold transition-colors"
                >
                  <span>Explore Shop</span>
                </Link>
              </div>
            </aside>
          </div>
        </Container>
      </section>

      {/* 
        ========================================================================
        3. ULTRA-COMPACT RELATED BLOGS SECTION (Reduced Height & Width, Responsive)
        ========================================================================
      */}
      {relatedPosts.length > 0 && (
        <section
          className="w-full bg-[#FBF7EE] py-5 sm:py-6 border-t border-[#28321F]/8 mb-10"
          aria-label="Related Blogs"
        >
          <Container size="lg">
            <div className="flex items-center justify-between gap-3 mb-3.5 sm:mb-4">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#536B35] block">
                  Continue Reading
                </span>
                <h2 className="font-heading text-xl sm:text-2xl font-bold text-[#263D18] tracking-tight leading-tight">
                  Related Blogs
                </h2>
              </div>

              <Link
                href="/blog"
                className="inline-flex items-center gap-1 text-xs sm:text-[13px] font-semibold text-[#536B35] hover:text-[#263D18] transition-colors shrink-0"
              >
                <span>All Articles</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              {relatedPosts.map((related) => (
                <article
                  key={related.id}
                  className="relative group bg-white rounded-[5px] p-2.5 sm:p-3 border border-[#28321F]/10 shadow-2xs hover:shadow-card hover:border-[#536B35]/30 transition-all duration-200 flex items-center gap-3 sm:gap-3.5"
                >
                  {/* Compact Thumbnail */}
                  <div className="relative w-24 h-20 sm:w-28 sm:h-24 rounded-[5px] overflow-hidden bg-[#F2ECE0] shrink-0">
                    <Image
                      src={related.coverImage}
                      alt={related.title}
                      fill
                      sizes="(max-width: 640px) 96px, 112px"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      unoptimized
                    />
                  </div>

                  {/* Compact Content */}
                  <div className="min-w-0 flex-1 flex flex-col justify-between">
                    <div className="flex items-center gap-2 text-[10px] sm:text-[11px] font-medium text-[#536B35] mb-1">
                      <span className="px-2 py-0.5 rounded-full bg-[#EAF1DF] text-[#263D18] font-semibold truncate">
                        {related.category}
                      </span>
                      <span className="text-[#777968] shrink-0">
                        {related.readTime}
                      </span>
                    </div>

                    <h3 className="font-heading text-base sm:text-lg font-bold text-[#263D18] group-hover:text-[#536B35] transition-colors leading-snug line-clamp-2 mb-1">
                      <Link
                        href={`/blog/${related.slug}`}
                        className="after:absolute after:inset-0 focus-visible:outline-none"
                      >
                        {related.title}
                      </Link>
                    </h3>

                    <span className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-semibold text-[#536B35] group-hover:text-[#263D18]">
                      <span>Read Article</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </Container>
        </section>
      )}
    </main>
  );
}
