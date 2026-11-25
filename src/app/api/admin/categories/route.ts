import { NextResponse } from "next/server";
import { categoryCreateSchema } from "@/lib/categories/schema";
import { databaseError, requireCategoryAdmin, validateImageAsset, validationMessage } from "@/lib/categories/admin";

export async function GET() {
  try {
    const admin = await requireCategoryAdmin();
    if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { data, error } = await admin.supabase
      .from("categories")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });
    if (error) return databaseError(error, "loaded");
    return NextResponse.json({ categories: data ?? [] });
  } catch (error) {
    console.error("Category list failed", { error });
    return NextResponse.json({ error: "Categories could not be loaded. Check the server configuration." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const admin = await requireCategoryAdmin();
    if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid category data." }, { status: 400 });
    }

    const parsed = categoryCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: validationMessage(parsed.error.issues) }, { status: 400 });
    }

    const imageError = await validateImageAsset(admin.supabase, parsed.data);
    if (imageError) return imageError;

    const { data, error } = await admin.supabase
      .from("categories")
      .insert(parsed.data)
      .select("*")
      .single();
    if (error) return databaseError(error, "saved");
    return NextResponse.json({ category: data }, { status: 201 });
  } catch (error) {
    console.error("Category create failed", { error });
    return NextResponse.json({ error: "Category could not be saved. Check the server configuration." }, { status: 500 });
  }
}
