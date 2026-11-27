"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowLeft, ArrowUp, ExternalLink, ImageOff, Plus, Save, Star, Trash2, Upload, X } from "lucide-react";
import {
  adminRequest,
  checkDimensions,
  dangerIconButton,
  errorText,
  FormError,
  iconButton,
  inputClass,
  panel,
  primaryButton,
  removeImages,
  secondaryButton,
  Switch,
  type ImageRules,
} from "@/components/admin/kit";
import { BadgeListEditor } from "@/components/admin/BadgeListEditor";
import { siteConfig } from "@/config/site";
import { toBadges } from "@/lib/content/badges";
import { compressionNote } from "@/lib/media/compress-image";
import { renderableImageUrl } from "@/lib/media/image-url";
import { uploadAdminImage } from "@/lib/media/upload-client";
import {
  asList,
  imageFileIds,
  sortedVariants,
  toImages,
  type AdminProduct,
  type CategoryOption,
  type ProductImage,
} from "@/lib/products/shared";

const BADGES = ["Best Seller", "New", "Organic", "Award Winner", "Sale"];
// The dropdown choice that opens a text box; longer than any badge may be.
const OWN_BADGE = "__type_your_own_badge__";
const MAX_IMAGES = 30;
const MAX_SIZES = 20;
const MAX_FAQS = 20;
// Any shape is accepted: the upload cuts it to a square.
const MIN_SIZE: ImageRules = { minWidth: 300, minHeight: 300 };
const addButton =
  "inline-flex h-10 items-center gap-2 rounded-full border border-[#536B35]/30 px-4 text-sm font-semibold text-[#263D18] hover:bg-[#EAF1DF]/60";

type SizeRow = { key: string; id?: string; name: string; price: string; original_price: string; stock: string };
/** `sizeKey` points at a size row, so renaming a size keeps its pictures. */
type FormImage = ProductImage & { sizeKey?: string };
type FaqRow = { key: string; question: string; answer: string };

const newKey = () => `new-${Math.random().toString(36).slice(2, 10)}`;
const amountText = (value: number | string | null) => (value === null ? "" : String(Number(value)));
const toLines = (value: unknown) => asList(value).filter((item) => typeof item === "string").join("\n");
const fromLines = (value: string) => [...new Set(value.split("\n").map((line) => line.trim()).filter(Boolean))];

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 160);
}

function toFaqs(value: unknown): FaqRow[] {
  return asList(value).flatMap((item, index) => {
    const record = item && typeof item === "object" ? (item as Record<string, unknown>) : {};
    return typeof record.question === "string" && typeof record.answer === "string"
      ? [{ key: `faq-${index}`, question: record.question, answer: record.answer }]
      : [];
  });
}

function startingForm(product: AdminProduct | null) {
  const sizes: SizeRow[] = sortedVariants(product).map((size) => ({
    key: size.id,
    id: size.id,
    name: size.name,
    price: amountText(size.price),
    original_price: amountText(size.original_price),
    stock: String(size.stock_quantity),
  }));
  const images: FormImage[] = toImages(product?.images).map((image) => ({
    ...image,
    sizeKey: sizes.find((size) => size.name === image.size)?.key,
  }));
  return {
    name: product?.name ?? "",
    slug: product?.slug ?? "",
    category_id: product?.category_id ?? "",
    badge: product?.badge ?? "",
    tagline: product?.tagline ?? "",
    short_description: product?.short_description ?? "",
    description: product?.description ?? "",
    how_to_use: product?.how_to_use ?? "",
    price: product ? String(Number(product.price)) : "",
    original_price: product ? amountText(product.original_price) : "",
    stock_quantity: String(product?.stock_quantity ?? 0),
    ingredients: toLines(product?.ingredients),
    benefits: toLines(product?.benefits),
    seo_title: product?.seo_title ?? "",
    seo_description: product?.seo_description ?? "",
    is_active: product?.is_active ?? true,
    is_featured: product?.is_featured ?? false,
    is_best_seller: product?.is_best_seller ?? false,
    sizes,
    faqs: toFaqs(product?.faqs),
    highlights: toBadges(product?.highlights),
    tags: toLines(product?.tags),
    images,
  };
}

type Form = ReturnType<typeof startingForm>;
type TextKey = { [K in keyof Form]: Form[K] extends string ? K : never }[keyof Form];

