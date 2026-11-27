import { BlogManager, type AdminBlog } from "@/components/admin/BlogManager";
import { fetchAll, requireAdminPage } from "@/lib/admin/server";

type Row = Record<string, unknown>;

const record = (value: unknown): Row =>
  value && typeof value === "object" && !Array.isArray(value) ? (value as Row) : {};
// Older articles keep some fields only inside `body`.
const text = (...values: unknown[]) => (values.find((value) => typeof value === "string" && value) as string) ?? "";
const list = (...values: unknown[]) => {
  const found = values.find((value) => Array.isArray(value) && value.length);
  return Array.isArray(found) ? found.filter((item): item is string => typeof item === "string") : [];
};

function toSections(value: unknown): AdminBlog["sections"] {
  if (!Array.isArray(value)) return [];
  return value.map((item, index) => {
    const section = record(item);
    return {
      id: text(section.id) || `section-${index + 1}`,
      heading: text(section.heading),
      paragraphs: list(section.paragraphs),
      bullets: list(section.bullets),
      highlightTip: text(section.highlightTip),
    };
  });
}

function toBlog(row: Row): AdminBlog {
  const body = record(row.body);
  const author = record(body.author);
  return {
    id: String(row.id),
    title: text(row.title, body.title),
    slug: text(row.slug, body.slug, String(row.section_key ?? "").replace(/^blog:/, "")),
    subtitle: text(row.subtitle, body.subtitle),
    excerpt: text(row.excerpt, body.excerpt),
    category: text(row.category, body.category, "Journal"),
    read_time: text(row.read_time, body.readTime),
    published_at: text(row.published_at, body.publishedAt),
    cover_image: text(row.cover_image, body.coverImage),
    cover_image_file_id: text(row.cover_image_file_id, body.coverImageFileId),
    tags: list(row.tags, body.tags),
    key_takeaways: list(row.key_takeaways, body.keyTakeaways),
    content: text(row.content, body.content),
    sections: toSections(body.sections),
    author_name: text(row.author_name, author.name, "Liyana Naturals"),
    author_role: text(row.author_role, author.role),
    author_bio: text(row.author_bio, author.bio),
    is_featured: Boolean(row.is_featured),
    is_published: Boolean(row.is_published),
  };
}

export default async function BlogsPage() {
  const { supabase } = await requireAdminPage();
  const rows = await fetchAll<Row>("Blogs", (from, to) =>
    supabase
      .from("site_content")
      .select("*")
      .like("section_key", "blog:%")
      .order("updated_at", { ascending: false })
      .order("id")
      .range(from, to),
  );

  return <BlogManager blogs={rows.map(toBlog)} />;
}
