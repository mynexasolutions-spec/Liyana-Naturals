"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Heart,
  LayoutGrid,
  List,
  RotateCcw,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { Product } from "@/types";
import { Container } from "@/components/ui/Container";
import { StoreProductCard } from "@/components/products/StoreProductCard";
import { useStore } from "@/context/StoreContext";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*                       Product Attribute Metadata Map                       */
/* -------------------------------------------------------------------------- */

const PRODUCT_META: Record<
  string,
  { skinTypes: string[]; concerns: string[] }
> = {
  "prod-1": {
    skinTypes: ["All Skin Types", "Dry Skin", "Sensitive Skin"],
    concerns: ["Hydration & Dryness", "Gentle Cleansing"],
  },
  "prod-2": {
    skinTypes: ["All Hair Types", "Dry Scalp"],
    concerns: ["Hair Fall & Thinning", "Dryness & Dandruff"],
  },
  "prod-3": {
    skinTypes: ["All Skin Types", "Dry Skin", "Sensitive Skin", "Combination Skin"],
    concerns: ["Hydration & Dryness", "Dull Skin", "Barrier Repair"],
  },
  "prod-4": {
    skinTypes: ["All Skin Types", "Oily Skin", "Combination Skin"],
    concerns: ["Dark Spots", "Dull Skin", "Anti-Aging"],
  },
  "prod-5": {
    skinTypes: ["All Hair Types", "Dry & Damaged Hair"],
    concerns: ["Damage & Split Ends", "Dryness & Frizz"],
  },
  "prod-6": {
    skinTypes: ["All Hair Types", "Oily Scalp"],
    concerns: ["Hair Fall & Thinning", "Low Hair Density"],
  },
};

const SKIN_TYPE_FILTERS = [
  "All Skin Types",
  "Dry Skin",
  "Sensitive Skin",
  "Oily Skin",
  "Combination Skin",
  "All Hair Types",
];

const CONCERN_FILTERS = [
  "Hydration & Dryness",
  "Dark Spots",
  "Dull Skin",
  "Hair Fall & Thinning",
  "Damage & Split Ends",
  "Gentle Cleansing",
];

type SortOption =
  | "bestselling"
  | "featured"
  | "price-asc"
  | "price-desc"
  | "rating"
  | "discount";

interface ShopCatalogProps {
  initialCategory?: string;
  initialTag?: string;
  initialSearch?: string;
  products?: Product[];
}

function mapInitialCategory(param: string | undefined, products: Product[]): string[] {
  if (!param) return [];
  const normalized = param.toLowerCase();
  return [...new Set(products.filter((product) => product.categorySlug === normalized).map((product) => product.category))];
}

