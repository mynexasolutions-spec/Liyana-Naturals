import { ModuleTable } from "@/components/admin/ModuleTable";

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <ModuleTable
        table="store_settings"
        title="Store Settings"
        searchKeys={["store_name", "support_email", "currency"]}
        columns={[
          { key: "store_name", label: "Store" },
          { key: "support_email", label: "Email" },
          { key: "support_phone", label: "Phone" },
          { key: "currency", label: "Currency" },
        ]}
        orderBy="updated_at"
        allowCreate={false}
        emptyFields={[
          { key: "store_name", label: "Store name", required: true },
          { key: "support_email", label: "Support email", type: "email" },
          { key: "support_phone", label: "Support phone" },
          { key: "address", label: "Address", type: "textarea" },
          { key: "currency", label: "Currency", required: true },
          { key: "timezone", label: "Timezone", required: true },
          { key: "announcement_enabled", label: "Announcement enabled", type: "boolean" },
          { key: "announcement_text", label: "Announcement text" },
          { key: "shipping_fee", label: "Shipping fee", type: "number" },
          { key: "free_shipping_threshold", label: "Free shipping threshold", type: "number" },
          { key: "tax_percent", label: "Tax percent", type: "number" },
        ]}
      />
    </div>
  );
}
