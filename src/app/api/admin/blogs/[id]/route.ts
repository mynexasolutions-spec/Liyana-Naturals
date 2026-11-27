import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { blogCreateSchema, blogUpdateSchema, type BlogCreatePayload, type BlogUpdatePayload } from "@/lib/blogs/schema";
import { databaseError, requireBlogAdmin, validateImageAsset, validationMessage, type SupabaseAdminClient } from "@/lib/blogs/admin";

type BlogRow = Record<string, unknown>;

function record(value: unknown): BlogRow {
  return value && typeof value === "object" && !Array.isArray(value) ? value as BlogRow : {};
}

function text(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value.trim() : fallback;
}

function list(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string" && Boolean(item.trim())).map((item) => item.trim())
    : [];
}

function revalidateBlogPaths(slugs: string[]) {
  revalidatePath("/");
  revalidatePath("/blog");
  for (const slug of new Set(slugs.filter(Boolean))) revalidatePath(`/blog/${slug}`);
}

function mergedPayload(row: BlogRow, patch: BlogUpdatePayload): BlogCreatePayload {
  const body = record(row.body);
  const author = record(body.author);
  return {
    // Left out of an update, the saved sections stay as they are.
    sections: patch.sections,
    slug: patch.slug ?? text(row.slug, text(body.slug, text(row.section_key).replace(/^blog:/, ""))),
    title: patch.title ?? text(row.title, text(body.title)),
    subtitle: patch.subtitle !== undefined ? patch.subtitle : (row.subtitle === null ? null : text(row.subtitle, text(body.subtitle))),
    excerpt: patch.excerpt ?? text(row.excerpt, text(body.excerpt, text(row.subtitle))),
    category: patch.category ?? text(row.category, text(body.category, "Journal")),
    read_time: patch.read_time ?? text(row.read_time, text(body.readTime)),
    published_at: patch.published_at ?? text(row.published_at, text(body.publishedAt)),
    cover_image: patch.cover_image ?? text(row.cover_image, text(body.coverImage)),
    cover_image_file_id: patch.cover_image_file_id ?? text(row.cover_image_file_id, text(body.coverImageFileId)),
    tags: patch.tags ?? list(row.tags ?? body.tags),
    key_takeaways: patch.key_takeaways ?? list(row.key_takeaways ?? body.keyTakeaways),
    content: patch.content !== undefined ? patch.content : (row.content === null ? null : text(row.content, text(body.content))),
    author_name: patch.author_name ?? text(row.author_name, text(author.name, "Liyana Naturals")),
    author_role: patch.author_role !== undefined ? patch.author_role : (row.author_role === null ? null : text(row.author_role, text(author.role))),
    author_bio: patch.author_bio !== undefined ? patch.author_bio : (row.author_bio === null ? null : text(row.author_bio, text(author.bio))),
    is_featured: patch.is_featured ?? Boolean(row.is_featured ?? body.featured),
    is_published: patch.is_published ?? Boolean(row.is_published),
  };
}

function blogBody(payload: BlogCreatePayload, id: string, existing: unknown) {
  const previous = record(existing);
  return {
    ...previous,
    id: text(previous.id, id),
    title: payload.title,
    slug: payload.slug,
    subtitle: payload.subtitle ?? "",
    excerpt: payload.excerpt,
    category: payload.category,
    readTime: payload.read_time,
    publishedAt: payload.published_at,
    featured: payload.is_featured,
    coverImage: payload.cover_image,
    coverImageFileId: payload.cover_image_file_id,
    tags: payload.tags,
    keyTakeaways: payload.key_takeaways,
    content: payload.content ?? "",
    ...(payload.sections ? { sections: payload.sections } : {}),
    author: {
      ...record(previous.author),
      name: payload.author_name,
      role: payload.author_role ?? "",
      bio: payload.author_bio ?? "",
    },
  };
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireBlogAdmin();
    if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const { id } = await params;
    if (!isUuid(id)) return NextResponse.json({ error: "Invalid blog id." }, { status: 400 });

    const body = await request.json().catch(() => null);
    if (!body) return NextResponse.json({ error: "Invalid blog data." }, { status: 400 });
    const parsed = blogUpdateSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: validationMessage(parsed.error.issues) }, { status: 400 });

    const existingResult = await admin.supabase.from("site_content").select("*").eq("id", id).like("section_key", "blog:%").maybeSingle();
    const existing = existingResult.data;
    if (existingResult.error) return databaseError(existingResult.error, "loaded");
    if (!existing) return NextResponse.json({ error: "Blog not found." }, { status: 404 });
    return updateBlog(admin.supabase, id, existing as BlogRow, parsed.data);
  } catch (error) {
    console.error("Blog update failed", { error });
    return NextResponse.json({ error: "Blog could not be updated. Check the server configuration." }, { status: 500 });
  }
}

async function updateBlog(supabase: SupabaseAdminClient, id: string, existing: BlogRow, patch: BlogUpdatePayload) {
  const merged = blogCreateSchema.safeParse(mergedPayload(existing, patch));
  if (!merged.success) return NextResponse.json({ error: validationMessage(merged.error.issues) }, { status: 400 });
  const imageError = await validateImageAsset(supabase, merged.data);
  if (imageError) return imageError;

  const { data, error } = await supabase
    .from("site_content")
    .update({
      section_key: `blog:${merged.data.slug}`,
      title: merged.data.title,
      subtitle: merged.data.subtitle ?? null,
      body: blogBody(merged.data, id, existing.body),
      slug: merged.data.slug,
      excerpt: merged.data.excerpt,
      category: merged.data.category,
      read_time: merged.data.read_time,
      published_at: merged.data.published_at,
      cover_image: merged.data.cover_image,
      cover_image_file_id: merged.data.cover_image_file_id,
      tags: merged.data.tags,
      key_takeaways: merged.data.key_takeaways,
      content: merged.data.content ?? null,
      author_name: merged.data.author_name,
      author_role: merged.data.author_role ?? null,
      author_bio: merged.data.author_bio ?? null,
      is_featured: merged.data.is_featured,
      is_published: merged.data.is_published,
    })
    .eq("id", id)
    .select("*")
    .single();
  if (error) return databaseError(error, "updated");
  revalidateBlogPaths([text(existing.slug, text(record(existing.body).slug)), merged.data.slug]);
  return NextResponse.json({ site_content: data });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  void request;
  try {
    const admin = await requireBlogAdmin();
    if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const { id } = await params;
    if (!isUuid(id)) return NextResponse.json({ error: "Invalid blog id." }, { status: 400 });

    const existing = await admin.supabase.from("site_content").select("slug,body").eq("id", id).like("section_key", "blog:%").maybeSingle();
    if (existing.error) return databaseError(existing.error, "loaded");
    if (!existing.data) return NextResponse.json({ error: "Blog not found." }, { status: 404 });
    const { error } = await admin.supabase.from("site_content").delete().eq("id", id);
    if (error) return databaseError(error, "deleted");
    const body = record(existing.data.body);
    revalidateBlogPaths([text(existing.data.slug, text(body.slug))]);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Blog delete failed", { error });
    return NextResponse.json({ error: "Blog could not be deleted. Check the server configuration." }, { status: 500 });
  }
}
