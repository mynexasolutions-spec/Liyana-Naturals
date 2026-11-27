import { redirect } from "next/navigation";
import { CategoryManager, type AdminCategory } from "@/components/admin/CategoryManager";
import { getAdminSession } from "@/lib/supabase/admin-auth";

const PAGE_SIZE = 1000;

type Session = NonNullable<Awaited<ReturnType<typeof getAdminSession>>>;

// The database returns at most 1000 rows per request.
async function productCategories(supabase: Session["supabase"]) {
  const rows: { category_id: string | null; is_active: boolean }[] = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await supabase
      .from("products")
      .select("category_id,is_active")
      .order("id")
      .range(from, from + PAGE_SIZE - 1);
    if (error) throw new Error(`Products could not be loaded: ${error.message}`);
    rows.push(...(data ?? []));
    if ((data?.length ?? 0) < PAGE_SIZE) return rows;
  }
}

export default async function CategoriesPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const [categories, products] = await Promise.all([
    session.supabase
      .from("categories")
      .select("id,name,slug,description,image_url,image_file_id,is_active,is_featured,sort_order")
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true }),
    productCategories(session.supabase),
  ]);
  if (categories.error) throw new Error(`Categories could not be loaded: ${categories.error.message}`);

  const list: AdminCategory[] = (categories.data ?? []).map((category) => {
    const own = products.filter((product) => product.category_id === category.id);
    return {
      ...(category as Omit<AdminCategory, "productCount" | "activeProductCount">),
      productCount: own.length,
      activeProductCount: own.filter((product) => product.is_active).length,
    };
  });

  return (
    <CategoryManager
      categories={list}
      uncategorised={products.filter((product) => !product.category_id).length}
    />
  );
}
