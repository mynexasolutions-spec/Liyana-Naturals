import { z } from "zod";

const text = (min: number, max: number, message: string) =>
  z.string(message).trim().min(min, message).max(max, message);

export const orderRequestSchema = z.object({
  customer: z.object({
    fullName: text(2, 100, "Please enter your full name."),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .max(254, "Please enter a valid email address.")
      .pipe(z.email("Please enter a valid email address.")),
    phone: text(10, 20, "Please enter a valid phone number.").refine((value) => {
      const digits = value.replace(/\D/g, "");
      return digits.length >= 10 && digits.length <= 15 && /^[+\d\s()-]+$/.test(value);
    }, "Please enter a valid phone number."),
  }),
  address: z.object({
    street: text(6, 300, "Please enter your complete delivery street address."),
    city: text(2, 80, "Please enter your city."),
    state: text(2, 60, "Please select your state."),
    pinCode: z.string().trim().regex(/^\d{6}$/, "Please enter a valid 6-digit PIN code."),
  }),
  items: z
    .array(
      z.object({
        productId: z.uuid("The cart contains an invalid product."),
        // Required when the product is sold in sizes.
        variantId: z.uuid("The cart contains an invalid size.").optional(),
        quantity: z.number().int().min(1).max(99, "Product quantities must be between 1 and 99."),
      }),
    )
    .min(1, "Your cart is empty.")
    .max(50, "Too many items in your cart."),
  paymentMethod: z.enum(["online", "cod"], "Choose a payment method."),
  couponCode: z.string().trim().toUpperCase().max(40).default(""),
  // Only compared against the server total, never used as the charged amount.
  expectedTotal: z.number().nonnegative(),
});

export const paymentVerificationSchema = z.object({
  razorpay_order_id: z.string().regex(/^order_[A-Za-z0-9]{6,40}$/),
  razorpay_payment_id: z.string().regex(/^pay_[A-Za-z0-9]{6,40}$/),
  razorpay_signature: z.string().regex(/^[a-f0-9]{64}$/),
});
