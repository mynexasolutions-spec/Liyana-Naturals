import "server-only";

import { z } from "zod";
import { jsonError } from "@/lib/security/request";

const date = z.iso.date("Enter a valid date.").nullable().optional();
const count = (label: string) =>
  z.number().int(`${label} must be a whole number.`).min(1, `${label} must be at least 1.`).max(1_000_000).nullable().optional();
const rupees = z.number().min(0, "Amounts cannot be negative.").max(10_000_000);

const fields = {
  code: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z0-9_-]{3,30}$/, "Code must be 3–30 letters, numbers, - or _ without spaces."),
  label: z.string().trim().min(2, "Enter a short title.").max(80, "Title must be 80 characters or fewer."),
  discount_type: z.enum(["percent", "fixed"], "Choose a discount type."),
  value: rupees.refine((value) => value > 0, "Discount value must be more than 0."),
  max_discount: rupees.refine((value) => value > 0, "Maximum discount must be more than 0.").nullable().optional(),
  min_subtotal: rupees,
  starts_on: date,
  expires_on: date,
  usage_limit: count("Total uses"),
  per_customer_limit: count("Uses per customer"),
  show_on_checkout: z.boolean(),
  is_active: z.boolean(),
};

export const couponCreateSchema = z.strictObject({
  ...fields,
  // An empty field means no minimum.
  min_subtotal: fields.min_subtotal.nullable().default(0).transform((value) => value ?? 0),
  show_on_checkout: fields.show_on_checkout.default(false),
  is_active: fields.is_active.default(true),
});

export const couponUpdateSchema = z
  .strictObject({ ...fields, min_subtotal: fields.min_subtotal.nullable() })
  .partial();

/** Turns database rule violations into messages the admin can act on. */
export function couponDatabaseError(error: { code?: string; message: string }, action: string) {
  if (error.code === "23505") return jsonError("A coupon with this code already exists.", 409);
  if (error.code === "23514") {
    if (error.message.includes("coupons_percent_range")) return jsonError("A percentage cannot be more than 100.", 400);
    if (error.message.includes("coupons_date_order")) return jsonError("The end date cannot be before the start date.", 400);
    return jsonError("Check the coupon values and try again.", 400);
  }
  console.error(`[admin-coupons] ${action} failed:`, error.message);
  return jsonError(`The coupon could not be ${action}.`, 500);
}
