import { ModuleTable } from "@/components/admin/ModuleTable";

export default function InventoryPage() {
  return (
    <ModuleTable
      table="products"
      title="Inventory"
      searchKeys={["name", "slug"]}
      columns={[
        { key: "name", label: "Product", format: "product" },
        { key: "stock_quantity", label: "Units" },
        { key: "is_active", label: "Available", format: "status" },
      ]}
      emptyFields={[
        { key: "stock_quantity", label: "Stock quantity", type: "number", required: true },
        { key: "is_active", label: "Available for sale", type: "boolean" },
      ]}
    />
  );
}
