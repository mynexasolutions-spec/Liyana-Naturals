import { NextResponse } from "next/server";
import { productCreateSchema } from "@/lib/products/schema";
import { databaseError, requireProductAdmin, saveVariants, validateRelations, validationMessage } from "@/lib/products/admin";

export async function GET() {
  try {
    const admin = await requireProductAdmin();
    if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { data, error } = await admin.supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) return databaseError(error, "loaded");
    return NextResponse.json({ products: data ?? [] });
  } catch (error) {
    console.error("Product list failed", { error });
    return NextResponse.json({ error: "Products could not be loaded. Check the server configuration." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const admin = await requireProductAdmin();
    if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid product data." }, { status: 400 });
    }

    const parsed = productCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: validationMessage(parsed.error.issues) }, { status: 400 });
    }

    const relationError = await validateRelations(admin.supabase, parsed.data);
    if (relationError) return relationError;

    const { variants, ...product } = parsed.data;
    const { data, error } = await admin.supabase
      .from("products")
      .insert(product)
      .select("*")
      .single();
    if (error) return databaseError(error, "saved");
    if (variants?.length && !(await saveVariants(admin.supabase, data.id, variants))) {
      // Do not leave a product behind without the sizes it was meant to have.
      await admin.supabase.from("products").delete().eq("id", data.id);
      return NextResponse.json({ error: "The sizes could not be saved. Try again." }, { status: 500 });
    }
    return NextResponse.json({ product: data }, { status: 201 });
  } catch (error) {
    console.error("Product create failed", { error });
    return NextResponse.json({ error: "Product could not be saved. Check the server configuration." }, { status: 500 });
  }
}
