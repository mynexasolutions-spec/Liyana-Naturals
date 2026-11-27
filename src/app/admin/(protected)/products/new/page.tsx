import { ProductForm } from "@/components/admin/products/ProductForm";
import { requireAdminPage } from "@/lib/admin/server";
import { getCategoryOptions } from "@/lib/products/queries";

export default async function NewProductPage() {
  const { supabase } = await requireAdminPage();
  const categories = await getCategoryOptions(supabase);

  return <ProductForm product={null} categories={categories} />;
}