export function ShopCatalog({
  initialCategory,
  initialTag,
  initialSearch,
  products = [],
}: ShopCatalogProps) {
  const { wishlistIds, totalWishlistCount, isHydrated } = useStore();

  // Modern Responsive Wishlist-Only Toast State
  const prevWishlistRef = useRef<string[] | null>(null);
  const [wishlistToast, setWishlistToast] = useState<{
    visible: boolean;
    action: "added" | "removed";
    productName: string;
  }>({
    visible: false,
    action: "added",
    productName: "",
  });

  useEffect(() => {
    if (!isHydrated) return;

    if (prevWishlistRef.current === null) {
      prevWishlistRef.current = wishlistIds;
      return;
    }

    const prev = prevWishlistRef.current;
    prevWishlistRef.current = wishlistIds;

    const addedId = wishlistIds.find((id) => !prev.includes(id));
    const removedId = prev.find((id) => !wishlistIds.includes(id));
    const targetId = addedId ?? removedId;

    if (!targetId) return;

    const targetProduct = products.find((p) => p.id === targetId);
    const productName = targetProduct?.name ?? "Product";
    const action: "added" | "removed" = addedId ? "added" : "removed";

    const showTimer = window.setTimeout(() => {
      setWishlistToast({
        visible: true,
        action,
        productName,
      });
    }, 0);

    return () => window.clearTimeout(showTimer);
  }, [wishlistIds, isHydrated]);

  useEffect(() => {
    if (!wishlistToast.visible) return;
    const timer = window.setTimeout(() => {
      setWishlistToast((prev) => ({ ...prev, visible: false }));
    }, 3500);
    return () => window.clearTimeout(timer);
  }, [wishlistToast.visible, wishlistToast.action, wishlistToast.productName]);

  const minProductPrice = useMemo(
    () => Math.min(...products.map((p) => p.price)),
    []
  );
  const maxProductPrice = useMemo(
    () => Math.max(...products.map((p) => p.price)),
    []
  );

  // Filter & View State
  const [selectedCategories, setSelectedCategories] = useState<string[]>(() =>
    mapInitialCategory(initialCategory, products)
  );
  const [selectedSkinTypes, setSelectedSkinTypes] = useState<string[]>([]);
  const [selectedConcerns, setSelectedConcerns] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState<number>(maxProductPrice);
  const [searchQuery, setSearchQuery] = useState<string>(initialSearch ?? "");
  const [tagFilter, setTagFilter] = useState<string>(initialTag ?? "");
  const [sortBy, setSortBy] = useState<SortOption>("bestselling");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState<boolean>(false);

  // Accordion Open State in Sidebar
  const [openGroups, setOpenGroups] = useState({
    category: true,
    price: true,
    skinType: true,
    concerns: true,
  });

  // Category Options with Dynamic Counts from Available Products
  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const product of products) {
      counts.set(product.category, (counts.get(product.category) ?? 0) + 1);
    }
    return Array.from(counts.entries()).map(([name, count]) => ({
      name,
      count,
    }));
  }, []);

  const toggleGroup = (key: keyof typeof openGroups) => {
    setOpenGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleSelection = (
    value: string,
    setter: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setCurrentPage(1);
    setter((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value]
    );
  };

  const handleResetAll = () => {
    setSelectedCategories([]);
    setSelectedSkinTypes([]);
    setSelectedConcerns([]);
    setMaxPrice(maxProductPrice);
    setSearchQuery("");
    setTagFilter("");
    setSortBy("bestselling");
    setCurrentPage(1);
  };

  // Filter & Sort Available Products
  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    const matched = products.filter((product) => {
      if (
        selectedCategories.length > 0 &&
        !selectedCategories.includes(product.category)
      ) {
        return false;
      }

      if (product.price > maxPrice) {
        return false;
      }

      const meta = PRODUCT_META[product.id];

      if (selectedSkinTypes.length > 0) {
        const productSkinTypes = meta?.skinTypes ?? [];
        const hasMatch = selectedSkinTypes.some((type) =>
          productSkinTypes.includes(type)
        );
        if (!hasMatch) return false;
      }

      if (selectedConcerns.length > 0) {
        const productConcerns = meta?.concerns ?? [];
        const hasMatch = selectedConcerns.some((concern) =>
          productConcerns.includes(concern)
        );
        if (!hasMatch) return false;
      }

      if (tagFilter === "bestseller" && !product.isBestSeller) {
        return false;
      }
      if (tagFilter === "new" && product.badge !== "New") {
        return false;
      }

      if (query) {
        const searchable = [
          product.name,
          product.category,
          product.tagline ?? "",
          product.shortDescription ?? "",
          product.description,
        ]
          .join(" ")
          .toLowerCase();
        if (!searchable.includes(query)) return false;
      }

      return true;
    });

    const sorted = [...matched];
    switch (sortBy) {
      case "price-asc":
        sorted.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        sorted.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        sorted.sort(
          (a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount
        );
        break;
      case "discount": {
        const getDisc = (p: Product) =>
          p.originalPrice ? (p.originalPrice - p.price) / p.originalPrice : 0;
        sorted.sort((a, b) => getDisc(b) - getDisc(a));
        break;
      }
      case "featured":
        sorted.sort(
          (a, b) =>
            Number(Boolean(b.isFeatured)) - Number(Boolean(a.isFeatured))
        );
        break;
      case "bestselling":
      default:
        sorted.sort(
          (a, b) =>
            Number(Boolean(b.isBestSeller)) - Number(Boolean(a.isBestSeller))
        );
        break;
    }

    return sorted;
  }, [
    selectedCategories,
    maxPrice,
    selectedSkinTypes,
    selectedConcerns,
    tagFilter,
    searchQuery,
    sortBy,
  ]);

  const itemsPerPage = 6;
  const totalPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / itemsPerPage)
  );
  const safePage = Math.min(currentPage, totalPages);
  const paginatedProducts = filteredProducts.slice(
    (safePage - 1) * itemsPerPage,
    safePage * itemsPerPage
  );

  const activeFilterCount =
    selectedCategories.length +
    selectedSkinTypes.length +
    selectedConcerns.length +
    (maxPrice < maxProductPrice ? 1 : 0) +
    (searchQuery.trim() ? 1 : 0) +
    (tagFilter ? 1 : 0);

  /* --------------------------- Filter Sidebar UI -------------------------- */
  const renderFilterSidebarContent = (isDrawer = false) => (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-[#28321F]/10">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-[#263D18]" />
          <h2 className="font-heading text-xl font-bold text-[#263D18]">
            Filters
          </h2>
          {activeFilterCount > 0 && (
            <span className="px-2 py-0.5 rounded-[5px] bg-[#EAF1DF] text-[#263D18] text-[11px] font-bold">
              {activeFilterCount}
            </span>
          )}
        </div>
        {isDrawer && (
          <button
            type="button"
            onClick={() => setIsMobileFilterOpen(false)}
            aria-label="Close filters"
            className="p-1.5 rounded-[5px] text-[#28321F] hover:bg-[#FBF7EE]"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Quick Search inside Filters */}
      <div className="relative">
        <Search className="w-3.5 h-3.5 text-[#777968] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1);
          }}
          placeholder="Search products..."
          aria-label="Search shop products"
          className="w-full pl-8 pr-3 py-2 rounded-[5px] bg-[#FBF7EE] border border-[#28321F]/12 text-xs sm:text-[13px] text-[#28321F] placeholder:text-[#777968] focus:outline-none focus:border-[#536B35]"
        />
      </div>

      {/* 1. Category Filter */}
      <div className="border-b border-[#28321F]/10 pb-3.5">
        <button
          type="button"
          onClick={() => toggleGroup("category")}
          className="w-full flex items-center justify-between text-left py-1 font-sans text-sm font-bold text-[#263D18] cursor-pointer"
          aria-expanded={openGroups.category}
        >
          <span>Category</span>
          <ChevronDown
            className={cn(
              "w-4 h-4 text-[#536B35] transition-transform duration-200",
              openGroups.category && "rotate-180"
            )}
          />
        </button>

        {openGroups.category && (
          <div className="mt-2.5 space-y-2">
            <label className="flex items-center justify-between gap-2 text-[13px] text-[#28321F] cursor-pointer group">
              <span className="flex items-center gap-2.5">
                <input
                  type="checkbox"
                  checked={selectedCategories.length === 0}
                  onChange={() => {
                    setSelectedCategories([]);
                    setCurrentPage(1);
                  }}
                  className="w-4 h-4 rounded-[5px] accent-[#263D18] cursor-pointer"
                />
                <span className="font-medium group-hover:text-[#263D18]">
                  All Products
                </span>
              </span>
              <span className="text-xs text-[#777968]">({products.length})</span>
            </label>

            {categoryCounts.map((cat) => (
              <label
                key={cat.name}
                className="flex items-center justify-between gap-2 text-[13px] text-[#28321F] cursor-pointer group"
              >
                <span className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(cat.name)}
                    onChange={() =>
                      toggleSelection(cat.name, setSelectedCategories)
                    }
                    className="w-4 h-4 rounded-[5px] accent-[#263D18] cursor-pointer"
                  />
                  <span className="group-hover:text-[#263D18]">{cat.name}</span>
                </span>
                <span className="text-xs text-[#777968]">({cat.count})</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* 2. Price Range Filter */}
      <div className="border-b border-[#28321F]/10 pb-3.5">
        <button
          type="button"
          onClick={() => toggleGroup("price")}
          className="w-full flex items-center justify-between text-left py-1 font-sans text-sm font-bold text-[#263D18] cursor-pointer"
          aria-expanded={openGroups.price}
        >
          <span>Price Range</span>
          <ChevronDown
            className={cn(
              "w-4 h-4 text-[#536B35] transition-transform duration-200",
              openGroups.price && "rotate-180"
            )}
          />
        </button>

        {openGroups.price && (
          <div className="mt-3 space-y-2">
            <input
              type="range"
              min={minProductPrice}
              max={maxProductPrice}
              step={50}
              value={maxPrice}
              onChange={(e) => {
                setMaxPrice(Number(e.target.value));
                setCurrentPage(1);
              }}
              aria-label="Maximum product price"
              className="w-full accent-[#263D18] cursor-pointer"
            />
            <div className="flex items-center justify-between text-xs font-semibold text-[#28321F]">
              <span>₹{minProductPrice}</span>
              <span className="px-2 py-0.5 rounded-[5px] bg-[#EAF1DF] text-[#263D18]">
                Up to ₹{maxPrice}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 3. Skin & Hair Type Filter */}
      <div className="border-b border-[#28321F]/10 pb-3.5">
        <button
          type="button"
          onClick={() => toggleGroup("skinType")}
          className="w-full flex items-center justify-between text-left py-1 font-sans text-sm font-bold text-[#263D18] cursor-pointer"
          aria-expanded={openGroups.skinType}
        >
          <span>Skin &amp; Hair Type</span>
          <ChevronDown
            className={cn(
              "w-4 h-4 text-[#536B35] transition-transform duration-200",
              openGroups.skinType && "rotate-180"
            )}
          />
        </button>

        {openGroups.skinType && (
          <div className="mt-2.5 space-y-2">
            {SKIN_TYPE_FILTERS.map((type) => (
              <label
                key={type}
                className="flex items-center gap-2.5 text-[13px] text-[#28321F] cursor-pointer group"
              >
                <input
                  type="checkbox"
                  checked={selectedSkinTypes.includes(type)}
                  onChange={() => toggleSelection(type, setSelectedSkinTypes)}
                  className="w-4 h-4 rounded-[5px] accent-[#263D18] cursor-pointer"
                />
                <span className="group-hover:text-[#263D18]">{type}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* 4. Concerns Filter */}
      <div className="pb-2">
        <button
          type="button"
          onClick={() => toggleGroup("concerns")}
          className="w-full flex items-center justify-between text-left py-1 font-sans text-sm font-bold text-[#263D18] cursor-pointer"
          aria-expanded={openGroups.concerns}
        >
          <span>Concerns</span>
          <ChevronDown
            className={cn(
              "w-4 h-4 text-[#536B35] transition-transform duration-200",
              openGroups.concerns && "rotate-180"
            )}
          />
        </button>

        {openGroups.concerns && (
          <div className="mt-2.5 space-y-2">
            {CONCERN_FILTERS.map((concern) => (
              <label
                key={concern}
                className="flex items-center gap-2.5 text-[13px] text-[#28321F] cursor-pointer group"
              >
                <input
                  type="checkbox"
                  checked={selectedConcerns.includes(concern)}
                  onChange={() => toggleSelection(concern, setSelectedConcerns)}
                  className="w-4 h-4 rounded-[5px] accent-[#263D18] cursor-pointer"
                />
                <span className="group-hover:text-[#263D18]">{concern}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="pt-2 space-y-2">
        <button
          type="button"
          onClick={() => setIsMobileFilterOpen(false)}
          className="w-full py-2.5 px-4 rounded-[5px] bg-[#263D18] hover:bg-[#1D3214] text-[#FBF7EE] text-xs sm:text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-2xs"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>
            {isDrawer
              ? `Show ${filteredProducts.length} Products`
              : "Apply Filters"}
          </span>
        </button>

        <button
          type="button"
          onClick={handleResetAll}
          className="w-full py-2 px-4 rounded-[5px] bg-transparent hover:bg-[#FBF7EE] text-[#555C4A] hover:text-[#263D18] text-xs font-medium inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset All</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* 
        ========================================================================
        MAIN CATALOG: SIDEBAR FILTERS + PRODUCT GRID / LIST
        ========================================================================
      */}
      <section
        id="shop-catalog"
        className="w-full bg-[#FBF7EE] pt-4 pb-7 sm:py-8 lg:py-10"
        aria-label="Shop Catalog"
      >
        <Container size="xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            {/* DESKTOP LEFT FILTER SIDEBAR */}
            <aside className="hidden lg:block lg:col-span-3 bg-white rounded-[5px] border border-[#28321F]/10 p-5 shadow-soft sticky top-24">
              {renderFilterSidebarContent(false)}
            </aside>

            {/* RIGHT PRODUCT CATALOG COLUMN */}
            <div className="lg:col-span-9">
              {/* Top Title + Sort + View Mode Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4 mb-3.5 sm:mb-6">
                <div>
                  <h2 className="font-heading text-xl sm:text-3xl lg:text-[34px] font-bold text-[#263D18] tracking-tight leading-tight">
                    Shop All Products
                  </h2>
                  <p className="font-sans text-[11.5px] sm:text-sm text-[#777968] mt-0.5">
                    Explore our complete range of natural skincare and haircare
                    products ({filteredProducts.length} available).
                  </p>
                </div>

                {/* Controls Row */}
                <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-2.5">
                  <div className="flex items-center gap-2">
                    {/* Mobile Filter Button */}
                    <button
                      type="button"
                      onClick={() => setIsMobileFilterOpen(true)}
                      className="lg:hidden inline-flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-[5px] bg-white border border-[#28321F]/15 text-[11px] sm:text-xs font-semibold text-[#263D18] hover:bg-[#EAF1DF] transition-colors cursor-pointer"
                    >
                      <SlidersHorizontal className="w-3.5 h-3.5 text-[#536B35]" />
                      <span>Filters</span>
                      {activeFilterCount > 0 && (
                        <span className="px-1.5 py-0.5 rounded-[5px] bg-[#263D18] text-white text-[10px]">
                          {activeFilterCount}
                        </span>
                      )}
                    </button>

                    {/* Sort By Dropdown */}
                    <div className="flex items-center gap-2">
                      <label
                        htmlFor="shop-sort"
                        className="text-xs font-medium text-[#777968] hidden sm:inline"
                      >
                        Sort By:
                      </label>
                      <div className="relative">
                        <select
                          id="shop-sort"
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value as SortOption)}
                          className="appearance-none bg-white border border-[#28321F]/15 rounded-[5px] pl-2.5 sm:pl-3 pr-7 sm:pr-8 py-1.5 sm:py-2 text-[11px] sm:text-[13px] font-medium text-[#28321F] focus:outline-none focus:border-[#536B35] cursor-pointer"
                        >
                          <option value="bestselling">Bestselling</option>
                          <option value="featured">Featured</option>
                          <option value="price-asc">Price: Low to High</option>
                          <option value="price-desc">Price: High to Low</option>
                          <option value="rating">Top Rated</option>
                          <option value="discount">Highest Discount</option>
                        </select>
                        <ChevronDown className="w-3.5 h-3.5 text-[#536B35] absolute right-2 sm:right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  {/* Grid / List View Switcher */}
                  <div
                    className="inline-flex items-center rounded-[5px] border border-[#28321F]/15 bg-white p-0.5"
                    role="group"
                    aria-label="Product view layout"
                  >
                    <button
                      type="button"
                      onClick={() => setViewMode("grid")}
                      aria-label="Grid view"
                      aria-pressed={viewMode === "grid"}
                      className={cn(
                        "p-1.5 rounded-[5px] transition-colors cursor-pointer",
                        viewMode === "grid"
                          ? "bg-[#263D18] text-white"
                          : "text-[#555C4A] hover:text-[#263D18]"
                      )}
                    >
                      <LayoutGrid className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode("list")}
                      aria-label="List view"
                      aria-pressed={viewMode === "list"}
                      className={cn(
                        "p-1.5 rounded-[5px] transition-colors cursor-pointer",
                        viewMode === "list"
                          ? "bg-[#263D18] text-white"
                          : "text-[#555C4A] hover:text-[#263D18]"
                      )}
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Active Filters Strip */}
              {activeFilterCount > 0 && (
                <div className="flex flex-wrap items-center justify-between gap-2 mb-5 p-3 rounded-[5px] bg-[#EAF1DF]/75 border border-[#A8B88A]/40">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {selectedCategories.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() =>
                          toggleSelection(cat, setSelectedCategories)
                        }
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[5px] bg-white text-[#263D18] text-xs font-medium border border-[#28321F]/10 hover:bg-[#F6EEDD] cursor-pointer"
                      >
                        <span>{cat}</span>
                        <X className="w-3 h-3" />
                      </button>
                    ))}
                    {tagFilter && (
                      <button
                        type="button"
                        onClick={() => setTagFilter("")}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[5px] bg-white text-[#263D18] text-xs font-medium border border-[#28321F]/10 cursor-pointer"
                      >
                        <span>Tag: {tagFilter}</span>
                        <X className="w-3 h-3" />
                      </button>
                    )}
                    {searchQuery.trim() && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery("")}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[5px] bg-white text-[#263D18] text-xs font-medium border border-[#28321F]/10 cursor-pointer"
                      >
                        <span>&ldquo;{searchQuery}&rdquo;</span>
                        <X className="w-3 h-3" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleResetAll}
                      className="text-xs font-semibold text-[#536B35] hover:text-[#263D18] px-2 py-1 cursor-pointer"
                    >
                      Clear all
                    </button>
                  </div>
                </div>
              )}

              {/* PRODUCTS GRID OR LIST */}
              {paginatedProducts.length > 0 ? (
                <div
                  className={cn(
                    viewMode === "grid"
                      ? "grid grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-2.5 sm:gap-4 lg:gap-5"
                      : "flex flex-col gap-4"
                  )}
                >
                  {paginatedProducts.map((product) => (
                    <StoreProductCard
                      key={product.id}
                      product={product}
                      viewMode={viewMode}
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-[5px] border border-[#28321F]/10 p-8 sm:p-10 text-center">
                  <h3 className="font-heading text-2xl font-bold text-[#263D18] mb-2">
                    No Matching Products Found
                  </h3>
                  <p className="text-sm text-[#777968] max-w-md mx-auto mb-5">
                    Try adjusting your price range or clearing selected filters
                    to explore all natural Liyana Naturals formulations.
                  </p>
                  <button
                    type="button"
                    onClick={handleResetAll}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-[5px] bg-[#263D18] hover:bg-[#1D3214] text-[#FBF7EE] text-sm font-medium transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Reset All Filters</span>
                  </button>
                </div>
              )}

              {/* Pagination Row */}
              {filteredProducts.length > 0 && (
                <div className="mt-7 flex items-center justify-center gap-1.5">
                  <button
                    type="button"
                    disabled={safePage <= 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    aria-label="Previous page"
                    className="w-8 h-8 rounded-[5px] border border-[#28321F]/15 bg-white text-[#28321F] flex items-center justify-center disabled:opacity-40 hover:bg-[#EAF1DF] transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {Array.from({ length: totalPages }, (_, idx) => idx + 1).map(
                    (pageNum) => (
                      <button
                        key={pageNum}
                        type="button"
                        onClick={() => setCurrentPage(pageNum)}
                        aria-current={pageNum === safePage ? "page" : undefined}
                        className={cn(
                          "w-8 h-8 rounded-[5px] text-xs font-semibold transition-colors cursor-pointer",
                          pageNum === safePage
                            ? "bg-[#263D18] text-[#FBF7EE]"
                            : "bg-white border border-[#28321F]/15 text-[#28321F] hover:bg-[#EAF1DF]"
                        )}
                      >
                        {pageNum}
                      </button>
                    )
                  )}

                  <button
                    type="button"
                    disabled={safePage >= totalPages}
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    aria-label="Next page"
                    className="w-8 h-8 rounded-[5px] border border-[#28321F]/15 bg-white text-[#28321F] flex items-center justify-center disabled:opacity-40 hover:bg-[#EAF1DF] transition-colors cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </Container>
      </section>

      {/* 
        ========================================================================
        MOBILE FILTER DRAWER
        ========================================================================
      */}
      {isMobileFilterOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden flex"
          role="dialog"
          aria-modal="true"
          aria-label="Product Filters"
        >
          <div
            className="fixed inset-0 bg-[#1D3214]/55 backdrop-blur-xs"
            onClick={() => setIsMobileFilterOpen(false)}
            aria-hidden="true"
          />
          <div className="relative z-10 w-[86%] max-w-sm bg-white h-full overflow-y-auto p-5 shadow-2xl border-r border-[#28321F]/10">
            {renderFilterSidebarContent(true)}
          </div>
        </div>
      )}

      {/* Modern Responsive Wishlist-Only Toast Notification */}
      {wishlistToast.visible && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-4 inset-x-4 sm:inset-x-auto sm:right-5 sm:bottom-5 z-40 sm:w-auto sm:min-w-[300px] sm:max-w-sm pointer-events-auto"
        >
          <div className="flex items-center justify-between gap-3 px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-[8px] bg-[#1D3214]/95 backdrop-blur-md text-[#FBF7EE] border border-[#A8B88A]/30 shadow-[0_14px_34px_rgba(29,50,20,0.28)]">
            <div className="flex items-center gap-2.5 min-w-0">
              <span
                className={cn(
                  "w-8 h-8 rounded-[6px] border flex items-center justify-center shrink-0",
                  wishlistToast.action === "added"
                    ? "bg-[#C2652B]/20 border-[#C2652B]/40"
                    : "bg-[#536B35]/35 border-[#A8B88A]/30"
                )}
              >
                <Heart
                  className={cn(
                    "w-4 h-4",
                    wishlistToast.action === "added"
                      ? "fill-[#E88452] text-[#E88452]"
                      : "text-[#A8B88A]"
                  )}
                />
              </span>
              <div className="min-w-0">
                <p className="font-sans text-xs sm:text-sm font-semibold text-[#FBF7EE] truncate">
                  {wishlistToast.action === "added"
                    ? `${wishlistToast.productName} saved`
                    : `${wishlistToast.productName} removed`}
                </p>
                <p className="font-sans text-[11px] text-[#A8B88A] truncate">
                  {totalWishlistCount > 0
                    ? `${totalWishlistCount} ${
                        totalWishlistCount === 1 ? "item" : "items"
                      } in Wishlist`
                    : "Wishlist is now empty"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {totalWishlistCount > 0 && (
                <Link
                  href="/wishlist"
                  onClick={() =>
                    setWishlistToast((prev) => ({ ...prev, visible: false }))
                  }
                  className="px-2.5 py-1.5 rounded-[5px] bg-[#FBF7EE] hover:bg-[#EAF1DF] text-[#263D18] text-[11px] sm:text-xs font-semibold transition-colors whitespace-nowrap"
                >
                  View Wishlist
                </Link>
              )}
              <button
                type="button"
                onClick={() =>
                  setWishlistToast((prev) => ({ ...prev, visible: false }))
                }
                aria-label="Dismiss wishlist notification"
                className="p-1 rounded-[5px] text-[#A8B88A] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
