import { ModuleTable } from "@/components/admin/ModuleTable";

export default function BannersPage() {
  return <ModuleTable table="homepage_banners" title="Homepage Banners" searchKeys={["title", "subtitle", "link_url"]} columns={[
    { key: "title", label: "Banner" },
    { key: "link_url", label: "Link" },
    { key: "sort_order", label: "Sort" },
    { key: "is_active", label: "Status", format: "status" },
  ]} emptyFields={[
    { key: "title", label: "Title", required: true },
    { key: "subtitle", label: "Subtitle" },
    { key: "image_url", label: "Banner image", type: "image", assetIdKey: "image_file_id", folder: "/liyana-naturals/banners", required: true },
    { key: "link_url", label: "Link URL" },
    { key: "sort_order", label: "Sort order", type: "number" },
    { key: "is_active", label: "Active", type: "boolean" },
  ]} />;
}
