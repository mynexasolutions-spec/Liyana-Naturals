import { ModuleTable } from "@/components/admin/ModuleTable";

export default function ProductsPage() {
  return <ModuleTable table="products" title="Products" searchKeys={["name", "slug", "tagline"]} columns={[
    { key: "name", label: "Product", format: "product" },
    { key: "price", label: "Price", format: "currency" },
    { key: "stock_quantity", label: "Stock" },
    { key: "is_active", label: "Status", format: "status" },
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
    { key: "ingredients", label: "Ingredients JSON", type: "json" },
    { key: "benefits", label: "Benefits JSON", type: "json" },
    { key: "how_to_use", label: "How to use", type: "textarea" },
    { key: "is_featured", label: "Featured", type: "boolean" },
    { key: "is_best_seller", label: "Best seller", type: "boolean" },
    { key: "is_active", label: "Active", type: "boolean" },
    { key: "images", label: "Product images", type: "image", folder: "/liyana-naturals/products" },
  ]} />;
}
