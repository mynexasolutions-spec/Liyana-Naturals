"use client";

import React, { useEffect, useMemo, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  ImageOff,
  Pencil,
  Plus,
  Search,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { compressionNote } from "@/lib/media/compress-image";
import { renderableImageUrl } from "@/lib/media/image-url";
import { deleteUploadedImage, uploadAdminImage } from "@/lib/media/upload-client";
import { DataTable, DataView, useViewMode, ViewToggle } from "@/components/admin/kit";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export type AdminCategory = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  image_file_id: string | null;
  is_active: boolean;
  is_featured: boolean;
  sort_order: number;
  productCount: number;
  activeProductCount: number;
};

type FormValues = {
  name: string;
  slug: string;
  description: string;
  image_url: string;
  image_file_id: string;
  is_active: boolean;
  is_featured: boolean;
};

const EMPTY_FORM: FormValues = {
  name: "",
  slug: "",
  description: "",
  image_url: "",
  image_file_id: "",
  is_active: true,
  is_featured: false,
};

const FILTERS = [
  ["all", "All"],
  ["active", "Active"],
  ["hidden", "Hidden"],
  ["homepage", "On homepage"],
] as const;

const inputClass =
  "mt-1.5 w-full rounded-xl border border-[#28321F]/12 bg-white px-3.5 py-2.5 text-sm text-[#28321F] outline-none focus:border-[#536B35] focus:ring-2 focus:ring-[#536B35]/15";

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 160);
}

