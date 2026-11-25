import { NextResponse } from "next/server";
import { productCreateSchema } from "@/lib/products/schema";
import { databaseError, requireProductAdmin, validateRelations, validationMessage } from "@/lib/products/admin";

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

    const { data, error } = await admin.supabase
      .from("products")
      .insert(parsed.data)
      .select("*")
      .single();
    if (error) return databaseError(error, "saved");
    return NextResponse.json({ product: data }, { status: 201 });
  } catch (error) {
    console.error("Product create failed", { error });
    return NextResponse.json({ error: "Product could not be saved. Check the server configuration." }, { status: 500 });
  }
}
