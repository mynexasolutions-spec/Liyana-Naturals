"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Check, Heart, ShoppingCart, Star, Trash2 } from "lucide-react";
import { Product } from "@/types";
import { useStore } from "@/context/StoreContext";
import { cn } from "@/lib/utils";

interface StoreProductCardProps {
  product: Product;
  viewMode?: "grid" | "list";
  actionMode?: "wishlist" | "remove";
  className?: string;
  dataProductCard?: boolean;
}

function getBadgeStyle(badge?: Product["badge"]) {
  switch (badge) {
    case "Best Seller":
      return "bg-[#263D18] text-[#FBF7EE]";
    case "New":
      return "bg-[#536B35] text-white";
    case "Sale":
      return "bg-[#C2652B] text-white";
    case "Organic":
      return "bg-[#43682B] text-white";
    default:
      return "bg-[#263D18] text-white";
  }
}

export function StoreProductCard({
  product,
  viewMode = "grid",
  actionMode = "wishlist",
  className,
  dataProductCard = false,
}: StoreProductCardProps) {
  const {
    addToCart,
    getCartItemQty,
    isInWishlist,
    toggleWishlist,
    removeFromWishlist,
  } = useStore();
  const [justAdded, setJustAdded] = useState(false);

  const isWishlisted = isInWishlist(product.id);
  const cartQty = getCartItemQty(product.id);

  const discountPct = product.originalPrice
    ? Math.round(
        ((product.originalPrice - product.price) / product.originalPrice) * 100
      )
    : 0;

  const filledStars = Math.round(product.rating);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product.id, 1);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (actionMode === "remove") {
      removeFromWishlist(product.id);
    } else {
      toggleWishlist(product.id);
    }
  };

  return (
    <article
      {...(dataProductCard ? { "data-product-card": true } : {})}
      className={cn(
        "group bg-white rounded-[5px] border border-[#28321F]/10 shadow-[0_2px_12px_rgba(40,50,31,0.05)] hover:shadow-[0_10px_28px_rgba(40,50,31,0.11)] hover:border-[#536B35]/30 transition-all duration-300 overflow-hidden flex",
        viewMode === "grid"
          ? "flex-col p-2.5 sm:p-4"
          : "flex-col sm:flex-row p-3 sm:p-4 gap-3.5 sm:gap-5 items-start sm:items-center",
        className
      )}
    >
      {/* Product Image Box (Compact 4:3 height, object-contain prevents any cropping) */}
      <div
        className={cn(
          "relative rounded-[5px] overflow-hidden bg-white border border-[#28321F]/8 shrink-0",
          viewMode === "grid"
            ? "w-full aspect-[4/3] mb-2 sm:mb-3"
            : "w-full max-w-[360px] mx-auto sm:mx-0 sm:w-52 md:w-60 aspect-[4/3]"
        )}
      >
        {/* Top-Left Badge */}
        {product.badge && (
          <span
            className={cn(
              "absolute top-1.5 left-1.5 sm:top-2.5 sm:left-2.5 z-10 text-[9.5px] sm:text-[11px] font-semibold px-1.5 sm:px-2.5 py-0.5 rounded-[5px] shadow-2xs",
              getBadgeStyle(product.badge)
            )}
          >
            {product.badge}
          </span>
        )}

        {/* Top-Right Action Button (Wishlist Heart OR Delete Icon on Wishlist Page) */}
        {actionMode === "remove" ? (
          <button
            type="button"
            onClick={handleWishlist}
            aria-label={`Delete ${product.name} from wishlist`}
            title="Remove from Wishlist"
            className="absolute top-1.5 right-1.5 sm:top-2.5 sm:right-2.5 z-10 w-7 h-7 sm:w-8 sm:h-8 rounded-[5px] border bg-white/95 hover:bg-[#FFF5F2] border-[#28321F]/12 hover:border-[#C2652B]/40 text-[#C2652B] flex items-center justify-center shadow-2xs transition-all duration-200 active:scale-90 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleWishlist}
            aria-label={
              isWishlisted
                ? `Remove ${product.name} from wishlist`
                : `Add ${product.name} to wishlist`
            }
            aria-pressed={isWishlisted}
            className={cn(
              "absolute top-1.5 right-1.5 sm:top-2.5 sm:right-2.5 z-10 w-7 h-7 sm:w-8 sm:h-8 rounded-[5px] border flex items-center justify-center shadow-2xs transition-all duration-200 active:scale-90 cursor-pointer",
              isWishlisted
                ? "bg-[#FFF5F2] border-[#C2652B]/35"
                : "bg-white/95 hover:bg-white border-[#28321F]/10"
            )}
          >
            <Heart
              className={cn(
                "w-3.5 h-3.5 sm:w-4 sm:h-4 transition-all duration-200",
                isWishlisted
                  ? "fill-[#C2652B] text-[#C2652B] scale-110"
                  : "text-[#28321F]"
              )}
            />
          </button>
        )}

        {/* Bottom-Left Discount Badge (Inside Image matching Top-Left Badge) */}
        {discountPct > 0 && (
          <span className="absolute bottom-1.5 left-1.5 sm:bottom-2.5 sm:left-2.5 z-10 px-1.5 sm:px-2 py-0.5 rounded-[5px] bg-[#EAF1DF]/95 backdrop-blur-xs text-[#263D18] text-[9.5px] sm:text-[11px] font-bold shadow-2xs border border-[#A8B88A]/40">
            {discountPct}% Off
          </span>
        )}

        <Link
          href={`/products/${product.slug}`}
          className="absolute inset-0 block"
        >
          <Image
            src={product.images[0]?.src || "/images/products/Fresh_Green.webp"}
            alt={product.images[0]?.alt || product.name}
            fill
            sizes={
              viewMode === "list"
                ? "(min-width: 768px) 240px, (min-width: 640px) 208px, 100vw"
                : "(min-width: 1280px) 22vw, (min-width: 640px) 45vw, 50vw"
            }
            className="object-contain object-center group-hover:scale-105 transition-transform duration-500 ease-out"
            unoptimized
          />
        </Link>
      </div>

      {/* Product Details */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex flex-wrap items-center justify-between gap-1 sm:gap-2 mb-1 sm:mb-1.5">
          <span className="text-[9.5px] sm:text-[11px] font-semibold uppercase tracking-wider text-[#536B35] truncate">
            {product.category}
          </span>

          {/* Star Rating (Responsive spacing for 2-col mobile) */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 text-xs">
            <div
              className="flex items-center gap-0.5 sm:gap-1"
              aria-label={`${product.rating} out of 5 stars`}
            >
              {[...Array(5)].map((_, idx) => (
                <Star
                  key={idx}
                  className={cn(
                    "w-2.5 h-2.5 sm:w-3.5 sm:h-3.5",
                    idx < filledStars
                      ? "fill-[#E5A83B] text-[#E5A83B]"
                      : "fill-transparent text-[#28321F]/25"
                  )}
                />
              ))}
            </div>
            <span className="text-[10px] sm:text-xs text-[#777968] font-medium">
              ({product.reviewCount})
            </span>
          </div>
        </div>

        <h3 className="font-sans text-[13px] sm:text-[17px] font-bold text-[#28321F] group-hover:text-[#263D18] transition-colors leading-snug line-clamp-1">
          <Link href={`/products/${product.slug}`}>{product.name}</Link>
        </h3>

        <p className="font-sans text-[11px] sm:text-[13px] text-[#777968] mt-0.5 sm:mt-1 mb-2 sm:mb-3 line-clamp-1">
          {product.tagline || product.shortDescription}
        </p>

        {viewMode === "list" && (
          <p className="font-sans text-xs sm:text-sm text-[#555C4A] leading-relaxed mb-3 line-clamp-2">
            {product.description}
          </p>
        )}

        {/* Price Row */}
        <div className="flex items-center gap-1.5 sm:gap-2 mb-2.5 sm:mb-3.5 mt-auto">
          <span className="font-sans text-[16px] sm:text-[22px] font-bold text-[#263D18]">
            ₹{product.price}
          </span>
          {product.originalPrice && (
            <span className="font-sans text-[12px] sm:text-[16px] text-[#777968]/80 line-through">
              ₹{product.originalPrice}
            </span>
          )}
        </div>

        {/* Add to Cart Button */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleAdd}
            aria-label={`Add ${product.name} to cart`}
            className={cn(
              "w-full py-2 sm:py-2.5 px-2 sm:px-4 rounded-[5px] text-[11px] sm:text-sm font-semibold inline-flex items-center justify-center gap-1.5 sm:gap-2 transition-all duration-200 active:scale-[0.98] cursor-pointer whitespace-nowrap",
              justAdded
                ? "bg-[#3C6E26] text-white"
                : cartQty > 0
                ? "bg-[#536B35] hover:bg-[#263D18] text-white"
                : "bg-[#263D18] hover:bg-[#1D3214] text-[#FBF7EE]"
            )}
          >
            {justAdded ? (
              <>
                <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5] shrink-0" />
                <span>Added! ({cartQty})</span>
              </>
            ) : cartQty > 0 ? (
              <>
                <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                <span className="sm:hidden">In Cart ({cartQty})</span>
                <span className="hidden sm:inline">
                  In Cart ({cartQty}) • Add More
                </span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                <span>Add to Cart</span>
              </>
            )}
          </button>

          {viewMode === "list" && (
            <Link
              href={`/products/${product.slug}`}
              className="shrink-0 py-2.5 px-4 rounded-[5px] border border-[#263D18]/25 hover:border-[#263D18] text-[#263D18] text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap"
            >
              Details
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
