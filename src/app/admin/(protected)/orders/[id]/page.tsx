import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, ImageOff } from "lucide-react";
import { UnpaidOrderBanner } from "@/components/admin/orders/MarkPaid";
import { OrderStatusManager } from "@/components/admin/orders/OrderStatusManager";
import { ShipmentManager } from "@/components/admin/orders/ShipmentManager";
import { OrderTimeline } from "@/components/orders/OrderTimeline";
import { codFeeOf } from "@/lib/checkout/pricing";
import { firstImageUrl } from "@/lib/media/image-url";
import { awaitsPayment } from "@/lib/orders/rules";
import { orderIdSchema } from "@/lib/security/admin-route";
import { DEFAULT_PACKAGE, formatIndiaTime, parseScans, type OrderStatus } from "@/lib/shiprocket/shared";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getAdminSession } from "@/lib/supabase/admin-auth";

type AdminOrder = {
  id: string;
  order_number: string;
  created_at: string;
  status: OrderStatus;
  payment_method: string | null;
  payment_status: string;
  razorpay_payment_id: string | null;
  attention_note: string | null;
  stock_released: boolean;
  subtotal: number | string;
  discount: number | string;
  coupon_code: string | null;
  shipping: number | string;
  total: number | string;
  shipping_address: Record<string, string | undefined> | null;
  shiprocket_order_id: string | null;
  awb_code: string | null;
  courier_name: string | null;
  shiprocket_status: string | null;
  tracking_scans: unknown;
  processing_at: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  order_items: {
    id: string;
    product_name: string;
    variant_name: string | null;
    quantity: number;
    unit_price: number | string;
    total: number | string;
    // Null when the product has since been deleted.
    products: { images: unknown } | null;
  }[];
};

const money = (value: number | string) => `₹${Number(value).toLocaleString("en-IN")}`;
const panel = "rounded-2xl border border-[#28321F]/8 bg-white p-5";

function blockedReason(order: AdminOrder): string | null {
  if (["cancelled", "returned", "delivered"].includes(order.status) || order.stock_released) {
    return "This order is closed or its stock was released, so it cannot be shipped.";
  }
  if (order.payment_method !== "cod" && order.payment_status !== "paid") {
    return "This online order is not paid yet, so it cannot be shipped.";
  }
  return null;
}

