import { z } from "zod";

const optionalText = (max: number, label: string) =>
  z
    .string()
    .trim()
    .max(max, `${label} must be ${max} characters or fewer.`)
    .nullable()
    .transform((value) => value || null);

export const customerUpdateSchema = z.strictObject({
  full_name: z.string().trim().min(2, "Enter the customer's name.").max(100, "Name is too long."),
  phone: optionalText(20, "Phone").refine(
    (value) => value === null || (/^[+\d\s()-]+$/.test(value) && value.replace(/\D/g, "").length >= 10),
    "Enter a valid phone number.",
  ),
});

const reviewStatus = z.enum(["pending", "approved", "rejected"], "Choose a review status.");
const reviewFields = {
  author_name: z.string().trim().min(2, "Enter the customer's name.").max(120, "Name is too long."),
  rating: z.number().int().min(1, "Choose a rating from 1 to 5.").max(5, "Choose a rating from 1 to 5."),
  title: optionalText(160, "Title"),
  body: optionalText(2000, "Review"),
  status: reviewStatus,
  show_on_home: z.boolean().optional(),
};

export const reviewCreateSchema = z.strictObject({ ...reviewFields, product_id: z.uuid("Choose a product.") });
export const reviewUpdateSchema = z.strictObject(reviewFields).partial();

export const inquiryUpdateSchema = z.strictObject({
  status: z.enum(["new", "in_progress", "resolved", "closed"], "Choose a status."),
});
