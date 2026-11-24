import React from "react";
import { HeroSection } from "@/components/home/HeroSection";
import { CategorySection } from "@/components/home/CategorySection";
import { BestSellers } from "@/components/home/BestSellers";
import { AboutSection } from "@/components/home/AboutSection";
import { Testimonials } from "@/components/home/Testimonials";
import { BlogSection } from "@/components/home/BlogSection";
import { Newsletter } from "@/components/home/Newsletter";
import type { BlogPost, Product, ProductCategory } from "@/types";
import {
  getStorefrontBanners,
  getStorefrontBlogs,
  getStorefrontCategories,
  getStorefrontProducts,
  getStorefrontReviews,
  getStorefrontContent,
} from "@/lib/supabase/storefront";

function stringList(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function orderBySlugs<T extends { slug: string }>(items: T[], slugs: string[]): T[] {
  if (slugs.length === 0) return items;
  const positions = new Map(slugs.map((slug, index) => [slug, index]));
  return [...items].sort((left, right) => {
    const leftPosition = positions.get(left.slug) ?? slugs.length;
    const rightPosition = positions.get(right.slug) ?? slugs.length;
    return leftPosition - rightPosition;
  });
}

function applyHomepageConfiguration(
  products: Product[],
  categories: ProductCategory[],
  blogs: BlogPost[],
  configuration: Record<string, unknown>,
) {
  const bestSellerSlugs = stringList(configuration.bestSellerProductSlugs);
  const featuredProductSlugs = stringList(configuration.featuredProductSlugs);
  const featuredCategorySlugs = stringList(configuration.featuredCategorySlugs);
  const featuredBlogSlugs = stringList(configuration.featuredBlogSlugs);

  return {
    products: orderBySlugs(
      products.map((product) => ({
        ...product,
        isBestSeller: bestSellerSlugs.length > 0
          ? bestSellerSlugs.includes(product.slug)
          : product.isBestSeller,
        isFeatured: featuredProductSlugs.length > 0
          ? featuredProductSlugs.includes(product.slug)
          : product.isFeatured,
      })),
      bestSellerSlugs,
    ),
    categories: orderBySlugs(categories, featuredCategorySlugs),
    blogs: orderBySlugs(
      blogs.map((blog) => ({
        ...blog,
        featured: featuredBlogSlugs.length > 0
          ? featuredBlogSlugs.includes(blog.slug)
          : blog.featured,
      })),
      featuredBlogSlugs,
    ),
  };
}

export default async function HomePage() {
  const [storefrontProducts, storefrontCategories, storefrontBanners, storefrontReviews, storefrontBlogs, homepageConfiguration] = await Promise.all([
    getStorefrontProducts(),
    getStorefrontCategories(),
    getStorefrontBanners(),
    getStorefrontReviews(),
    getStorefrontBlogs(),
    getStorefrontContent("homepage:configuration"),
  ]);
  const homepage = applyHomepageConfiguration(
    storefrontProducts,
    storefrontCategories,
    storefrontBlogs,
    homepageConfiguration,
  );

  return (
    <main className="min-h-screen bg-[#FBF7EE]">
      <HeroSection banners={storefrontBanners} />
      <CategorySection categories={homepage.categories} />
      <BestSellers products={homepage.products} />
      <AboutSection />
      <Testimonials reviews={storefrontReviews} />
      <BlogSection posts={homepage.blogs} />
      <Newsletter />
    </main>
  );
}
