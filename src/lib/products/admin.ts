import "server-only";

import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getAdminSession } from "@/lib/supabase/admin-auth";
import type { ProductCreatePayload } from "@/lib/products/schema";

type SupabaseAdminClient = ReturnType<typeof createSupabaseAdminClient>;
// An update may leave either of these out; only what is sent is checked.
type ProductRelationPayload = Partial<Pick<ProductCreatePayload, "category_id" | "images">>;

export function validationMessage(issues: { path: PropertyKey[]; message: string }[]): string {
  return issues
    .map((issue) => `${issue.path.join(".") || "Product"}: ${issue.message}`)
    .join(" ");
}

export function databaseError(error: { code?: string; message?: string }, action: string) {
  if (error.code === "23505") {
    return NextResponse.json({ error: "A product with this slug already exists." }, { status: 409 });
  }
  if (error.code === "23503") {
    return NextResponse.json({ error: "The selected category no longer exists. Refresh and choose another category." }, { status: 400 });
  }
  if (error.code === "23514") {
    return NextResponse.json({ error: "The product contains a value that does not match the database rules." }, { status: 400 });
  }
  console.error(`Product ${action} failed`, { code: error.code, message: error.message });
  return NextResponse.json({ error: `Product could not be ${action}. Try again.` }, { status: 500 });
}

export async function validateRelations(
  supabase: SupabaseAdminClient,
  payload: ProductRelationPayload,
): Promise<NextResponse | null> {
  if (payload.category_id) {
    const { data, error } = await supabase
      .from("categories")
      .select("id")
      .eq("id", payload.category_id)
      .maybeSingle();
    if (error) return databaseError(error, "category validation");
    if (!data) return NextResponse.json({ error: "The selected category does not exist." }, { status: 400 });
  }

  const fileIds = (payload.images ?? [])
    .flatMap((image) => image.fileId ? [image.fileId] : []);
  if (fileIds.length === 0) return null;

  const { data, error } = await supabase
    .from("media_assets")
    .select("imagekit_file_id")
    .in("imagekit_file_id", [...new Set(fileIds)]);
  if (error) return databaseError(error, "image validation");

  const savedIds = new Set((data ?? []).map((asset) => asset.imagekit_file_id));
  const missing = [...new Set(fileIds)].filter((fileId) => !savedIds.has(fileId));
  if (missing.length > 0) {
    return NextResponse.json({ error: "One or more product images were not saved in ImageKit metadata. Upload them again." }, { status: 400 });
  }
  return null;
}

/** Replaces a product's sizes in one database step. */
export async function saveVariants(
  supabase: SupabaseAdminClient,
  productId: string,
  variants: NonNullable<ProductCreatePayload["variants"]>,
): Promise<boolean> {
  const { error } = await supabase.rpc("save_product_variants", {
    p_product_id: productId,
    p_variants: variants,
  });
  if (error) console.error("Product sizes save failed", { code: error.code, message: error.message });
  return !error;
}

export async function requireProductAdmin() {
  const session = await getAdminSession();
  if (!session) return null;
  return { supabase: createSupabaseAdminClient() };
}
