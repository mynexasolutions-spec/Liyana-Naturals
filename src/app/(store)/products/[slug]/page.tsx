import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetailClient } from "@/components/products/ProductDetailClient";
import { getStorefrontProducts, getStorefrontReviews } from "@/lib/supabase/storefront";

export const dynamic = "force-dynamic";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return [];
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

  return {
    title: product.name,
    description: product.shortDescription || product.description,
    openGraph: {
      title: `${product.name} | Liyana Naturals`,
      description: product.shortDescription || product.description,
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

  const [initialReviews, relatedProducts] = await Promise.all([
    getStorefrontReviews(product.id),
    Promise.resolve(products.filter((item) => item.slug !== product.slug).slice(0, 3)),
  ]);

  return (
    <ProductDetailClient
      product={product}
      relatedProducts={relatedProducts}
      initialReviews={initialReviews}
    />
  );
}
