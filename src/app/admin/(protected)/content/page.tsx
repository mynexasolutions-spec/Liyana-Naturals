import { ModuleTable } from "@/components/admin/ModuleTable";

export default function ContentPage() {
  return <ModuleTable table="site_content" title="Content" searchKeys={["section_key", "title", "subtitle"]} columns={[
    { key: "section_key", label: "Section" },
    { key: "title", label: "Title" },
    { key: "is_published", label: "Status", format: "status" },
  ]} emptyFields={[
    { key: "section_key", label: "Section key", required: true },
    { key: "title", label: "Title" },
    { key: "subtitle", label: "Subtitle" },
    { key: "body", label: "Body JSON", type: "json" },
    { key: "is_published", label: "Published", type: "boolean" },
  ]} />;
}
