"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ExternalLink, ImageOff, Pencil, Trash2 } from "lucide-react";
import {
  BlogSectionsEditor,
  sectionsPayload,
  toSectionDrafts,
  type SectionDraft,
} from "@/components/admin/BlogSectionsEditor";
import {
  adminRequest,
  ConfirmDialog,
  dangerIconButton,
  EmptyState,
  errorText,
  Feedback,
  FormActions,
  FormError,
  iconButton,
  ImageField,
  inputClass,
  Modal,
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
  DataTable,
  DataView,
} from "@/components/admin/kit";
import { renderableImageUrl } from "@/lib/media/image-url";

export type AdminBlog = {
  id: string;
  title: string;
  slug: string;
  subtitle: string;
  excerpt: string;
  category: string;
  read_time: string;
  published_at: string;
  cover_image: string;
  cover_image_file_id: string;
  tags: string[];
  key_takeaways: string[];
  content: string;
  sections: {
    id: string;
    heading: string;
    paragraphs: string[];
    bullets: string[];
    highlightTip: string;
  }[];
  author_name: string;
  author_role: string;
  author_bio: string;
  is_featured: boolean;
  is_published: boolean;
};

const FILTERS = [
  ["all", "All"],
  ["published", "Published"],
  ["draft", "Drafts"],
  ["featured", "Featured"],
] as const;
const PER_PAGE = 9;

const EMPTY = {
  title: "",
  slug: "",
  subtitle: "",
  excerpt: "",
  category: "",
  read_time: "",
  published_at: "",
  cover_image: "",
  cover_image_file_id: "",
  tags: "",
  key_takeaways: "",
  content: "",
  sections: [] as SectionDraft[],
  author_name: "Liyana Naturals",
  author_role: "",
  author_bio: "",
  is_featured: false,
  is_published: true,
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 160);

const lines = (value: string, separator: RegExp) => [...new Set(value.split(separator).map((item) => item.trim()).filter(Boolean))];

// About 200 words are read in a minute.
const readingTime = (content: string) => `${Math.max(1, Math.round(content.trim().split(/\s+/).filter(Boolean).length / 200))} min read`;

