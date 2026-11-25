import { ModuleTable } from "@/components/admin/ModuleTable";

export default function ProductsPage() {
  return <ModuleTable table="products" title="Products" mutationEndpoint="/api/admin/products" searchKeys={["name", "slug", "tagline"]} columns={[
    { key: "images", label: "Image", format: "image" },
    { key: "name", label: "Product", format: "product" },
    { key: "price", label: "Price", format: "currency" },
    { key: "stock_quantity", label: "Stock" },
    { key: "is_featured", label: "Featured", format: "toggle" },
    { key: "is_best_seller", label: "Best seller", format: "toggle" },
    { key: "is_active", label: "Active", format: "toggle" },
  ]} emptyFields={[
    { key: "name", label: "Product name", required: true },
    { key: "slug", label: "Slug", required: true },
    { key: "category_id", label: "Category", type: "select", relation: { table: "categories", labelKey: "name" } },
    { key: "tagline", label: "Tagline" },
    { key: "description", label: "Description", type: "textarea" },
    { key: "short_description", label: "Short description", type: "textarea" },
    { key: "price", label: "Price", type: "number", required: true },
    { key: "original_price", label: "Original price", type: "number" },
    { key: "stock_quantity", label: "Stock quantity", type: "number" },
    { key: "volume", label: "Volume" },
    { key: "badge", label: "Badge", type: "select", options: [
      { label: "None", value: "" }, { label: "Best Seller", value: "Best Seller" },
      { label: "New", value: "New" }, { label: "Organic", value: "Organic" },
      { label: "Award Winner", value: "Award Winner" }, { label: "Sale", value: "Sale" },
    ] },
    { key: "ingredients", label: "Ingredients", type: "textarea", valueFormat: "string-array", placeholder: "e.g. Aloe vera, Vitamin E, Shea butter" },
    { key: "benefits", label: "Benefits", type: "textarea", valueFormat: "string-array", placeholder: "e.g. Hydrates skin, Gentle cleansing" },
    { key: "how_to_use", label: "How to use", type: "textarea" },
    { key: "is_featured", label: "Featured", type: "boolean", control: "toggle", defaultValue: false },
    { key: "is_best_seller", label: "Best seller", type: "boolean", control: "toggle", defaultValue: false },
    { key: "is_active", label: "Active", type: "boolean", control: "toggle", defaultValue: true },
    {
      key: "images",
      label: "Product images",
      type: "image",
      folder: "/liyana-naturals/products",
      imageValidation: {
        allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
        maxBytes: 10 * 1024 * 1024,
        minWidth: 300,
        minHeight: 300,
        helpText: "JPG, PNG, or WebP · at least 300 × 300 · 10 MB max",
      },
    },
  ]} />;
}
