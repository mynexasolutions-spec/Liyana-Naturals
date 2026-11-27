import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { blogCreateSchema, type BlogCreatePayload } from "@/lib/blogs/schema";
import { databaseError, requireBlogAdmin, validateImageAsset, validationMessage } from "@/lib/blogs/admin";

function blogPaths(slug: string) {
  revalidatePath("/");
  revalidatePath("/blog");
  revalidatePath(`/blog/${slug}`);
}

function blogBody(payload: BlogCreatePayload, id: string) {
  return {
    id,
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
    ...(payload.sections?.length ? { sections: payload.sections } : {}),
    author: {
      name: payload.author_name,
      role: payload.author_role ?? "",
      bio: payload.author_bio ?? "",
    },
  };
}

async function parseRequest(request: Request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

export async function GET() {
  try {
    const admin = await requireBlogAdmin();
    if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { data, error } = await admin.supabase
      .from("site_content")
      .select("*")
      .like("section_key", "blog:%")
      .order("updated_at", { ascending: false });
    if (error) return databaseError(error, "loaded");
    return NextResponse.json({ site_content: data ?? [] });
  } catch (error) {
    console.error("Blog list failed", { error });
    return NextResponse.json({ error: "Blogs could not be loaded. Check the server configuration." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const admin = await requireBlogAdmin();
    if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await parseRequest(request);
    if (!body) return NextResponse.json({ error: "Invalid blog data." }, { status: 400 });
    const parsed = blogCreateSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: validationMessage(parsed.error.issues) }, { status: 400 });
    const payload = {
      ...parsed.data,
      published_at: parsed.data.published_at || new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    };

    const imageError = await validateImageAsset(admin.supabase, payload);
    if (imageError) return imageError;

    const id = crypto.randomUUID();
    const { data, error } = await admin.supabase
      .from("site_content")
      .insert({
        section_key: `blog:${payload.slug}`,
        title: payload.title,
        subtitle: payload.subtitle ?? null,
        body: blogBody(payload, id),
        slug: payload.slug,
        excerpt: payload.excerpt,
        category: payload.category,
        read_time: payload.read_time,
        published_at: payload.published_at,
        cover_image: payload.cover_image,
        cover_image_file_id: payload.cover_image_file_id,
        tags: payload.tags,
        key_takeaways: payload.key_takeaways,
        content: payload.content ?? null,
        author_name: payload.author_name,
        author_role: payload.author_role ?? null,
        author_bio: payload.author_bio ?? null,
        is_featured: payload.is_featured,
        is_published: payload.is_published,
      })
      .select("*")
      .single();
    if (error) return databaseError(error, "saved");
    blogPaths(payload.slug);
    return NextResponse.json({ site_content: data }, { status: 201 });
  } catch (error) {
    console.error("Blog create failed", { error });
    return NextResponse.json({ error: "Blog could not be saved. Check the server configuration." }, { status: 500 });
  }
}