export function BlogManager({ blogs }: { blogs: AdminBlog[] }) {
  useRealtimeRefresh("admin-blogs", ["site_content"]);
  const [view, setView] = useViewMode("blogs");
  const { run, busy, locked, error, notice } = useAdminAction();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<(typeof FILTERS)[number][0]>("all");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<AdminBlog | "new" | null>(null);
  const [deleting, setDeleting] = useState<AdminBlog | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [slugEdited, setSlugEdited] = useState(false);
  const [formError, setFormError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [pending, setPending] = useState<string[]>([]);

  const needle = query.trim().toLowerCase();
  const matched = blogs.filter(
    (blog) =>
      (filter === "all" ||
        (filter === "published" && blog.is_published) ||
        (filter === "draft" && !blog.is_published) ||
        (filter === "featured" && blog.is_featured)) &&
      (!needle || `${blog.title} ${blog.category} ${blog.tags.join(" ")}`.toLowerCase().includes(needle)),
  );
  const pages = Math.max(1, Math.ceil(matched.length / PER_PAGE));
  const current = Math.min(page, pages);
  const visible = matched.slice((current - 1) * PER_PAGE, current * PER_PAGE);
  const categories = [...new Set(blogs.map((blog) => blog.category).filter(Boolean))];

  const set = <K extends keyof typeof EMPTY>(key: K, value: (typeof EMPTY)[K]) =>
    setForm((values) => ({ ...values, [key]: value }));

  const openForm = (blog: AdminBlog | "new") => {
    setEditing(blog);
    setSlugEdited(blog !== "new");
    setPending([]);
    setFormError("");
    setForm(
      blog === "new"
        ? EMPTY
        : {
            ...blog,
            tags: blog.tags.join(", "),
            key_takeaways: blog.key_takeaways.join("\n"),
            sections: toSectionDrafts(blog.sections),
          },
    );
  };

  const closeForm = () => {
    if (busy || uploading) return;
    void removeImages(pending);
    setPending([]);
    setEditing(null);
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editing) return;
    if (!form.title.trim() || !form.slug || !form.excerpt.trim() || !form.category.trim() || !form.author_name.trim()) {
      return setFormError("Fill in the title, link name, short summary, category and author.");
    }
    if (!form.cover_image || !form.cover_image_file_id) {
      return setFormError("Upload a cover image.");
    }
    const sections = sectionsPayload(form.sections);
    if (!sections) {
      return setFormError("Give every section a heading, or remove the section.");
    }
    // The article id is part of the address, not the saved fields.
    const values: Record<string, unknown> = { ...form };
    delete values.id;
    const payload = {
      ...values,
      subtitle: form.subtitle.trim() || null,
      content: form.content.trim() || null,
      author_role: form.author_role.trim() || null,
      author_bio: form.author_bio.trim() || null,
      read_time: form.read_time.trim() || readingTime(articleText),
      sections,
      tags: lines(form.tags, /[\n,]+/),
      key_takeaways: lines(form.key_takeaways, /\n+/),
    };

    setFormError("");
    let failure = "";
    const saved = await run(async () => {
      try {
        await adminRequest(
          editing === "new" ? "/api/admin/blogs" : `/api/admin/blogs/${editing.id}`,
          editing === "new" ? "POST" : "PATCH",
          payload,
        );
      } catch (saveError) {
        failure = errorText(saveError);
        throw saveError;
      }
    }, "Article saved.");
    if (!saved) return setFormError(failure);

    const replaced = editing === "new" ? [] : [editing.cover_image_file_id];
    void removeImages([...pending, ...replaced].filter((id) => id !== form.cover_image_file_id));
    setPending([]);
    setEditing(null);
  };

  const toggle = (blog: AdminBlog, key: "is_published" | "is_featured") =>
    run(() => adminRequest(`/api/admin/blogs/${blog.id}`, "PATCH", { [key]: !blog[key] }), "Article updated.");

  const publishedSwitch = (blog: AdminBlog, label: string) => (
    <Switch checked={blog.is_published} label={label} disabled={locked} onChange={() => void toggle(blog, "is_published")} />
  );
  const featuredSwitch = (blog: AdminBlog, label: string) => (
    <Switch checked={blog.is_featured} label={label} disabled={locked} onChange={() => void toggle(blog, "is_featured")} />
  );
  const actions = (blog: AdminBlog) => (
    <div className="flex justify-end gap-1">
      {blog.is_published && (
        <Link href={`/blog/${blog.slug}`} target="_blank" aria-label="View article" className={iconButton}>
          <ExternalLink className="size-4" />
        </Link>
      )}
      <button type="button" aria-label={`Edit ${blog.title}`} onClick={() => openForm(blog)} className={iconButton}>
        <Pencil className="size-4" />
      </button>
      <button type="button" aria-label={`Delete ${blog.title}`} onClick={() => setDeleting(blog)} className={dangerIconButton}>
        <Trash2 className="size-4" />
      </button>
    </div>
  );
  const cover = (blog: AdminBlog, className: string, sizes: string) => {
    const image = renderableImageUrl(blog.cover_image);
    return (
      <div className={`relative overflow-hidden bg-[#FBF7EE] ${className}`}>
        {image ? (
          <Image src={image} alt="" fill unoptimized sizes={sizes} className="object-cover" />
        ) : (
          <span className="absolute inset-0 grid place-items-center text-[#777968]">
            <ImageOff className="size-5" />
          </span>
        )}
      </div>
    );
  };

  // The text readers see: the sections if there are any, otherwise the plain article.
  const articleText = form.sections.length
    ? form.sections.map((section) => [section.heading, section.paragraphs, section.bullets, section.highlightTip].join(" ")).join(" ")
    : form.content;

  const field = (
    key: "subtitle" | "read_time" | "published_at" | "author_name" | "author_role",
    label: string,
    placeholder = "",
  ) => (
    <label className="block min-w-0 text-sm font-medium">
      {label}
      <input value={form[key]} placeholder={placeholder} onChange={(event) => set(key, event.target.value)} className={inputClass} />
    </label>
  );

  return (
    <div className="space-y-5">
      <PageHeader title="Blogs" addLabel="New article" onAdd={() => openForm("new")} />
      <StatGrid
        items={[
          ["Articles", blogs.length],
          ["Published", blogs.filter((blog) => blog.is_published).length],
          ["Drafts", blogs.filter((blog) => !blog.is_published).length],
          ["On homepage", blogs.filter((blog) => blog.is_published && blog.is_featured).length],
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
        placeholder="Search title, category or tag"
        view={view}
        onView={setView}
      />
      <Feedback error={editing ? "" : error} notice={notice} />

      {visible.length === 0 ? (
        <EmptyState>{blogs.length === 0 ? "No articles yet. Write your first one." : "No articles match."}</EmptyState>
      ) : (
        <DataView
          view={view}
          table={
            <DataTable
              rows={visible}
              columns={[
                {
                  label: "Article",
                  cell: (blog) => (
                    <div className="flex items-center gap-3">
                      {cover(blog, "h-14 w-20 shrink-0 rounded-lg", "80px")}
                      <div className="min-w-0 max-w-xs">
                        <p className="line-clamp-2 font-medium text-[#263D18]">{blog.title}</p>
                        <p className="truncate text-xs text-[#777968]">/blog/{blog.slug}</p>
                      </div>
                    </div>
                  ),
                },
                { label: "Category", cell: (blog) => blog.category },
                {
                  label: "Author",
                  cell: (blog) => (
                    <>
                      <p>{blog.author_name}</p>
                      <p className="whitespace-nowrap text-xs text-[#777968]">{blog.published_at}</p>
                    </>
                  ),
                },
                { label: "Published", cell: (blog) => publishedSwitch(blog, blog.is_published ? "Live" : "Draft") },
                { label: "Featured", cell: (blog) => featuredSwitch(blog, blog.is_featured ? "Yes" : "No") },
                { label: "Actions", align: "right", cell: actions },
              ]}
            />
          }
          grid={
            <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {visible.map((blog) => (
                <li key={blog.id} className={`${panel} flex min-w-0 flex-col overflow-hidden`}>
                  <div className="relative">
                    {cover(blog, "aspect-[16/9]", "(max-width: 640px) 100vw, 400px")}
                    <span className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-semibold ${blog.is_published ? "bg-emerald-50 text-emerald-800" : "bg-[#28321F] text-white"}`}>
                      {blog.is_published ? "Published" : "Draft"}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col gap-2 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#536B35]">{blog.category}</p>
                    <h2 className="line-clamp-2 font-serif text-lg text-[#263D18]">{blog.title}</h2>
                    <p className="line-clamp-2 text-sm text-[#555C4A]">{blog.excerpt}</p>
                    <p className="text-xs text-[#777968]">{[blog.author_name, blog.published_at, blog.read_time].filter(Boolean).join(" · ")}</p>
                    <div className="mt-auto flex flex-wrap gap-x-5 gap-y-2 border-t border-[#28321F]/8 pt-3">
                      {publishedSwitch(blog, "Published")}
                      {featuredSwitch(blog, "Featured")}
                    </div>
                    {actions(blog)}
                  </div>
                </li>
              ))}
            </ul>
          }
        />
      )}
      <Pager page={current} pages={pages} onPage={setPage} />

      {editing && (
        <Modal title={editing === "new" ? "New article" : "Edit article"} wide onClose={closeForm}>
          <form onSubmit={save} noValidate className="space-y-4">
            <FormError>{formError}</FormError>
            <label className="block text-sm font-medium">
              Title
              <input
                value={form.title}
                maxLength={240}
                onChange={(event) => {
                  const title = event.target.value;
                  setForm((values) => ({ ...values, title, slug: slugEdited ? values.slug : slugify(title) }));
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
              <span className="mt-1 block break-all text-xs font-normal text-[#777968]">Article link: /blog/{form.slug || "…"}</span>
            </label>
            {field("subtitle", "Subtitle (optional)")}
            <label className="block text-sm font-medium">
              Short summary
              <textarea rows={2} maxLength={2000} value={form.excerpt} onChange={(event) => set("excerpt", event.target.value)} className={inputClass} />
            </label>
            <ImageField
              label="Cover image"
              help="At least 600 × 400. JPG, PNG or WebP up to 40 MB, compressed automatically."
              url={form.cover_image}
              folder="/liyana-naturals/blog"
              rules={{ minWidth: 600, minHeight: 400 }}
              onBusy={setUploading}
              onUploaded={(image) => {
                setPending((ids) => [...ids, image.fileId]);
                setForm((values) => ({ ...values, cover_image: image.url, cover_image_file_id: image.fileId }));
              }}
            />
            {form.sections.length === 0 && (
              <label className="block text-sm font-medium">
                Article
                <textarea
                  rows={12}
                  maxLength={100000}
                  value={form.content}
                  placeholder="Write the article. Leave a blank line between paragraphs."
                  onChange={(event) => set("content", event.target.value)}
                  className={inputClass}
                />
              </label>
            )}
            <BlogSectionsEditor
              sections={form.sections}
              plainText={form.content}
              onChange={(sections, movedPlainText) =>
                setForm((values) => ({ ...values, sections, content: movedPlainText ? "" : values.content }))
              }
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-medium">
                Category
                <input value={form.category} maxLength={120} list="blog-categories" placeholder="Skincare" onChange={(event) => set("category", event.target.value)} className={inputClass} />
                <datalist id="blog-categories">
                  {categories.map((category) => (
                    <option key={category} value={category} />
                  ))}
                </datalist>
              </label>
              {field("read_time", "Read time (optional)", readingTime(articleText))}
              {field("published_at", "Published date (optional)", "Today")}
              {field("author_name", "Author name")}
              {field("author_role", "Author role (optional)")}
              <label className="block text-sm font-medium">
                Tags (separate with commas)
                <input value={form.tags} onChange={(event) => set("tags", event.target.value)} className={inputClass} />
              </label>
            </div>
            <label className="block text-sm font-medium">
              Key takeaways (one per line)
              <textarea rows={3} value={form.key_takeaways} onChange={(event) => set("key_takeaways", event.target.value)} className={inputClass} />
            </label>
            <label className="block text-sm font-medium">
              About the author (optional)
              <textarea rows={2} maxLength={2000} value={form.author_bio} onChange={(event) => set("author_bio", event.target.value)} className={inputClass} />
            </label>
            <div className="flex flex-wrap gap-x-6 gap-y-3">
              <Switch checked={form.is_published} label="Published" onChange={() => set("is_published", !form.is_published)} />
              <Switch checked={form.is_featured} label="Feature on homepage" onChange={() => set("is_featured", !form.is_featured)} />
            </div>
            <FormActions busy={busy || uploading} label="Save article" onCancel={closeForm} />
          </form>
        </Modal>
      )}

      {deleting && (
        <ConfirmDialog
          title="Delete article"
          busy={busy}
          onCancel={() => setDeleting(null)}
          onConfirm={() =>
            void run(async () => {
              await adminRequest(`/api/admin/blogs/${deleting.id}`, "DELETE");
              await removeImages([deleting.cover_image_file_id]);
            }, "Article deleted.").then(() => setDeleting(null))
          }
        >
          Delete <strong>{deleting.title}</strong>? To only hide it, switch off Published instead.
        </ConfirmDialog>
      )}
    </div>
  );
}