export default async function AdminOrderPage({ params }: { params: Promise<{ id: string }> }) {
  // Checked here too, because this page reads with the server key.
  if (!(await getAdminSession())) redirect("/admin/login");
  const id = orderIdSchema.safeParse((await params).id);
  if (!id.success) notFound();

  const { data, error } = await createSupabaseAdminClient()
    .from("orders")
    .select(
      "id,order_number,created_at,status,payment_method,payment_status,razorpay_payment_id,attention_note,stock_released,subtotal,discount,coupon_code,shipping,total,shipping_address,shiprocket_order_id,awb_code,courier_name,shiprocket_status,tracking_scans,processing_at,shipped_at,delivered_at,order_items(id,product_name,variant_name,quantity,unit_price,total,products(images))",
    )
    .eq("id", id.data)
    .maybeSingle();
  if (error) throw new Error(`Order could not be loaded: ${error.message}`);
  if (!data) notFound();
  const order = data as unknown as AdminOrder;
  const address = order.shipping_address ?? {};
  const units = order.order_items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="space-y-5">
      <Link href="/admin/orders" className="inline-flex items-center gap-1.5 text-sm font-medium text-[#536B35] hover:text-[#263D18]">
        <ArrowLeft className="size-4" /> Back to Orders
      </Link>

      <header>
        <h1 className="break-all font-serif text-3xl text-[#263D18]">Order {order.order_number}</h1>
        <p className="text-sm text-[#777968]">Placed {formatIndiaTime(order.created_at)}</p>
      </header>

      {awaitsPayment(order) && (
        <UnpaidOrderBanner orderId={order.id} orderNumber={order.order_number} amount={money(order.total)} />
      )}

      <OrderTimeline
        status={order.status}
        placedAt={order.created_at}
        processingAt={order.processing_at}
        shippedAt={order.shipped_at}
        deliveredAt={order.delivered_at}
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,380px)]">
        <div className="min-w-0 space-y-5">
          <section className={panel}>
            <h2 className="mb-2 font-serif text-xl text-[#263D18]">Items</h2>
            <ul className="divide-y divide-[#28321F]/8 text-sm">
              {order.order_items.map((item) => {
                const image = firstImageUrl(item.products?.images, item.variant_name);
                return (
                  <li key={item.id} className="flex items-center gap-3 py-3">
                    <span className="relative size-16 shrink-0 overflow-hidden rounded-xl border border-[#28321F]/10 bg-[#FBF7EE] sm:size-20">
                      {image ? (
                        <Image src={image} alt={item.product_name} fill unoptimized sizes="80px" className="object-cover" />
                      ) : (
                        <span className="absolute inset-0 grid place-items-center text-[#777968]">
                          <ImageOff aria-label="No image" className="size-5" />
                        </span>
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="break-words font-medium">{item.product_name}</p>
                      {item.variant_name && <p className="text-xs font-semibold text-[#536B35]">Size: {item.variant_name}</p>}
                      <p className="text-[#777968]">
                        {money(item.unit_price)} × {item.quantity}
                      </p>
                    </div>
                    <strong className="shrink-0">{money(item.total)}</strong>
                  </li>
                );
              })}
            </ul>
            <dl className="mt-3 space-y-1.5 border-t border-[#28321F]/8 pt-3 text-sm">
              {[
                ["Subtotal", money(order.subtotal)],
                [order.coupon_code ? `Discount (${order.coupon_code})` : "Discount", `-${money(order.discount)}`],
                ["Shipping", money(order.shipping)],
                ...(codFeeOf(order) > 0 ? [["Cash on Delivery fee", money(codFeeOf(order))]] : []),
                ["Total", money(order.total)],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between last:font-bold last:text-[#263D18]">
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className={`${panel} grid gap-4 text-sm sm:grid-cols-2`}>
            <div>
              <h2 className="mb-2 font-serif text-xl text-[#263D18]">Customer</h2>
              <p className="break-words font-medium">{address.fullName}</p>
              <p className="break-all text-[#777968]">{address.email}</p>
              <p className="text-[#777968]">{address.phone}</p>
            </div>
            <div>
              <h2 className="mb-2 font-serif text-xl text-[#263D18]">Shipping Address</h2>
              <p className="break-words text-[#555C4A]">{address.street}</p>
              <p className="text-[#555C4A]">
                {address.city}, {address.state} - {address.pinCode}
              </p>
              {/* Only older orders placed with express delivery. */}
              {address.deliveryMethod === "express" && <p className="mt-1 text-[#777968]">Express delivery</p>}
            </div>
            <div className="sm:col-span-2 border-t border-[#28321F]/8 pt-3 text-[#555C4A]">
              Payment: <strong>{order.payment_method === "cod" ? "Cash on Delivery" : order.payment_method === "razorpay" ? "Online (Razorpay)" : "Not recorded"}</strong>
              {order.razorpay_payment_id && <span className="block select-all font-mono text-xs">{order.razorpay_payment_id}</span>}
            </div>
          </section>
        </div>

        <div className="min-w-0 space-y-5">
          <OrderStatusManager
            orderId={order.id}
            status={order.status}
            paymentStatus={order.payment_status}
            attentionNote={order.attention_note}
          />
          <ShipmentManager
            orderId={order.id}
            blockedReason={blockedReason(order)}
            shiprocketOrderId={order.shiprocket_order_id}
            awbCode={order.awb_code}
            courierName={order.courier_name}
            status={order.shiprocket_status}
            scans={parseScans(order.tracking_scans)}
            defaults={{
              weightKg: Math.round((units * DEFAULT_PACKAGE.itemWeightKg + DEFAULT_PACKAGE.packagingWeightKg) * 100) / 100,
              lengthCm: DEFAULT_PACKAGE.lengthCm,
              breadthCm: DEFAULT_PACKAGE.breadthCm,
              heightCm: DEFAULT_PACKAGE.heightCm,
            }}
          />
        </div>
      </div>
    </div>
  );
}