async function request(url: string, method: "POST" | "PATCH" | "DELETE", body?: unknown) {
  const response = await fetch(url, {
    method,
    credentials: "same-origin",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (response.ok) return;
  const result = (await response.json().catch(() => ({}))) as { error?: string };
  throw new Error(result.error ?? `Request failed (${response.status}).`);
}

const message = (error: unknown) => (error instanceof Error ? error.message : "Something went wrong.");

function Switch({
  checked,
  label,
  disabled,
  onChange,
}: {
  checked: boolean;
  label: string;
  disabled?: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={onChange}
      className="flex items-center gap-2 text-xs font-medium text-[#28321F] disabled:opacity-50"
    >
      <span className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${checked ? "bg-[#3C6E26]" : "bg-[#CFCFC4]"}`}>
        <span className={`absolute left-0.5 top-0.5 size-4 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-4" : ""}`} />
      </span>
      {label}
    </button>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-[#1D3214]/45 p-4" role="dialog" aria-modal="true" aria-label={title}>
      <div className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-5 shadow-elevated md:p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="font-serif text-2xl text-[#263D18]">{title}</h2>
          <button type="button" aria-label="Close" onClick={onClose} className="grid size-9 place-items-center rounded-lg hover:bg-[#FBF7EE]">
            <X className="size-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function CategoryManager({
  categories,
  uncategorised,
}: {
  categories: AdminCategory[];
  uncategorised: number;
}) {
  const router = useRouter();
  const [isRefreshing, startRefresh] = useTransition();
  const [view, setView] = useViewMode("categories");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<(typeof FILTERS)[number][0]>("all");
  const [editing, setEditing] = useState<AdminCategory | "new" | null>(null);
  const [deleting, setDeleting] = useState<AdminCategory | null>(null);
  const [form, setForm] = useState<FormValues>(EMPTY_FORM);
  const [slugEdited, setSlugEdited] = useState(false);
  // Images uploaded in the open form that are not saved to a category yet.
  const [pendingImages, setPendingImages] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [savedNote, setSavedNote] = useState("");
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [notice, setNotice] = useState("");
  const locked = busy || isRefreshing;

  // Show changes made elsewhere, such as a product moving between categories.
  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    const channel = supabase
      .channel("admin-category-manager")
      .on("postgres_changes", { event: "*", schema: "public", table: "categories" }, () => router.refresh())
      .on("postgres_changes", { event: "*", schema: "public", table: "products" }, () => router.refresh())
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [router]);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(""), 3500);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return categories.filter(
      (category) =>
        (!needle || `${category.name} ${category.slug}`.toLowerCase().includes(needle)) &&
        (filter === "all" ||
          (filter === "active" && category.is_active) ||
          (filter === "hidden" && !category.is_active) ||
          (filter === "homepage" && category.is_active && category.is_featured)),
    );
  }, [categories, filter, query]);
  const canReorder = filter === "all" && !query.trim();

  const run = async (task: () => Promise<void>, success: string) => {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await task();
      setNotice(success);
    } catch (taskError) {
      setError(message(taskError));
    } finally {
      setBusy(false);
      startRefresh(() => router.refresh());
    }
  };

  const toggle = (category: AdminCategory, key: "is_active" | "is_featured") =>
    run(
      () => request(`/api/admin/categories/${category.id}`, "PATCH", { [key]: !category[key] }),
      `${category.name} updated.`,
    );

  const move = (index: number, step: -1 | 1) =>
    run(async () => {
      const ordered = [...categories];
      [ordered[index], ordered[index + step]] = [ordered[index + step], ordered[index]];
      for (const [position, category] of ordered.entries()) {
        if (category.sort_order === position + 1) continue;
        await request(`/api/admin/categories/${category.id}`, "PATCH", { sort_order: position + 1 });
      }
    }, "Order saved.");

  const openForm = (category: AdminCategory | "new") => {
    setEditing(category);
    setSlugEdited(category !== "new");
    setPendingImages([]);
    setSavedNote("");
    setFormError("");
    setForm(
      category === "new"
        ? EMPTY_FORM
        : {
            name: category.name,
            slug: category.slug,
            description: category.description ?? "",
            image_url: category.image_url ?? "",
            image_file_id: category.image_file_id ?? "",
            is_active: category.is_active,
            is_featured: category.is_featured,
          },
    );
  };

  const removeImages = async (fileIds: string[]) => {
    for (const fileId of fileIds) {
      // A leftover file is harmless; the category change has already been made.
      await deleteUploadedImage(fileId).catch(() => {});
    }
  };

  const closeForm = () => {
    if (busy || uploading) return;
    void removeImages(pendingImages);
    setPendingImages([]);
    setEditing(null);
  };

  const upload = async (file: File) => {
    setUploading(true);
    setFormError("");
    try {
      setSavedNote("");
      const image = await uploadAdminImage(file, "/liyana-naturals/categories");
      setSavedNote(compressionNote(image.originalBytes, image.storedBytes));
      setPendingImages((current) => [...current, image.fileId]);
      setForm((current) => ({ ...current, image_url: image.url, image_file_id: image.fileId }));
    } catch (uploadError) {
      setFormError(message(uploadError));
    } finally {
      setUploading(false);
    }
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editing) return;
    if (!form.name.trim()) {
      setFormError("Enter the category name.");
      return;
    }
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(form.slug)) {
      setFormError("The link name may use only small letters, numbers and single hyphens.");
      return;
    }

    const payload = {
      name: form.name.trim(),
      slug: form.slug,
      description: form.description.trim() || null,
      image_url: form.image_url || null,
      image_file_id: form.image_file_id || null,
      is_active: form.is_active,
      is_featured: form.is_featured,
      ...(editing === "new"
        ? { sort_order: Math.max(0, ...categories.map((category) => category.sort_order)) + 1 }
        : {}),
    };

    setBusy(true);
    setFormError("");
    try {
      await request(
        editing === "new" ? "/api/admin/categories" : `/api/admin/categories/${editing.id}`,
        editing === "new" ? "POST" : "PATCH",
        payload,
      );
      const replaced = editing === "new" ? null : editing.image_file_id;
      const unused = [...pendingImages, ...(replaced ? [replaced] : [])].filter((id) => id !== form.image_file_id);
      await removeImages(unused);
      setPendingImages([]);
      setNotice(`${payload.name} ${editing === "new" ? "added" : "saved"}.`);
      setEditing(null);
      startRefresh(() => router.refresh());
    } catch (saveError) {
      setFormError(message(saveError));
    } finally {
      setBusy(false);
    }
  };

  const confirmDelete = () => {
    const target = deleting;
    if (!target) return;
    void run(async () => {
      await request(`/api/admin/categories/${target.id}`, "DELETE");
      if (target.image_file_id) await removeImages([target.image_file_id]);
    }, `${target.name} deleted.`).then(() => setDeleting(null));
  };

  const stats = [
    ["Categories", categories.length],
    ["Active", categories.filter((category) => category.is_active).length],
    ["On homepage", categories.filter((category) => category.is_active && category.is_featured).length],
    ["Products without category", uncategorised],
  ] as const;

  const preview = renderableImageUrl(form.image_url);

  const orderButtons = (category: AdminCategory) => {
    const index = categories.findIndex((item) => item.id === category.id);
    return (
      <div className="flex items-center gap-1 text-xs text-[#777968]">
        <button
          type="button"
          aria-label={`Move ${category.name} earlier`}
          disabled={!canReorder || locked || index === 0}
          onClick={() => void move(index, -1)}
          className="grid size-9 place-items-center rounded-lg border border-[#28321F]/10 disabled:opacity-35"
        >
          <ArrowLeft className="size-4" />
        </button>
        <button
          type="button"
          aria-label={`Move ${category.name} later`}
          disabled={!canReorder || locked || index === categories.length - 1}
          onClick={() => void move(index, 1)}
          className="grid size-9 place-items-center rounded-lg border border-[#28321F]/10 disabled:opacity-35"
        >
          <ArrowRight className="size-4" />
        </button>
        <span className="ml-1">#{index + 1}</span>
      </div>
    );
  };

  const rowActions = (category: AdminCategory) => (
    <div className="flex justify-end gap-1">
      {category.is_active && (
        <Link
          href={`/shop?category=${category.slug}`}
          target="_blank"
          aria-label={`View ${category.name} in the store`}
          className="grid size-9 place-items-center rounded-lg text-[#536B35] hover:bg-[#EAF1DF]"
        >
          <ExternalLink className="size-4" />
        </Link>
      )}
      <button type="button" aria-label={`Edit ${category.name}`} onClick={() => openForm(category)} className="grid size-9 place-items-center rounded-lg text-[#536B35] hover:bg-[#EAF1DF]">
        <Pencil className="size-4" />
      </button>
      <button type="button" aria-label={`Delete ${category.name}`} onClick={() => setDeleting(category)} className="grid size-9 place-items-center rounded-lg text-red-600 hover:bg-red-50">
        <Trash2 className="size-4" />
      </button>
    </div>
  );

  return (
    <div className="space-y-5">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-[#777968]">Store management</p>
          <h1 className="font-serif text-3xl text-[#263D18]">Categories</h1>
        </div>
        <button
          type="button"
          onClick={() => openForm("new")}
          className="flex h-11 items-center justify-center gap-2 rounded-full bg-[#263D18] px-5 text-sm font-semibold text-white"
        >
          <Plus className="size-4" /> Add category
        </button>
      </header>

      <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map(([label, value]) => (
          <div key={label} className="flex flex-col-reverse rounded-2xl border border-[#28321F]/8 bg-white p-4">
            <dt className="mt-1 text-xs text-[#777968]">{label}</dt>
            <dd className="text-2xl font-semibold text-[#263D18]">{value}</dd>
          </div>
        ))}
      </dl>
      {uncategorised > 0 && (
        <p className="text-xs text-[#777968]">
          Give products a category from the{" "}
          <Link href="/admin/products" className="font-semibold text-[#536B35] underline">
            Products page
          </Link>
          .
        </p>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {FILTERS.map(([key, label]) => (
            <button
              key={key}
              type="button"
              aria-pressed={filter === key}
              onClick={() => setFilter(key)}
              className={`shrink-0 rounded-full border px-4 py-1.5 text-xs font-semibold ${
                filter === key ? "border-[#263D18] bg-[#263D18] text-white" : "border-[#28321F]/12 bg-white text-[#555C4A]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="flex min-w-0 items-center gap-2">
          <label className="relative block min-w-0 flex-1 sm:w-72 sm:flex-none">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#777968]" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search categories…"
              aria-label="Search categories"
              className="h-11 w-full rounded-xl border border-[#28321F]/10 bg-white pl-9 pr-4 text-sm outline-none focus:border-[#536B35]"
            />
          </label>
          <ViewToggle view={view} onChange={setView} />
        </div>
      </div>

      {error && (
        <p role="alert" className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="size-4 shrink-0" /> {error}
        </p>
      )}
      {notice && (
        <p role="status" className="fixed right-4 top-4 z-[80] flex max-w-[calc(100vw-2rem)] items-center gap-2 rounded-xl border border-[#536B35]/20 bg-[#EAF1DF] px-4 py-3 text-sm text-[#263D18] shadow-lg">
          <CheckCircle2 className="size-4 shrink-0" /> {notice}
        </p>
      )}

      {visible.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#28321F]/15 bg-white px-5 py-16 text-center text-sm text-[#777968]">
          {categories.length === 0 ? "No categories yet. Add your first one." : "No categories match."}
        </div>
      ) : (
        <DataView
          view={view}
          table={
            <DataTable
              rows={visible}
              columns={[
                {
                  label: "Category",
                  cell: (category) => {
                    const image = renderableImageUrl(category.image_url);
                    return (
                      <div className="flex items-center gap-3">
                        <span className="relative grid size-14 shrink-0 place-items-center overflow-hidden rounded-lg bg-[#FBF7EE] text-[#777968]">
                          {image ? <Image src={image} alt="" fill unoptimized sizes="56px" className="object-cover" /> : <ImageOff className="size-4" />}
                        </span>
                        <span className="min-w-0">
                          <span className="block font-medium text-[#263D18]">{category.name}</span>
                          <span className="block text-xs text-[#777968]">{category.slug}</span>
                        </span>
                      </div>
                    );
                  },
                },
                {
                  label: "Products",
                  cell: (category) => (
                    <span className="whitespace-nowrap">
                      <strong>{category.productCount}</strong>
                      <span className="text-xs text-[#777968]"> · {category.activeProductCount} active</span>
                    </span>
                  ),
                },
                {
                  label: "Active",
                  cell: (category) => (
                    <Switch checked={category.is_active} label={category.is_active ? "On" : "Off"} disabled={locked} onChange={() => void toggle(category, "is_active")} />
                  ),
                },
                {
                  label: "Homepage",
                  cell: (category) => (
                    <Switch checked={category.is_featured} label={category.is_featured ? "Yes" : "No"} disabled={locked} onChange={() => void toggle(category, "is_featured")} />
                  ),
                },
                { label: "Order", cell: orderButtons },
                { label: "Actions", align: "right", cell: rowActions },
              ]}
            />
          }
          grid={
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {visible.map((category) => {
                const image = renderableImageUrl(category.image_url);
                return (
                  <li key={category.id} className="flex min-w-0 flex-col overflow-hidden rounded-2xl border border-[#28321F]/8 bg-white shadow-soft">
                    <div className="relative aspect-square bg-[#FBF7EE]">
                      {image ? (
                        <Image src={image} alt={category.name} fill unoptimized sizes="(max-width: 640px) 100vw, 400px" className="object-cover" />
                      ) : (
                        <span className="absolute inset-0 grid place-items-center text-xs text-[#777968]">
                          <span className="flex flex-col items-center gap-1.5">
                            <ImageOff className="size-6" /> No image
                          </span>
                        </span>
                      )}
                      {!category.is_active && (
                        <span className="absolute left-3 top-3 rounded-full bg-[#28321F] px-2.5 py-1 text-[11px] font-semibold text-white">Hidden</span>
                      )}
                    </div>

                    <div className="flex flex-1 flex-col gap-3 p-4">
                      <div className="min-w-0">
                        <h2 className="truncate font-serif text-xl text-[#263D18]">{category.name}</h2>
                        <p className="truncate text-xs text-[#777968]">/shop?category={category.slug}</p>
                        {category.description && <p className="mt-1.5 line-clamp-2 text-sm text-[#555C4A]">{category.description}</p>}
                      </div>
                      <p className="text-sm text-[#28321F]">
                        <strong>{category.productCount}</strong> product{category.productCount === 1 ? "" : "s"}
                        <span className="text-[#777968]"> · {category.activeProductCount} active</span>
                      </p>
                      {category.is_active && category.activeProductCount === 0 && (
                        <p className="text-xs font-medium text-amber-800">Visible in the store but has no active products.</p>
                      )}

                      <div className="mt-auto flex flex-wrap gap-x-5 gap-y-2 border-t border-[#28321F]/8 pt-3">
                        <Switch checked={category.is_active} label="Active" disabled={locked} onChange={() => void toggle(category, "is_active")} />
                        <Switch checked={category.is_featured} label="Homepage" disabled={locked} onChange={() => void toggle(category, "is_featured")} />
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2">
                        {orderButtons(category)}
                        {rowActions(category)}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          }
        />
      )}
      {!canReorder && visible.length > 0 && <p className="text-xs text-[#777968]">Clear the search and filters to change the order.</p>}

      {editing && (
        <Modal title={editing === "new" ? "Add category" : "Edit category"} onClose={closeForm}>
          <form onSubmit={save} noValidate className="space-y-4">
            {formError && (
              <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
                {formError}
              </p>
            )}
            <label className="block text-sm font-medium">
              Category name
              <input
                value={form.name}
                maxLength={120}
                autoFocus
                onChange={(event) => {
                  const name = event.target.value;
                  setForm((current) => ({ ...current, name, slug: slugEdited ? current.slug : slugify(name) }));
                }}
                className={inputClass}
              />
            </label>
            <label className="block text-sm font-medium">
              Link name (slug)
              <input
                value={form.slug}
                maxLength={160}
                onChange={(event) => {
                  setSlugEdited(true);
                  setForm((current) => ({ ...current, slug: event.target.value.toLowerCase() }));
                }}
                className={inputClass}
              />
              <span className="mt-1 block break-all text-xs font-normal text-[#777968]">
                Store link: /shop?category={form.slug || "…"}
                {editing !== "new" && form.slug !== editing.slug ? " (old links to this category will stop working)" : ""}
              </span>
            </label>
            <label className="block text-sm font-medium">
              Description (optional)
              <textarea
                rows={3}
                maxLength={2000}
                value={form.description}
                onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                className={inputClass}
              />
            </label>

            <div>
              <p className="text-sm font-medium">Image</p>
              <div className="mt-1.5 flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative size-32 shrink-0 overflow-hidden rounded-xl border border-[#28321F]/10 bg-[#FBF7EE]">
                  {preview ? (
                    <Image src={preview} alt="Category preview" fill unoptimized sizes="128px" className="object-cover" />
                  ) : (
                    <span className="absolute inset-0 grid place-items-center text-[#777968]">
                      <ImageOff className="size-5" />
                    </span>
                  )}
                </div>
                <div className="space-y-2">
                  <label className={`inline-flex h-10 cursor-pointer items-center gap-2 rounded-full border border-[#536B35]/30 px-4 text-sm font-semibold text-[#263D18] ${uploading ? "opacity-60" : ""}`}>
                    <Upload className="size-4" />
                    {uploading ? "Uploading…" : preview ? "Change image" : "Upload image"}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      disabled={uploading}
                      className="sr-only"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (file) void upload(file);
                        event.target.value = "";
                      }}
                    />
                  </label>
                  {preview && (
                    <button
                      type="button"
                      onClick={() => setForm((current) => ({ ...current, image_url: "", image_file_id: "" }))}
                      className="block text-xs font-semibold text-red-600"
                    >
                      Remove image
                    </button>
                  )}
                  <p className="text-xs text-[#777968]">Shown as a square: other shapes are cut from the middle. JPG, PNG or WebP up to 40 MB, compressed automatically.</p>
                  {savedNote && <p role="status" className="text-xs font-medium text-[#3C6E26]">{savedNote}</p>}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-x-6 gap-y-3 rounded-xl bg-[#FBF7EE] px-4 py-3">
              <Switch checked={form.is_active} label="Active in store" onChange={() => setForm((current) => ({ ...current, is_active: !current.is_active }))} />
              <Switch checked={form.is_featured} label="Show on homepage" onChange={() => setForm((current) => ({ ...current, is_featured: !current.is_featured }))} />
            </div>

            <div className="flex justify-end gap-3 pt-1">
              <button type="button" onClick={closeForm} disabled={busy || uploading} className="h-11 rounded-full border border-[#28321F]/12 px-5 text-sm disabled:opacity-50">
                Cancel
              </button>
              <button type="submit" disabled={busy || uploading} className="h-11 rounded-full bg-[#263D18] px-6 text-sm font-semibold text-white disabled:opacity-60">
                {busy ? "Saving…" : editing === "new" ? "Add category" : "Save changes"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {deleting && (
        <Modal title="Delete category" onClose={() => !busy && setDeleting(null)}>
          <p className="text-sm text-[#555C4A]">
            Delete <strong>{deleting.name}</strong>? This cannot be undone.
          </p>
          {deleting.productCount > 0 && (
            <p className="mt-3 rounded-xl border border-amber-300 bg-amber-50 px-3.5 py-2.5 text-sm text-amber-900">
              This category has {deleting.productCount} product{deleting.productCount === 1 ? "" : "s"}. Move{" "}
              {deleting.productCount === 1 ? "it" : "them"} to another category from the{" "}
              <Link href="/admin/products" className="font-semibold underline">
                Products page
              </Link>{" "}
              first. To only hide the category, turn off Active instead.
            </p>
          )}
          <div className="mt-5 flex justify-end gap-3">
            <button type="button" disabled={busy} onClick={() => setDeleting(null)} className="h-11 rounded-full border border-[#28321F]/12 px-5 text-sm">
              Cancel
            </button>
            <button type="button" disabled={busy || deleting.productCount > 0} onClick={confirmDelete} className="h-11 rounded-full bg-red-600 px-6 text-sm font-semibold text-white disabled:opacity-60">
              {busy ? "Deleting…" : "Delete"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
