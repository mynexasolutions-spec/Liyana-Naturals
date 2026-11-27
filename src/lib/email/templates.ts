import "server-only";

import { siteConfig } from "@/config/site";
import { codFeeOf } from "@/lib/checkout/pricing";

const BRAND = {
  forest: "#263D18",
  leaf: "#536B35",
  cream: "#FBF7EE",
  sage: "#EAF1DF",
  ink: "#28321F",
  muted: "#777968",
  border: "#E4E0D4",
};

export function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function money(value: number): string {
  return `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

/** The store's own contact details, from admin Settings. */
export type SupportContact = { email: string; phone: string };

function shell(heading: string, body: string, support: SupportContact): string {
  const help = [support.email, support.phone].filter(Boolean).map(escapeHtml).join(" &bull; ");
  return `<!doctype html>
<html lang="en">
<body style="margin:0;padding:24px 12px;background:${BRAND.cream};font-family:Helvetica,Arial,sans-serif;color:${BRAND.ink};">
  <div style="max-width:520px;margin:0 auto;background:#ffffff;border:1px solid ${BRAND.border};border-radius:20px;overflow:hidden;">
    <div style="background:${BRAND.forest};padding:22px;text-align:center;">
      <span style="font-family:Georgia,serif;font-size:22px;letter-spacing:1px;color:${BRAND.cream};">${siteConfig.name}</span>
    </div>
    <div style="padding:28px 24px;">
      <h1 style="margin:0 0 12px;font-family:Georgia,serif;font-size:22px;color:${BRAND.forest};">${heading}</h1>
      ${body}
    </div>
    <div style="padding:16px 24px;border-top:1px solid ${BRAND.border};text-align:center;font-size:11px;color:${BRAND.muted};">
      ${help ? `Need help? ${help}<br />` : ""}
      &copy; ${new Date().getFullYear()} ${siteConfig.name}
    </div>
  </div>
</body>
</html>`;
}

const paragraph = (content: string) =>
  `<p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:${BRAND.ink};">${content}</p>`;

export function otpEmail(code: string, minutes: number, support: SupportContact) {
  return {
    subject: `Your ${siteConfig.name} verification code`,
    html: shell(
      "Verify your email",
      `${paragraph("Enter this code to finish creating your account.")}
      <div style="margin:20px 0;padding:16px;text-align:center;background:${BRAND.sage};border-radius:14px;font-size:32px;font-weight:bold;letter-spacing:8px;color:${BRAND.forest};">${escapeHtml(code)}</div>
      ${paragraph(`The code is valid for ${minutes} minutes. Never share it with anyone. If you did not request it, ignore this email.`)}`,
      support,
    ),
    text: `Your ${siteConfig.name} verification code is ${code}. It is valid for ${minutes} minutes. If you did not request it, ignore this email.`,
  };
}

export function existingAccountEmail(support: SupportContact) {
  const loginUrl = `${siteConfig.url}/login`;
  return {
    subject: `You already have a ${siteConfig.name} account`,
    html: shell(
      "You already have an account",
      `${paragraph("Someone tried to register with this email address, but an account already exists.")}
      ${paragraph(`<a href="${loginUrl}" style="color:${BRAND.leaf};font-weight:bold;">Sign in</a>, or use "Forgot Password" if you need a new one. If this was not you, no action is needed.`)}`,
      support,
    ),
    text: `An account already exists for this email. Sign in at ${loginUrl} or use "Forgot Password". If this was not you, no action is needed.`,
  };
}

export type OrderEmailData = {
  orderNumber: string;
  customerName: string;
  paymentMethod: "razorpay" | "cod";
  /** Razorpay's references, for online payments only. */
  razorpayPaymentId?: string;
  razorpayOrderId?: string;
  needsAttention: boolean;
  items: { name: string; quantity: number; total: number }[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  addressLines: string[];
  support: SupportContact;
};

export function orderConfirmationEmail(order: OrderEmailData) {
  const paymentLine =
    order.paymentMethod === "cod"
      ? `Cash on Delivery. Please keep ${money(order.total)} ready.`
      : "Paid online.";
  const references = [
    order.razorpayPaymentId ? `Payment ID: ${order.razorpayPaymentId}` : "",
    order.razorpayOrderId ? `Razorpay Order ID: ${order.razorpayOrderId}` : "",
  ].filter(Boolean);
  const intro = order.needsAttention
    ? "We received your payment. Our team needs to check your order and will contact you shortly."
    : "Thank you for your order. We have received it and will update you as it moves.";

  const row = (label: string, value: string, strong = false) =>
    `<tr><td style="padding:4px 0;font-size:13px;${strong ? `font-weight:bold;color:${BRAND.forest};` : `color:${BRAND.muted};`}">${label}</td><td style="padding:4px 0;text-align:right;font-size:13px;${strong ? "font-weight:bold;" : ""}">${value}</td></tr>`;

  const items = order.items
    .map((item) => row(`${escapeHtml(item.name)} &times; ${item.quantity}`, money(item.total)))
    .join("");
  const codFee = codFeeOf(order);
  const totals = [
    row("Subtotal", money(order.subtotal)),
    order.discount > 0 ? row("Discount", `-${money(order.discount)}`) : "",
    row("Shipping", order.shipping === 0 ? "Free" : money(order.shipping)),
    codFee > 0 ? row("Cash on Delivery fee", money(codFee)) : "",
    row("Total", money(order.total), true),
  ].join("");
  const table = (rows: string) =>
    `<table role="presentation" width="100%" style="border-collapse:collapse;border-top:1px solid ${BRAND.border};margin-bottom:8px;">${rows}</table>`;

  return {
    subject: `Order ${order.orderNumber} received`,
    html: shell(
      `Order #${escapeHtml(order.orderNumber)}`,
      `${paragraph(`Hi ${escapeHtml(order.customerName)},`)}
      ${paragraph(intro)}
      ${table(items)}
      ${table(totals)}
      ${paragraph([`<strong>Payment:</strong> ${paymentLine}`, ...references.map(escapeHtml)].join("<br />"))}
      ${paragraph(`<strong>Delivery address</strong><br />${order.addressLines.map(escapeHtml).join("<br />")}`)}`,
      order.support,
    ),
    text: [
      `Hi ${order.customerName},`,
      intro,
      `Order #${order.orderNumber}`,
      ...order.items.map((item) => `${item.name} x ${item.quantity}: ${money(item.total)}`),
      `Total: ${money(order.total)}`,
      `Payment: ${paymentLine}`,
      ...references,
      `Delivery address: ${order.addressLines.join(", ")}`,
    ].join("\n"),
  };
}
