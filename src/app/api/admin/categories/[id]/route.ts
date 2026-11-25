import { NextResponse } from "next/server";
import { categoryUpdateSchema } from "@/lib/categories/schema";
import { databaseError, requireCategoryAdmin, validateImageAsset, validationMessage } from "@/lib/categories/admin";

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const admin = await requireCategoryAdmin();
    if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { id } = await params;
    if (!isUuid(id)) return NextResponse.json({ error: "Invalid category id." }, { status: 400 });

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid category data." }, { status: 400 });
    }

    const parsed = categoryUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: validationMessage(parsed.error.issues) }, { status: 400 });
    }

    const imageError = await validateImageAsset(admin.supabase, parsed.data);
    if (imageError) return imageError;

    const { data, error } = await admin.supabase
      .from("categories")
      .update(parsed.data)
      .eq("id", id)
      .select("*")
      .maybeSingle();
    if (error) return databaseError(error, "updated");
    if (!data) return NextResponse.json({ error: "Category not found." }, { status: 404 });
    return NextResponse.json({ category: data });
  } catch (error) {
    console.error("Category update failed", { error });
    return NextResponse.json({ error: "Category could not be updated. Check the server configuration." }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  void request;
  try {
    const admin = await requireCategoryAdmin();
    if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { id } = await params;
    if (!isUuid(id)) return NextResponse.json({ error: "Invalid category id." }, { status: 400 });

    const { data, error } = await admin.supabase
      .from("categories")
      .delete()
      .eq("id", id)
      .select("id")
      .maybeSingle();
    if (error) return databaseError(error, "deleted");
    if (!data) return NextResponse.json({ error: "Category not found." }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Category delete failed", { error });
    return NextResponse.json({ error: "Category could not be deleted. Check the server configuration." }, { status: 500 });
  }
}
