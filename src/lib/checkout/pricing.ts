// Shared by the checkout page and the order API so the amount shown is always
// the amount charged. The server recalculates everything from database prices.

import { calculateCouponDiscount, type CouponRule } from "@/lib/coupons/shared";

/** Delivery charges, set by the admin on the Settings page. */
export type ShippingSettings = {
  standardFee: number;
  /** Order amount from which delivery is free; null means never. */
  freeFrom: number | null;
};

/** How customers may pay, set by the admin on the Settings page. */
export type PaymentSettings = {
  onlineEnabled: boolean;
  codEnabled: boolean;
  /** Extra charge on Cash on Delivery orders. */
  codFee: number;
};

// Used only where the store has no settings record.
export const DEFAULT_SHIPPING: ShippingSettings = { standardFee: 60, freeFrom: 999 };

export function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

/** A stored amount, or null when it is empty or unusable. */
function amount(value: number | string | null | undefined): number | null {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? roundMoney(number) : null;
}

export function toShippingSettings(
  row: { shipping_fee?: number | string | null; free_shipping_threshold?: number | string | null } | null | undefined,
): ShippingSettings {
  if (!row) return DEFAULT_SHIPPING;
  return {
    standardFee: amount(row.shipping_fee) ?? DEFAULT_SHIPPING.standardFee,
    freeFrom: amount(row.free_shipping_threshold),
  };
}

export function toPaymentSettings(
  row:
    | {
        cod_enabled?: boolean | null;
        online_payment_enabled?: boolean | null;
        cod_fee?: number | string | null;
      }
    | null
    | undefined,
): PaymentSettings {
  return {
    codEnabled: row?.cod_enabled !== false,
    onlineEnabled: row?.online_payment_enabled !== false,
    codFee: amount(row?.cod_fee) ?? 0,
  };
}

/** The Cash on Delivery charge inside a saved order's total. */
export function codFeeOf(order: {
  subtotal: number | string;
  discount: number | string;
  shipping: number | string;
  total: number | string;
}): number {
  return Math.max(
    0,
    roundMoney(Number(order.total) - Number(order.subtotal) + Number(order.discount) - Number(order.shipping)),
  );
}

/** How much more must be added for free standard delivery; null if it is never free. */
export function amountToFreeShipping(subtotal: number, shipping: ShippingSettings): number | null {
  if (shipping.standardFee === 0) return 0;
  if (shipping.freeFrom === null) return null;
  return Math.max(0, roundMoney(shipping.freeFrom - subtotal));
}

/** Banner text, or null when there is no free delivery to advertise. */
export function freeShippingOffer(shipping: ShippingSettings): string | null {
  if (shipping.standardFee === 0 || shipping.freeFrom === 0) return "Free Shipping on all orders";
  if (shipping.freeFrom === null) return null;
  return `Free Shipping on orders above ₹${shipping.freeFrom.toLocaleString("en-IN")}`;
}

export function getStandardShippingFee(subtotal: number, shipping: ShippingSettings): number {
  return subtotal === 0 || amountToFreeShipping(subtotal, shipping) === 0 ? 0 : shipping.standardFee;
}

export function calculateOrderTotals(input: {
  subtotal: number;
  coupon: CouponRule | null;
  shipping: ShippingSettings;
  /** The Cash on Delivery charge, when that is how the order is paid. */
  codFee?: number;
}) {
  const subtotal = roundMoney(input.subtotal);
  const discount = calculateCouponDiscount(input.coupon, subtotal);
  const shipping = getStandardShippingFee(subtotal, input.shipping);
  const codFee = subtotal > 0 ? roundMoney(input.codFee ?? 0) : 0;
  return { subtotal, discount, shipping, codFee, total: roundMoney(subtotal - discount + shipping + codFee) };
}
