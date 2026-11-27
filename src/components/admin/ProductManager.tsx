"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ExternalLink, ImageOff, Pencil, Trash2 } from "lucide-react";
import {
  adminRequest,
  ConfirmDialog,
  dangerIconButton,
  DataTable,
  DataView,
  EmptyState,
  Feedback,
  iconButton,
  PageHeader,
  Pager,
  panel,
  removeImages,
  StatGrid,
  Switch,
  Toolbar,
  useAdminAction,
  useRealtimeRefresh,
  useViewMode,
} from "@/components/admin/kit";
import { firstImageUrl } from "@/lib/media/image-url";
import { imageFileIds, toImages, type AdminProduct, type CategoryOption } from "@/lib/products/shared";

type Flag = "is_active" | "is_featured" | "is_best_seller";

const FILTERS = [
  ["all", "All"],
  ["active", "Active"],
  ["hidden", "Hidden"],
  ["low", "Low stock"],
  ["featured", "Featured"],
] as const;
const PER_PAGE = 12;
const selectClass = "h-11 rounded-xl border border-[#28321F]/10 bg-white px-3 text-sm outline-none focus:border-[#536B35]";

const money = (value: number | string) => `₹${Number(value).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
const editPath = (product: AdminProduct) => `/admin/products/${product.id}/edit`;

export function ProductManager({
  products,
  categories,
  lowStockLimit,
}: {
  products: AdminProduct[];
  categories: CategoryOption[];
  lowStockLimit: number;
}) {
  const router = useRouter();
  useRealtimeRefresh("admin-products", ["products", "categories"]);
  const [view, setView] = useViewMode("products");
  const { run, busy, locked, error, notice } = useAdminAction();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<(typeof FILTERS)[number][0]>("all");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [deleting, setDeleting] = useState<AdminProduct | null>(null);

  const categoryNames = new Map(categories.map((item) => [item.id, item.name]));
  const categoryName = (product: AdminProduct) => (product.category_id && categoryNames.get(product.category_id)) || "";
  const isLow = (product: AdminProduct) => product.is_active && product.stock_quantity <= lowStockLimit;

  const needle = query.trim().toLowerCase();
  const matched = products
    .filter(
      (product) =>
        (filter === "all" ||
          (filter === "active" && product.is_active) ||
          (filter === "hidden" && !product.is_active) ||
          (filter === "low" && isLow(product)) ||
          (filter === "featured" && product.is_featured)) &&
        (category === "all" || product.category_id === category) &&
        (!needle || `${product.name} ${product.slug} ${product.tagline ?? ""} ${categoryName(product)}`.toLowerCase().includes(needle)),
    )
    // "Newest" keeps the order the page loaded them in.
    .sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name);
      if (sort === "price-low") return Number(a.price) - Number(b.price);
      if (sort === "price-high") return Number(b.price) - Number(a.price);
      if (sort === "stock") return a.stock_quantity - b.stock_quantity;
      return 0;
    });
  const pages = Math.max(1, Math.ceil(matched.length / PER_PAGE));
  const current = Math.min(page, pages);
  const visible = matched.slice((current - 1) * PER_PAGE, current * PER_PAGE);

  const toggle = (product: AdminProduct, key: Flag) =>
    run(() => adminRequest(`/api/admin/products/${product.id}`, "PATCH", { [key]: !product[key] }), `${product.name} updated.`);

  const confirmDelete = () => {
    const target = deleting;
    if (!target) return;
    void run(async () => {
      await adminRequest(`/api/admin/products/${target.id}`, "DELETE");
      await removeImages(imageFileIds(toImages(target.images)));
    }, `${target.name} deleted.`).then(() => setDeleting(null));
  };

  const thumbnail = (product: AdminProduct) => {
    const image = firstImageUrl(product.images);
    return image ? (
      <Image src={image} alt={product.name} fill unoptimized sizes="(max-width: 640px) 100vw, 400px" className="object-cover" />
    ) : (
      <span className="absolute inset-0 grid place-items-center text-[#777968]">
        <ImageOff aria-label="No image" className="size-5" />
      </span>
    );
  };
  const priceLine = (product: AdminProduct) => (
    <span className="whitespace-nowrap">
      <strong className="tabular-nums text-[#263D18]">{money(product.price)}</strong>
      {product.original_price !== null && Number(product.original_price) > Number(product.price) && (
        <s className="ml-1.5 text-xs tabular-nums text-[#777968]">{money(product.original_price)}</s>
      )}
    </span>
  );
  const stockBadge = (product: AdminProduct) => {
    const sizes = product.product_variants ?? [];
    const soldOut = sizes.filter((size) => size.stock_quantity === 0).length;
    return (
      <span className="inline-flex flex-col items-start gap-1">
        <span
          className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${
            product.stock_quantity === 0
              ? "bg-red-50 text-red-700"
              : product.stock_quantity <= lowStockLimit
                ? "bg-amber-50 text-amber-800"
                : "bg-[#EAF1DF] text-[#263D18]"
          }`}
        >
          {product.stock_quantity === 0 ? "Out of stock" : `${product.stock_quantity} in stock`}
        </span>
        {sizes.length > 0 && (
          <span className={`whitespace-nowrap text-xs ${soldOut ? "font-medium text-amber-800" : "text-[#777968]"}`}>
            {sizes.length} size{sizes.length === 1 ? "" : "s"}
            {soldOut ? `, ${soldOut} sold out` : ""}
          </span>
        )}
      </span>
    );
  };
  const flag = (product: AdminProduct, key: Flag, label: string) => (
    <Switch checked={product[key]} label={label} disabled={locked} onChange={() => void toggle(product, key)} />
  );
  const actions = (product: AdminProduct) => (
    <div className="flex justify-end gap-1">
      {product.is_active && (
        <Link href={`/products/${product.slug}`} target="_blank" aria-label={`View ${product.name} in the store`} className={iconButton}>
          <ExternalLink className="size-4" />
        </Link>
      )}
      <Link href={editPath(product)} aria-label={`Edit ${product.name}`} className={iconButton}>
        <Pencil className="size-4" />
      </Link>
      <button type="button" aria-label={`Delete ${product.name}`} onClick={() => setDeleting(product)} className={dangerIconButton}>
        <Trash2 className="size-4" />
      </button>
    </div>
  );

  return (
    <div className="space-y-5">
      <PageHeader title="Products" addLabel="Add product" onAdd={() => router.push("/admin/products/new")} />
      <StatGrid
        items={[
          ["Products", products.length],
          ["Active", products.filter((product) => product.is_active).length],
          ["Low or out of stock", products.filter(isLow).length],
          ["Featured", products.filter((product) => product.is_featured).length],
        ]}
      />
      <Toolbar
        filters={FILTERS}
        filter={filter}
        onFilter={(key) => {
          setFilter(key);
          setPage(1);
        }}
        query={query}
        onQuery={(value) => {
          setQuery(value);
          setPage(1);
        }}
        placeholder="Search products"
        view={view}
        onView={setView}
      />
      <div className="flex flex-wrap items-center gap-2">
        <select
          aria-label="Category"
          value={category}
          onChange={(event) => {
            setCategory(event.target.value);
            setPage(1);
          }}
          className={selectClass}
        >
          <option value="all">All categories</option>
          {categories.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
        <select
          aria-label="Sort products"
          value={sort}
          onChange={(event) => {
            setSort(event.target.value);
            setPage(1);
          }}
          className={selectClass}
        >
          <option value="newest">Newest first</option>
          <option value="name">Name A–Z</option>
          <option value="price-low">Price: low to high</option>
          <option value="price-high">Price: high to low</option>
          <option value="stock">Lowest stock</option>
        </select>
        <span className="text-xs text-[#777968]">
          {matched.length} product{matched.length === 1 ? "" : "s"}
        </span>
      </div>
      <Feedback error={error} notice={notice} />

      {visible.length === 0 ? (
        <EmptyState>{products.length === 0 ? "No products yet. Add your first one." : "No products match."}</EmptyState>
      ) : (
        <DataView
          view={view}
          table={
            <DataTable
              rows={visible}
              columns={[
                {
                  label: "Product",
                  cell: (product) => (
                    <Link href={editPath(product)} className="flex items-center gap-3">
                      <span className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-[#FBF7EE]">{thumbnail(product)}</span>
                      <span className="min-w-0">
                        <span className="block font-medium text-[#263D18]">{product.name}</span>
                        <span className={`block text-xs ${categoryName(product) ? "text-[#777968]" : "font-medium text-amber-800"}`}>
                          {categoryName(product) || "No category"}
                        </span>
                      </span>
                    </Link>
                  ),
                },
                { label: "Price", cell: priceLine },
                { label: "Stock", cell: stockBadge },
                { label: "Active", cell: (product) => flag(product, "is_active", product.is_active ? "On" : "Off") },
                { label: "Featured", cell: (product) => flag(product, "is_featured", product.is_featured ? "Yes" : "No") },
                { label: "Best seller", cell: (product) => flag(product, "is_best_seller", product.is_best_seller ? "Yes" : "No") },
                { label: "Actions", align: "right", cell: actions },
              ]}
            />
          }
          grid={
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {visible.map((product) => (
                <li key={product.id} className={`${panel} flex min-w-0 flex-col overflow-hidden`}>
                  <Link href={editPath(product)} aria-label={`Edit ${product.name}`} className="relative block aspect-square bg-[#FBF7EE]">
                    {thumbnail(product)}
                    <span className="absolute left-3 top-3 flex flex-wrap gap-1.5">
                      {!product.is_active && <span className="rounded-full bg-[#28321F] px-2.5 py-1 text-[11px] font-semibold text-white">Hidden</span>}
                      {product.badge && <span className="rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-[#263D18]">{product.badge}</span>}
                    </span>
                  </Link>
                  <div className="flex flex-1 flex-col gap-3 p-4">
                    <div className="min-w-0">
                      <h2 className="line-clamp-2 font-serif text-lg text-[#263D18]">{product.name}</h2>
                      <p className={`text-xs ${categoryName(product) ? "text-[#777968]" : "font-medium text-amber-800"}`}>
                        {categoryName(product) || "No category"}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                      {priceLine(product)}
                      {stockBadge(product)}
                    </div>
                    <div className="mt-auto flex flex-wrap gap-x-4 gap-y-2 border-t border-[#28321F]/8 pt-3">
                      {flag(product, "is_active", "Active")}
                      {flag(product, "is_featured", "Featured")}
                      {flag(product, "is_best_seller", "Best seller")}
                    </div>
                    {actions(product)}
                  </div>
                </li>
              ))}
            </ul>
          }
        />
      )}
      <Pager page={current} pages={pages} onPage={setPage} />

      {deleting && (
        <ConfirmDialog title="Delete product" busy={busy} onCancel={() => setDeleting(null)} onConfirm={confirmDelete}>
          Delete <strong>{deleting.name}</strong> and its images? This cannot be undone. Past orders keep the product name but lose its
          picture. To only hide it from the store, turn off Active instead.
        </ConfirmDialog>
      )}
    </div>
  );
}
