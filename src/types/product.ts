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
  }[];
  badge?: "Best Seller" | "New" | "Organic" | "Award Winner" | "Sale";
  isBestSeller?: boolean;
  isFeatured?: boolean;
  inStock: boolean;
  volume?: string;
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
  productCount?: number;
}
