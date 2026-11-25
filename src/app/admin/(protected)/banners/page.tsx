import { ModuleTable } from "@/components/admin/ModuleTable";

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

export default function BannersPage() {
  return (
    <ModuleTable
      table="homepage_banners"
      title="Homepage Banners"
      mutationEndpoint="/api/admin/banners"
      searchKeys={["title", "subtitle", "link_url"]}
      columns={[
        { key: "title", label: "Banner" },
        { key: "desktop_image_url", label: "Desktop", format: "image" },
        { key: "mobile_image_url", label: "Mobile", format: "image" },
        { key: "link_url", label: "Link" },
        { key: "sort_order", label: "Sort" },
        { key: "is_active", label: "Status", format: "status" },
      ]}
      emptyFields={[
        { key: "title", label: "Title", required: true },
        { key: "subtitle", label: "Subtitle", type: "textarea" },
        {
          key: "desktop_image_url",
          label: "Desktop hero image",
          type: "image",
          assetIdKey: "desktop_image_file_id",
          syncKeys: { url: "image_url", fileId: "image_file_id" },
          folder: "/liyana-naturals/banners/desktop",
          required: true,
          imageValidation: {
            maxBytes: MAX_IMAGE_BYTES,
            minWidth: 1200,
            minHeight: 500,
            minAspectRatio: 1.6,
            maxAspectRatio: 3,
            helpText: "JPG, PNG, or WebP · at least 1200 × 500 · 10 MB max",
          },
        },
        {
          key: "mobile_image_url",
          label: "Mobile hero image",
          type: "image",
          assetIdKey: "mobile_image_file_id",
          folder: "/liyana-naturals/banners/mobile",
          required: true,
          imageValidation: {
            maxBytes: MAX_IMAGE_BYTES,
            minWidth: 360,
            minHeight: 480,
            minAspectRatio: 0.45,
            maxAspectRatio: 1.1,
            helpText: "JPG, PNG, or WebP · at least 360 × 480 · 10 MB max",
          },
        },
        { key: "link_url", label: "Link URL" },
        { key: "sort_order", label: "Sort order", type: "number" },
        { key: "is_active", label: "Active", type: "boolean" },
      ]}
    />
  );
}
