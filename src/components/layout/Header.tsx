"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Search,
  User,
  ShoppingBag,
  X,
  ArrowRight,
  Menu,
  ChevronDown,
  Sparkles,
  Phone,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { products } from "@/data/products";
import { formatPrice, cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";

/* -------------------------------------------------------------------------- */
/*                          Desktop Navigation Menu                           */
/* -------------------------------------------------------------------------- */

function DesktopNavigation() {
  const pathname = usePathname();
  const [isShopOpen, setIsShopOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

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
    <nav className="hidden lg:flex items-center gap-7 xl:gap-9" aria-label="Main Navigation">
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
                  "inline-flex items-center gap-1.5 text-[15px] font-medium tracking-wide transition-colors py-1 relative",
                  isActive || isShopOpen
                    ? "text-[#263D18]"
                    : "text-[#28321F] hover:text-[#263D18]"
                )}
                aria-expanded={isShopOpen}
              >
                <span>{item.label}</span>
                <ChevronDown
                  className={cn(
                    "w-3.5 h-3.5 text-[#536B35] transition-transform duration-200",
                    isShopOpen && "rotate-180 text-[#263D18]"
                  )}
                />
                {isActive && (
                  <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#263D18] rounded-full" />
                )}
              </Link>

              {/* Luxury Shop Mega Dropdown */}
              <div
                className={cn(
                  "absolute top-full left-1/2 -translate-x-1/2 w-80 bg-white rounded-2xl p-4 shadow-elevated border border-[#28321F]/10 transition-all duration-200 z-50",
                  isShopOpen
                    ? "opacity-100 visible translate-y-0"
                    : "opacity-0 invisible -translate-y-2 pointer-events-none"
                )}
              >
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#28321F]/5 px-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#536B35]">
                    Botanical Collections
                  </span>
                  <Link
                    href="/shop"
                    onClick={() => setIsShopOpen(false)}
                    className="text-[11px] font-medium text-[#263D18] hover:text-[#536B35] inline-flex items-center gap-1"
                  >
                    View All <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>

                <div className="space-y-1">
                  {item.children?.map((subItem) => (
                    <Link
                      key={subItem.href}
                      href={subItem.href}
                      onClick={() => setIsShopOpen(false)}
                      className="flex items-center justify-between px-3 py-2 rounded-xl text-sm text-[#28321F] hover:bg-[#FBF7EE] hover:text-[#263D18] transition-colors group"
                    >
                      <span className="font-normal group-hover:font-medium">
                        {subItem.label}
                      </span>
                      {subItem.label.includes("Best Sellers") && (
                        <span className="inline-flex items-center gap-1 text-[10px] uppercase font-semibold text-[#536B35] bg-[#E9DCC5]/50 px-2 py-0.5 rounded-full">
                          <Sparkles className="w-2.5 h-2.5" /> Popular
                        </span>
                      )}
                    </Link>
                  ))}
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
              "text-[15px] font-medium tracking-wide transition-colors py-2 relative",
              isActive
                ? "text-[#263D18]"
                : "text-[#28321F] hover:text-[#263D18]"
            )}
          >
            <span>{item.label}</span>
            {isActive && (
              <span className="absolute bottom-1 left-0 w-full h-[2.5px] bg-[#263D18] rounded-full" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}

/* -------------------------------------------------------------------------- */
/*                            Mobile Drawer Menu                              */
/* -------------------------------------------------------------------------- */

function MobileDrawerMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [isShopExpanded, setIsShopExpanded] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const pathname = usePathname();

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <div className="lg:hidden">
      {/* Mobile Hamburger Toggle Button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Open Navigation Menu"
        aria-expanded={isOpen}
        className="p-2 -ml-2 text-[#28321F] hover:text-[#263D18] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#536B35] rounded-lg transition-colors"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Backdrop Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-[#1D3214]/60 backdrop-blur-sm z-50 transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Slide-over Drawer */}
      <div
        className={cn(
          "fixed top-0 left-0 bottom-0 w-[85%] max-w-sm bg-[#FBF7EE] z-50 shadow-2xl flex flex-col transition-transform duration-300 ease-out border-r border-[#28321F]/10",
          isOpen ? "translate-x-0" : "-translate-x-full pointer-events-none"
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile Navigation Menu"
      >
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 flex items-center justify-between border-b border-[#28321F]/10 bg-white/70">
          <Logo size="sm" />
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            aria-label="Close Navigation Menu"
            className="p-2 text-[#28321F] hover:text-[#263D18] hover:bg-[#28321F]/5 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input Bar in Drawer */}
        <div className="p-4 border-b border-[#28321F]/5 bg-white/40">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (searchQuery.trim()) {
                window.location.href = `/shop?search=${encodeURIComponent(searchQuery.trim())}`;
              }
            }}
            className="relative"
          >
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search botanical skincare, oils..."
              className="w-full pl-9 pr-4 py-2.5 rounded-full bg-white border border-[#28321F]/15 text-sm text-[#28321F] placeholder:text-[#777968] focus:outline-none focus:border-[#536B35] focus:ring-1 focus:ring-[#536B35]"
            />
            <Search className="w-4 h-4 text-[#777968] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </form>
        </div>

        {/* Drawer Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {siteConfig.navigation.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

            const hasChildren = item.children && item.children.length > 0;

            if (hasChildren) {
              return (
                <div key={item.label} className="rounded-xl overflow-hidden bg-white/50 border border-[#28321F]/5">
                  <button
                    type="button"
                    onClick={() => setIsShopExpanded(!isShopExpanded)}
                    className="w-full flex items-center justify-between p-3.5 text-base font-semibold text-[#28321F] hover:text-[#263D18] transition-colors"
                  >
                    <span>{item.label}</span>
                    <ChevronDown
                      className={cn(
                        "w-4 h-4 text-[#536B35] transition-transform duration-200",
                        isShopExpanded && "rotate-180"
                      )}
                    />
                  </button>

                  {isShopExpanded && (
                    <div className="px-3 pb-3 space-y-1 border-t border-[#28321F]/5 pt-2">
                      {item.children?.map((subItem) => (
                        <Link
                          key={subItem.href}
                          href={subItem.href}
                          className="flex items-center justify-between px-3 py-2 rounded-lg text-sm text-[#777968] hover:text-[#263D18] hover:bg-[#E9DCC5]/40 transition-colors"
                        >
                          <span>{subItem.label}</span>
                          <ArrowRight className="w-3.5 h-3.5 opacity-50" />
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center justify-between p-3.5 rounded-xl text-base font-medium transition-colors",
                  isActive
                    ? "bg-[#263D18] text-[#FBF7EE] font-semibold"
                    : "text-[#28321F] hover:bg-white/60 hover:text-[#263D18]"
                )}
              >
                <span>{item.label}</span>
                <ArrowRight className={cn("w-4 h-4", isActive ? "text-[#A8B88A]" : "text-[#536B35]/40")} />
              </Link>
            );
          })}

          {/* Quick Perks Section */}
          <div className="pt-4 mt-4 border-t border-[#28321F]/10 space-y-3">
            <div className="flex items-center gap-2.5 text-xs text-[#536B35] font-medium p-2.5 rounded-xl bg-[#E9DCC5]/30">
              <Truck className="w-4 h-4 shrink-0 text-[#263D18]" />
              <span>Free Shipping on orders above ₹999</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-[#536B35] font-medium p-2.5 rounded-xl bg-[#E9DCC5]/30">
              <ShieldCheck className="w-4 h-4 shrink-0 text-[#263D18]" />
              <span>100% Natural &amp; Safe Certified</span>
            </div>
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-[#28321F]/10 bg-white/70 space-y-3">
          <a
            href={`tel:${siteConfig.contact.phone.replace(/[^0-9+]/g, "")}`}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-full bg-[#263D18] text-[#FBF7EE] text-sm font-medium hover:bg-[#1D3214] transition-colors shadow-sm"
          >
            <Phone className="w-4 h-4 text-[#A8B88A]" />
            <span>Call {siteConfig.contact.phone}</span>
          </a>
          <div className="flex items-center justify-between text-xs text-[#777968] px-1">
            <span>Customer Care</span>
            <span className="font-medium text-[#263D18]">{siteConfig.contact.email}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                            Main Header Component                           */
/* -------------------------------------------------------------------------- */

export function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCartPreviewOpen, setIsCartPreviewOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Focus search input when search modal opens
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [isSearchOpen]);

  // Filter products for quick search
  const filteredProducts = searchQuery.trim()
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <header className="sticky top-0 z-40 bg-[#FBF7EE]/30 backdrop-blur-md border-b border-[#28321F]/10 shadow-xs transition-all duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-20 sm:h-[84px] flex items-center justify-between gap-4">
          {/* Mobile Menu Button (Visible on < lg screens) */}
          <div className="flex lg:hidden items-center shrink-0">
            <MobileDrawerMenu />
          </div>

          {/* Logo on Left */}
          <div className="flex items-center shrink-0">
            <Logo size="md" />
          </div>

          {/* Desktop Navigation Links in Center */}
          <div className="hidden lg:flex items-center justify-center flex-1">
            <DesktopNavigation />
          </div>

          {/* Header Action Icons on Right */}
          <div className="flex items-center gap-1 sm:gap-2 text-[#28321F] shrink-0">
            {/* Search Button */}
            <button
              type="button"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              aria-label="Search natural products"
              className="p-2 sm:p-2.5 rounded-full hover:bg-black/5 text-[#28321F] hover:text-[#263D18] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#536B35]"
            >
              <Search className="w-5 h-5" strokeWidth={1.8} />
            </button>

            {/* Account / User Button */}
            <Link
              href="/contact"
              aria-label="My Account"
              className="p-2 sm:p-2.5 rounded-full hover:bg-black/5 text-[#28321F] hover:text-[#263D18] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#536B35]"
            >
              <User className="w-5 h-5" strokeWidth={1.8} />
            </Link>

            {/* Cart Button with Count Badge */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsCartPreviewOpen(!isCartPreviewOpen)}
                aria-label="Shopping Cart with 0 items"
                className="p-2 sm:p-2.5 rounded-full hover:bg-black/5 text-[#28321F] hover:text-[#263D18] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#536B35] relative"
              >
                <ShoppingBag className="w-5 h-5" strokeWidth={1.8} />
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#263D18] text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                  0
                </span>
              </button>

              {/* Quick Cart Dropdown Preview */}
              {isCartPreviewOpen && (
                <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 bg-white rounded-2xl p-5 shadow-elevated border border-[#28321F]/10 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="flex items-center justify-between pb-3 border-b border-[#28321F]/10">
                    <span className="font-heading text-lg text-[#263D18]">
                      Your Ritual Bag
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsCartPreviewOpen(false)}
                      className="p-1 text-[#777968] hover:text-[#28321F]"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="py-8 text-center">
                    <div className="w-12 h-12 rounded-full bg-[#E9DCC5]/40 flex items-center justify-center mx-auto mb-3 text-[#536B35]">
                      <ShoppingBag className="w-6 h-6" />
                    </div>
                    <p className="text-sm text-[#28321F] font-medium mb-1">
                      Your bag is currently empty
                    </p>
                    <p className="text-xs text-[#777968] mb-4">
                      Explore pure botanical elixirs, serums &amp; oils.
                    </p>
                    <Link
                      href="/shop"
                      onClick={() => setIsCartPreviewOpen(false)}
                      className="inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-[#263D18] text-white text-xs font-semibold hover:bg-[#1D3214] transition-colors shadow-sm"
                    >
                      Shop Best Sellers
                    </Link>
                  </div>

                  <div className="pt-3 border-t border-[#28321F]/5 text-[11px] text-[#536B35] text-center font-medium">
                    Free shipping on orders above ₹999
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Full-Width / Dropdown Search Overlay */}
      {isSearchOpen && (
        <div className="border-t border-[#28321F]/10 bg-white/98 backdrop-blur-md px-4 sm:px-6 lg:px-8 py-4 shadow-lg animate-in slide-in-from-top-2 duration-200">
          <div className="max-w-3xl mx-auto">
            <div className="relative flex items-center">
              <Search className="w-5 h-5 text-[#536B35] absolute left-4 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search natural botanicals, facial serums, scalp oils, creams..."
                className="w-full pl-12 pr-10 py-3.5 rounded-full bg-[#FBF7EE] border border-[#28321F]/15 text-sm sm:text-base text-[#28321F] placeholder:text-[#777968] focus:outline-none focus:border-[#263D18] focus:ring-1 focus:ring-[#263D18]"
              />
              {searchQuery ? (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 text-[#777968] hover:text-[#28321F]"
                >
                  <X className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsSearchOpen(false)}
                  className="absolute right-4 text-[#777968] hover:text-[#28321F]"
                  aria-label="Close search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Quick Search Results Preview */}
            {searchQuery.trim() && (
              <div className="mt-4 pt-3 border-t border-[#28321F]/10 max-h-72 overflow-y-auto">
                <span className="text-[11px] uppercase tracking-wider text-[#536B35] font-semibold block mb-2 px-2">
                  Matching Botanicals ({filteredProducts.length})
                </span>
                {filteredProducts.length > 0 ? (
                  <div className="space-y-1">
                    {filteredProducts.map((product) => (
                      <Link
                        key={product.id}
                        href={`/products/${product.slug}`}
                        onClick={() => {
                          setIsSearchOpen(false);
                          setSearchQuery("");
                        }}
                        className="flex items-center justify-between p-2.5 rounded-xl hover:bg-[#FBF7EE] transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-[#E9DCC5]/40 flex items-center justify-center font-heading text-xs text-[#263D18] shrink-0">
                            🌿
                          </div>
                          <div>
                            <p className="text-sm font-medium text-[#28321F] group-hover:text-[#263D18]">
                              {product.name}
                            </p>
                            <span className="text-xs text-[#777968]">
                              {product.category}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-[#263D18]">
                            {formatPrice(product.price)}
                          </span>
                          <ArrowRight className="w-4 h-4 text-[#536B35] opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-[#777968] py-4 text-center">
                    No botanical formulas found matching &ldquo;{searchQuery}&rdquo;.
                  </p>
                )}
              </div>
            )}

            {/* Trending tags */}
            {!searchQuery.trim() && (
              <div className="flex flex-wrap items-center gap-2 mt-3 pt-2 text-xs text-[#777968]">
                <span className="font-semibold text-[#28321F]">Trending:</span>
                {["Youth Elixir", "Rosemary Hair Oil", "Cloud Moisturizer", "Facial Mist"].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setSearchQuery(tag)}
                    className="px-3 py-1 rounded-full bg-[#E9DCC5]/40 text-[#28321F] hover:bg-[#263D18] hover:text-white transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

// Named alias exports for backwards compatibility if needed
export { DesktopNavigation as Navigation, MobileDrawerMenu as MobileMenu };
