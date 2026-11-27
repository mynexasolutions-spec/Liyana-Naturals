import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { fetchAll } from "@/lib/admin/server";
import type { CategoryOption } from "@/lib/products/shared";

export function getCategoryOptions(supabase: SupabaseClient) {
  return fetchAll<CategoryOption>("Categories", (from, to) =>
    supabase
      .from("categories")
      .select("id,name,is_active")
      .order("sort_order")
      .order("name")
      .order("id")
      .range(from, to),
  );
}
