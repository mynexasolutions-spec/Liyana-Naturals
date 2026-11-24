import { ModuleTable } from "@/components/admin/ModuleTable";

export default function CustomersPage() {
  return <ModuleTable table="customers" title="Customers" searchKeys={["full_name", "email", "phone"]} columns={[
    { key: "full_name", label: "Customer" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone" },
    { key: "is_active", label: "Status", format: "status" },
  ]} emptyFields={[
    { key: "full_name", label: "Full name", required: true },
    { key: "email", label: "Email", type: "email", required: true },
    { key: "phone", label: "Phone" },
    { key: "is_active", label: "Active", type: "boolean" },
  ]} />;
}
