"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  Search,
  User,
  ShoppingBag,
  Heart,
  X,
  ArrowRight,
  Menu,
  ChevronDown,
  Sparkles,
  Phone,
  ShieldCheck,
  Truck,
  Plus,
  Minus,
  Trash2,
  Home,
  Store,
  Leaf,
} from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { products } from "@/data/products";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";
import { useStore } from "@/context/StoreContext";

/* -------------------------------------------------------------------------- */
/*                          Desktop Navigation + Mega Menu                    */
/* -------------------------------------------------------------------------- */

function DesktopNavigation() {
  const pathname = usePathname();
  const [isShopOpen, setIsShopOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const featuredMegaProducts = products.slice(0, 3);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsShopOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsShopOpen(false);
    }, 150);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <nav
      className="hidden lg:flex items-center gap-1.5 xl:gap-2.5"
      aria-label="Main Navigation"
    >
      {siteConfig.navigation.map((item) => {
        const isActive =
          item.href === "/"
            ? pathname === "/"
            : pathname.startsWith(item.href);

        const hasChildren = item.children && item.children.length > 0;

        if (hasChildren) {
          return (
            <div
              key={item.label}
              ref={dropdownRef}
              className="relative py-2"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <Link
                href={item.href}
                className={cn(
                  "inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[5px] text-[15.5px] font-medium tracking-wide transition-all duration-200 relative",
                  isActive
                    ? "bg-[#EAF1DF]/85 text-[#263D18] font-semibold"
                    : isShopOpen
                    ? "bg-[#EAF1DF]/55 text-[#263D18]"
                    : "text-[#28321F] hover:bg-[#EAF1DF]/45 hover:text-[#263D18]"
                )}
                aria-expanded={isShopOpen}
              >
                <span>{item.label}</span>
                <ChevronDown
                  className={cn(
                    "w-4 h-4 text-[#536B35] transition-transform duration-200",
                    isShopOpen && "rotate-180 text-[#263D18]"
                  )}
                />
              </Link>

              {/* Modern 2-Panel Botanical Mega Menu (Larger Readable Typography) */}
              <div
                className={cn(
                  "absolute top-full left-1/2 -translate-x-1/2 pt-2 w-[660px] xl:w-[720px] transition-all duration-200 z-50",
                  isShopOpen
                    ? "opacity-100 visible translate-y-0"
                    : "opacity-0 invisible -translate-y-2 pointer-events-none"
                )}
              >
                <div className="bg-white rounded-[5px] p-5 shadow-elevated border border-[#28321F]/10 grid grid-cols-12 gap-5">
                  {/* Left Column: Collections */}
                  <div className="col-span-5 border-r border-[#28321F]/8 pr-4 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-[#28321F]/8">
                        <span className="text-xs font-bold uppercase tracking-[0.14em] text-[#536B35]">
                          Collections
                        </span>
                        <Link
                          href="/shop"
                          onClick={() => setIsShopOpen(false)}
                          className="text-xs font-semibold text-[#263D18] hover:text-[#536B35] inline-flex items-center gap-1"
                        >
                          View All <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>

                      <div className="space-y-1">
                        {item.children?.map((subItem) => (
                          <Link
                            key={subItem.href}
                            href={subItem.href}
                            onClick={() => setIsShopOpen(false)}
                            className="flex items-center justify-between px-2.5 py-2 rounded-[5px] text-[15px] text-[#28321F] hover:bg-[#FBF7EE] hover:text-[#263D18] transition-colors group"
                          >
                            <span className="flex items-center gap-2 font-medium group-hover:translate-x-0.5 transition-transform">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#A8B88A] group-hover:bg-[#263D18] transition-colors" />
                              {subItem.label}
                            </span>
                            {subItem.label.includes("Best Sellers") && (
                              <span className="inline-flex items-center gap-1 text-[11px] uppercase font-semibold text-[#263D18] bg-[#EAF1DF] px-2 py-0.5 rounded-[5px]">
                                <Sparkles className="w-3 h-3 text-[#536B35]" />
                                Popular
                              </span>
                            )}
                            {subItem.label.includes("New Arrivals") && (
                              <span className="text-[11px] uppercase font-semibold text-white bg-[#536B35] px-2 py-0.5 rounded-[5px]">
                                New
                              </span>
                            )}
                          </Link>
                        ))}
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#28321F]/8 flex items-center gap-2 text-xs text-[#555C4A]">
                      <Leaf className="w-4 h-4 text-[#536B35] shrink-0" />
                      <span>100% Pure, Paraben &amp; Sulphate Free</span>
                    </div>
                  </div>

                  {/* Right Column: Featured Botanicals & Combo Banner */}
                  <div className="col-span-7 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-[#28321F]/8">
                        <span className="text-xs font-bold uppercase tracking-[0.14em] text-[#536B35]">
                          Featured Essentials
                        </span>
                        <span className="text-xs text-[#777968]">
                          Customer Favorites
                        </span>
                      </div>

                      <div className="space-y-2">
                        {featuredMegaProducts.map((prod) => (
                          <Link
                            key={prod.id}
                            href={`/products/${prod.slug}`}
                            onClick={() => setIsShopOpen(false)}
                            className="flex items-center gap-3 p-2 rounded-[5px] hover:bg-[#FAF7F0] border border-transparent hover:border-[#28321F]/8 transition-all group"
                          >
                            <div className="relative w-14 h-14 rounded-[5px] bg-[#FAF7F0] border border-[#28321F]/8 shrink-0 overflow-hidden">
                              <Image
                                src={
                                  prod.images[0]?.src ||
                                  "/images/products/Fresh_Green.webp"
                                }
                                alt={prod.name}
                                fill
                                sizes="52px"
                                className="object-contain p-1 group-hover:scale-105 transition-transform"
                                unoptimized
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#536B35] block">
                                {prod.category}
                              </span>
                              <p className="text-sm font-bold text-[#263D18] truncate group-hover:text-[#536B35] transition-colors">
                                {prod.name}
                              </p>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="text-sm font-bold text-[#263D18] block">
                                ₹{prod.price}
                              </span>
                              {prod.originalPrice && (
                                <span className="text-xs text-[#777968] line-through">
                                  ₹{prod.originalPrice}
                                </span>
                              )}
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>

                    {/* Mini Combo Promo Strip */}
                    <Link
                      href="/shop"
                      onClick={() => setIsShopOpen(false)}
                      className="mt-3 p-3.5 rounded-[5px] bg-[#1D3214] text-[#FBF7EE] flex items-center justify-between gap-3 group hover:bg-[#263D18] transition-colors"
                    >
                      <div>
                        <span className="text-[11px] uppercase tracking-wider text-[#A8B88A] font-semibold block">
                          Bundle &amp; Save
                        </span>
                        <span className="text-sm font-semibold text-white">
                          Build Your Own Combo — Up to 20% Off
                        </span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-[#A8B88A] group-hover:translate-x-1 transition-transform shrink-0" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          );
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "px-3.5 py-2 rounded-[5px] text-[15.5px] font-medium tracking-wide transition-all duration-200 relative",
              isActive
                ? "bg-[#EAF1DF]/85 text-[#263D18] font-semibold"
                : "text-[#28321F] hover:bg-[#EAF1DF]/45 hover:text-[#263D18]"
            )}
          >
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

/* -------------------------------------------------------------------------- */
/*                            Main Header Component                           */
/* -------------------------------------------------------------------------- */

export function Header() {
  const pathname = usePathname();
  const router = useRouter();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileShopExpanded, setIsMobileShopExpanded] = useState(true);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const desktopActionsRef = useRef<HTMLDivElement>(null);

  const {
    currentUser,
    cartItems,
    wishlistIds,
    totalCartCount,
    totalWishlistCount,
    cartSubtotal,
    isCartOpen,
    closeCart,
    toggleCart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    addToCart,
    removeFromWishlist,
  } = useStore();

  // Focus search input when popup opens
  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 60);
    }
  }, [isSearchOpen]);

  // Close overlays/menus on route change
  useEffect(() => {
    setIsSearchOpen(false);
    closeCart();
    setIsWishlistOpen(false);
    setIsMobileMenuOpen(false);
  }, [pathname, closeCart]);

  // Lock body scroll when Mobile Drawer, Cart Drawer, or Search Popup is open
  useEffect(() => {
    if (isMobileMenuOpen || isSearchOpen || isCartOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen, isSearchOpen, isCartOpen]);

  // Escape key closes popups & drawers
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsSearchOpen(false);
        closeCart();
        setIsWishlistOpen(false);
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [closeCart]);

  // Close Desktop Wishlist dropdown on outside click
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (desktopActionsRef.current && !desktopActionsRef.current.contains(target)) {
        setIsWishlistOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const wishlistedProducts = products.filter((p) => wishlistIds.includes(p.id));

  const filteredProducts = searchQuery.trim()
    ? products.filter((p) => {
        const q = searchQuery.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          (p.tagline ?? "").toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
        );
      })
    : [];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchQuery.trim();
    setIsSearchOpen(false);
    setIsMobileMenuOpen(false);
    if (trimmed) {
      router.push(`/shop?search=${encodeURIComponent(trimmed)}`);
    } else {
      router.push("/shop");
    }
  };

  /* ---------------------- Reusable Wishlist Content ----------------------- */
  const renderWishlistItems = (onClose: () => void) =>
    wishlistedProducts.length > 0 ? (
      <>
        <div className="mt-3 space-y-2.5 max-h-72 overflow-y-auto scrollbar-thin pr-1">
          {wishlistedProducts.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 p-2 rounded-[5px] bg-[#FAF7F0] border border-[#28321F]/8"
            >
              <Link
                href={`/products/${item.slug}`}
                onClick={onClose}
                className="relative w-12 h-12 rounded-[5px] bg-white shrink-0 overflow-hidden"
              >
                <Image
                  src={
                    item.images[0]?.src || "/images/products/Fresh_Green.webp"
                  }
                  alt={item.name}
                  fill
                  sizes="48px"
                  className="object-contain p-1"
                  unoptimized
                />
              </Link>
              <div className="min-w-0 flex-1">
                <Link
                  href={`/products/${item.slug}`}
                  onClick={onClose}
                  className="text-xs font-bold text-[#263D18] hover:text-[#536B35] truncate block"
                >
                  {item.name}
                </Link>
                <span className="text-xs font-semibold text-[#536B35]">
                  ₹{item.price}
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => {
                      addToCart(item.id, 1);
                      removeFromWishlist(item.id);
                    }}
                    className="text-[11px] font-semibold px-2 py-0.5 rounded-[5px] bg-[#263D18] text-white hover:bg-[#1D3214] cursor-pointer"
                  >
                    Move to Cart
                  </button>
                  <button
                    type="button"
                    onClick={() => removeFromWishlist(item.id)}
                    aria-label={`Remove ${item.name} from wishlist`}
                    className="text-[11px] text-[#777968] hover:text-[#C2652B] cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="pt-3 mt-3 border-t border-[#28321F]/10">
          <Link
            href="/wishlist"
            onClick={onClose}
            className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-[5px] bg-[#EAF1DF] hover:bg-[#DCE8D0] text-[#263D18] text-xs font-semibold transition-colors"
          >
            <span>Open Full Wishlist Page</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </>
    ) : (
      <div className="py-7 text-center">
        <div className="w-11 h-11 rounded-[5px] bg-[#EAF1DF] flex items-center justify-center mx-auto mb-2.5 text-[#536B35]">
          <Heart className="w-5 h-5" />
        </div>
        <p className="text-sm text-[#28321F] font-medium mb-1">
          Your wishlist is empty
        </p>
        <p className="text-xs text-[#777968] mb-3.5">
          Save your favorite botanical skincare &amp; haircare items.
        </p>
        <div className="flex items-center justify-center gap-2">
          <Link
            href="/shop"
            onClick={onClose}
            className="inline-flex items-center justify-center px-4 py-2 rounded-[5px] bg-[#263D18] text-white text-xs font-semibold hover:bg-[#1D3214] transition-colors"
          >
            Browse Shop
          </Link>
          <Link
            href="/wishlist"
            onClick={onClose}
            className="inline-flex items-center justify-center px-4 py-2 rounded-[5px] border border-[#28321F]/15 text-[#263D18] text-xs font-semibold hover:bg-[#FAF7F0] transition-colors"
          >
            Wishlist Page
          </Link>
        </div>
      </div>
    );

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#FBF7EE]/85 backdrop-blur-md border-b border-[#28321F]/10 shadow-xs transition-all duration-200">
        <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-20 sm:h-[84px] flex items-center justify-between gap-4">
            {/* Logo on Left (Both Mobile & Desktop) */}
            <div className="flex items-center shrink-0">
              <Logo size="md" />
            </div>

            {/* Desktop Navigation Links & Mega Menu in Center */}
            <div className="hidden lg:flex items-center justify-center flex-1">
              <DesktopNavigation />
            </div>

            {/* Mobile Right Actions: Cart + Hamburger Menu Icon */}
            <div className="flex lg:hidden items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  toggleCart();
                  setIsWishlistOpen(false);
                  setIsSearchOpen(false);
                  setIsMobileMenuOpen(false);
                }}
                aria-label={`Shopping Cart with ${totalCartCount} items`}
                aria-expanded={isCartOpen}
                className={cn(
                  "w-9 h-9 rounded-[5px] border flex items-center justify-center transition-colors relative cursor-pointer",
                  isCartOpen
                    ? "bg-[#263D18] text-white border-[#263D18]"
                    : "bg-white/85 hover:bg-[#EAF1DF] border-[#28321F]/12 text-[#263D18]"
                )}
              >
                <ShoppingBag className="w-[18px] h-[18px]" strokeWidth={1.9} />
                <span className="absolute -top-1.5 -right-1.5 min-w-[17px] h-[17px] px-1 rounded-full bg-[#263D18] text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                  {totalCartCount}
                </span>
              </button>

              {/* Mobile Hamburger Toggle */}
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(true);
                  closeCart();
                  setIsWishlistOpen(false);
                  setIsSearchOpen(false);
                }}
                aria-label="Open Navigation Menu"
                aria-expanded={isMobileMenuOpen}
                className="w-9 h-9 rounded-[5px] bg-white/85 hover:bg-[#EAF1DF] border border-[#28321F]/12 text-[#263D18] flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[#536B35] transition-colors cursor-pointer"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>

            {/* Desktop Right Actions: Search, Wishlist, Account, Cart */}
            <div
              ref={desktopActionsRef}
              className="hidden lg:flex items-center gap-2 text-[#28321F] shrink-0"
            >
              {/* Search Button (Opens Modern Popup Modal) */}
              <button
                type="button"
                onClick={() => {
                  setIsSearchOpen(true);
                  closeCart();
                  setIsWishlistOpen(false);
                }}
                aria-label="Search natural products"
                className={cn(
                  "w-10 h-10 rounded-[5px] border flex items-center justify-center transition-all cursor-pointer",
                  isSearchOpen
                    ? "bg-[#263D18] text-white border-[#263D18]"
                    : "bg-white/75 hover:bg-[#EAF1DF] text-[#263D18] border-[#28321F]/10"
                )}
              >
                <Search className="w-[19px] h-[19px]" strokeWidth={1.8} />
              </button>

              {/* Wishlist Button with Live Count Badge */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setIsWishlistOpen((prev) => !prev);
                    closeCart();
                    setIsSearchOpen(false);
                  }}
                  aria-label={`Wishlist with ${totalWishlistCount} items`}
                  className={cn(
                    "w-10 h-10 rounded-[5px] border flex items-center justify-center transition-all relative cursor-pointer",
                    isWishlistOpen
                      ? "bg-[#263D18] text-white border-[#263D18]"
                      : "bg-white/75 hover:bg-[#EAF1DF] text-[#263D18] border-[#28321F]/10"
                  )}
                >
                  <Heart className="w-[19px] h-[19px]" strokeWidth={1.8} />
                  <span className="absolute -top-1.5 -right-1.5 min-w-[17px] h-[17px] px-1 rounded-full bg-[#536B35] text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                    {totalWishlistCount}
                  </span>
                </button>

                {isWishlistOpen && (
                  <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-[5px] p-4 shadow-elevated border border-[#28321F]/12 z-50">
                    <div className="flex items-center justify-between pb-2.5 border-b border-[#28321F]/10">
                      <span className="font-heading text-lg font-bold text-[#263D18]">
                        Your Wishlist ({totalWishlistCount})
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsWishlistOpen(false)}
                        aria-label="Close wishlist"
                        className="p-1 text-[#777968] hover:text-[#28321F] cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    {renderWishlistItems(() => setIsWishlistOpen(false))}
                  </div>
                )}
              </div>

              {/* Cart Button (Opens Slide-Over Cart Drawer) */}
              <button
                type="button"
                onClick={() => {
                  toggleCart();
                  setIsWishlistOpen(false);
                  setIsSearchOpen(false);
                }}
                aria-label={`Shopping Cart with ${totalCartCount} items`}
                aria-expanded={isCartOpen}
                className={cn(
                  "w-10 h-10 rounded-[5px] border flex items-center justify-center transition-all relative cursor-pointer",
                  isCartOpen
                    ? "bg-[#263D18] text-white border-[#263D18]"
                    : "bg-white/75 hover:bg-[#EAF1DF] text-[#263D18] border-[#28321F]/10"
                )}
              >
                <ShoppingBag className="w-[19px] h-[19px]" strokeWidth={1.8} />
                <span className="absolute -top-1.5 -right-1.5 min-w-[17px] h-[17px] px-1 rounded-full bg-[#263D18] text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                  {totalCartCount}
                </span>
              </button>

              {/* Account / Login Button */}
              <Link
                href="/login"
                aria-label={currentUser ? `Account (${currentUser.fullName})` : "Login or Register"}
                className="relative w-10 h-10 rounded-[5px] bg-[#263D18] hover:bg-[#1D3214] text-[#FBF7EE] flex items-center justify-center shadow-2xs transition-colors"
              >
                {currentUser ? (
                  <span className="font-sans text-xs font-bold tracking-wide">
                    {currentUser.fullName
                      .split(" ")
                      .map((part) => part[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase()}
                  </span>
                ) : (
                  <User className="w-[19px] h-[19px]" strokeWidth={1.8} />
                )}
                {currentUser && (
                  <span
                    aria-hidden="true"
                    className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#A8B88A] ring-2 ring-[#FBF7EE]"
                  />
                )}
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* 
        ========================================================================
        MODERN SEARCH POPUP MODAL (Rendered outside <header> for true full-screen fixed positioning)
        ========================================================================
      */}
      {isSearchOpen && (
        <div
          className="fixed inset-0 z-50 bg-[#1D3214]/65 backdrop-blur-sm flex items-start justify-center p-3 sm:p-6 pt-12 sm:pt-20"
          role="dialog"
          aria-modal="true"
          aria-label="Search Products"
          onClick={() => setIsSearchOpen(false)}
        >
          <div
            className="w-full max-w-2xl bg-white rounded-[5px] shadow-2xl border border-[#28321F]/15 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header & Input */}
            <div className="p-3.5 sm:p-5 border-b border-[#28321F]/10 bg-[#FAF7F0]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-[0.16em] text-[#536B35]">
                  Search Liyana Botanicals
                </span>
                <button
                  type="button"
                  onClick={() => setIsSearchOpen(false)}
                  aria-label="Close search popup"
                  className="w-8 h-8 rounded-[5px] bg-white hover:bg-[#EAF1DF] border border-[#28321F]/12 text-[#263D18] flex items-center justify-center cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 sm:w-5 sm:h-5 text-[#536B35] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search aloe soap, hair oil, face serum..."
                    className="w-full pl-10 sm:pl-11 pr-9 py-2.5 sm:py-3 rounded-[5px] bg-white border border-[#28321F]/15 text-sm sm:text-base text-[#28321F] placeholder:text-[#777968] focus:outline-none focus:border-[#263D18] focus:ring-1 focus:ring-[#263D18]"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      aria-label="Clear search"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#777968] hover:text-[#263D18] cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <button
                  type="submit"
                  className="shrink-0 px-4 sm:px-5 py-2.5 sm:py-3 rounded-[5px] bg-[#263D18] hover:bg-[#1D3214] text-[#FBF7EE] text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
                >
                  Search
                </button>
              </form>
            </div>

            {/* Modal Body: Live Results or Popular Suggestions */}
            <div className="p-3.5 sm:p-5 max-h-[60vh] overflow-y-auto scrollbar-thin">
              {searchQuery.trim() ? (
                <>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#536B35]">
                      Matching Products ({filteredProducts.length})
                    </span>
                    {filteredProducts.length > 0 && (
                      <button
                        type="button"
                        onClick={handleSearchSubmit}
                        className="text-xs font-semibold text-[#263D18] hover:text-[#536B35] inline-flex items-center gap-1 cursor-pointer"
                      >
                        <span>View in Shop</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {filteredProducts.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {filteredProducts.map((product) => (
                        <Link
                          key={product.id}
                          href={`/products/${product.slug}`}
                          onClick={() => {
                            setIsSearchOpen(false);
                            setSearchQuery("");
                          }}
                          className="flex items-center gap-3 p-2.5 rounded-[5px] bg-[#FAF7F0] hover:bg-[#EAF1DF]/70 border border-[#28321F]/8 transition-colors group"
                        >
                          <div className="relative w-12 h-12 rounded-[5px] bg-white border border-[#28321F]/8 shrink-0 overflow-hidden">
                            <Image
                              src={
                                product.images[0]?.src ||
                                "/images/products/Fresh_Green.webp"
                              }
                              alt={product.name}
                              fill
                              sizes="48px"
                              className="object-contain p-1"
                              unoptimized
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className="text-[11px] font-semibold text-[#536B35] block">
                              {product.category}
                            </span>
                            <p className="text-sm font-bold text-[#263D18] truncate">
                              {product.name}
                            </p>
                            <span className="text-xs font-bold text-[#28321F]">
                              ₹{product.price}
                            </span>
                          </div>
                          <ArrowRight className="w-4 h-4 text-[#536B35] shrink-0 group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="py-8 text-center">
                      <p className="text-sm font-medium text-[#28321F] mb-1">
                        No botanical products found for &ldquo;{searchQuery}&rdquo;
                      </p>
                      <p className="text-xs text-[#777968]">
                        Try searching for Soap, Hair Oil, Face Cream, or Serum.
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <div className="space-y-4">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-[#536B35] block mb-2.5">
                      Popular Searches
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {[
                        "Avocado Soap",
                        "Hair Growth Oil",
                        "Nourishing Face Cream",
                        "Herbal Face Serum",
                        "Herbal Hair Mask",
                        "Hair Growth Serum",
                      ].map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => setSearchQuery(tag)}
                          className="px-3 py-1.5 rounded-[5px] bg-[#EAF1DF]/75 text-xs font-semibold text-[#263D18] hover:bg-[#263D18] hover:text-white transition-colors cursor-pointer"
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#28321F]/8">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#536B35] block mb-2.5">
                      Featured Products
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      {products.slice(0, 3).map((product) => (
                        <Link
                          key={product.id}
                          href={`/products/${product.slug}`}
                          onClick={() => setIsSearchOpen(false)}
                          className="flex sm:flex-col items-center sm:items-start gap-3 sm:gap-2 p-2.5 rounded-[5px] bg-[#FAF7F0] hover:bg-[#EAF1DF]/65 border border-[#28321F]/8 transition-colors"
                        >
                          <div className="relative w-12 h-12 sm:w-full sm:h-24 rounded-[5px] bg-white overflow-hidden shrink-0">
                            <Image
                              src={
                                product.images[0]?.src ||
                                "/images/products/Fresh_Green.webp"
                              }
                              alt={product.name}
                              fill
                              sizes="(max-width: 640px) 48px, 180px"
                              className="object-contain p-1.5"
                              unoptimized
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs sm:text-sm font-bold text-[#263D18] truncate">
                              {product.name}
                            </p>
                            <span className="text-xs font-semibold text-[#536B35]">
                              ₹{product.price}
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 
        ========================================================================
        SLIDE-OVER CART DRAWER (Auto-opens on Add to Cart + Cart Icon Click)
        Rendered OUTSIDE <header> so fixed inset covers 100vh on Mobile & Desktop
        ========================================================================
      */}
      {isCartOpen && (
        <div
          className="fixed inset-0 bg-[#1D3214]/60 backdrop-blur-sm z-50 transition-opacity duration-300"
          onClick={closeCart}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          "fixed top-0 right-0 bottom-0 w-[92%] max-w-md bg-[#FBF7EE] z-50 shadow-2xl flex flex-col transition-transform duration-300 ease-out border-l border-[#28321F]/10",
          isCartOpen ? "translate-x-0" : "translate-x-full pointer-events-none"
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping Cart Drawer"
      >
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 flex items-center justify-between border-b border-[#28321F]/10 bg-white/90">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-[5px] bg-[#EAF1DF] text-[#263D18] flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-heading text-xl font-bold text-[#263D18] leading-none">
                Your Ritual Bag
              </h2>
              <span className="text-[11px] font-medium text-[#777968]">
                {totalCartCount} {totalCartCount === 1 ? "item" : "items"}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={closeCart}
            aria-label="Close shopping cart"
            className="w-9 h-9 rounded-[5px] bg-[#FBF7EE] hover:bg-[#EAF1DF] text-[#28321F] flex items-center justify-center border border-[#28321F]/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Free Shipping Progress Strip */}
        <div className="px-4 sm:px-5 py-2.5 bg-[#EAF1DF]/75 border-b border-[#A8B88A]/35">
          <div className="flex items-center justify-between text-[11.5px] font-semibold text-[#263D18] mb-1.5">
            <span className="inline-flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-[#536B35]" />
              {cartSubtotal >= 999
                ? "Free shipping unlocked on your order!"
                : `Add ₹${999 - cartSubtotal} more for Free Shipping`}
            </span>
            <span>{Math.min(100, Math.round((cartSubtotal / 999) * 100))}%</span>
          </div>
          <div className="w-full h-1.5 rounded-[5px] bg-white overflow-hidden">
            <div
              className="h-full bg-[#263D18] transition-all duration-300"
              style={{
                width: `${Math.min(100, Math.round((cartSubtotal / 999) * 100))}%`,
              }}
            />
          </div>
        </div>

        {/* Scrollable Cart Items */}
        <div className="flex-1 overflow-y-auto scrollbar-thin p-4 sm:p-5 space-y-3">
          {cartItems.length > 0 ? (
            cartItems.map((entry) => {
              const product = products.find((p) => p.id === entry.productId);
              if (!product) return null;

              return (
                <div
                  key={entry.productId}
                  className="flex items-center gap-3 p-3 rounded-[5px] bg-white border border-[#28321F]/8 shadow-2xs"
                >
                  <Link
                    href={`/products/${product.slug}`}
                    onClick={closeCart}
                    className="relative w-16 h-16 rounded-[5px] bg-[#FAF7F0] border border-[#28321F]/8 shrink-0 overflow-hidden"
                  >
                    <Image
                      src={
                        product.images[0]?.src ||
                        "/images/products/Fresh_Green.webp"
                      }
                      alt={product.name}
                      fill
                      sizes="64px"
                      className="object-contain p-1"
                      unoptimized
                    />
                  </Link>

                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-[#536B35] block">
                      {product.category}
                    </span>
                    <Link
                      href={`/products/${product.slug}`}
                      onClick={closeCart}
                      className="text-sm font-bold text-[#263D18] hover:text-[#536B35] truncate block"
                    >
                      {product.name}
                    </Link>

                    <div className="flex items-center justify-between gap-2 mt-2">
                      <div className="inline-flex items-center rounded-[5px] border border-[#28321F]/15 bg-[#FAF7F0]">
                        <button
                          type="button"
                          onClick={() =>
                            updateCartQuantity(
                              entry.productId,
                              entry.quantity - 1
                            )
                          }
                          aria-label={`Decrease ${product.name} quantity`}
                          className="w-7 h-7 flex items-center justify-center text-[#263D18] hover:bg-[#EAF1DF] cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center text-xs font-bold text-[#28321F]">
                          {entry.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            updateCartQuantity(
                              entry.productId,
                              entry.quantity + 1
                            )
                          }
                          aria-label={`Increase ${product.name} quantity`}
                          className="w-7 h-7 flex items-center justify-center text-[#263D18] hover:bg-[#EAF1DF] cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="text-sm font-bold text-[#263D18]">
                        ₹{product.price * entry.quantity}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeFromCart(entry.productId)}
                    aria-label={`Remove ${product.name} from bag`}
                    className="p-1.5 rounded-[5px] text-[#777968] hover:text-[#C2652B] hover:bg-[#FFF5F2] transition-colors self-start cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center py-10">
              <div className="w-14 h-14 rounded-[5px] bg-[#EAF1DF] flex items-center justify-center mb-3 text-[#536B35]">
                <ShoppingBag className="w-7 h-7" />
              </div>
              <h3 className="font-heading text-2xl font-bold text-[#263D18] mb-1">
                Your Bag is Empty
              </h3>
              <p className="text-xs sm:text-sm text-[#777968] max-w-xs mb-5">
                Discover pure botanical skincare and haircare essentials crafted
                for natural radiance.
              </p>
              <Link
                href="/shop"
                onClick={closeCart}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[5px] bg-[#263D18] hover:bg-[#1D3214] text-[#FBF7EE] text-xs sm:text-sm font-semibold transition-colors"
              >
                <span>Explore Shop</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>

        {/* Sticky Drawer Footer */}
        {cartItems.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-[#28321F]/10 bg-white/95 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#555C4A] font-medium">Subtotal</span>
              <span className="font-bold text-[#263D18] text-lg">
                ₹{cartSubtotal}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Link
                href="/shop"
                onClick={closeCart}
                className="w-full py-2.5 px-4 rounded-[5px] border border-[#263D18]/25 hover:bg-[#FAF7F0] text-[#263D18] text-xs sm:text-sm font-semibold text-center transition-colors"
              >
                Continue Shopping
              </Link>
              <Link
                href="/checkout"
                onClick={closeCart}
                className="w-full py-2.5 px-4 rounded-[5px] bg-[#263D18] hover:bg-[#1D3214] text-[#FBF7EE] text-xs sm:text-sm font-semibold text-center transition-colors"
              >
                Proceed to Checkout
              </Link>
            </div>

            <button
              type="button"
              onClick={clearCart}
              className="w-full py-1.5 text-center text-xs font-medium text-[#777968] hover:text-[#C2652B] transition-colors cursor-pointer"
            >
              Clear Bag
            </button>
          </div>
        )}
      </aside>

      {/* 
        ========================================================================
        MOBILE SLIDE-OVER NAVIGATION DRAWER (Rendered OUTSIDE <header> so fixed inset covers 100vh!)
        ========================================================================
      */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-[#1D3214]/60 backdrop-blur-sm z-50 lg:hidden transition-opacity duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      <div
        className={cn(
          "fixed top-0 right-0 bottom-0 w-[86%] max-w-sm bg-[#FBF7EE] z-50 lg:hidden shadow-2xl flex flex-col transition-transform duration-300 ease-out border-l border-[#28321F]/10",
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full pointer-events-none"
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile Navigation Menu"
      >
        {/* Drawer Header */}
        <div className="p-4 flex items-center justify-between border-b border-[#28321F]/10 bg-white/85">
          <Logo size="sm" />
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Close Navigation Menu"
            className="w-9 h-9 rounded-[5px] bg-[#FBF7EE] text-[#28321F] hover:text-[#263D18] hover:bg-[#EAF1DF] flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Search Trigger */}
        <div className="p-3.5 border-b border-[#28321F]/8 bg-white/50">
          <button
            type="button"
            onClick={() => {
              setIsMobileMenuOpen(false);
              setIsSearchOpen(true);
            }}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-[5px] bg-white border border-[#28321F]/15 text-sm text-[#777968] hover:border-[#536B35] text-left cursor-pointer"
          >
            <Search className="w-4 h-4 text-[#536B35] shrink-0" />
            <span>Search botanical skincare, oils...</span>
          </button>
        </div>

        {/* Drawer Scrollable Links + Mobile Mega Menu */}
        <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-2">
          {siteConfig.navigation.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

            const hasChildren = item.children && item.children.length > 0;

            if (hasChildren) {
              return (
                <div
                  key={item.label}
                  className="rounded-[5px] overflow-hidden bg-white border border-[#28321F]/8"
                >
                  <button
                    type="button"
                    onClick={() => setIsMobileShopExpanded((prev) => !prev)}
                    className="w-full flex items-center justify-between p-3 text-sm font-bold text-[#263D18] hover:bg-[#FAF7F0] transition-colors cursor-pointer"
                  >
                    <span>{item.label}</span>
                    <ChevronDown
                      className={cn(
                        "w-4 h-4 text-[#536B35] transition-transform duration-200",
                        isMobileShopExpanded && "rotate-180"
                      )}
                    />
                  </button>

                  {isMobileShopExpanded && (
                    <div className="px-2.5 pb-3 space-y-2.5 border-t border-[#28321F]/8 pt-2.5 bg-[#FAF7F0]/60">
                      <div className="grid grid-cols-2 gap-1.5">
                        {item.children?.map((subItem) => (
                          <Link
                            key={subItem.href}
                            href={subItem.href}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="flex items-center justify-between px-2.5 py-2 rounded-[5px] bg-white border border-[#28321F]/8 text-xs font-medium text-[#28321F] hover:text-[#263D18] hover:border-[#536B35]/35 transition-colors"
                          >
                            <span className="truncate">{subItem.label}</span>
                          </Link>
                        ))}
                      </div>

                      {/* Featured Mini Products inside Mobile Mega Menu */}
                      <div className="pt-2 border-t border-[#28321F]/8">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#536B35] block mb-1.5 px-1">
                          Popular Botanicals
                        </span>
                        <div className="space-y-1.5">
                          {products.slice(0, 2).map((prod) => (
                            <Link
                              key={prod.id}
                              href={`/products/${prod.slug}`}
                              onClick={() => setIsMobileMenuOpen(false)}
                              className="flex items-center gap-2.5 p-2 rounded-[5px] bg-white border border-[#28321F]/8"
                            >
                              <div className="relative w-10 h-10 rounded-[5px] bg-[#FAF7F0] shrink-0 overflow-hidden">
                                <Image
                                  src={
                                    prod.images[0]?.src ||
                                    "/images/products/Fresh_Green.webp"
                                  }
                                  alt={prod.name}
                                  fill
                                  sizes="40px"
                                  className="object-contain p-0.5"
                                  unoptimized
                                />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-bold text-[#263D18] truncate">
                                  {prod.name}
                                </p>
                                <span className="text-[11px] font-semibold text-[#536B35]">
                                  ₹{prod.price}
                                </span>
                              </div>
                              <ArrowRight className="w-3.5 h-3.5 text-[#536B35] shrink-0" />
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  "flex items-center justify-between p-3 rounded-[5px] text-sm font-medium transition-colors",
                  isActive
                    ? "bg-[#263D18] text-[#FBF7EE] font-semibold"
                    : "bg-white/80 text-[#28321F] hover:bg-[#EAF1DF]/60 hover:text-[#263D18] border border-[#28321F]/8"
                )}
              >
                <span>{item.label}</span>
                <ArrowRight
                  className={cn(
                    "w-4 h-4",
                    isActive ? "text-[#A8B88A]" : "text-[#536B35]/50"
                  )}
                />
              </Link>
            );
          })}

          {/* Quick Perks */}
          <div className="pt-3 mt-3 border-t border-[#28321F]/10 space-y-2">
            <div className="flex items-center gap-2.5 text-xs text-[#536B35] font-medium p-2.5 rounded-[5px] bg-[#EAF1DF]/65">
              <Truck className="w-4 h-4 shrink-0 text-[#263D18]" />
              <span>Free Shipping on orders above ₹999</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-[#536B35] font-medium p-2.5 rounded-[5px] bg-[#EAF1DF]/65">
              <ShieldCheck className="w-4 h-4 shrink-0 text-[#263D18]" />
              <span>100% Natural &amp; Safe Certified</span>
            </div>
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-[#28321F]/10 bg-white/85 space-y-2.5">
          <a
            href={`tel:${siteConfig.contact.phone.replace(/[^0-9+]/g, "")}`}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-[5px] bg-[#263D18] text-[#FBF7EE] text-xs font-semibold hover:bg-[#1D3214] transition-colors shadow-sm"
          >
            <Phone className="w-4 h-4 text-[#A8B88A]" />
            <span>Call {siteConfig.contact.phone}</span>
          </a>
          <div className="flex items-center justify-between text-[11px] text-[#777968] px-1">
            <span>Customer Care</span>
            <span className="font-medium text-[#263D18]">
              {siteConfig.contact.email}
            </span>
          </div>
        </div>
      </div>

      {/* 
        ========================================================================
        MOBILE WISHLIST BOTTOM SHEET (Opened from Bottom Navigation Bar)
        ========================================================================
      */}
      {isWishlistOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden flex items-end justify-center"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile Wishlist"
        >
          <div
            className="fixed inset-0 bg-[#1D3214]/55 backdrop-blur-xs"
            onClick={() => setIsWishlistOpen(false)}
            aria-hidden="true"
          />
          <div className="relative z-10 w-full max-w-md bg-white rounded-t-[10px] p-5 pb-8 shadow-2xl border-t border-[#28321F]/10">
            <div className="flex items-center justify-between pb-3 border-b border-[#28321F]/10">
              <span className="font-heading text-xl font-bold text-[#263D18]">
                Your Wishlist ({totalWishlistCount})
              </span>
              <button
                type="button"
                onClick={() => setIsWishlistOpen(false)}
                aria-label="Close wishlist"
                className="p-1.5 rounded-[5px] bg-[#FBF7EE] text-[#28321F] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {renderWishlistItems(() => setIsWishlistOpen(false))}
          </div>
        </div>
      )}

      {/* 
        ========================================================================
        MOBILE BOTTOM NAVIGATION BAR (< lg screens)
        Items: Home, Search, Shop, Wishlist, Account
        ========================================================================
      */}
      <nav
        aria-label="Mobile Bottom Navigation"
        className="fixed bottom-0 inset-x-0 z-40 lg:hidden bg-[#FBF7EE]/95 backdrop-blur-lg border-t border-[#28321F]/12 shadow-[0_-6px_24px_rgba(38,61,24,0.08)]"
      >
        <div className="grid grid-cols-5 items-center h-16 px-1 max-w-lg mx-auto">
          {/* 1. Home */}
          <Link
            href="/"
            className={cn(
              "flex flex-col items-center justify-center gap-1 py-1.5 rounded-[5px] transition-colors active:scale-95",
              pathname === "/"
                ? "text-[#263D18] font-bold"
                : "text-[#555C4A] hover:text-[#263D18]"
            )}
          >
            <span
              className={cn(
                "px-3 py-1 rounded-[5px] transition-colors",
                pathname === "/" && "bg-[#EAF1DF]"
              )}
            >
              <Home className="w-[19px] h-[19px]" strokeWidth={2} />
            </span>
            <span className="text-[10.5px] leading-none">Home</span>
          </Link>

          {/* 2. Search (Opens Modern Search Popup Modal) */}
          <button
            type="button"
            onClick={() => {
              setIsSearchOpen(true);
              closeCart();
              setIsWishlistOpen(false);
              setIsMobileMenuOpen(false);
            }}
            className={cn(
              "flex flex-col items-center justify-center gap-1 py-1.5 rounded-[5px] transition-colors active:scale-95 cursor-pointer",
              isSearchOpen
                ? "text-[#263D18] font-bold"
                : "text-[#555C4A] hover:text-[#263D18]"
            )}
          >
            <span
              className={cn(
                "px-3 py-1 rounded-[5px] transition-colors",
                isSearchOpen && "bg-[#EAF1DF]"
              )}
            >
              <Search className="w-[19px] h-[19px]" strokeWidth={2} />
            </span>
            <span className="text-[10.5px] leading-none">Search</span>
          </button>

          {/* 3. Shop */}
          <Link
            href="/shop"
            className={cn(
              "flex flex-col items-center justify-center gap-1 py-1.5 rounded-[5px] transition-colors active:scale-95",
              pathname.startsWith("/shop") || pathname.startsWith("/products")
                ? "text-[#263D18] font-bold"
                : "text-[#555C4A] hover:text-[#263D18]"
            )}
          >
            <span
              className={cn(
                "px-3 py-1 rounded-[5px] transition-colors",
                (pathname.startsWith("/shop") ||
                  pathname.startsWith("/products")) &&
                  "bg-[#EAF1DF]"
              )}
            >
              <Store className="w-[19px] h-[19px]" strokeWidth={2} />
            </span>
            <span className="text-[10.5px] leading-none">Shop</span>
          </Link>

          {/* 4. Wishlist (Direct Link to /wishlist Page) */}
          <Link
            href="/wishlist"
            className={cn(
              "flex flex-col items-center justify-center gap-1 py-1.5 rounded-[5px] transition-colors active:scale-95 relative",
              pathname.startsWith("/wishlist")
                ? "text-[#263D18] font-bold"
                : "text-[#555C4A] hover:text-[#263D18]"
            )}
          >
            <span
              className={cn(
                "px-3 py-1 rounded-[5px] transition-colors relative",
                pathname.startsWith("/wishlist") && "bg-[#EAF1DF]"
              )}
            >
              <Heart
                className={cn(
                  "w-[19px] h-[19px]",
                  totalWishlistCount > 0 && "text-[#263D18]"
                )}
                strokeWidth={2}
              />
              {totalWishlistCount > 0 && (
                <span className="absolute -top-0.5 right-1 min-w-[15px] h-[15px] px-1 rounded-full bg-[#536B35] text-white text-[9px] font-bold flex items-center justify-center">
                  {totalWishlistCount}
                </span>
              )}
            </span>
            <span className="text-[10.5px] leading-none">Wishlist</span>
          </Link>

          {/* 5. Account / Login */}
          <Link
            href="/login"
            className={cn(
              "flex flex-col items-center justify-center gap-1 py-1.5 rounded-[5px] transition-colors active:scale-95",
              pathname.startsWith("/login") || pathname.startsWith("/register")
                ? "text-[#263D18] font-bold"
                : "text-[#555C4A] hover:text-[#263D18]"
            )}
          >
            <span
              className={cn(
                "relative px-3 py-1 rounded-[5px] transition-colors",
                (pathname.startsWith("/login") ||
                  pathname.startsWith("/register")) &&
                  "bg-[#EAF1DF]"
              )}
            >
              <User className="w-[19px] h-[19px]" strokeWidth={2} />
              {currentUser && (
                <span
                  aria-hidden="true"
                  className="absolute top-0.5 right-2 w-2 h-2 rounded-full bg-[#536B35]"
                />
              )}
            </span>
            <span className="text-[10.5px] leading-none">
              {currentUser ? "Account" : "Login"}
            </span>
          </Link>
        </div>
      </nav>
    </>
  );
}

// Named alias exports for backwards compatibility if needed
export { DesktopNavigation as Navigation };
