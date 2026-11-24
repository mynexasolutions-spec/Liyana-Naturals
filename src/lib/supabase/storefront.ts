import "server-only";

import type { BlogPost, Product, ProductCategory } from "@/types";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type RelatedCategory = { name?: string; slug?: string } | null;

type StoreProductRow = {
  id: string;
  category_id: string | null;
  name: string;
  slug: string;
  tagline: string | null;
  description: string | null;
  short_description: string | null;
  price: number | string;
  original_price: number | string | null;
  stock_quantity: number;
  rating: number | string;
  review_count: number;
  badge: Product["badge"] | null;
  is_featured: boolean;
  is_best_seller: boolean;
  volume: string | null;
  ingredients: unknown;
  benefits: unknown;
  how_to_use: string | null;
  images: unknown;
  categories: RelatedCategory;
};

type StoreCategoryRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
};

type ContentRow = {
  section_key: string;
  title: string | null;
  subtitle: string | null;
  body: unknown;
  is_published: boolean;
};

export type StorefrontBanner = {
  id: string;
  title: string;
  subtitle: string | null;
  image_url: string;
  link_url: string | null;
};

export type StorefrontReview = {
  id: string;
  author: string;
  rating: number;
  title: string | null;
  body: string;
  createdAt: string;
  productName: string | null;
};

export type StorefrontSettings = {
  store_name: string;
  support_email: string | null;
  support_phone: string | null;
  address: string | null;
  announcement_enabled: boolean;
  announcement_text: string | null;
  free_shipping_threshold: number | string | null;
  global: Record<string, unknown>;
};

function stringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function productImages(value: unknown, name: string) {
  if (!Array.isArray(value)) return [];

  return value.flatMap((item) => {
    if (typeof item === "string") return [{ src: item, alt: name }];
    if (
      item &&
      typeof item === "object" &&
      "src" in item &&
      typeof item.src === "string"
    ) {
      return [{ src: item.src, alt: typeof item.alt === "string" ? item.alt : name }];
    }
    return [];
  });
}

function mapProduct(row: StoreProductRow): Product {
  const categoryName = row.categories?.name ?? "Botanicals";
  const categorySlug = row.categories?.slug ?? "botanicals";

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    tagline: row.tagline ?? undefined,
    description: row.description ?? row.short_description ?? "",
    shortDescription: row.short_description ?? undefined,
    price: Number(row.price),
    originalPrice: row.original_price === null ? undefined : Number(row.original_price),
    rating: Number(row.rating ?? 0),
    reviewCount: row.review_count ?? 0,
    category: categoryName,
    categorySlug,
    images: productImages(row.images, row.name),
    badge: row.badge ?? undefined,
    isBestSeller: row.is_best_seller,
    isFeatured: row.is_featured,
    inStock: row.stock_quantity > 0,
    volume: row.volume ?? undefined,
    ingredients: stringArray(row.ingredients),
    benefits: stringArray(row.benefits),
    howToUse: row.how_to_use ?? undefined,
  };
}

function mapBlog(row: ContentRow): BlogPost | null {
  if (!row.body || typeof row.body !== "object") return null;
  const body = row.body as Partial<BlogPost>;
  if (typeof body.slug !== "string" || typeof body.title !== "string") return null;
  return {
    ...body,
    id: typeof body.id === "string" ? body.id : row.section_key,
    title: body.title,
    slug: body.slug,
    excerpt: typeof body.excerpt === "string" ? body.excerpt : row.subtitle ?? "",
    coverImage: typeof body.coverImage === "string" ? body.coverImage : "",
    category: typeof body.category === "string" ? body.category : "Journal",
    readTime: typeof body.readTime === "string" ? body.readTime : "",
    publishedAt: typeof body.publishedAt === "string" ? body.publishedAt : "",
    author: body.author ?? { name: "Liyana Naturals" },
  } as BlogPost;
}

export async function getStorefrontProducts(): Promise<Product[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, categories(name,slug)")
    .eq("is_active", true)
    .order("created_at", { ascending: false });
  if (error) throw new Error(`Storefront products could not be loaded: ${error.message}`);
  return (data as StoreProductRow[] | null ?? []).map(mapProduct);
}

export async function getStorefrontCategories(): Promise<ProductCategory[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id,name,slug,description,image_url")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  if (error) throw new Error(`Storefront categories could not be loaded: ${error.message}`);

  return (data as StoreCategoryRow[] | null ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description ?? "",
    image: row.image_url ?? "",
  }));
}

export async function getStorefrontBanners(): Promise<StorefrontBanner[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("homepage_banners")
    .select("id,title,subtitle,image_url,link_url")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  if (error) throw new Error(`Homepage banners could not be loaded: ${error.message}`);
  return (data as StorefrontBanner[] | null) ?? [];
}

export async function getStorefrontReviews(productId?: string): Promise<StorefrontReview[]> {
  const supabase = await createSupabaseServerClient();
  let query = supabase
    .from("reviews")
    .select("id,author_name,rating,title,body,created_at,products(name)")
    .eq("status", "approved")
    .order("created_at", { ascending: false });
  if (productId) query = query.eq("product_id", productId);
  const { data, error } = await query;
  if (error) return [];

  return (data ?? []).map((row) => {
    const product = row.products as { name?: string } | null;
    return {
      id: row.id,
      author: row.author_name,
      rating: Number(row.rating),
      title: row.title,
      body: row.body ?? "",
      createdAt: row.created_at,
      productName: product?.name ?? null,
    };
  });
}

export async function getStorefrontBlogs(): Promise<BlogPost[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("site_content")
    .select("section_key,title,subtitle,body,is_published")
    .like("section_key", "blog:%")
    .eq("is_published", true)
    .order("updated_at", { ascending: false });
  if (error) throw new Error(`Blog content could not be loaded: ${error.message}`);
  return (data as ContentRow[] | null ?? []).flatMap((row) => {
    const post = mapBlog(row);
    return post ? [post] : [];
  });
}

export async function getStorefrontContent(sectionKey: string): Promise<Record<string, unknown>> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("site_content")
    .select("body")
    .eq("section_key", sectionKey)
    .eq("is_published", true)
    .maybeSingle();
  if (error) throw new Error(`Store content could not be loaded: ${error.message}`);
  return data?.body && typeof data.body === "object" ? data.body as Record<string, unknown> : {};
}

export async function getStorefrontSettings(): Promise<StorefrontSettings | null> {
  const supabase = await createSupabaseServerClient();
  const [{ data: settings, error: settingsError }, { data: content, error: contentError }] = await Promise.all([
    supabase
      .from("store_settings")
      .select("store_name,support_email,support_phone,address,announcement_enabled,announcement_text,free_shipping_threshold")
      .eq("id", true)
      .maybeSingle(),
    supabase
      .from("site_content")
      .select("body")
      .eq("section_key", "store:settings")
      .eq("is_published", true)
      .maybeSingle(),
  ]);
  if (settingsError) throw new Error(`Store settings could not be loaded: ${settingsError.message}`);
  if (contentError) throw new Error(`Global settings could not be loaded: ${contentError.message}`);
  if (!settings) return null;
  return { ...settings, global: content?.body && typeof content.body === "object" ? content.body as Record<string, unknown> : {} };
}
