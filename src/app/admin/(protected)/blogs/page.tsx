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
        { key: "category", label: "Category" },
        { key: "cover_image", label: "Image", format: "image" },
        { key: "is_featured", label: "Featured", format: "toggle" },
        { key: "is_published", label: "Status", format: "status" },
      ]}
      emptyFields={[
        { key: "title", label: "Title", required: true },
        { key: "slug", label: "Slug", required: true, placeholder: "natural-skincare-routine" },
        { key: "subtitle", label: "Subtitle", type: "textarea" },
        { key: "excerpt", label: "Excerpt", type: "textarea", required: true },
        { key: "category", label: "Category", required: true, placeholder: "Skincare" },
        { key: "read_time", label: "Read time", placeholder: "5 min read" },
        { key: "published_at", label: "Published date", placeholder: "Nov 26, 2026" },
        {
          key: "cover_image",
          label: "Cover image",
          type: "image",
          required: true,
          assetIdKey: "cover_image_file_id",
          folder: "/liyana-naturals/blog",
          imageValidation: {
            allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
            maxBytes: 10 * 1024 * 1024,
            minWidth: 600,
            minHeight: 400,
            helpText: "JPG, PNG, or WebP · at least 600 × 400 · 10 MB max",
          },
        },
        { key: "tags", label: "Tags", type: "textarea", valueFormat: "string-array", placeholder: "Aloe Vera, Hydration, Sensitive Skin" },
        { key: "key_takeaways", label: "Key takeaways", type: "textarea", valueFormat: "string-array", placeholder: "One takeaway per line" },
        { key: "content", label: "Article content", type: "textarea", placeholder: "Write the article body. Separate paragraphs with a blank line." },
        { key: "author_name", label: "Author name", required: true, defaultValue: "Liyana Naturals" },
        { key: "author_role", label: "Author role" },
        { key: "author_bio", label: "Author bio", type: "textarea" },
        { key: "is_featured", label: "Featured on homepage", type: "boolean", control: "toggle", defaultValue: false },
        { key: "is_published", label: "Published", type: "boolean", control: "toggle", defaultValue: true },
      ]}
      mutationEndpoint="/api/admin/blogs"
      orderBy="updated_at"
    />
  );
}
