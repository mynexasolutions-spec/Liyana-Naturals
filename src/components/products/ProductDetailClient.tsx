"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  FileText,
  FlaskConical,
  Heart,
  ImageOff,
  Leaf,
  Maximize2,
  Minus,
  Plus,
  ShoppingCart,
  Sparkles,
  Star,
  X,
  Zap,
} from "lucide-react";
import { Product } from "@/types";
import { Container } from "@/components/ui/Container";
import { StoreProductCard } from "@/components/products/StoreProductCard";
import { BadgeIcon } from "@/components/ui/BadgeIcon";
import { useStore } from "@/context/StoreContext";
import type { Badge } from "@/lib/content/badges";
import { amountToFreeShipping, freeShippingOffer } from "@/lib/checkout/pricing";
import { defaultVariant, findVariant, imagesFor } from "@/lib/products/variants";
import { cn } from "@/lib/utils";
import type { StorefrontReview } from "@/lib/supabase/storefront";

interface ProductDetailClientProps {
  product: Product;
  relatedProducts: Product[];
  initialReviews: StorefrontReview[];
  /** From admin Settings, shown under the buy buttons. */
  storeBadges: Badge[];
}

interface ProductReview {
  id: string;
  author: string;
  rating: number;
  title: string | null;
  comment: string;
  createdAt: string;
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
      return "bg-[#263D18] text-[#FBF7EE]";
  }
}

