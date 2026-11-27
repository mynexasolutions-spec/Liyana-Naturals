import Image from "next/image";
import { siteConfig } from "@/config/site";
import type { StoreContact } from "@/lib/settings/contact";

const money = (value: number) => `₹${value.toLocaleString("en-IN")}`;

export type ReceiptData = {
  orderId: string;
  placedAt: string;
  paymentText: string;
  razorpayPaymentId?: string;
  razorpayOrderId?: string;
  customerName: string;
  phone: string;
  email: string;
  addressLines: string[];
  items: { id: string; name: string; price: number; quantity: number }[];
  subtotal: number;
  discount: number;
  shippingFee: number;
  codFee: number;
  total: number;
};

/**
 * The sheet that comes out of "Print Receipt". It is never shown on screen; the
 * print rules in globals.css print it and nothing else.
 */
export function OrderReceipt({ order, store }: { order: ReceiptData; store: StoreContact }) {
  const totals = [
    ["Subtotal", money(order.subtotal)],
    ...(order.discount > 0 ? [["Discount", `-${money(order.discount)}`]] : []),
    ["Shipping", order.shippingFee === 0 ? "Free" : money(order.shippingFee)],
    ...(order.codFee > 0 ? [["Cash on Delivery fee", money(order.codFee)]] : []),
  ];

  return (
    // Paragraphs follow the sheet's text size, not the website's.
    <div className="print-receipt hidden print:block text-[13px] leading-relaxed text-black [&_p]:[font-size:inherit] [&_p]:[line-height:inherit]">
      <header className="flex items-start justify-between gap-6 border-b-2 border-black pb-4">
        <div>
          <Image src="/images/logo/logo.png" alt={siteConfig.name} width={160} height={52} priority unoptimized />
          {store.address && <p className="mt-2 max-w-[260px] whitespace-pre-line">{store.address}</p>}
          {store.phone && <p>{store.phone}</p>}
          {store.email && <p>{store.email}</p>}
        </div>
        <div className="text-right">
          <div className="text-xl font-bold">Order Receipt</div>
          <p className="mt-1 font-semibold">{order.orderId}</p>
          <p>{order.placedAt}</p>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-6 py-4">
        <div>
          <p className="font-bold">Deliver to</p>
          <p>{order.customerName}</p>
          {order.addressLines.map((line) => (
            <p key={line} className="break-words">{line}</p>
          ))}
          <p>Phone: {order.phone}</p>
          <p className="break-all">{order.email}</p>
        </div>
        <div className="text-right">
          <p className="font-bold">Payment</p>
          <p>{order.paymentText}</p>
          {order.razorpayPaymentId && <p className="break-all">Payment ID: {order.razorpayPaymentId}</p>}
          {order.razorpayOrderId && <p className="break-all">Razorpay Order ID: {order.razorpayOrderId}</p>}
        </div>
      </div>

      <table className="w-full border-collapse">
        <thead>
          <tr className="border-y border-black text-left">
            <th className="py-2 pr-2">Item</th>
            <th className="px-2 py-2 text-right">Price</th>
            <th className="px-2 py-2 text-right">Qty</th>
            <th className="py-2 pl-2 text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((item) => (
            <tr key={item.id} className="break-inside-avoid border-b border-neutral-300 align-top">
              <td className="py-2 pr-2">{item.name}</td>
              <td className="px-2 py-2 text-right">{money(item.price)}</td>
              <td className="px-2 py-2 text-right">{item.quantity}</td>
              <td className="py-2 pl-2 text-right">{money(item.price * item.quantity)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <dl className="ml-auto mt-3 w-64 break-inside-avoid space-y-1">
        {totals.map(([label, value]) => (
          <div key={label} className="flex justify-between gap-4">
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
        <div className="flex justify-between gap-4 border-t-2 border-black pt-2 text-base font-bold">
          <dt>Total</dt>
          <dd>{money(order.total)}</dd>
        </div>
      </dl>

      <p className="mt-8 border-t border-neutral-300 pt-3 text-center">
        Thank you for shopping with {siteConfig.name}. {siteConfig.url.replace(/^https:\/\//, "")}
      </p>
    </div>
  );
}
