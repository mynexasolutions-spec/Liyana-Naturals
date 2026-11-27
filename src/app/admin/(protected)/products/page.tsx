import { ProductManager } from "@/components/admin/ProductManager";
import { LOW_STOCK_LIMIT } from "@/lib/admin/dashboard";
import { fetchAll, requireAdminPage } from "@/lib/admin/server";
import { getCategoryOptions } from "@/lib/products/queries";
import { PRODUCT_COLUMNS, type AdminProduct } from "@/lib/products/shared";

export default async function ProductsPage() {
  const { supabase } = await requireAdminPage();

  const [products, categories] = await Promise.all([
    fetchAll<AdminProduct>("Products", (from, to) =>
      supabase
        .from("products")
        .select(PRODUCT_COLUMNS)
        .order("created_at", { ascending: false })
        .order("id")
        .range(from, to),
    ),
    getCategoryOptions(supabase),
  ]);

  return <ProductManager products={products} categories={categories} lowStockLimit={LOW_STOCK_LIMIT} />;
}
