import { ModuleTable } from "@/components/admin/ModuleTable";

export default function BlogsPage() {
  return (
    <ModuleTable
      table="site_content"
      title="Blogs"
      filters={[{ key: "section_key", value: "blog:%", operator: "like" }]}
      searchKeys={["section_key", "title", "subtitle"]}
      columns={[
        { key: "title", label: "Title" },
        { key: "section_key", label: "Key" },
        { key: "is_published", label: "Status", format: "status" },
      ]}
      emptyFields={[
        { key: "section_key", label: "Section key", required: true },
        { key: "title", label: "Title", required: true },
        { key: "subtitle", label: "Subtitle" },
        { key: "body", label: "Blog JSON", type: "json", required: true },
        { key: "is_published", label: "Published", type: "boolean" },
      ]}
    />
  );
}
