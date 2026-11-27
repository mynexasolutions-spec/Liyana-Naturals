import { PagesManager } from "@/components/admin/PagesManager";
import { requireAdminPage } from "@/lib/admin/server";
import { CONTENT_PAGES, pageContent, pageKey } from "@/lib/content/pages";

export default async function AdminPagesPage() {
  const { supabase } = await requireAdminPage();
  const { data, error } = await supabase
    .from("site_content")
    .select("section_key,title,body,is_published")
    .like("section_key", "page:%");
  if (error) throw new Error(`Pages could not be loaded: ${error.message}`);

  return (
    <PagesManager
      pages={CONTENT_PAGES.map(({ slug, name }) => {
        const row = data?.find((item) => item.section_key === pageKey(slug));
        return {
          slug,
          title: row?.title ?? name,
          content: pageContent(row?.body),
          is_published: row?.is_published ?? false,
        };
      })}
    />
  );
}
