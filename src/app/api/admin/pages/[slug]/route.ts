import { NextResponse } from "next/server";
import { contentPageSchema, isPageSlug, pageKey } from "@/lib/content/pages";
import { readAdminRequest } from "@/lib/security/admin-route";
import { jsonError } from "@/lib/security/request";
import { getAdminSession } from "@/lib/supabase/admin-auth";

export async function PATCH(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  // Room for the longest page in any language.
  const body = await readAdminRequest(request, 130_000);
  if (!body.ok) return body.response;
  const { slug } = await params;
  if (!isPageSlug(slug)) return jsonError("Unknown page.", 404);
  const parsed = contentPageSchema.safeParse(body.data);
  if (!parsed.success) return jsonError(parsed.error.issues[0]?.message ?? "Check the page.", 400);

  // The signed-in admin's own client, so database access rules apply too.
  const session = await getAdminSession();
  if (!session) return jsonError("Forbidden", 403);

  const { title, content, is_published } = parsed.data;
  const { error } = await session.supabase
    .from("site_content")
    .upsert({ section_key: pageKey(slug), title, body: { content }, is_published }, { onConflict: "section_key" });
  if (error) {
    console.error("[admin-pages] Save failed:", error.message);
    return jsonError("The page could not be saved.", 500);
  }
  return NextResponse.json({ ok: true });
}
