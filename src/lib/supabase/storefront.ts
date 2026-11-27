import "server-only";

import type { BlogPost, Product, ProductCategory } from "@/types";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { renderableImageUrl } from "@/lib/media/image-url";
import { toBadges } from "@/lib/content/badges";
import { CONTENT_PAGES, pageContent, pageKey, type PageSlug } from "@/lib/content/pages";

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
  ingredients: unknown;
  benefits: unknown;
  how_to_use: string | null;
  images: unknown;
  categories: RelatedCategory;
  seo_title: string | null;
  seo_description: string | null;
  faqs: unknown;
  highlights: unknown;
  tags: unknown;
  product_variants:
    | {
        id: string;
        name: string;
        price: number | string;
        original_price: number | string | null;
        stock_quantity: number;
        sort_order: number;
      }[]
    | null;
};

type StoreCategoryRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  is_featured: boolean;
};

type ContentRow = {
  section_key: string;
  title: string | null;
  subtitle: string | null;
  body: unknown;
  is_published: boolean;
  slug: string | null;
  excerpt: string | null;
  category: string | null;
  read_time: string | null;
  published_at: string | null;
  cover_image: string | null;
  tags: unknown;
  key_takeaways: unknown;
  content: string | null;
  author_name: string | null;
  author_role: string | null;
  author_bio: string | null;
  is_featured: boolean;
};

export type StorefrontBanner = {
  id: string;
  title: string;
  subtitle: string | null;
  image_url: string | null;
  desktop_image_url: string | null;
  mobile_image_url: string | null;
  link_url: string | null;
  eyebrow?: string | null;
  button_label?: string | null;
  show_text?: boolean;
};

export type StorefrontReview = {
  id: string;
  author: string;
  rating: number;
  title: string | null;
  body: string;
  createdAt: string;
  productName: string | null;
  /** Chosen by the admin for the home page. */
  showOnHome: boolean;
};

export type StorefrontSettings = {
  store_name: string;
  support_email: string | null;
  support_phone: string | null;
  address: string | null;
  announcement_enabled: boolean;
  announcement_text: string | null;
  shipping_fee: number | string | null;
  free_shipping_threshold: number | string | null;
  cod_enabled?: boolean;
  online_payment_enabled?: boolean;
  cod_fee?: number | string | null;
  product_badges: unknown;
  global: Record<string, unknown>;
};

function stringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function productImages(value: unknown, name: string) {
  const images = (() => {
    if (Array.isArray(value)) return value;
    if (typeof value !== "string" || !value.trim()) return [];
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  })();

  return images.flatMap((item) => {
    if (typeof item === "string") return [{ src: item, alt: name }];
    if (!item || typeof item !== "object") return [];
    const record = item as Record<string, unknown>;
    const src = typeof record.src === "string" && record.src.trim()
      ? record.src.trim()
      : typeof record.url === "string" && record.url.trim()
        ? record.url.trim()
        : null;
    if (src) {
      return [{
        src,
        alt: typeof record.alt === "string" ? record.alt : name,
        ...(typeof record.size === "string" && record.size ? { size: record.size } : {}),
      }];
    }
    return [];
  });
}

function productFaqs(value: unknown): NonNullable<Product["faqs"]> {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    const record = item && typeof item === "object" ? (item as Record<string, unknown>) : {};
    return typeof record.question === "string" && typeof record.answer === "string"
      ? [{ question: record.question, answer: record.answer }]
      : [];
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
    ingredients: stringArray(row.ingredients),
    benefits: stringArray(row.benefits),
    howToUse: row.how_to_use ?? undefined,
    variants: [...(row.product_variants ?? [])]
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((variant) => ({
        id: variant.id,
        name: variant.name,
        price: Number(variant.price),
        originalPrice: variant.original_price === null ? undefined : Number(variant.original_price),
        inStock: variant.stock_quantity > 0,
        stock: variant.stock_quantity,
      })),
    highlights: toBadges(row.highlights),
    tags: stringArray(row.tags),
    stock: row.stock_quantity,
    seoTitle: row.seo_title ?? undefined,
    seoDescription: row.seo_description ?? undefined,
    faqs: productFaqs(row.faqs),
  };
}

