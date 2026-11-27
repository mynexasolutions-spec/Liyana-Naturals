import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { getPublishedPages, getStorefrontBlogs, getStorefrontProducts } from "@/lib/supabase/storefront";

// Served as /sitemap.xml, from what is published right now.
export const dynamic = "force-dynamic";

const FIXED = ["", "/shop", "/about", "/blog", "/contact"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entry = (path: string) => ({ url: `${siteConfig.url}${path}` });
  // If one list cannot be loaded, search engines still get the rest.
  const [products, posts, pages] = await Promise.all(
    [
      getStorefrontProducts().then((list) => list.map((product) => `/products/${product.slug}`)),
      getStorefrontBlogs().then((list) => list.map((post) => `/blog/${post.slug}`)),
      getPublishedPages().then((list) => list.map((page) => `/${page.slug}`)),
    ].map((paths) =>
      paths.catch((error) => {
        console.error("[sitemap] A list could not be loaded:", error instanceof Error ? error.message : error);
        return [] as string[];
      }),
    ),
  );
  return [...FIXED, ...products, ...posts, ...pages].map(entry);
}
