import { ModuleTable } from "@/components/admin/ModuleTable";

export default function OrdersPage() {
  return <ModuleTable table="orders" title="Orders" searchKeys={["order_number", "status", "payment_status"]} columns={[
    { key: "order_number", label: "Order" },
    { key: "status", label: "Status", format: "status" },
    { key: "payment_status", label: "Payment", format: "status" },
    { key: "total", label: "Total", format: "currency" },
  ]} emptyFields={[
    { key: "order_number", label: "Order number", required: true },
    { key: "status", label: "Status", type: "select", required: true, options: [
      { label: "Pending", value: "pending" }, { label: "Confirmed", value: "confirmed" },
      { label: "Processing", value: "processing" }, { label: "Shipped", value: "shipped" },
      { label: "Delivered", value: "delivered" }, { label: "Cancelled", value: "cancelled" },
      { label: "Returned", value: "returned" },
    ] },
    { key: "payment_status", label: "Payment status", type: "select", required: true, options: [
      { label: "Pending", value: "pending" }, { label: "Paid", value: "paid" },
      { label: "Failed", value: "failed" }, { label: "Refunded", value: "refunded" },
    ] },
    { key: "subtotal", label: "Subtotal", type: "number" },
    { key: "discount", label: "Discount", type: "number" },
    { key: "shipping", label: "Shipping", type: "number" },
    { key: "total", label: "Total", type: "number" },
  ]} />;
}
