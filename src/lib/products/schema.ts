import { z } from "zod";
import { badgeSchema, MAX_BADGES } from "@/lib/content/badges";

const productImageSchema = z.object({
  src: z.string().trim().min(1).max(2048),
  url: z.string().trim().min(1).max(2048).optional(),
  alt: z.string().trim().max(240).optional(),
  fileId: z.string().trim().min(1).max(300).optional(),
  // The one size this picture belongs to. Left out, it shows for every size.
  size: z.string().trim().min(1).max(60).optional(),
}).strict();

const amount = z.number().finite().min(0).max(9999999999);

const variantSchema = z
  .object({
    id: z.string().uuid().optional(),
    name: z.string().trim().min(1, "Give every size a name.").max(60),
    price: amount.refine((value) => value > 0, "Every size needs a price."),
    original_price: amount.nullable(),
    stock_quantity: z.number().int().min(0).max(2147483647),
  })
  .strict()
  .refine((size) => size.original_price === null || size.original_price >= size.price, {
    message: "A size's MRP cannot be lower than its price.",
  });

const faqSchema = z
  .object({
    question: z.string().trim().min(3, "Each FAQ needs a question.").max(200),
    answer: z.string().trim().min(2, "Each FAQ needs an answer.").max(2000),
  })
  .strict();

const productFields = {
  name: z.string().trim().min(1, "Product name is required.").max(160),
  slug: z.string()
    .trim()
    .min(1, "Slug is required.")
    .max(160)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must use lowercase letters, numbers, and hyphens."),
  // Every product belongs to a category.
  category_id: z.string({ error: "Choose a category." }).uuid("Choose a category."),
  // Null clears an optional field.
  tagline: z.string().trim().max(240).nullable().optional(),
  description: z.string().trim().max(10000).nullable().optional(),
  short_description: z.string().trim().max(1000).nullable().optional(),
  price: z.number().finite().min(0).max(9999999999),
  original_price: z.number().finite().min(0).max(9999999999).nullable().optional(),
  stock_quantity: z.number().int().min(0).max(2147483647).optional(),
  // A suggested badge or the admin's own words.
  badge: z.string().trim().min(1).max(24, "Keep the badge to 24 characters.").nullable().optional(),
  ingredients: z.array(z.string().trim().min(1).max(240)).max(100).optional(),
  benefits: z.array(z.string().trim().min(1).max(240)).max(100).optional(),
  how_to_use: z.string().trim().max(5000).nullable().optional(),
  is_featured: z.boolean().optional(),
  is_best_seller: z.boolean().optional(),
  is_active: z.boolean().optional(),
  images: z.array(productImageSchema).max(30).optional(),
  seo_title: z.string().trim().max(70).nullable().optional(),
  seo_description: z.string().trim().max(170).nullable().optional(),
  faqs: z.array(faqSchema).max(20).optional(),
  highlights: z.array(badgeSchema).max(MAX_BADGES, "A product can have up to 4 highlights.").optional(),
  tags: z.array(z.string().trim().min(1).max(40, "Keep each tag to 40 characters.")).max(8, "A product can have up to 8 tags.").optional(),
  // Saved to their own table, not to the product row.
  variants: z
    .array(variantSchema)
    .max(20)
    .refine(
      (list) => new Set(list.map((size) => size.name.toLowerCase())).size === list.length,
      "Two sizes have the same name.",
    )
    .optional(),
};

export const productCreateSchema = z.object(productFields).strict();

export const productUpdateSchema = productCreateSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, "At least one product field is required.");

export type ProductCreatePayload = z.infer<typeof productCreateSchema>;
export type ProductUpdatePayload = z.infer<typeof productUpdateSchema>;