const wholeNumber = (value: string) => value.trim() !== "" && Number.isInteger(Number(value)) && Number(value) >= 0;

function sizeProblem(sizes: SizeRow[]): string {
  const names = new Set<string>();
  for (const [index, size] of sizes.entries()) {
    const name = size.name.trim();
    const label = name || `Size ${index + 1}`;
    if (!name) return `${label}: enter the size name, such as 50 ml.`;
    if (names.has(name.toLowerCase())) return `Two sizes are named "${name}".`;
    names.add(name.toLowerCase());
    if (!(Number(size.price) > 0)) return `${label}: enter a valid price.`;
    if (size.original_price.trim() && !(Number(size.original_price) >= Number(size.price))) {
      return `${label}: MRP cannot be lower than the price.`;
    }
    if (!wholeNumber(size.stock)) return `${label}: stock must be a whole number, 0 or more.`;
  }
  return "";
}

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className={`${panel} space-y-4 p-4 sm:p-6`}>
      <div>
        <h2 className="font-serif text-xl text-[#263D18]">{title}</h2>
        {hint && <p className="mt-0.5 text-xs text-[#777968]">{hint}</p>}
      </div>
      {children}
    </section>
  );
}

export function ProductForm({ product, categories }: { product: AdminProduct | null; categories: CategoryOption[] }) {
  const router = useRouter();
  const [form, setForm] = useState<Form>(() => startingForm(product));
  const [customBadge, setCustomBadge] = useState(() => Boolean(product?.badge) && !BADGES.includes(product?.badge ?? ""));
  const [slugEdited, setSlugEdited] = useState(Boolean(product));
  // Images uploaded on this page that are not saved to the product yet.
  const [pendingImages, setPendingImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  // The open images tab: a size's key, or "" for General.
  const [imageTab, setImageTab] = useState("");
  const [savedNote, setSavedNote] = useState("");

  const set = <K extends keyof Form>(key: K, value: Form[K]) => setForm((previous) => ({ ...previous, [key]: value }));
  const hasSizes = form.sizes.length > 0;

  const tabOf = (image: FormImage) => (form.sizes.some((size) => size.key === image.sizeKey) ? image.sizeKey! : "");
  const imageTabs = [
    { key: "", label: "General" },
    ...form.sizes.map((size, index) => ({ key: size.key, label: size.name.trim() || `Size ${index + 1}` })),
  ].map((tab) => ({ ...tab, count: form.images.filter((image) => tabOf(image) === tab.key).length }));
  // Falls back to General if the open size has been removed.
  const openTab = imageTabs.find((tab) => tab.key === imageTab) ?? imageTabs[0];
  const tabImages = form.images.filter((image) => tabOf(image) === openTab.key);

  // Leaving without saving removes the pictures uploaded here.
  const discard = () => {
    if (!saving) void removeImages(pendingImages);
  };

  const addSize = () =>
    setForm((previous) => {
      // The first size starts from what was already typed for the product.
      const first = previous.sizes.length === 0;
      const row: SizeRow = {
        key: newKey(),
        name: "",
        price: first ? previous.price : "",
        original_price: first ? previous.original_price : "",
        stock: first ? previous.stock_quantity : "0",
      };
      return { ...previous, sizes: [...previous.sizes, row] };
    });
  const changeSize = (key: string, field: "name" | "price" | "original_price" | "stock", value: string) =>
    setForm((previous) => ({
      ...previous,
      sizes: previous.sizes.map((size) => (size.key === key ? { ...size, [field]: value } : size)),
    }));
  const removeSize = (row: SizeRow) =>
    setForm((previous) => {
      const sizes = previous.sizes.filter((size) => size.key !== row.key);
      return {
        ...previous,
        sizes,
        images: previous.images.map((image) => (image.sizeKey === row.key ? { ...image, sizeKey: undefined } : image)),
        // With no sizes left, the product keeps the last size's price and stock.
        ...(sizes.length === 0 ? { price: row.price, original_price: row.original_price, stock_quantity: row.stock } : {}),
      };
    });
  const moveSize = (index: number, step: -1 | 1) =>
    setForm((previous) => {
      const sizes = [...previous.sizes];
      [sizes[index], sizes[index + step]] = [sizes[index + step], sizes[index]];
      return { ...previous, sizes };
    });

  const changeFaq = (key: string, field: "question" | "answer", value: string) =>
    set("faqs", form.faqs.map((faq) => (faq.key === key ? { ...faq, [field]: value } : faq)));

  const upload = async (files: File[], sizeKey?: string) => {
    setUploading(true);
    setError("");
    setSavedNote("");
    const room = MAX_IMAGES - form.images.length;
    const problems: string[] = files.length > room ? [`A product can have up to ${MAX_IMAGES} images.`] : [];
    // Totals for the "compressed" message.
    let picked = 0;
    let stored = 0;
    for (const file of files.slice(0, room)) {
      try {
        await checkDimensions(file, MIN_SIZE);
        const image = await uploadAdminImage(file, "/liyana-naturals/products");
        picked += image.originalBytes;
        stored += image.storedBytes;
        setSavedNote(compressionNote(picked, stored));
        setPendingImages((previous) => [...previous, image.fileId]);
        setForm((previous) => ({
          ...previous,
          images: [...previous.images, { src: image.url, url: image.url, alt: file.name.slice(0, 240), fileId: image.fileId, sizeKey }],
        }));
      } catch (uploadError) {
        problems.push(`${file.name}: ${errorText(uploadError)}`);
      }
    }
    setError(problems.join(" "));
    setUploading(false);
  };

  const price = Number(form.price);
  const originalPrice = form.original_price.trim() ? Number(form.original_price) : null;
  const percentOff = originalPrice && form.price.trim() && originalPrice > price ? Math.round((1 - price / originalPrice) * 100) : 0;

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (saving || uploading) return;
    // A fully empty FAQ row is simply dropped.
    const faqs = form.faqs
      .map((faq) => ({ question: faq.question.trim(), answer: faq.answer.trim() }))
      .filter((faq) => faq.question || faq.answer);
    const stock = Number(form.stock_quantity || 0);
    const problem = !form.name.trim()
      ? "Enter the product name."
      : !form.category_id
        ? "Choose a category."
        : !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(form.slug)
          ? "The link name may use only small letters, numbers and single hyphens."
          : hasSizes
            ? sizeProblem(form.sizes)
            : !form.price.trim() || !Number.isFinite(price) || price < 0
              ? "Enter a valid price."
              : originalPrice !== null && !(originalPrice >= price)
                ? "MRP cannot be lower than the selling price."
                : !Number.isInteger(stock) || stock < 0
                  ? "Stock must be a whole number, 0 or more."
                  : "";
    const faqProblem = faqs.some((faq) => faq.question.length < 3 || faq.answer.length < 2)
      ? "Complete or remove each FAQ."
      : "";
    // A highlight with no words is simply dropped.
    const highlights = form.highlights
      .map((item) => ({ icon: item.icon, label: item.label.trim() }))
      .filter((item) => item.label);
    const tags = fromLines(form.tags);
    const extraProblem = highlights.some((item) => item.label.length < 2)
      ? "Each highlight needs a few words."
      : tags.length > 8 || tags.some((tag) => tag.length > 40)
        ? "Use up to 8 tags of 40 characters or fewer."
        : "";
    if (problem || faqProblem || extraProblem) {
      setError(problem || faqProblem || extraProblem);
      return;
    }

    const optional = (value: string) => value.trim() || null;
    const variants = form.sizes.map((size) => ({
      ...(size.id ? { id: size.id } : {}),
      name: size.name.trim(),
      price: Number(size.price),
      original_price: size.original_price.trim() ? Number(size.original_price) : null,
      stock_quantity: Number(size.stock),
    }));
    // The product shows its first size in stock, and the stock of all sizes.
    const shown = variants.find((size) => size.stock_quantity > 0) ?? variants[0];
    // General pictures go first, so the shop's main picture is one of them.
    const images = imageTabs.flatMap((tab) =>
      form.images
        .filter((image) => tabOf(image) === tab.key)
        .map(({ src, url, alt, fileId }) => ({
          src,
          url,
          alt,
          fileId,
          size: form.sizes.find((row) => row.key === tab.key)?.name.trim(),
        })),
    );
    const payload = {
      name: form.name.trim(),
      slug: form.slug,
      category_id: form.category_id,
      badge: form.badge.trim() || null,
      tagline: optional(form.tagline),
      short_description: optional(form.short_description),
      description: optional(form.description),
      how_to_use: optional(form.how_to_use),
      price: shown ? shown.price : price,
      original_price: shown ? shown.original_price : originalPrice,
      stock_quantity: shown ? variants.reduce((total, size) => total + size.stock_quantity, 0) : stock,
      ingredients: fromLines(form.ingredients),
      benefits: fromLines(form.benefits),
      seo_title: optional(form.seo_title),
      seo_description: optional(form.seo_description),
      faqs,
      highlights,
      tags,
      variants,
      is_active: form.is_active,
      is_featured: form.is_featured,
      is_best_seller: form.is_best_seller,
      images,
    };

    setSaving(true);
    setError("");
    try {
      await adminRequest(
        product ? `/api/admin/products/${product.id}` : "/api/admin/products",
        product ? "PATCH" : "POST",
        payload,
      );
    } catch (saveError) {
      setError(errorText(saveError));
      setSaving(false);
      return;
    }
    // Delete pictures that are no longer used.
    const kept = new Set(imageFileIds(form.images));
    const before = imageFileIds(toImages(product?.images));
    await removeImages([...before, ...pendingImages].filter((id) => !kept.has(id)));
    router.push("/admin/products");
    router.refresh();
  };

  const field = (key: TextKey, label: string, options: { maxLength?: number; placeholder?: string; decimal?: boolean } = {}) => (
    <label className="block text-sm font-medium">
      {label}
      <input
        value={form[key]}
        maxLength={options.maxLength}
        placeholder={options.placeholder}
        inputMode={options.decimal ? "decimal" : undefined}
        onChange={(event) => set(key, event.target.value)}
        className={inputClass}
      />
    </label>
  );
  const area = (key: TextKey, label: string, rows: number, maxLength: number, placeholder?: string) => (
    <label className="block text-sm font-medium">
      {label}
      <textarea
        rows={rows}
        value={form[key]}
        maxLength={maxLength}
        placeholder={placeholder}
        onChange={(event) => set(key, event.target.value)}
        className={inputClass}
      />
    </label>
  );
  const sizeField = (size: SizeRow, key: "name" | "price" | "original_price" | "stock", label: string, placeholder: string) => (
    <label className="block text-xs font-medium">
      {label}
      <input
        value={size[key]}
        maxLength={key === "name" ? 60 : 12}
        inputMode={key === "name" ? undefined : "decimal"}
        placeholder={placeholder}
        onChange={(event) => changeSize(size.key, key, event.target.value)}
        className={inputClass}
      />
    </label>
  );

  const previewTitle = form.seo_title.trim() || `${form.name.trim() || "Product name"} | ${siteConfig.name}`;
  const previewText = (form.seo_description || form.short_description || form.description).trim().slice(0, 170);

  return (
    <div className="space-y-5">
      <header className="space-y-3">
        <Link href="/admin/products" onClick={discard} className="inline-flex items-center gap-1.5 text-sm font-medium text-[#536B35] hover:text-[#263D18]">
          <ArrowLeft className="size-4" /> Back to Products
        </Link>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="min-w-0">
            <h1 className="break-words font-serif text-3xl text-[#263D18]">{product ? "Edit product" : "New product"}</h1>
            <p className="text-sm text-[#777968]">{product ? product.name : "Add a new product to your store."}</p>
          </div>
          {product?.is_active && (
            <Link href={`/products/${product.slug}`} target="_blank" className={secondaryButton}>
              <ExternalLink className="size-4" /> View in store
            </Link>
          )}
        </div>
      </header>

      <form onSubmit={save} noValidate className="space-y-5">
        <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <div className="min-w-0 space-y-5">
            <Section title="Basic information">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-medium">
                  Product name
                  <input
                    value={form.name}
                    maxLength={160}
                    onChange={(event) => {
                      const name = event.target.value;
                      setForm((previous) => ({ ...previous, name, slug: slugEdited ? previous.slug : slugify(name) }));
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
                      set("slug", event.target.value.toLowerCase());
                    }}
                    className={inputClass}
                  />
                  <span className="mt-1 block break-all text-xs font-normal text-[#777968]">
                    /products/{form.slug || "…"}
                    {product && form.slug !== product.slug ? " (old links will stop working)" : ""}
                  </span>
                </label>
                <label className="block text-sm font-medium">
                  Category <span className="text-red-600">*</span>
                  <select
                    required
                    value={form.category_id}
                    onChange={(event) => set("category_id", event.target.value)}
                    className={inputClass}
                  >
                    <option value="" disabled>
                      Choose a category
                    </option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                        {category.is_active ? "" : " (hidden)"}
                      </option>
                    ))}
                  </select>
                  {categories.length === 0 && (
                    <span className="mt-1 block text-xs font-normal text-amber-800">
                      <Link href="/admin/categories" onClick={discard} className="font-semibold underline">
                        Add a category
                      </Link>{" "}
                      first.
                    </span>
                  )}
                </label>
                {field("tagline", "Tagline (optional)", { maxLength: 240 })}
              </div>
            </Section>

            <Section
              title="Price, stock and sizes"
              hint={
                hasSizes
                  ? "Customers pick a size. The first size in stock is selected to start with."
                  : "Add sizes only if this product is sold in more than one, such as 50 ml and 100 ml."
              }
            >
              {hasSizes ? (
                <ul className="space-y-3">
                  {form.sizes.map((size, index) => (
                    <li key={size.key} className="rounded-xl border border-[#28321F]/10 bg-[#FBF7EE]/50 p-3">
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        {sizeField(size, "name", "Size", "50 ml")}
                        {sizeField(size, "price", "Price (₹)", "499")}
                        {sizeField(size, "original_price", "MRP (₹, optional)", "599")}
                        {sizeField(size, "stock", "Stock", "0")}
                      </div>
                      <div className="mt-2 flex items-center justify-end gap-1">
                        <button type="button" aria-label="Move size up" disabled={index === 0} onClick={() => moveSize(index, -1)} className={iconButton}>
                          <ArrowUp className="size-4" />
                        </button>
                        <button type="button" aria-label="Move size down" disabled={index === form.sizes.length - 1} onClick={() => moveSize(index, 1)} className={iconButton}>
                          <ArrowDown className="size-4" />
                        </button>
                        <button type="button" aria-label={`Remove size ${size.name || index + 1}`} onClick={() => removeSize(size)} className={dangerIconButton}>
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <>
                  <div className="grid gap-4 sm:grid-cols-3">
                    {field("price", "Selling price (₹)", { decimal: true })}
                    {field("original_price", "MRP (₹, optional)", { decimal: true })}
                    {field("stock_quantity", "Stock quantity", { decimal: true })}
                  </div>
                  {percentOff > 0 && <p className="text-xs font-semibold text-[#3C6E26]">Customers see {percentOff}% off.</p>}
                </>
              )}
              {form.sizes.length < MAX_SIZES && (
                <button type="button" onClick={addSize} className={addButton}>
                  <Plus className="size-4" /> {hasSizes ? "Add another size" : "Add sizes"}
                </button>
              )}
            </Section>

            <Section title="Description">
              {area("short_description", "Short description (optional)", 2, 1000)}
              {area("description", "Full description (optional)", 7, 10000)}
              {area("how_to_use", "How to use (optional)", 3, 5000)}
            </Section>

            <Section title="Benefits and ingredients" hint="Write one on each line.">
              <div className="grid gap-4 sm:grid-cols-2">
                {area("benefits", "Benefits", 6, 4000, "Hydrates skin")}
                {area("ingredients", "Ingredients", 6, 4000, "Aloe vera")}
              </div>
            </Section>

            <Section
              title="Highlights and tags"
              hint="Shown on the product page exactly as written, and hidden when empty. Only add what is true for this product."
            >
              <div>
                <p className="mb-2 text-sm font-medium">Highlight boxes (up to 4)</p>
                <BadgeListEditor
                  items={form.highlights}
                  onChange={(items) => set("highlights", items)}
                  placeholder="Hydrates deeply"
                  addLabel="Add highlight"
                />
              </div>
              {area("tags", "Tags (one per line)", 3, 330, "Cruelty Free")}
            </Section>

            <Section title="FAQs" hint="Questions customers often ask. Shown on the product page.">
              {form.faqs.map((faq, index) => (
                <div key={faq.key} className="space-y-2 rounded-xl border border-[#28321F]/10 bg-[#FBF7EE]/50 p-3">
                  <div className="flex items-end gap-2">
                    <label className="block min-w-0 flex-1 text-xs font-medium">
                      Question {index + 1}
                      <input value={faq.question} maxLength={200} onChange={(event) => changeFaq(faq.key, "question", event.target.value)} className={inputClass} />
                    </label>
                    <button type="button" aria-label={`Remove question ${index + 1}`} onClick={() => set("faqs", form.faqs.filter((item) => item.key !== faq.key))} className={`${dangerIconButton} mb-1`}>
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                  <label className="block text-xs font-medium">
                    Answer
                    <textarea rows={2} value={faq.answer} maxLength={2000} onChange={(event) => changeFaq(faq.key, "answer", event.target.value)} className={inputClass} />
                  </label>
                </div>
              ))}
              {form.faqs.length < MAX_FAQS && (
                <button type="button" onClick={() => set("faqs", [...form.faqs, { key: newKey(), question: "", answer: "" }])} className={addButton}>
                  <Plus className="size-4" /> Add question
                </button>
              )}
            </Section>

            <Section title="SEO" hint="How this product appears on Google. Left empty, the name and description are used.">
              <label className="block text-sm font-medium">
                SEO title (optional)
                <input value={form.seo_title} maxLength={70} onChange={(event) => set("seo_title", event.target.value)} className={inputClass} />
                <span className="mt-1 block text-xs font-normal text-[#777968]">{form.seo_title.length}/70</span>
              </label>
              <label className="block text-sm font-medium">
                SEO description (optional)
                <textarea rows={3} value={form.seo_description} maxLength={170} onChange={(event) => set("seo_description", event.target.value)} className={inputClass} />
                <span className="mt-1 block text-xs font-normal text-[#777968]">{form.seo_description.length}/170</span>
              </label>
              <div className="rounded-xl border border-[#28321F]/10 bg-white p-4">
                <p className="text-xs text-[#777968]">Search preview</p>
                <p className="mt-1 break-all text-xs text-[#3C4043]">
                  {siteConfig.url}/products/{form.slug || "…"}
                </p>
                <p className="mt-0.5 break-words text-lg leading-snug text-[#1a0dab]">{previewTitle}</p>
                <p className="mt-0.5 break-words text-sm text-[#4D5156]">{previewText || "The description will appear here."}</p>
              </div>
            </Section>
          </div>

          <div className="min-w-0 space-y-5">
            <Section title="Images" hint="At least 300 × 300. Pictures that are not square are cut to a square from the middle. JPG, PNG or WebP up to 40 MB, compressed automatically. You can pick several at once.">
              {savedNote && <p role="status" className="text-xs font-medium text-[#3C6E26]">{savedNote}</p>}
              {hasSizes && (
                <>
                  <div role="tablist" aria-label="Pictures for" className="flex flex-wrap gap-2">
                    {imageTabs.map((tab) => (
                      <button
                        key={tab.key || "general"}
                        type="button"
                        role="tab"
                        aria-selected={tab.key === openTab.key}
                        onClick={() => setImageTab(tab.key)}
                        className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold ${
                          tab.key === openTab.key
                            ? "border-[#263D18] bg-[#263D18] text-white"
                            : "border-[#28321F]/12 bg-white text-[#555C4A] hover:border-[#536B35]/50"
                        }`}
                      >
                        {tab.label}
                        {tab.count > 0 && <span className="ml-1.5 opacity-75">({tab.count})</span>}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-[#777968]">
                    {openTab.key === ""
                      ? "General pictures show for every size. The first one is the main picture in the shop."
                      : `These pictures show only when a customer selects ${openTab.label}.`}
                  </p>
                </>
              )}
              <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-2">
                {tabImages.map((image, index) => {
                  const preview = renderableImageUrl(image.src);
                  const others = form.images.filter((item) => item !== image);
                  return (
                    <li key={`${image.src}-${index}`} className={index === 0 ? "lg:col-span-2" : ""}>
                      <div className="relative aspect-square overflow-hidden rounded-xl border border-[#28321F]/10 bg-[#FBF7EE]">
                        {preview ? (
                          <Image src={preview} alt={`Product image ${index + 1}`} fill unoptimized sizes="400px" className="object-cover" />
                        ) : (
                          <span className="absolute inset-0 grid place-items-center text-[#777968]">
                            <ImageOff className="size-5" />
                          </span>
                        )}
                        <button
                          type="button"
                          aria-label={`Remove image ${index + 1}`}
                          onClick={() => set("images", others)}
                          className="absolute right-2 top-2 grid size-8 place-items-center rounded-full bg-white/95 text-red-600 shadow-sm"
                        >
                          <X className="size-4" />
                        </button>
                        {index === 0 ? (
                          <span className="absolute bottom-2 left-2 rounded-full bg-[#263D18] px-2.5 py-1 text-[11px] font-semibold text-white">
                            {openTab.key === "" ? "Main" : "First"}
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => set("images", [image, ...others])}
                            className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-[#263D18] shadow-sm"
                          >
                            <Star className="size-3" /> {openTab.key === "" ? "Make main" : "Make first"}
                          </button>
                        )}
                      </div>
                      {hasSizes && (
                        <select
                          aria-label={`Move image ${index + 1}`}
                          value={openTab.key}
                          onChange={(event) =>
                            set(
                              "images",
                              form.images.map((item) =>
                                item === image ? { ...item, sizeKey: event.target.value || undefined } : item,
                              ),
                            )
                          }
                          className="mt-1.5 h-9 w-full rounded-lg border border-[#28321F]/12 bg-white px-2 text-xs"
                        >
                          {imageTabs.map((tab) => (
                            <option key={tab.key || "general"} value={tab.key}>
                              Show in: {tab.label}
                            </option>
                          ))}
                        </select>
                      )}
                    </li>
                  );
                })}
                {form.images.length < MAX_IMAGES && (
                  <li className={tabImages.length === 0 ? "lg:col-span-2" : ""}>
                    <label className={`flex aspect-square cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-[#536B35]/40 text-xs font-semibold text-[#263D18] hover:bg-[#EAF1DF]/50 ${uploading ? "opacity-60" : ""}`}>
                      <Upload className="size-5" />
                      {uploading ? "Uploading…" : hasSizes ? `Add ${openTab.label} images` : "Add images"}
                      <input
                        type="file"
                        multiple
                        accept="image/jpeg,image/png,image/webp"
                        disabled={uploading}
                        className="sr-only"
                        onChange={(event) => {
                          const files = Array.from(event.target.files ?? []);
                          event.target.value = "";
                          if (files.length) void upload(files, openTab.key || undefined);
                        }}
                      />
                    </label>
                  </li>
                )}
              </ul>
            </Section>

            <Section title="Status">
              <label className="block text-sm font-medium">
                Badge
                <select
                  value={customBadge ? OWN_BADGE : form.badge}
                  onChange={(event) => {
                    const own = event.target.value === OWN_BADGE;
                    setCustomBadge(own);
                    set("badge", own ? "" : event.target.value);
                  }}
                  className={inputClass}
                >
                  <option value="">None</option>
                  {BADGES.map((badge) => (
                    <option key={badge} value={badge}>
                      {badge}
                    </option>
                  ))}
                  <option value={OWN_BADGE}>Custom (type your own)</option>
                </select>
              </label>
              {customBadge && (
                <label className="block text-sm font-medium">
                  Your badge
                  <input
                    value={form.badge}
                    maxLength={24}
                    placeholder="Limited Edition"
                    onChange={(event) => set("badge", event.target.value)}
                    className={inputClass}
                  />
                  <span className="mt-1 block text-xs font-normal text-[#777968]">{form.badge.length}/24 characters. Leave empty for no badge.</span>
                </label>
              )}
              <div className="space-y-3">
                {(
                  [
                    ["is_active", "Active in store"],
                    ["is_featured", "Featured"],
                    ["is_best_seller", "Best seller"],
                  ] as const
                ).map(([key, label]) => (
                  <div key={key} className="rounded-xl border border-[#28321F]/10 bg-[#FBF7EE]/60 px-4 py-3">
                    <Switch checked={form[key]} label={label} onChange={() => set(key, !form[key])} />
                  </div>
                ))}
              </div>
            </Section>
          </div>
        </div>

        {/* Stays in view, so saving never needs a scroll. */}
        <div className="sticky bottom-3 z-20 space-y-3 rounded-2xl border border-[#28321F]/10 bg-white/95 p-3 shadow-elevated backdrop-blur">
          <FormError>{error}</FormError>
          <div className="flex justify-end gap-3">
            <Link href="/admin/products" onClick={discard} className={secondaryButton}>
              Cancel
            </Link>
            <button type="submit" disabled={saving || uploading} className={primaryButton}>
              <Save className="size-4" /> {saving ? "Saving…" : product ? "Save changes" : "Add product"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
