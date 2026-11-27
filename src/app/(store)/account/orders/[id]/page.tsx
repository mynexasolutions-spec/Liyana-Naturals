import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, CreditCard, ImageOff, MapPin, Package, Truck } from "lucide-react";
import { LiveOrderRefresh } from "@/components/account/LiveOrderRefresh";
import { OrderTimeline } from "@/components/orders/OrderTimeline";
import { ShipmentTracking } from "@/components/orders/ShipmentTracking";
import { getCustomerOrder, getSignedInCustomer, refreshTracking, trackingSnapshot } from "@/lib/account/orders";
import { codFeeOf } from "@/lib/checkout/pricing";
import { firstImageUrl } from "@/lib/media/image-url";
import { itemLabel } from "@/lib/products/variants";
import { formatIndiaTime, parseScans } from "@/lib/shiprocket/shared";

export const metadata: Metadata = {
  title: "Order Details",
  robots: { index: false, follow: false },
};

const money = (value: number | string) => `₹${Number(value).toLocaleString("en-IN")}`;
const panel = "rounded-2xl border border-[#28321F]/10 bg-white p-4 sm:p-6 shadow-card";
const heading = "flex items-center gap-2 font-heading text-xl font-bold text-[#263D18] mb-3";

export default async function CustomerOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getSignedInCustomer();
  if (!user) redirect("/login");

  const saved = await getCustomerOrder(user, (await params).id);
  if (!saved) notFound();
  const order = await refreshTracking(user, saved);
  const address = order.shipping_address ?? {};

  return (
    <main className="min-h-screen w-full bg-[#FBF7EE] text-[#28321F] py-6 sm:py-10 pb-24">
      <LiveOrderRefresh orderId={order.id} initialSnapshot={trackingSnapshot(order)} />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-5">
        <Link href="/account" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#536B35] hover:text-[#263D18]">
          <ArrowLeft className="w-4 h-4" /> Back to My Account
        </Link>

        <header className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="font-heading text-2xl sm:text-4xl font-bold text-[#263D18]">
              Order{" "}
              {/* The heading font draws uneven digits, so the number uses the plain one. */}
              <span className="font-sans text-xl sm:text-3xl tabular-nums break-all">{order.order_number}</span>
            </h1>
            <p className="mt-1 text-sm text-[#777968]">Placed on {formatIndiaTime(order.created_at)}</p>
          </div>
          <span className="rounded-full border border-[#536B35]/30 bg-[#EAF1DF] px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#263D18]">
            {order.status}
          </span>
        </header>

        <OrderTimeline
          status={order.status}
          placedAt={order.created_at}
          processingAt={order.processing_at}
          shippedAt={order.shipped_at}
          deliveredAt={order.delivered_at}
        />

        {order.shiprocket_order_id ? (
          <ShipmentTracking
            awbCode={order.awb_code}
            courierName={order.courier_name}
            status={order.shiprocket_status}
            scans={parseScans(order.tracking_scans)}
          />
        ) : (
          ["pending", "confirmed", "processing"].includes(order.status) && (
            <p className="flex items-center gap-3 rounded-2xl border border-[#536B35]/25 bg-[#EAF1DF]/60 p-4 text-sm font-medium text-[#263D18]">
              <Truck className="w-5 h-5 shrink-0" />
              Your tracking link will appear here once your order is shipped.
            </p>
          )
        )}

        <section className={panel}>
          <h2 className={heading}>
            <Package className="w-5 h-5" /> Ordered Items
          </h2>
          <ul className="divide-y divide-[#28321F]/10 text-sm">
            {order.order_items.map((item) => {
              const image = firstImageUrl(item.products?.images, item.variant_name);
              return (
                <li key={item.id} className="flex items-center gap-3 py-3">
                  <span className="relative size-16 sm:size-20 shrink-0 overflow-hidden rounded-xl border border-[#28321F]/10 bg-[#FBF7EE]">
                    {image ? (
                      <Image src={image} alt={item.product_name} fill unoptimized sizes="80px" className="object-cover" />
                    ) : (
                      <span className="absolute inset-0 grid place-items-center text-[#777968]">
                        <ImageOff aria-label="No image" className="w-5 h-5" />
                      </span>
                    )}
                  </span>
                  <span className="min-w-0 flex-1 break-words">
                    {itemLabel(item.product_name, item.variant_name)} × {item.quantity}
                  </span>
                  <strong className="shrink-0 text-[#263D18]">{money(item.total)}</strong>
                </li>
              );
            })}
          </ul>
          <dl className="mt-3 space-y-1.5 border-t border-[#28321F]/10 pt-3 text-sm text-[#555C4A]">
            <div className="flex justify-between">
              <dt>Subtotal</dt>
              <dd>{money(order.subtotal)}</dd>
            </div>
            {Number(order.discount) > 0 && (
              <div className="flex justify-between text-[#3C6E26]">
                <dt>Discount{order.coupon_code ? ` (${order.coupon_code})` : ""}</dt>
                <dd>-{money(order.discount)}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt>Shipping</dt>
              <dd>{Number(order.shipping) === 0 ? "Free" : money(order.shipping)}</dd>
            </div>
            {codFeeOf(order) > 0 && (
              <div className="flex justify-between">
                <dt>Cash on Delivery fee</dt>
                <dd>{money(codFeeOf(order))}</dd>
              </div>
            )}
            <div className="flex justify-between border-t border-[#28321F]/10 pt-2 text-base font-bold text-[#263D18]">
              <dt>Total</dt>
              <dd>{money(order.total)}</dd>
            </div>
          </dl>
        </section>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <section className={panel}>
            <h2 className={heading}>
              <MapPin className="w-5 h-5" /> Delivery Address
            </h2>
            <p className="text-sm leading-relaxed text-[#555C4A] break-words">
              <strong className="text-[#263D18]">{address.fullName}</strong>
              <br />
              {address.street}
              <br />
              {address.city}, {address.state} - {address.pinCode}
              <br />
              Phone: {address.phone}
            </p>
          </section>
          <section className={panel}>
            <h2 className={heading}>
              <CreditCard className="w-5 h-5" /> Payment
            </h2>
            <p className="text-sm text-[#555C4A]">
              {order.payment_method === "cod" ? "Cash on Delivery" : "Paid online"}
            </p>
            <p className="mt-1 text-sm text-[#555C4A]">
              Status: <strong className="capitalize text-[#263D18]">{order.payment_status}</strong>
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
