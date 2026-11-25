import "server-only";

import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getAdminSession } from "@/lib/supabase/admin-auth";
import type { BlogCreatePayload } from "@/lib/blogs/schema";

export type SupabaseAdminClient = ReturnType<typeof createSupabaseAdminClient>;

export function validationMessage(issues: { path: PropertyKey[]; message: string }[]): string {
  return issues.map((issue) => `${issue.path.join(".") || "Blog"}: ${issue.message}`).join(" ");
}

export function databaseError(error: { code?: string; message?: string }, action: string) {
  if (error.code === "23505") {
    return NextResponse.json({ error: "A blog with this slug already exists." }, { status: 409 });
  }
  if (error.code === "23514") {
    return NextResponse.json({ error: "The blog contains a value that does not match the database rules." }, { status: 400 });
  }
  console.error(`Blog ${action} failed`, { code: error.code, message: error.message });
  return NextResponse.json({ error: `Blog could not be ${action}. Try again.` }, { status: 500 });
}

export async function validateImageAsset(
  supabase: SupabaseAdminClient,
  payload: Partial<BlogCreatePayload>,
): Promise<NextResponse | null> {
  if (payload.cover_image === undefined && payload.cover_image_file_id === undefined) return null;
  if (!payload.cover_image || !payload.cover_image_file_id) {
    return NextResponse.json({ error: "Cover image must include both its URL and ImageKit file ID." }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("media_assets")
    .select("imagekit_file_id,url")
    .eq("imagekit_file_id", payload.cover_image_file_id)
    .maybeSingle();
  if (error) return databaseError(error, "image validation");
  if (!data || data.url !== payload.cover_image) {
    return NextResponse.json({ error: "The cover image does not match its ImageKit asset. Upload it again." }, { status: 400 });
  }
  return null;
}

export async function requireBlogAdmin() {
  const session = await getAdminSession();
  if (!session) return null;
  return { supabase: createSupabaseAdminClient() };
}
