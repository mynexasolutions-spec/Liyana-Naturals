import fs from "node:fs/promises";
import { createClient } from "@supabase/supabase-js";

function readEnv(raw: string): Record<string, string> {
  return Object.fromEntries(
    raw
      .split(/\r?\n/)
      .map((line) => line.match(/^([^#=]+)=(.*)$/))
      .filter((match): match is RegExpMatchArray => Boolean(match))
      .map((match) => [match[1].trim(), match[2].trim().replace(/^['\"]|['\"]$/g, "")]),
  );
}

const env = readEnv(await fs.readFile(".env", "utf8"));
const client = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
const auth = await client.auth.signInWithPassword({ email: env.Email, password: env.Password });
if (auth.error || !auth.data.session) throw new Error(auth.error?.message ?? "Admin sign-in failed.");

const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, {
  global: { headers: { Authorization: `Bearer ${auth.data.session.access_token}` } },
});

const tables = [
  "profiles",
  "customers",
  "inquiries",
  "categories",
  "products",
  "reviews",
  "homepage_banners",
  "site_content",
  "store_settings",
  "media_assets",
] as const;
const result: Record<string, unknown> = {};
for (const table of tables) {
  const query = await admin.from(table).select("id", { count: "exact", head: true });
  result[table] = { count: query.count, error: query.error?.message ?? null };
}

const blogs = await admin
  .from("site_content")
  .select("section_key,body,slug,excerpt,cover_image,cover_image_file_id,is_featured,is_published")
  .like("section_key", "blog:%");
result.blogs = {
  count: blogs.data?.length ?? 0,
  allHaveTypedMetadata: (blogs.data ?? []).every(
    (row) => typeof row.slug === "string" && typeof row.excerpt === "string" && typeof row.cover_image === "string",
  ),
  allHaveImageFileIds: (blogs.data ?? []).every(
    (row) => typeof row.cover_image_file_id === "string" && row.cover_image_file_id.length > 0,
  ),
  featuredPublished: (blogs.data ?? []).filter((row) => row.is_featured && row.is_published).length,
};

const products = await admin.from("products").select("slug,images");
const productImages = (products.data ?? []).flatMap((product) =>
  Array.isArray(product.images) ? product.images : [],
);
result.productImages = {
  products: products.data?.length ?? 0,
  withImages: (products.data ?? []).filter((product) => Array.isArray(product.images) && product.images.length > 0).length,
  totalImages: productImages.length,
  allImageKit: productImages.every(
    (image) =>
      image &&
      typeof image === "object" &&
      typeof (image as { src?: unknown }).src === "string" &&
      (image as { src: string }).src.includes("imagekit"),
  ),
  allHaveFileIds: productImages.every(
    (image) => image && typeof image === "object" && typeof (image as { fileId?: unknown }).fileId === "string",
  ),
};

const categories = await admin.from("categories").select("slug,image_url,image_file_id");
const configuredCategoryImages = (categories.data ?? []).filter(
  (category) => typeof category.image_url === "string" && category.image_url.trim(),
);
result.categoryImages = {
  categories: categories.data?.length ?? 0,
  withImages: configuredCategoryImages.length,
  allValidUrls: configuredCategoryImages.every(
    (category) => /^https?:\/\//i.test(category.image_url) || category.image_url.startsWith("/"),
  ),
  allImageKit: configuredCategoryImages.every((category) => category.image_url.includes("imagekit")),
  allHaveFileIds: configuredCategoryImages.every((category) => typeof category.image_file_id === "string" && category.image_file_id.length > 0),
};

const banners = await admin
  .from("homepage_banners")
  .select("id,image_url,image_file_id,desktop_image_url,desktop_image_file_id,mobile_image_url,mobile_image_file_id");
const configuredBanners = (banners.data ?? []).filter(
  (banner) => banner && typeof banner === "object",
);
const bannerImageUrls = configuredBanners.flatMap((banner) =>
  [banner.image_url, banner.desktop_image_url, banner.mobile_image_url].filter(
    (url): url is string => typeof url === "string" && url.trim().length > 0,
  ),
);
result.homepageBanners = {
  count: banners.data?.length ?? 0,
  error: banners.error?.message ?? null,
  allValidUrls: bannerImageUrls.every((url) => /^https?:\/\//i.test(url) || url.startsWith("/")),
  allImageKit: bannerImageUrls.every((url) => url.includes("imagekit")),
  allHaveDesktopFileIds: configuredBanners.every(
    (banner) => typeof banner.desktop_image_file_id === "string" && banner.desktop_image_file_id.length > 0,
  ),
  allHaveMobileFileIds: configuredBanners.every(
    (banner) => typeof banner.mobile_image_file_id === "string" && banner.mobile_image_file_id.length > 0,
  ),
};

const customers = await admin.from("customers").select("auth_user_id,email,full_name");
result.customerAuth = {
  customers: customers.data?.length ?? 0,
  linkedToAuth: (customers.data ?? []).filter((customer) => typeof customer.auth_user_id === "string").length,
  allHaveNames: (customers.data ?? []).every(
    (customer) => typeof customer.full_name === "string" && customer.full_name.trim().length > 0,
  ),
  error: customers.error?.message ?? null,
};

console.log(JSON.stringify(result, null, 2));
await client.auth.signOut();
