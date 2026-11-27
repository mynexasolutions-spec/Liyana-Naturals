import type { Badge } from "@/lib/content/badges";

/** One size of a product, with its own price and stock. */
export interface ProductVariant {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  inStock: boolean;
  /** Units available. */
  stock: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  tagline?: string;
  description: string;
  shortDescription?: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  category: string;
  categorySlug: string;
  images: {
    src: string;
    alt: string;
    /** Set when the picture belongs to one size only. */
    size?: string;
  }[];
  /** Empty or missing for a product sold in one size. */
  variants?: ProductVariant[];
  seoTitle?: string;
  seoDescription?: string;
  faqs?: { question: string; answer: string }[];
  /** Boxes under the price, written by the admin. */
  highlights?: Badge[];
  tags?: string[];
  /** Units available, all sizes together. */
  stock?: number;
  /** Short label on the picture, such as "New" or the admin's own words. */
  badge?: string;
  isBestSeller?: boolean;
  isFeatured?: boolean;
  inStock: boolean;
  ingredients?: string[];
  benefits?: string[];
  howToUse?: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  isFeatured?: boolean;
  productCount?: number;
}
