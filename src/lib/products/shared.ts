// Product shapes used by the admin product pages, on the server and in the browser.

export type AdminVariant = {
  id: string;
  name: string;
  price: number | string;
  original_price: number | string | null;
  stock_quantity: number;
  sort_order: number;
};

export type AdminProduct = {
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
  badge: string | null;
  is_featured: boolean;
  is_best_seller: boolean;
  is_active: boolean;
  ingredients: unknown;
  benefits: unknown;
  how_to_use: string | null;
  images: unknown;
  seo_title: string | null;
  seo_description: string | null;
  faqs: unknown;
  highlights: unknown;
  tags: unknown;
  product_variants: AdminVariant[] | null;
};

export const PRODUCT_COLUMNS =
  "id,category_id,name,slug,tagline,description,short_description,price,original_price,stock_quantity,badge,is_featured,is_best_seller,is_active,ingredients,benefits,how_to_use,images,seo_title,seo_description,faqs,highlights,tags,product_variants(id,name,price,original_price,stock_quantity,sort_order)";

export type CategoryOption = { id: string; name: string; is_active: boolean };
export type ProductImage = { src: string; url?: string; alt?: string; fileId?: string; size?: string };

/** A product's sizes in the order the admin arranged them. */
export const sortedVariants = (product: AdminProduct | null) =>
  [...(product?.product_variants ?? [])].sort((a, b) => a.sort_order - b.sort_order);

/** A stored list, which older rows keep as JSON text. */
export function asList(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  if (typeof value !== "string" || !value.trim()) return [];
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function toImages(value: unknown): ProductImage[] {
  return asList(value).flatMap((item) => {
    if (typeof item === "string") return item.trim() ? [{ src: item }] : [];
    if (!item || typeof item !== "object") return [];
    const record = item as Record<string, unknown>;
    const text = (key: string) => (typeof record[key] === "string" && record[key] ? (record[key] as string) : undefined);
    const src = text("src") ?? text("url");
    if (!src) return [];
    return [{ src, url: text("url"), alt: text("alt")?.slice(0, 240), fileId: text("fileId"), size: text("size") }];
  });
}

export const imageFileIds = (images: ProductImage[]) => images.flatMap((image) => (image.fileId ? [image.fileId] : []));
