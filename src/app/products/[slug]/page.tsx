import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { products } from "@/data/products";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = products.find((p) => p.slug === slug);

  if (!product) {
    return {
      title: "Product Details",
      description: "Discover organic beauty products by Liyana Naturals.",
    };
  }

  return {
    title: `${product.name} | Liyana Naturals`,
    description: product.shortDescription || product.description,
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = products.find((p) => p.slug === slug);

  return (
    <div className="min-h-screen bg-[#FBF7EE] py-16 px-6">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 text-sm text-[#536B35] hover:text-[#263D18] mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Shop
        </Link>
        <div className="bg-white rounded-2xl p-8 shadow-card border border-[#28321F]/10">
          <span className="text-xs uppercase tracking-widest text-[#536B35] font-semibold block mb-2">
            {product?.category || "Natural Botanical"}
          </span>
          <h1 className="font-heading text-3xl sm:text-4xl text-[#263D18] mb-4">
            {product?.name || `Product: ${slug}`}
          </h1>
          <p className="text-[#777968] leading-relaxed max-w-xl">
            {product?.description || "Detailed product information and botanical formulations will appear here."}
          </p>
        </div>
      </div>
    </div>
  );
}
