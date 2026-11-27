import { ReviewManager, type AdminReview } from "@/components/admin/ReviewManager";
import { fetchAll, requireAdminPage } from "@/lib/admin/server";

type ReviewRow = {
  id: string;
  author_name: string;
  rating: number;
  title: string | null;
  body: string | null;
  status: AdminReview["status"];
  show_on_home?: boolean;
  created_at: string;
  products: { name: string } | null;
};

export default async function ReviewsPage() {
  const { supabase } = await requireAdminPage();

  const [reviews, products] = await Promise.all([
    fetchAll<ReviewRow>("Reviews", (from, to) =>
      supabase
        .from("reviews")
        .select("*,products(name)")
        .order("created_at", { ascending: false })
        .order("id")
        .range(from, to),
    ),
    fetchAll<{ id: string; name: string }>("Products", (from, to) =>
      supabase.from("products").select("id,name").order("name").order("id").range(from, to),
    ),
  ]);

  return (
    <ReviewManager
      products={products}
      reviews={reviews.map((review) => ({
        id: review.id,
        productName: review.products?.name ?? "a removed product",
        author: review.author_name,
        rating: review.rating,
        title: review.title ?? "",
        body: review.body ?? "",
        status: review.status,
        showOnHome: review.show_on_home === true,
        createdAt: review.created_at,
      }))}
    />
  );
}
