import "server-only";

import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getAdminSession } from "@/lib/supabase/admin-auth";
import type { CategoryCreatePayload } from "@/lib/categories/schema";

type SupabaseAdminClient = ReturnType<typeof createSupabaseAdminClient>;
type CategoryImagePayload = Pick<CategoryCreatePayload, "image_url" | "image_file_id">;

export function validationMessage(issues: { path: PropertyKey[]; message: string }[]): string {
  return issues
    .map((issue) => `${issue.path.join(".") || "Category"}: ${issue.message}`)
    .join(" ");
}

export function databaseError(error: { code?: string; message?: string }, action: string) {
  if (error.code === "23505") {
    return NextResponse.json({ error: "A category with this slug already exists." }, { status: 409 });
  }
  if (error.code === "23514") {
    return NextResponse.json({ error: "The category contains a value that does not match the database rules." }, { status: 400 });
  }
  console.error(`Category ${action} failed`, { code: error.code, message: error.message });
  return NextResponse.json({ error: `Category could not be ${action}. Try again.` }, { status: 500 });
}

export async function validateImageAsset(
  supabase: SupabaseAdminClient,
  payload: CategoryImagePayload,
): Promise<NextResponse | null> {
  if (!payload.image_file_id) return null;

  const { data, error } = await supabase
    .from("media_assets")
    .select("imagekit_file_id,url")
    .eq("imagekit_file_id", payload.image_file_id)
    .limit(1)
    .maybeSingle();
  if (error) return databaseError(error, "image validation");
  if (!data) return NextResponse.json({ error: "The selected category image was not saved in ImageKit metadata. Upload it again." }, { status: 400 });
  if (payload.image_url && data.url !== payload.image_url) {
    return NextResponse.json({ error: "The category image URL does not match its ImageKit asset. Upload it again." }, { status: 400 });
  }
  return null;
}

export async function requireCategoryAdmin() {
  const session = await getAdminSession();
  if (!session) return null;
  return { supabase: createSupabaseAdminClient() };
}
