import fs from "node:fs/promises";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import ImageKit from "imagekit";
import { products } from "../src/data/products.ts";
import { categories } from "../src/data/categories.ts";
import { blogPosts } from "../src/data/blog.ts";
import { testimonials } from "../src/data/testimonials.ts";

type Env = Record<string, string>;

function readEnv(raw: string): Env {
  return Object.fromEntries(
    raw
      .split(/\r?\n/)
      .map((line) => line.match(/^([^#=]+)=(.*)$/))
      .filter((match): match is RegExpMatchArray => Boolean(match))
      .map((match) => [match[1].trim(), match[2].trim().replace(/^['"]|['"]$/g, "")]),
  );
}

async function requireConfiguration(): Promise<Env> {
  const env = readEnv(await fs.readFile(".env", "utf8"));
  const required = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    "Email",
    "Password",
    "NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY",
    "IMAGEKIT_PRIVATE_KEY",
    "NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT",
  ];
  const missing = required.filter((key) => !env[key]);
  if (missing.length > 0) throw new Error(`Missing .env values: ${missing.join(", ")}`);
  return env;
}

async function main(): Promise<void> {
  const env = await requireConfiguration();
  const supabase = createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: env.Email,
    password: env.Password,
  });
  if (authError || !authData.session || !authData.user) {
    throw new Error(authError?.message ?? "The configured admin account could not sign in.");
  }

  const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, {
    global: { headers: { Authorization: `Bearer ${authData.session.access_token}` } },
  });
  const imagekit = new ImageKit({
    publicKey: env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY,
    privateKey: env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT,
  });

  const fileCache = new Map<string, { fileId: string; url: string; thumbnailUrl?: string }>();
  for (const folder of ["/liyana-naturals/products", "/liyana-naturals/categories", "/liyana-naturals/blog", "/liyana-naturals/banners"]) {
    const files = await imagekit.listFiles({ path: folder, limit: 1000 });
    for (const file of files) {
      if (file.name && file.fileId && file.url) {
        fileCache.set(`${folder}/${file.name}`, {
          fileId: file.fileId,
          url: file.url,
          thumbnailUrl: file.thumbnailUrl,
        });
      }
    }
  }

  async function imageAsset(source: string, folder: string, fileName: string, alt: string) {
    const cacheKey = `${folder}/${fileName}`;
    let asset = fileCache.get(cacheKey);
    if (!asset) {
      const file = await fs.readFile(path.join(process.cwd(), "public", source.replace(/^\//, "")));
      const uploaded = await imagekit.upload({
        file,
        fileName,
        folder,
        useUniqueFileName: false,
        overwriteFile: false,
      });
      asset = { fileId: uploaded.fileId, url: uploaded.url, thumbnailUrl: uploaded.thumbnailUrl };
      fileCache.set(cacheKey, asset);
    }

    const { data: existingAsset, error: assetLookupError } = await admin
      .from("media_assets")
      .select("id")
      .eq("imagekit_file_id", asset.fileId)
      .maybeSingle();
    if (assetLookupError) throw new Error(`Media lookup failed: ${assetLookupError.message}`);
    if (!existingAsset) {
      const { error: assetInsertError } = await admin.from("media_assets").insert({
        imagekit_file_id: asset.fileId,
        name: fileName,
        url: asset.url,
        thumbnail_url: asset.thumbnailUrl ?? null,
        mime: path.extname(fileName).replace(".", "image/"),
        folder,
        created_by: authData.user.id,
      });
      if (assetInsertError) throw new Error(`Media metadata failed: ${assetInsertError.message}`);
    }

    return { ...asset, src: asset.url, alt };
  }

  const categoryAssets = new Map<string, Awaited<ReturnType<typeof imageAsset>>>();
  for (const category of categories) {
    categoryAssets.set(
      category.slug,
      await imageAsset(
        category.image,
        "/liyana-naturals/categories",
        `${category.slug}${path.extname(category.image)}`,
        category.name,
      ),
    );
  }

  const { error: categoryError } = await admin.from("categories").upsert(
    categories.map((category, index) => {
      const asset = categoryAssets.get(category.slug)!;
      return {
        name: category.name,
        slug: category.slug,
        description: category.description,
        image_url: asset.url,
        image_file_id: asset.fileId,
        is_active: true,
        is_featured: true,
        sort_order: index,
      };
    }),
    { onConflict: "slug" },
  );
  if (categoryError) throw new Error(`Category seed failed: ${categoryError.message}`);

  const { data: categoryRows, error: categoryLookupError } = await admin
    .from("categories")
    .select("id,slug");
  if (categoryLookupError) throw new Error(`Category lookup failed: ${categoryLookupError.message}`);
  const categoryIds = new Map((categoryRows ?? []).map((row) => [row.slug, row.id]));

  const productRows = [];
  for (const product of products) {
    const imageAssets = [];
    for (const [index, image] of product.images.entries()) {
      imageAssets.push(
        await imageAsset(
          image.src,
          "/liyana-naturals/products",
          `${product.slug}-${index + 1}${path.extname(image.src)}`,
          image.alt,
        ),
      );
    }
    productRows.push({
      category_id: categoryIds.get(product.categorySlug) ?? null,
      name: product.name,
      slug: product.slug,
      tagline: product.tagline ?? null,
      description: product.description,
      short_description: product.shortDescription ?? null,
      price: product.price,
      original_price: product.originalPrice ?? null,
      // The source catalog exposes availability, not a numeric quantity. Ten is a
      // conservative starting balance that keeps existing in-stock products purchasable.
      stock_quantity: product.inStock ? 10 : 0,
      rating: product.rating,
      review_count: product.reviewCount,
      badge: product.badge ?? null,
      is_featured: product.isFeatured ?? false,
      is_best_seller: product.isBestSeller ?? false,
      is_active: true,
      volume: product.volume ?? null,
      ingredients: product.ingredients ?? [],
      benefits: product.benefits ?? [],
      how_to_use: product.howToUse ?? null,
      images: imageAssets,
    });
  }
  const { error: productError } = await admin.from("products").upsert(productRows, { onConflict: "slug" });
  if (productError) throw new Error(`Product seed failed: ${productError.message}`);

  const { data: productRowsByName, error: productLookupError } = await admin
    .from("products")
    .select("id,name");
  if (productLookupError) throw new Error(`Product lookup failed: ${productLookupError.message}`);
  const productIds = new Map((productRowsByName ?? []).map((row) => [row.name, row.id]));

  const { data: existingReviews, error: reviewLookupError } = await admin
    .from("reviews")
    .select("author_name,body");
  if (reviewLookupError) throw new Error(`Review lookup failed: ${reviewLookupError.message}`);
  const existingReviewKeys = new Set((existingReviews ?? []).map((review) => `${review.author_name}:${review.body}`));
  const reviewRows = testimonials
    .filter((testimonial) => !existingReviewKeys.has(`${testimonial.author}:${testimonial.quote}`))
    .map((testimonial) => ({
      product_id: productIds.get(testimonial.productName ?? "") ?? null,
      author_name: testimonial.author,
      rating: testimonial.rating,
      title: null,
      body: testimonial.quote,
      status: "approved",
    }));
  if (reviewRows.length > 0) {
    const { error: reviewError } = await admin.from("reviews").insert(reviewRows);
    if (reviewError) throw new Error(`Review seed failed: ${reviewError.message}`);
  }

  const { data: approvedReviews, error: approvedReviewError } = await admin
    .from("reviews")
    .select("product_id,rating")
    .eq("status", "approved")
    .not("product_id", "is", null);
  if (approvedReviewError) throw new Error(`Review statistics failed: ${approvedReviewError.message}`);
  const reviewStats = new Map<string, number[]>();
  for (const review of approvedReviews ?? []) {
    const values = reviewStats.get(review.product_id) ?? [];
    values.push(Number(review.rating));
    reviewStats.set(review.product_id, values);
  }
  for (const [productId, ratings] of reviewStats) {
    const { error: statsError } = await admin
      .from("products")
      .update({
        review_count: ratings.length,
        rating: Math.round((ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length) * 10) / 10,
      })
      .eq("id", productId);
    if (statsError) throw new Error(`Product review statistics failed: ${statsError.message}`);
  }

  const { error: settingsError } = await admin.from("store_settings").upsert({
    id: true,
    store_name: "Liyana Naturals",
    support_email: "info@liyananaturals.com",
    support_phone: "+91 91069 72400",
    address: "Udgir, Maharashtra, India",
    currency: "INR",
    timezone: "Asia/Kolkata",
    announcement_enabled: true,
    announcement_text: "Free Shipping on orders above ₹999",
    shipping_fee: 60,
    free_shipping_threshold: 999,
    tax_percent: 0,
  }, { onConflict: "id" });
  if (settingsError) throw new Error(`Settings seed failed: ${settingsError.message}`);

  const heroAsset = await imageAsset(
    "/images/hero/Liyana_hero_dextop.png",
    "/liyana-naturals/banners",
    "hero-desktop.png",
    "Liyana Naturals botanical collection",
  );
  const { data: existingBanner, error: bannerLookupError } = await admin
    .from("homepage_banners")
    .select("id")
    .eq("title", "Glow Naturally, Live Beautifully")
    .maybeSingle();
  if (bannerLookupError) throw new Error(`Banner lookup failed: ${bannerLookupError.message}`);
  const banner = {
    title: "Glow Naturally, Live Beautifully",
    subtitle: "Pure. Gentle. Effective cosmetics for healthy skin & hair.",
    image_url: heroAsset.url,
    image_file_id: heroAsset.fileId,
    link_url: "/shop",
    is_active: true,
    sort_order: 0,
  };
  const bannerMutation = existingBanner
    ? admin.from("homepage_banners").update(banner).eq("id", existingBanner.id)
    : admin.from("homepage_banners").insert(banner);
  const { error: bannerError } = await bannerMutation;
  if (bannerError) throw new Error(`Banner seed failed: ${bannerError.message}`);

  const seededBlogPosts = [];
  for (const post of blogPosts) {
    const asset = await imageAsset(
      post.coverImage,
      "/liyana-naturals/blog",
      `${post.slug}${path.extname(post.coverImage)}`,
      post.title,
    );
    seededBlogPosts.push({
      ...post,
      coverImage: asset.url,
      coverImageFileId: asset.fileId,
    });
  }

  const contentRows = [
    {
      section_key: "homepage:configuration",
      title: "Homepage configuration",
      subtitle: "Controls which database records appear on the homepage.",
      body: {
        featuredCategorySlugs: categories.map((category) => category.slug),
        bestSellerProductSlugs: products.filter((product) => product.isBestSeller).map((product) => product.slug),
        featuredProductSlugs: products.filter((product) => product.isFeatured).map((product) => product.slug),
        featuredBlogSlugs: seededBlogPosts.filter((post) => post.featured).map((post) => post.slug),
      },
      is_published: true,
    },
    {
      section_key: "store:settings",
      title: "Store settings",
      subtitle: "Global branding, contact, social, policy, and SEO settings.",
      body: {
        tagline: "Pure, Organic, Botanically Crafted Skincare",
        description: "Discover natural skincare, haircare and beauty products with Liyana Naturals.",
        websiteUrl: "https://liyananaturals.com",
        social: {
          instagram: "https://instagram.com/liyananaturals",
          facebook: "https://facebook.com/liyananaturals",
          pinterest: "https://pinterest.com/liyananaturals",
          youtube: "https://youtube.com/@liyananaturals",
        },
        policies: {
          shipping: "Free shipping on orders above ₹999.",
          returns: "Contact support for return and replacement assistance.",
        },
        seo: {
          title: "Liyana Naturals | Natural Beauty & Skincare",
          description: "Pure botanical skincare and haircare essentials.",
        },
      },
      is_published: true,
    },
    ...seededBlogPosts.map((post) => ({
      section_key: `blog:${post.slug}`,
      title: post.title,
      subtitle: post.subtitle ?? null,
      body: post,
      slug: post.slug,
      excerpt: post.excerpt,
      category: post.category,
      read_time: post.readTime,
      published_at: post.publishedAt,
      cover_image: post.coverImage,
      cover_image_file_id: post.coverImageFileId,
      tags: post.tags ?? [],
      key_takeaways: post.keyTakeaways ?? [],
      content: post.content ?? null,
      author_name: post.author.name,
      author_role: post.author.role ?? null,
      author_bio: post.author.bio ?? null,
      is_featured: post.featured ?? false,
      is_published: true,
    })),
  ];
  const { error: contentError } = await admin.from("site_content").upsert(contentRows, { onConflict: "section_key" });
  if (contentError) throw new Error(`Content seed failed: ${contentError.message}`);

  console.log(JSON.stringify({
    ok: true,
    seeded: {
      categories: categories.length,
      products: products.length,
      reviews: reviewRows.length,
      banners: 1,
      content: contentRows.length,
      imageKitFolder: "/liyana-naturals",
    },
  }, null, 2));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error instanceof Error ? error.message : "Seed failed.");
    process.exit(1);
  });
