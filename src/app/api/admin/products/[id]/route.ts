import { NextResponse } from "next/server";
import { productUpdateSchema } from "@/lib/products/schema";
import { databaseError, requireProductAdmin, validateRelations, validationMessage } from "@/lib/products/admin";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const admin = await requireProductAdmin();
    if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { id } = await params;
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
      return NextResponse.json({ error: "Invalid product id." }, { status: 400 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid product data." }, { status: 400 });
    }

    const parsed = productUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: validationMessage(parsed.error.issues) }, { status: 400 });
    }

    const relationError = await validateRelations(admin.supabase, parsed.data);
    if (relationError) return relationError;

    const { data, error } = await admin.supabase
      .from("products")
      .update(parsed.data)
      .eq("id", id)
      .select("*")
      .maybeSingle();
    if (error) return databaseError(error, "updated");
    if (!data) return NextResponse.json({ error: "Product not found." }, { status: 404 });
    return NextResponse.json({ product: data });
  } catch (error) {
    console.error("Product update failed", { error });
    return NextResponse.json({ error: "Product could not be updated. Check the server configuration." }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  void request;
  try {
    const admin = await requireProductAdmin();
    if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { id } = await params;
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
      return NextResponse.json({ error: "Invalid product id." }, { status: 400 });
    }

    const { data, error } = await admin.supabase
      .from("products")
      .delete()
      .eq("id", id)
      .select("id")
      .maybeSingle();
    if (error) return databaseError(error, "deleted");
    if (!data) return NextResponse.json({ error: "Product not found." }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Product delete failed", { error });
    return NextResponse.json({ error: "Product could not be deleted. Check the server configuration." }, { status: 500 });
  }
}
