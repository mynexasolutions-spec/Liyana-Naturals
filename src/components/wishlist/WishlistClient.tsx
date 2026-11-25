"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, Heart, ShoppingBag, Trash2 } from "lucide-react";
import { StoreProductCard } from "@/components/products/StoreProductCard";
import { Container } from "@/components/ui/Container";
import { useStore } from "@/context/StoreContext";

export function WishlistClient() {
  const { wishlistIds, addToCart, removeFromWishlist, catalogProducts } = useStore();
  const [movedAll, setMovedAll] = useState(false);

  const wishlistedProducts = useMemo(
    () => catalogProducts.filter((p) => wishlistIds.includes(p.id)),
    [catalogProducts, wishlistIds]
  );

  const recommendedProducts = useMemo(
    () =>
      catalogProducts
        .filter((p) => !wishlistIds.includes(p.id))
        .slice(0, 3),
    [catalogProducts, wishlistIds]
  );

  const handleMoveAllToCart = () => {
    if (wishlistedProducts.length === 0) return;
    for (const item of wishlistedProducts) {
      addToCart(item.id, 1);
    }
    setMovedAll(true);
    setTimeout(() => setMovedAll(false), 2000);
  };

  const handleClearWishlist = () => {
    for (const id of wishlistIds) {
      removeFromWishlist(id);
    }
  };

  return (
    <section
      className="relative w-full bg-[#FBF7EE] py-6 sm:py-8 md:py-10"
      aria-label="Saved Wishlist Products"
    >
      <section className="max-w-[1350px] mx-auto px-4 sm:px-6 lg:px-8">
        {wishlistedProducts.length > 0 ? (
          <>
            {/* Summary & Bulk Action Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 sm:mb-7 p-4 rounded-[5px] bg-[#EAF1DF]/85 border border-[#A8B88A]/40 shadow-2xs">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-[5px] bg-[#263D18] text-[#FBF7EE] flex items-center justify-center shrink-0">
                  <Heart className="w-4 h-4 fill-[#A8B88A] text-[#A8B88A]" />
                </div>
                <div>
                  <h2 className="font-heading text-xl sm:text-2xl font-bold text-[#263D18] leading-tight">
                    Saved Botanicals ({wishlistedProducts.length})
                  </h2>
                  <p className="font-sans text-xs sm:text-[13px] text-[#555C4A]">
                    Add your favorites to cart or click the trash icon to remove.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleMoveAllToCart}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-[5px] bg-[#263D18] hover:bg-[#1D3214] text-[#FBF7EE] text-xs sm:text-[13px] font-semibold transition-colors active:scale-95 cursor-pointer"
                >
                  {movedAll ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>All Added to Cart!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Add All to Cart</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleClearWishlist}
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-[5px] bg-white hover:bg-[#FFF5F2] border border-[#28321F]/15 hover:border-[#C2652B]/40 text-[#555C4A] hover:text-[#C2652B] text-xs sm:text-[13px] font-medium transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear All</span>
                </button>
              </div>
            </div>

            {/* Wishlist Products Grid (Delete Icon on Each Card, 2-col Mobile) */}
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-4 lg:gap-5">
              {wishlistedProducts.map((product) => (
                <StoreProductCard
                  key={product.id}
                  product={product}
                  actionMode="remove"
                />
              ))}
            </div>
          </>
        ) : (
          /* Empty Wishlist Card (About Us style) */
          <div className="bg-[#EAF1DF]/90 border border-[#A8B88A]/45 rounded-[5px] p-6 sm:p-10 text-center max-w-2xl mx-auto shadow-xs">
            <div className="w-14 h-14 rounded-full bg-[#DCE8D0] border border-[#A8B88A]/40 flex items-center justify-center mx-auto mb-4 text-[#263D18]">
              <Heart className="w-6 h-6 text-[#536B35]" />
            </div>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#263D18] mb-2">
              Your Wishlist is Empty
            </h2>
            <p className="font-sans text-[13px] sm:text-[15px] text-[#555C4A] max-w-md mx-auto mb-5 leading-relaxed">
              Tap the heart icon on any skincare or haircare product to save
              your favorites here for easy shopping.
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center justify-center px-5 py-2.5 sm:py-3 rounded-[5px] bg-[#263D18] hover:bg-[#1D3214] text-[#FBF7EE] text-xs sm:text-sm font-semibold shadow-xs transition-all active:scale-95"
            >
              <span>Explore Shop</span>
            </Link>
          </div>
        )}

        {/* Recommended Botanicals Section (Quick Add to Wishlist / Cart) */}
        {recommendedProducts.length > 0 && (
          <div className="mt-10 sm:mt-12 pt-8 border-t border-[#28321F]/10">
            <div className="flex items-end justify-between gap-4 mb-5">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#536B35] block mb-0.5">
                  Handpicked For You
                </span>
                <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#263D18] tracking-tight">
                  Recommended Botanicals
                </h2>
              </div>

              <Link
                href="/shop"
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#536B35] hover:text-[#263D18] transition-colors shrink-0"
              >
                <span>View All</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4 lg:gap-5">
              {recommendedProducts.map((product) => (
                <StoreProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}
      </section>
    </section>
  );
}
