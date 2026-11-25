import { ModuleTable } from "@/components/admin/ModuleTable";

export default function CategoriesPage() {
  return <ModuleTable table="categories" title="Categories" searchKeys={["name", "slug"]} columns={[
    { key: "image_url", label: "Image", format: "image" },
    { key: "name", label: "Category" },
    { key: "slug", label: "Slug" },
    { key: "sort_order", label: "Sort" },
    { key: "is_featured", label: "Featured", format: "toggle" },
    { key: "is_active", label: "Status", format: "status" },
  ]} emptyFields={[
    { key: "name", label: "Category name", required: true },
    { key: "slug", label: "Slug", required: true },
    { key: "description", label: "Description", type: "textarea" },
    { key: "sort_order", label: "Sort order", type: "number" },
    { key: "is_featured", label: "Featured", type: "boolean", control: "toggle", defaultValue: false },
    { key: "is_active", label: "Active", type: "boolean" },
    { key: "image_url", label: "Category image", type: "image", assetIdKey: "image_file_id", folder: "/liyana-naturals/categories" },
  ]} />;
}
