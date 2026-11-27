import { notFound } from "next/navigation";
import { z } from "zod";
import { ProductForm } from "@/components/admin/products/ProductForm";
import { requireAdminPage } from "@/lib/admin/server";
import { getCategoryOptions } from "@/lib/products/queries";
import { PRODUCT_COLUMNS, type AdminProduct } from "@/lib/products/shared";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { supabase } = await requireAdminPage();
  const id = z.uuid().safeParse((await params).id);
  if (!id.success) notFound();

  const [{ data, error }, categories] = await Promise.all([
    supabase.from("products").select(PRODUCT_COLUMNS).eq("id", id.data).maybeSingle(),
    getCategoryOptions(supabase),
  ]);
  if (error) throw new Error(`Product could not be loaded: ${error.message}`);
  if (!data) notFound();
  const product = data as unknown as AdminProduct;

  return <ProductForm key={product.id} product={product} categories={categories} />;
}
