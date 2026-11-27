import { BannerManager, type AdminBanner } from "@/components/admin/BannerManager";
import { requireAdminPage } from "@/lib/admin/server";

export default async function BannersPage() {
  const { supabase } = await requireAdminPage();
  const countOf = (table: string) => supabase.from(table).select("id", { count: "exact", head: true });

  const [banners, categories, bestSellers, reviews, blogs] = await Promise.all([
    supabase
      .from("homepage_banners")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false }),
    countOf("categories").eq("is_active", true).eq("is_featured", true),
    countOf("products").eq("is_active", true).eq("is_best_seller", true),
    countOf("reviews").eq("status", "approved").eq("show_on_home", true),
    countOf("site_content").like("section_key", "blog:%").eq("is_published", true).eq("is_featured", true),
  ]);
  const failure = banners.error ?? categories.error ?? bestSellers.error ?? reviews.error ?? blogs.error;
  if (failure) throw new Error(`Homepage could not be loaded: ${failure.message}`);

  return (
    <BannerManager
      banners={(banners.data ?? []) as AdminBanner[]}
      sections={[
        { label: "Categories", count: categories.count ?? 0, href: "/admin/categories", hint: "Switch on “Homepage”" },
        { label: "Best sellers", count: bestSellers.count ?? 0, href: "/admin/products", hint: "Switch on “Best seller”" },
        { label: "Testimonials", count: reviews.count ?? 0, href: "/admin/reviews", hint: "Switch on “Home page”" },
        { label: "Featured blogs", count: blogs.count ?? 0, href: "/admin/blogs", hint: "Switch on “Featured”" },
      ]}
    />
  );
}