export function ProductDetailClient({
  product,
  relatedProducts,
  initialReviews,
  storeBadges,
}: ProductDetailClientProps) {
  const { addToCart, getCartItemQty, isInWishlist, toggleWishlist } =
    useStore();

  const [wantedQuantity, setQuantity] = useState<number>(1);
  const [justAdded, setJustAdded] = useState<boolean>(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState<boolean>(false);
  const [isBuyNowOpen, setIsBuyNowOpen] = useState<boolean>(false);
  const [openAccordion, setOpenAccordion] = useState<string>("details");

  // Short Modern Review Form State
  const [reviews, setReviews] = useState<ProductReview[]>(() =>
    initialReviews.map((review) => ({
      id: review.id,
      author: review.author,
      rating: review.rating,
      title: review.title,
      comment: review.body,
      createdAt: new Date(review.createdAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
    })),
  );
  const [reviewName, setReviewName] = useState<string>("");
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [reviewComment, setReviewComment] = useState<string>("");
  const [reviewError, setReviewError] = useState<string>("");
  const [reviewSubmitted, setReviewSubmitted] = useState<boolean>(false);

  // The chosen size, for a product sold in sizes.
  const [sizeId, setSizeId] = useState<string | undefined>(() => defaultVariant(product)?.id);
  const size = findVariant(product, sizeId) ?? defaultVariant(product);
  const price = size?.price ?? product.price;
  const originalPrice = size ? size.originalPrice : product.originalPrice;
  const inStock = size ? size.inStock : product.inStock;
  // No more than the stock of the chosen size (an order allows up to 99).
  const maxQuantity = Math.max(1, Math.min(99, size?.stock ?? product.stock ?? 0));
  const quantity = Math.min(wantedQuantity, maxQuantity);

  // The pictures for that size. A new size starts again at its first picture.
  const gallery = imagesFor(product, size);
  const [picked, setPicked] = useState(0);
  const image = gallery[picked] ?? gallery[0];
  const imageSrc = image?.src;
  const noPicture = (
    <span className="absolute inset-0 grid place-items-center text-[#777968]">
      <ImageOff aria-label="No picture" className="w-6 h-6" />
    </span>
  );
  const selectSize = (id: string) => {
    setSizeId(id);
    setPicked(0);
  };

  const { shippingSettings } = useStore();
  const shippingOffer = freeShippingOffer(shippingSettings);
  const toFreeShipping = amountToFreeShipping(price * quantity, shippingSettings);
  const isWishlisted = isInWishlist(product.id);
  const currentCartQty = getCartItemQty(product.id, size?.id);

  const discountPct = originalPrice
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;

  const displayReviewCount = product.reviewCount;
  const displayRating = product.rating;
  const filledStars = Math.round(displayRating);

  // Everything below comes from the admin. An empty field shows nothing.
  const highlights = product.highlights ?? [];
  const benefits = product.benefits ?? [];
  const ingredients = product.ingredients ?? [];
  const tags = product.tags ?? [];
  const summary = product.shortDescription || product.description;

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsLightboxOpen(false);
        setIsBuyNowOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const handleAddToCart = () => {
    addToCart(product.id, quantity, { variantId: size?.id });
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1600);
  };

  const handleBuyNow = () => {
    addToCart(product.id, quantity, { openDrawer: false, variantId: size?.id });
    setIsBuyNowOpen(true);
  };

  const toggleAccordion = (key: string) => {
    setOpenAccordion((prev) => (prev === key ? "" : key));
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = reviewName.trim();
    const trimmedComment = reviewComment.trim();

    if (!trimmedName) {
      setReviewError("Please enter your name.");
      return;
    }
    if (!trimmedComment) {
      setReviewError("Please write a short review.");
      return;
    }

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          authorName: trimmedName,
          rating: reviewRating,
          body: trimmedComment,
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        setReviewError(result.error ?? "Unable to submit your review.");
        return;
      }
    } catch {
      setReviewError("Unable to submit your review right now.");
      return;
    }

    setReviewName("");
    setReviewComment("");
    setReviewRating(5);
    setReviewError("");
    setReviewSubmitted(true);
    setTimeout(() => setReviewSubmitted(false), 3000);
  };

  return (
    <main className="relative min-h-screen bg-[#FBF7EE] text-[#28321F] overflow-x-clip">
      {/* Decorative Botanical Leaves Top Left & Right (Matching Reference) */}
      <div
        className="hidden md:block absolute -top-6 -left-8 w-44 h-44 pointer-events-none opacity-75 z-0"
        aria-hidden="true"
      >
        <Image
          src="/images/about/Glossy_Green.png"
          alt=""
          fill
          className="object-contain -rotate-[20deg]"
          unoptimized
        />
      </div>
      <div
        className="hidden md:block absolute -top-6 -right-8 w-44 h-44 pointer-events-none opacity-75 z-0"
        aria-hidden="true"
      >
        <Image
          src="/images/about/Glossy_Green.png"
          alt=""
          fill
          className="object-contain -scale-x-100 -rotate-[20deg]"
          unoptimized
        />
      </div>

      <section
        className="relative z-10 w-full py-5 sm:py-7 lg:py-9"
        aria-label={product.name}
      >
        <div className="max-w-[1350px] mx-auto px-4 sm:px-6 lg:px-8">
          {/* Compact Breadcrumb */}
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1.5 text-[11px] sm:text-xs text-[#777968] mb-4 sm:mb-6 font-medium min-w-0"
          >
            <Link
              href="/"
              className="text-[#555C4A] hover:text-[#263D18] transition-colors shrink-0"
            >
              Home
            </Link>
            <ChevronRight className="w-3 h-3 text-[#777968]/70 shrink-0" />
            <Link
              href="/shop"
              className="text-[#555C4A] hover:text-[#263D18] transition-colors shrink-0"
            >
              Shop
            </Link>
            <ChevronRight className="w-3 h-3 text-[#777968]/70 shrink-0" />
            <Link
              href={`/shop?category=${encodeURIComponent(product.categorySlug)}`}
              className="text-[#536B35] hover:text-[#263D18] transition-colors shrink-0 hidden sm:inline"
            >
              {product.category}
            </Link>
            <ChevronRight className="w-3 h-3 text-[#777968]/70 shrink-0 hidden sm:inline" />
            <span className="text-[#263D18] font-semibold truncate">
              {product.name}
            </span>
          </nav>

          {/* 
            ====================================================================
            MAIN 2-COLUMN PRODUCT DETAIL GRID
            Left: Main Product Image (NO thumbnails) + "Why You'll Love It?" Card
            Right: Rating, Title, Price, 4 Benefit Cards, Qty, Cart/Buy, Trust, Accordions
            ====================================================================
          */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start">
            {/* LEFT COLUMN: Product Showcase + Why You'll Love It */}
            <div className="lg:col-span-5 space-y-4 sm:space-y-5">
              {/* Main Product Image Stage (square, like the pictures the admin uploads) */}
              <div className="relative w-full max-w-[460px] sm:max-w-[520px] lg:max-w-none mx-auto aspect-square rounded-[5px] overflow-hidden bg-white border border-[#28321F]/10 shadow-card group">
                {/* Top-Left Badge */}
                {product.badge && (
                  <span
                    className={cn(
                      "absolute top-3 left-3 z-10 inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-[5px] shadow-xs",
                      getBadgeStyle(product.badge)
                    )}
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>{product.badge}</span>
                  </span>
                )}

                {/* Top-Right Wishlist Heart Button */}
                <button
                  type="button"
                  onClick={() => toggleWishlist(product.id)}
                  aria-label={
                    isWishlisted
                      ? `Remove ${product.name} from wishlist`
                      : `Save ${product.name} to wishlist`
                  }
                  aria-pressed={isWishlisted}
                  className={cn(
                    "absolute top-3 right-3 z-10 w-9 h-9 sm:w-10 sm:h-10 rounded-[5px] border flex items-center justify-center shadow-xs transition-all active:scale-90 cursor-pointer",
                    isWishlisted
                      ? "bg-[#FFF5F2] border-[#C2652B]/35"
                      : "bg-white/95 hover:bg-white border-[#28321F]/10"
                  )}
                >
                  <Heart
                    className={cn(
                      "w-4 h-4 sm:w-5 sm:h-5 transition-colors",
                      isWishlisted
                        ? "fill-[#C2652B] text-[#C2652B]"
                        : "text-[#28321F]"
                    )}
                  />
                </button>

                {/* Product Image */}
                <div className="relative w-full h-full bg-white">
                  {imageSrc ? (
                    <Image
                      src={imageSrc}
                      alt={image?.alt || product.name}
                      fill
                      priority
                      sizes="(min-width: 1024px) 40vw, (min-width: 640px) 520px, 100vw"
                      className="object-cover object-center group-hover:scale-[1.03] transition-transform duration-500 ease-out"
                      unoptimized
                    />
                  ) : (
                    noPicture
                  )}
                </div>

                {/* Bottom-Right Expand / Fullscreen Zoom Button */}
                {imageSrc && (
                  <button
                    type="button"
                    onClick={() => setIsLightboxOpen(true)}
                    aria-label="Zoom product image"
                    className="absolute bottom-3 right-3 z-10 w-9 h-9 rounded-[5px] bg-white/95 hover:bg-white border border-[#28321F]/10 text-[#28321F] flex items-center justify-center shadow-xs transition-all hover:scale-105 cursor-pointer"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Thumbnails, when there is more than one picture */}
              {gallery.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1" aria-label="Product pictures">
                  {gallery.map((item, index) => (
                    <button
                      key={`${item.src}-${index}`}
                      type="button"
                      onClick={() => setPicked(index)}
                      aria-label={`Show picture ${index + 1}`}
                      aria-pressed={item === image}
                      className={cn(
                        "relative w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-[5px] overflow-hidden bg-white border cursor-pointer",
                        item === image ? "border-[#263D18] ring-1 ring-[#263D18]" : "border-[#28321F]/12"
                      )}
                    >
                      <Image src={item.src} alt="" fill sizes="80px" className="object-cover" unoptimized />
                    </button>
                  ))}
                </div>
              )}

              {/* "Why You'll Love It?" Card */}
              {benefits.length > 0 && (
              <div className="relative bg-gradient-to-br from-[#F4EFE0] via-[#EAF1DF] to-[#DCE8CC] border border-[#A8B88A]/45 rounded-[5px] p-4 sm:p-6 shadow-2xs overflow-hidden">
                {/* Subtle Botanical Leaf Sprig Right Accent */}
                <div
                  className="absolute -right-4 -bottom-4 w-28 h-28 sm:w-36 sm:h-36 pointer-events-none opacity-80"
                  aria-hidden="true"
                >
                  <Image
                    src="/images/about/Glossy_Green.png"
                    alt=""
                    fill
                    className="object-contain rotate-[15deg]"
                    unoptimized
                  />
                </div>

                <div className="relative z-10 pr-12 sm:pr-20">
                  <h2 className="font-heading text-xl sm:text-2xl font-bold text-[#263D18] tracking-tight mb-3">
                    Why You&apos;ll Love It?
                  </h2>

                  <ul className="space-y-2">
                    {benefits.map((benefit) => (
                      <li
                        key={benefit}
                        className="flex items-start gap-2.5 text-xs sm:text-[14px] text-[#28321F] font-medium leading-snug"
                      >
                        <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-[5px] bg-[#263D18] text-white flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 stroke-[2.8]" />
                        </span>
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              )}
            </div>

            {/* RIGHT COLUMN: Product Purchase Info & Accordions */}
            <div className="lg:col-span-7 flex flex-col">
              {/* Top Row: Rating + Review Count + In Stock Pill */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-2 sm:mb-2.5">
                <div className="flex items-center gap-1.5">
                  <div
                    className="flex items-center gap-1"
                    aria-label={`${displayRating.toFixed(1)} out of 5 stars`}
                  >
                    {[...Array(5)].map((_, idx) => (
                      <Star
                        key={idx}
                        className={cn(
                          "w-4 h-4",
                          idx < filledStars
                            ? "fill-[#E5A83B] text-[#E5A83B]"
                            : "fill-transparent text-[#28321F]/25"
                        )}
                      />
                    ))}
                  </div>
                  <span className="text-xs sm:text-sm font-medium text-[#555C4A]">
                    ({displayReviewCount} Reviews)
                  </span>
                </div>

                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[5px] text-xs font-semibold",
                    inStock
                      ? "bg-[#EAF1DF] text-[#263D18] border border-[#A8B88A]/45"
                      : "bg-[#F6EEDD] text-[#C2652B]"
                  )}
                >
                  <span
                    className={cn(
                      "w-2 h-2 rounded-full",
                      inStock ? "bg-[#3C6E26]" : "bg-[#C2652B]"
                    )}
                  />
                  <span>{inStock ? "In Stock" : "Out of Stock"}</span>
                </span>
              </div>

              {/* Product Title & Tagline */}
              <h1 className="font-heading text-3xl sm:text-4xl lg:text-[44px] font-bold text-[#263D18] tracking-tight leading-[1.08] mb-1.5">
                {product.name}
              </h1>

              {product.tagline && (
                <p className="font-sans text-sm sm:text-base font-semibold text-[#536B35] mb-2.5">
                  {product.tagline}
                </p>
              )}

              {/* Short Description */}
              {summary && (
                <p className="font-sans text-[13.5px] sm:text-[15px] md:text-[16px] text-[#555C4A] leading-relaxed mb-4 max-w-2xl">
                  {summary}
                </p>
              )}

              {/* Price + Original Price + % Off */}
              <div className="flex flex-wrap items-center gap-3 mb-5">
                <span className="font-sans text-2xl sm:text-3xl font-bold text-[#263D18]">
                  ₹{price}
                </span>
                {originalPrice !== undefined && originalPrice > price && (
                  <span className="font-sans text-base sm:text-lg text-[#777968]/80 line-through">
                    ₹{originalPrice}
                  </span>
                )}
                {discountPct > 0 && (
                  <span className="px-2.5 py-0.5 rounded-[5px] bg-[#EAF1DF] text-[#263D18] text-xs font-semibold border border-[#A8B88A]/40">
                    {discountPct}% Off
                  </span>
                )}
              </div>

              {/* Size Selector */}
              {product.variants && product.variants.length > 0 && (
                <div className="mb-5">
                  <p id="size-label" className="font-sans text-sm sm:text-base font-semibold text-[#28321F] mb-2">
                    Select Size{size ? `: ${size.name}` : ""}
                  </p>
                  <div className="flex flex-wrap gap-2.5" role="radiogroup" aria-labelledby="size-label">
                    {product.variants.map((option) => {
                      const selected = option.id === size?.id;
                      return (
                        <button
                          key={option.id}
                          type="button"
                          role="radio"
                          aria-checked={selected}
                          onClick={() => selectSize(option.id)}
                          className={cn(
                            "min-w-[96px] rounded-[5px] border px-3.5 py-2 text-center transition-colors cursor-pointer",
                            selected
                              ? "border-[#263D18] bg-[#263D18] text-[#FBF7EE]"
                              : "border-[#28321F]/15 bg-white text-[#28321F] hover:border-[#536B35]",
                            !option.inStock && !selected && "opacity-60"
                          )}
                        >
                          <span className="block text-sm font-bold">{option.name}</span>
                          <span className={cn("block text-xs", selected ? "text-[#E9DCC5]" : "text-[#536B35]")}>
                            {option.inStock ? `₹${option.price}` : "Out of stock"}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Highlight Tiles */}
              {highlights.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 mb-5">
                  {highlights.map((item, index) => (
                    <div
                      key={`${item.label}-${index}`}
                      className="bg-[#FFFFFF]/80 border border-[#28321F]/8 rounded-[5px] p-3 flex flex-col items-center text-center gap-1.5"
                    >
                      <BadgeIcon icon={item.icon} className="w-5 h-5 text-[#263D18] stroke-[1.7]" />
                      <span className="font-sans text-[11px] sm:text-xs font-semibold text-[#28321F] leading-tight">
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Quantity Selector Row */}
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-5">
                <span className="font-sans text-sm sm:text-base font-semibold text-[#28321F]">
                  Quantity:
                </span>
                <div className="inline-flex items-center rounded-[5px] border border-[#28321F]/15 bg-white overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    aria-label="Decrease quantity"
                    className="w-9 h-9 flex items-center justify-center text-[#263D18] hover:bg-[#EAF1DF] disabled:opacity-40 transition-colors cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-10 text-center font-sans text-sm font-bold text-[#263D18]">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))}
                    disabled={quantity >= maxQuantity}
                    aria-label="Increase quantity"
                    className="w-9 h-9 flex items-center justify-center text-[#263D18] hover:bg-[#EAF1DF] disabled:opacity-40 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {currentCartQty > 0 && (
                  <span className="text-xs font-medium text-[#536B35]">
                    ({currentCartQty} currently in your bag)
                  </span>
                )}
              </div>

              {/* Primary CTA Buttons: Add to Cart + Buy Now (Sticky on Desktop Scroll) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5 lg:sticky lg:top-[92px] z-20 lg:bg-[#FBF7EE]/95 lg:backdrop-blur-md lg:p-2.5 lg:-mx-2.5 lg:rounded-[5px] lg:border lg:border-[#28321F]/8 lg:shadow-sm">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={!inStock}
                  className={cn(
                    "w-full py-3 px-6 rounded-[5px] text-sm font-semibold inline-flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.98] shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed",
                    justAdded
                      ? "bg-[#3C6E26] text-white"
                      : "bg-[#263D18] hover:bg-[#1D3214] text-[#FBF7EE]"
                  )}
                >
                  {justAdded ? (
                    <>
                      <Check className="w-4 h-4 stroke-[2.5]" />
                      <span>Added to Cart!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4" />
                      <span>Add to Cart</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleBuyNow}
                  disabled={!inStock}
                  className="w-full py-3 px-6 rounded-[5px] border border-[#263D18] bg-white hover:bg-[#EAF1DF] text-[#263D18] text-sm font-semibold inline-flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Zap className="w-4 h-4 text-[#536B35]" />
                  <span>Buy Now</span>
                </button>
              </div>

              {/* Free shipping (from the shipping settings) and the store's badges */}
              {(shippingOffer || storeBadges.length > 0) && (
                <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center sm:justify-around gap-2.5 sm:gap-4 py-3.5 px-3 rounded-[5px] bg-[#F6EFE0]/60 border border-[#28321F]/8 mb-5">
                  {shippingOffer && (
                    <div className="flex items-center gap-2.5">
                      <Image
                        src="/images/icons/shopicons/05-free-shipping-truck.svg"
                        alt=""
                        width={24}
                        height={24}
                        unoptimized
                        className="w-6 h-6 object-contain shrink-0"
                      />
                      <span className="font-sans text-[12px] sm:text-[14px] font-medium text-[#28321F] leading-tight">
                        {shippingOffer}
                      </span>
                    </div>
                  )}
                  {storeBadges.map((badge, index) => (
                    <div key={`${badge.label}-${index}`} className="flex items-center gap-2.5">
                      <BadgeIcon icon={badge.icon} className="w-5 h-5 text-[#263D18] shrink-0 stroke-[1.7]" />
                      <span className="font-sans text-[12px] sm:text-[14px] font-medium text-[#28321F] leading-tight">
                        {badge.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* 4 Expandable Accordions */}
              <div className="bg-white rounded-[5px] border border-[#28321F]/12 divide-y divide-[#28321F]/10 overflow-hidden shadow-2xs">
                {/* 1. Product Details */}
                <div>
                  <button
                    type="button"
                    onClick={() => toggleAccordion("details")}
                    aria-expanded={openAccordion === "details"}
                    className={cn(
                      "w-full flex items-center justify-between gap-3 px-4 py-3.5 text-left transition-colors cursor-pointer",
                      openAccordion === "details"
                        ? "bg-[#EAF1DF]/70 text-[#263D18]"
                        : "hover:bg-[#FAF7F0]"
                    )}
                  >
                    <span className="flex items-center gap-2.5 font-sans text-sm font-bold text-[#263D18]">
                      <FileText className="w-4 h-4 text-[#536B35]" />
                      <span>Product Details</span>
                    </span>
                    <ChevronDown
                      className={cn(
                        "w-4 h-4 text-[#536B35] transition-transform duration-200",
                        openAccordion === "details" && "rotate-180"
                      )}
                    />
                  </button>
                  {openAccordion === "details" && (
                    <div className="px-4 py-3.5 text-xs sm:text-sm text-[#555C4A] leading-relaxed space-y-2 bg-white">
                      <p className="whitespace-pre-line">{product.description}</p>
                      <div className="flex flex-wrap gap-2 pt-1">
                        {[`Category: ${product.category}`, ...tags].map((tag) => (
                          <span key={tag} className="px-2.5 py-0.5 rounded-[5px] bg-[#FBF7EE] border border-[#28321F]/10 text-xs font-medium text-[#263D18]">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. Ingredients */}
                {ingredients.length > 0 && (
                <div>
                  <button
                    type="button"
                    onClick={() => toggleAccordion("ingredients")}
                    aria-expanded={openAccordion === "ingredients"}
                    className={cn(
                      "w-full flex items-center justify-between gap-3 px-4 py-3.5 text-left transition-colors cursor-pointer",
                      openAccordion === "ingredients"
                        ? "bg-[#EAF1DF]/70 text-[#263D18]"
                        : "hover:bg-[#FAF7F0]"
                    )}
                  >
                    <span className="flex items-center gap-2.5 font-sans text-sm font-bold text-[#263D18]">
                      <Leaf className="w-4 h-4 text-[#536B35]" />
                      <span>Ingredients</span>
                    </span>
                    <ChevronDown
                      className={cn(
                        "w-4 h-4 text-[#536B35] transition-transform duration-200",
                        openAccordion === "ingredients" && "rotate-180"
                      )}
                    />
                  </button>
                  {openAccordion === "ingredients" && (
                    <div className="px-4 py-3.5 bg-white">
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {ingredients.map((ing) => (
                          <li
                            key={ing}
                            className="flex items-center gap-2 text-xs sm:text-sm text-[#28321F]"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-[#536B35] shrink-0" />
                            <span>{ing}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                )}

                {/* 3. How to Use */}
                {product.howToUse && (
                <div>
                  <button
                    type="button"
                    onClick={() => toggleAccordion("howToUse")}
                    aria-expanded={openAccordion === "howToUse"}
                    className={cn(
                      "w-full flex items-center justify-between gap-3 px-4 py-3.5 text-left transition-colors cursor-pointer",
                      openAccordion === "howToUse"
                        ? "bg-[#EAF1DF]/70 text-[#263D18]"
                        : "hover:bg-[#FAF7F0]"
                    )}
                  >
                    <span className="flex items-center gap-2.5 font-sans text-sm font-bold text-[#263D18]">
                      <FlaskConical className="w-4 h-4 text-[#536B35]" />
                      <span>How to Use</span>
                    </span>
                    <ChevronDown
                      className={cn(
                        "w-4 h-4 text-[#536B35] transition-transform duration-200",
                        openAccordion === "howToUse" && "rotate-180"
                      )}
                    />
                  </button>
                  {openAccordion === "howToUse" && (
                    <div className="px-4 py-3.5 text-xs sm:text-sm text-[#555C4A] leading-relaxed bg-white whitespace-pre-line">
                      {product.howToUse}
                    </div>
                  )}
                </div>
                )}

                {/* FAQs */}
                {product.faqs && product.faqs.length > 0 && (
                  <div>
                    <button
                      type="button"
                      onClick={() => toggleAccordion("faqs")}
                      aria-expanded={openAccordion === "faqs"}
                      className={cn(
                        "w-full flex items-center justify-between gap-3 px-4 py-3.5 text-left transition-colors cursor-pointer",
                        openAccordion === "faqs"
                          ? "bg-[#EAF1DF]/70 text-[#263D18]"
                          : "hover:bg-[#FAF7F0]"
                      )}
                    >
                      <span className="flex items-center gap-2.5 font-sans text-sm font-bold text-[#263D18]">
                        <CircleHelp className="w-4 h-4 text-[#536B35]" />
                        <span>FAQs</span>
                      </span>
                      <ChevronDown
                        className={cn(
                          "w-4 h-4 text-[#536B35] transition-transform duration-200",
                          openAccordion === "faqs" && "rotate-180"
                        )}
                      />
                    </button>
                    {openAccordion === "faqs" && (
                      <dl className="px-4 py-3.5 space-y-3 bg-white">
                        {product.faqs.map((faq) => (
                          <div key={faq.question}>
                            <dt className="text-xs sm:text-sm font-semibold text-[#263D18]">{faq.question}</dt>
                            <dd className="mt-1 text-xs sm:text-sm text-[#555C4A] leading-relaxed whitespace-pre-line">
                              {faq.answer}
                            </dd>
                          </div>
                        ))}
                      </dl>
                    )}
                  </div>
                )}

                {/* 4. Reviews */}
                <div>
                  <button
                    type="button"
                    onClick={() => toggleAccordion("reviews")}
                    aria-expanded={openAccordion === "reviews"}
                    className={cn(
                      "w-full flex items-center justify-between gap-3 px-4 py-3.5 text-left transition-colors cursor-pointer",
                      openAccordion === "reviews"
                        ? "bg-[#EAF1DF]/70 text-[#263D18]"
                        : "hover:bg-[#FAF7F0]"
                    )}
                  >
                    <span className="flex items-center gap-2.5 font-sans text-sm font-bold text-[#263D18]">
                      <Star className="w-4 h-4 text-[#536B35]" />
                      <span>Reviews ({displayReviewCount})</span>
                    </span>
                    <ChevronDown
                      className={cn(
                        "w-4 h-4 text-[#536B35] transition-transform duration-200",
                        openAccordion === "reviews" && "rotate-180"
                      )}
                    />
                  </button>
                  {openAccordion === "reviews" && (
                    <div className="px-4 py-4 bg-white text-xs sm:text-sm text-[#555C4A] space-y-4">
                      {/* Rating Summary */}
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-0.5">
                            {[...Array(5)].map((_, idx) => (
                              <Star
                                key={idx}
                                className={cn(
                                  "w-4 h-4",
                                  idx < filledStars
                                    ? "fill-[#E5A83B] text-[#E5A83B]"
                                    : "fill-transparent text-[#28321F]/25"
                                )}
                              />
                            ))}
                          </div>
                          <span className="font-semibold text-[#263D18]">
                            {displayRating.toFixed(1)} out of 5 ({displayReviewCount}{" "}
                            {displayReviewCount === 1 ? "Review" : "Reviews"})
                          </span>
                        </div>
                      </div>

                      {/* Modern & Short Review Form */}
                      <form
                        onSubmit={handleReviewSubmit}
                        className="bg-[#FAF7F0] border border-[#28321F]/10 rounded-[5px] p-3 sm:p-4 space-y-3"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="font-sans text-xs sm:text-sm font-bold text-[#263D18]">
                            Write a Quick Review
                          </span>
                          <div
                            className="flex items-center gap-1"
                            role="radiogroup"
                            aria-label="Select your rating"
                          >
                            {[1, 2, 3, 4, 5].map((starVal) => {
                              const active = starVal <= (hoverRating || reviewRating);
                              return (
                                <button
                                  key={starVal}
                                  type="button"
                                  onClick={() => setReviewRating(starVal)}
                                  onMouseEnter={() => setHoverRating(starVal)}
                                  onMouseLeave={() => setHoverRating(0)}
                                  aria-label={`Rate ${starVal} stars`}
                                  className="p-0.5 cursor-pointer transition-transform hover:scale-110"
                                >
                                  <Star
                                    className={cn(
                                      "w-4 h-4 sm:w-5 sm:h-5",
                                      active
                                        ? "fill-[#E5A83B] text-[#E5A83B]"
                                        : "fill-transparent text-[#28321F]/25"
                                    )}
                                  />
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          <input
                            type="text"
                            value={reviewName}
                            onChange={(e) => {
                              setReviewName(e.target.value);
                              if (reviewError) setReviewError("");
                            }}
                            placeholder="Your Name *"
                            aria-label="Your Name"
                            className="w-full px-3 py-2 rounded-[5px] bg-white border border-[#28321F]/15 text-xs sm:text-sm text-[#28321F] placeholder:text-[#777968] focus:outline-none focus:border-[#536B35]"
                          />
                          <input
                            type="text"
                            value={reviewComment}
                            onChange={(e) => {
                              setReviewComment(e.target.value);
                              if (reviewError) setReviewError("");
                            }}
                            placeholder="Short feedback (e.g. Gentle & glowing!) *"
                            aria-label="Your Review"
                            className="w-full px-3 py-2 rounded-[5px] bg-white border border-[#28321F]/15 text-xs sm:text-sm text-[#28321F] placeholder:text-[#777968] focus:outline-none focus:border-[#536B35]"
                          />
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            {reviewError && (
                              <span className="text-[11px] font-medium text-[#C2652B]">
                                {reviewError}
                              </span>
                            )}
                            {reviewSubmitted && !reviewError && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#3C6E26]">
                                <Check className="w-3.5 h-3.5" />
                                Review submitted for approval.
                              </span>
                            )}
                          </div>

                          <button
                            type="submit"
                            className="px-4 py-2 rounded-[5px] bg-[#263D18] hover:bg-[#1D3214] text-[#FBF7EE] text-xs font-semibold transition-colors active:scale-95 cursor-pointer"
                          >
                            Submit Review
                          </button>
                        </div>
                      </form>

                      {/* Submitted Reviews List */}
                      {reviews.length > 0 ? (
                        <div className="space-y-2.5">
                          {reviews.map((rev) => (
                            <div
                              key={rev.id}
                              className="p-3 rounded-[5px] bg-[#FBF7EE] border border-[#28321F]/8 space-y-1"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-semibold text-[#263D18] text-xs sm:text-sm">
                                  {rev.author}
                                </span>
                                <span className="text-[11px] text-[#777968]">
                                  {rev.createdAt}
                                </span>
                              </div>
                              <div className="flex items-center gap-0.5">
                                {[...Array(5)].map((_, idx) => (
                                  <Star
                                    key={idx}
                                    className={cn(
                                      "w-3 h-3",
                                      idx < rev.rating
                                        ? "fill-[#E5A83B] text-[#E5A83B]"
                                        : "fill-transparent text-[#28321F]/25"
                                    )}
                                  />
                                ))}
                              </div>
                              {rev.title && (
                                <p className="text-xs sm:text-sm font-semibold text-[#28321F] break-words">
                                  {rev.title}
                                </p>
                              )}
                              <p className="text-xs text-[#28321F]/85 leading-relaxed">
                                {rev.comment}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-[#777968]">
                          No reviews yet. Be the first to review {product.name}!
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 
        ========================================================================
        RELATED AVAILABLE PRODUCTS SECTION
        ========================================================================
      */}
      {relatedProducts.length > 0 && (
        <section
          className="w-full bg-[#FBF7EE] py-8 sm:py-10 border-t border-[#28321F]/8"
          aria-label="You May Also Like"
        >
          <Container size="xl">
            <div className="flex items-end justify-between gap-4 mb-5 sm:mb-6">
              <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#263D18] tracking-tight">
                You May Also Like
              </h2>

              <Link
                href="/shop"
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#536B35] hover:text-[#263D18] transition-colors shrink-0"
              >
                <span>View All Products</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4 lg:gap-5">
              {relatedProducts.map((related) => (
                <StoreProductCard key={related.id} product={related} />
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* 
        ========================================================================
        IMAGE ZOOM LIGHTBOX MODAL
        ========================================================================
      */}
      {isLightboxOpen && imageSrc && (
        <div
          className="fixed inset-0 z-50 bg-[#999999]/55 backdrop-blur-[2px] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label={`${product.name} zoom view`}
          onClick={() => setIsLightboxOpen(false)}
        >
          <div
            className="relative w-full max-w-[min(36rem,82vh)] aspect-square bg-white rounded-[5px] p-3 sm:p-5 shadow-2xl border border-[#28321F]/10"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsLightboxOpen(false)}
              aria-label="Close image preview"
              className="absolute top-3 right-3 z-10 w-9 h-9 rounded-[5px] bg-[#FBF7EE] hover:bg-[#EAF1DF] text-[#263D18] flex items-center justify-center border border-[#28321F]/15 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="relative w-full h-full">
              <Image
                src={imageSrc}
                alt={image?.alt || product.name}
                fill
                sizes="(max-width: 640px) 92vw, 576px"
                className="object-contain"
                unoptimized
              />
            </div>
          </div>
        </div>
      )}

      {/* 
        ========================================================================
        BUY NOW QUICK ORDER SUMMARY MODAL
        ========================================================================
      */}
      {isBuyNowOpen && (
        <div
          className="fixed inset-0 z-50 bg-[#1D3214]/65 backdrop-blur-xs flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Express Order Summary"
          onClick={() => setIsBuyNowOpen(false)}
        >
          <div
            className="relative w-full max-w-md bg-white rounded-[5px] p-5 sm:p-6 shadow-2xl border border-[#28321F]/15"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#28321F]/10">
              <div className="flex items-center gap-2 text-[#263D18]">
                <CheckCircle2 className="w-5 h-5 text-[#3C6E26]" />
                <h3 className="font-heading text-xl font-bold">
                  Added to Your Ritual Bag
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsBuyNowOpen(false)}
                aria-label="Close express order modal"
                className="p-1 text-[#777968] hover:text-[#28321F] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-3.5 py-4 border-b border-[#28321F]/10">
              <div className="relative w-16 h-16 rounded-[5px] bg-[#FAF7F0] border border-[#28321F]/8 shrink-0 overflow-hidden">
                {imageSrc ? (
                  <Image
                    src={imageSrc}
                    alt={product.name}
                    fill
                    sizes="64px"
                    className="object-contain p-1"
                    unoptimized
                  />
                ) : (
                  noPicture
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-sans text-sm font-bold text-[#263D18] truncate">
                  {product.name}
                </h4>
                <p className="text-xs text-[#777968]">
                  {size ? `Size: ${size.name} · ` : ""}Quantity: {quantity}
                </p>
                <p className="text-sm font-bold text-[#263D18] mt-0.5">
                  ₹{price * quantity}
                </p>
              </div>
            </div>

            <p className="text-xs text-[#555C4A] py-3 leading-relaxed">
              {toFreeShipping === 0
                ? "Your order qualifies for FREE shipping!"
                : toFreeShipping === null
                ? `Standard delivery charge: ₹${shippingSettings.standardFee}.`
                : `Add ₹${toFreeShipping} more in your bag to unlock free shipping above ₹${shippingSettings.freeFrom}.`}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              <Link
                href="/shop"
                onClick={() => setIsBuyNowOpen(false)}
                className="w-full py-2.5 px-4 rounded-[5px] border border-[#263D18]/25 hover:bg-[#FAF7F0] text-[#263D18] text-xs font-semibold text-center transition-colors"
              >
                Continue Shopping
              </Link>
              <Link
                href="/checkout"
                onClick={() => setIsBuyNowOpen(false)}
                className="w-full py-2.5 px-4 rounded-[5px] bg-[#263D18] hover:bg-[#1D3214] text-[#FBF7EE] text-xs font-semibold text-center transition-colors"
              >
                Proceed to Checkout
              </Link>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