function mapBlog(row: ContentRow): BlogPost | null {
  if (!row.body || typeof row.body !== "object") return null;
  const body = row.body as Partial<BlogPost> & Record<string, unknown>;
  const slug = row.slug ?? (typeof body.slug === "string" ? body.slug : null);
  const title = row.title ?? (typeof body.title === "string" ? body.title : null);
  if (!slug || !title) return null;
  const author = body.author && typeof body.author === "object" ? body.author as Record<string, unknown> : {};
  return {
    ...body,
    id: typeof body.id === "string" ? body.id : row.section_key,
    title,
    slug,
    subtitle: row.subtitle ?? (typeof body.subtitle === "string" ? body.subtitle : undefined),
    excerpt: row.excerpt ?? (typeof body.excerpt === "string" ? body.excerpt : row.subtitle ?? ""),
    coverImage: row.cover_image ?? (typeof body.coverImage === "string" ? body.coverImage : ""),
    category: row.category ?? (typeof body.category === "string" ? body.category : "Journal"),
    readTime: row.read_time ?? (typeof body.readTime === "string" ? body.readTime : ""),
    publishedAt: row.published_at ?? (typeof body.publishedAt === "string" ? body.publishedAt : ""),
    featured: row.is_featured ?? Boolean(body.featured),
    tags: stringArray(row.tags ?? body.tags),
    keyTakeaways: stringArray(row.key_takeaways ?? body.keyTakeaways),
    content: row.content ?? (typeof body.content === "string" ? body.content : undefined),
    author: {
      name: row.author_name ?? (typeof author.name === "string" ? author.name : "Liyana Naturals"),
      role: row.author_role ?? (typeof author.role === "string" ? author.role : undefined),
      bio: row.author_bio ?? (typeof author.bio === "string" ? author.bio : undefined),
      avatar: typeof author.avatar === "string" ? author.avatar : undefined,
    },
  } as BlogPost;
}

export async function getStorefrontProducts(): Promise<Product[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, categories(name,slug), product_variants(id,name,price,original_price,stock_quantity,sort_order)")
    .eq("is_active", true)
    .order("created_at", { ascending: false });
  if (error) throw new Error(`Storefront products could not be loaded: ${error.message}`);
  return (data as StoreProductRow[] | null ?? []).map(mapProduct);
}

export async function getStorefrontCategories(): Promise<ProductCategory[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id,name,slug,description,image_url,is_featured")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });
  if (error) throw new Error(`Storefront categories could not be loaded: ${error.message}`);

  return (data as StoreCategoryRow[] | null ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description ?? "",
    image: row.image_url ?? "",
    isFeatured: row.is_featured,
  }));
}

export async function getStorefrontBanners(): Promise<StorefrontBanner[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("homepage_banners")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  if (error) throw new Error(`Homepage banners could not be loaded: ${error.message}`);
  return ((data as StorefrontBanner[] | null) ?? []).map((banner) => ({
    ...banner,
    image_url: renderableImageUrl(banner.image_url),
    desktop_image_url: renderableImageUrl(banner.desktop_image_url),
    mobile_image_url: renderableImageUrl(banner.mobile_image_url),
  }));
}

export async function getStorefrontReviews(productId?: string): Promise<StorefrontReview[]> {
  const supabase = await createSupabaseServerClient();
  let query = supabase
    .from("reviews")
    // Every column, so reviews still load before the show_on_home column exists.
    .select("*,products(name)")
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
      showOnHome: row.show_on_home !== false,
    };
  });
}

export async function getStorefrontBlogs(): Promise<BlogPost[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("site_content")
    .select("section_key,title,subtitle,body,is_published,slug,excerpt,category,read_time,published_at,cover_image,tags,key_takeaways,content,author_name,author_role,author_bio,is_featured")
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

export type PageLink = { slug: PageSlug; title: string };

/** The published text pages, in footer order. Never breaks the rest of the website. */
export async function getPublishedPages(): Promise<PageLink[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("site_content")
    .select("section_key,title,body")
    .like("section_key", "page:%")
    // A signed-in admin can read hidden pages too, so ask for published ones.
    .eq("is_published", true);
  if (error) {
    console.error("[storefront] Pages could not be loaded:", error.message);
    return [];
  }
  return CONTENT_PAGES.flatMap(({ slug, name }) => {
    const row = data?.find((item) => item.section_key === pageKey(slug));
    return row && pageContent(row.body) ? [{ slug, title: row.title || name }] : [];
  });
}

export async function getContentPage(slug: PageSlug) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("site_content")
    .select("title,body,updated_at")
    .eq("section_key", pageKey(slug))
    .eq("is_published", true)
    .maybeSingle();
  if (error) throw new Error(`Page could not be loaded: ${error.message}`);
  const content = pageContent(data?.body);
  return data && content ? { title: data.title as string | null, content, updatedAt: data.updated_at as string } : null;
}

export async function getStorefrontSettings(): Promise<StorefrontSettings | null> {
  const supabase = await createSupabaseServerClient();
  const [{ data: settings, error: settingsError }, { data: content, error: contentError }] = await Promise.all([
    supabase
      .from("store_settings")
      // Every column of this table is public.
      .select("*")
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
