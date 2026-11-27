import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

// Served as /robots.txt. Private and account pages are kept out of search.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api/", "/account", "/auth/", "/checkout", "/login", "/register", "/wishlist"],
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  };
}
