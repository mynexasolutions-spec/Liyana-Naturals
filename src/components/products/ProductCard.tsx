import React from "react";
import Link from "next/link";
import { Star, ShoppingBag } from "lucide-react";
import { Product } from "@/types";
import { ProductBadge } from "./ProductBadge";
import { formatPrice } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <div className="group relative bg-white rounded-2xl overflow-hidden shadow-card hover:shadow-elevated transition-all duration-300 flex flex-col border border-[#28321F]/5">
      {/* Product Image Stage */}
      <div className="relative aspect-square w-full bg-[#E9DCC5]/25 flex items-center justify-center p-6 overflow-hidden">
        {product.badge && (
          <div className="absolute top-3 left-3 z-10">
            <ProductBadge type={product.badge} />
          </div>
        )}

        {/* Fallback elegant botanical visual representation */}
        <div className="w-full h-full flex flex-col items-center justify-center text-center p-4 rounded-xl bg-gradient-to-b from-[#FBF7EE] to-[#E9DCC5]/40 transition-transform duration-500 group-hover:scale-105">
          <span className="font-heading text-xl text-[#263D18] mb-1">
            {product.name}
          </span>
          <span className="text-xs text-[#777968]">
            Natural Botanical
          </span>
        </div>

        {/* Quick Add Button Overlay */}
        <button
          type="button"
          aria-label={`Add ${product.name} to cart`}
          className="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-[#263D18] text-white flex items-center justify-center opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 shadow-md hover:bg-[#1D3214]"
        >
          <ShoppingBag className="w-4 h-4" />
        </button>
      </div>

      {/* Product Info */}
      <div className="p-5 flex-1 flex flex-col">
        <span className="text-xs text-[#536B35] font-medium tracking-wide uppercase mb-1">
          {product.category}
        </span>

        <h3 className="font-sans text-base font-semibold text-[#28321F] group-hover:text-[#263D18] transition-colors mb-2 line-clamp-1">
          <Link href={`/products/${product.slug}`}>
            <span aria-hidden="true" className="absolute inset-0" />
            {product.name}
          </Link>
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1.5 mb-3 text-xs text-[#777968]">
          <div className="flex items-center text-amber-600">
            <Star className="w-3.5 h-3.5 fill-current" />
          </div>
          <span className="font-medium text-[#28321F]">{product.rating}</span>
          <span>({product.reviewCount})</span>
        </div>

        {/* Pricing */}
        <div className="mt-auto flex items-center justify-between pt-2 border-t border-[#28321F]/5">
          <div className="flex items-baseline gap-2">
            <span className="text-base font-bold text-[#263D18]">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && (
              <span className="text-xs line-through text-[#777968]">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>
          <span className="text-xs text-[#536B35] font-medium">In Stock</span>
        </div>
      </div>
    </div>
  );
}
