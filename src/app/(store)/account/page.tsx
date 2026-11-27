import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AccountTabs } from "@/components/account/AccountTabs";
import { getSignedInCustomer, listCustomerOrders } from "@/lib/account/orders";
import { itemLabel } from "@/lib/products/variants";

export const metadata: Metadata = {
  title: "My Account",
  robots: { index: false, follow: false },
};

export default async function AccountPage() {
  const user = await getSignedInCustomer();
  if (!user) redirect("/login");

  const orders = await listCustomerOrders(user);
  const metadataText = (key: string) =>
    typeof user.user_metadata?.[key] === "string" ? (user.user_metadata[key] as string) : "";
  const profile = {
    fullName: metadataText("full_name") || user.email?.split("@")[0] || "Liyana member",
    email: user.email ?? "",
    phone: metadataText("phone"),
  };

  return (
    <main className="min-h-screen w-full bg-[#FBF7EE] text-[#28321F] py-6 sm:py-10 pb-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-5">
        <header>
          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-[#263D18]">My Account</h1>
          <p className="mt-1 text-sm text-[#777968] break-words">
            {profile.fullName} · {profile.email}
          </p>
        </header>
        <AccountTabs
          profile={profile}
          orders={orders.map((order) => ({
            id: order.id,
            orderNumber: order.order_number,
            createdAt: order.created_at,
            status: order.status,
            total: Number(order.total),
            awbCode: order.awb_code,
            courierName: order.courier_name,
            items: order.order_items.map((item) => ({ name: itemLabel(item.product_name, item.variant_name), quantity: item.quantity })),
          }))}
        />
      </div>
    </main>
  );
}
