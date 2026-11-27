import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetailClient } from "@/components/products/ProductDetailClient";
import { siteConfig } from "@/config/site";
import { toBadges } from "@/lib/content/badges";
import { getStorefrontProducts, getStorefrontReviews, getStorefrontSettings } from "@/lib/supabase/storefront";
import type { Product } from "@/types";

export const dynamic = "force-dynamic";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return [];
}

// Search results show about this much of a description.
const summary = (product: Product) =>
  (product.seoDescription || product.shortDescription || product.description).slice(0, 170);

/** Product details in the format search engines read. */
function structuredData(product: Product) {
  const url = `${siteConfig.url}/products/${product.slug}`;
  const sizes = product.variants?.length ? product.variants : [product];
  const prices = sizes.map((size) => size.price);
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: summary(product),
    image: product.images.map((image) => new URL(image.src, siteConfig.url).href),
    brand: { "@type": "Brand", name: siteConfig.name },
    category: product.category,
    offers: {
      "@type": "AggregateOffer",
      url,
      priceCurrency: "INR",
      lowPrice: Math.min(...prices),
      highPrice: Math.max(...prices),
      offerCount: sizes.length,
      availability: `https://schema.org/${product.inStock ? "InStock" : "OutOfStock"}`,
    },
    ...(product.reviewCount > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: product.rating,
            reviewCount: product.reviewCount,
          },
        }
      : {}),
  };
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const products = await getStorefrontProducts();
  const product = products.find((p) => p.slug === slug);

  if (!product) {
    return {
      title: "Product Not Found",
      description: "Discover organic beauty products by Liyana Naturals.",
    };
  }

  const description = summary(product);
  return {
    // A title written for search engines is used exactly as typed.
    title: product.seoTitle ? { absolute: product.seoTitle } : product.name,
    description,
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: {
      title: product.seoTitle || `${product.name} | Liyana Naturals`,
      description,
      images: product.images[0]?.src
        ? [{ url: product.images[0].src, alt: product.name }]
        : undefined,
    },
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const products = await getStorefrontProducts();
  const product = products.find((p) => p.slug === slug);

  if (!product) {
    notFound();
  }

  const [initialReviews, settings] = await Promise.all([
    getStorefrontReviews(product.id),
    getStorefrontSettings(),
  ]);
  // Products from the same category come first; others fill any space left.
  const relatedProducts = products
    .filter((item) => item.slug !== product.slug)
    .sort((a, b) => Number(b.categorySlug === product.categorySlug) - Number(a.categorySlug === product.categorySlug))
    .slice(0, 3);

  return (
    <>
      <script
        type="application/ld+json"
        // "<" is escaped so product text can never close the script tag.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData(product)).replace(/</g, "\\u003c") }}
      />
      <ProductDetailClient
        product={product}
        relatedProducts={relatedProducts}
        initialReviews={initialReviews}
        storeBadges={toBadges(settings?.product_badges)}
      />
    </>
  );
}
