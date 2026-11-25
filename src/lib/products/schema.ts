import { z } from "zod";

const productImageSchema = z.object({
  src: z.string().trim().min(1).max(2048),
  url: z.string().trim().min(1).max(2048).optional(),
  alt: z.string().trim().max(240).optional(),
  fileId: z.string().trim().min(1).max(300).optional(),
}).strict();

const productFields = {
  name: z.string().trim().min(1, "Product name is required.").max(160),
  slug: z.string()
    .trim()
    .min(1, "Slug is required.")
    .max(160)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must use lowercase letters, numbers, and hyphens."),
  category_id: z.string().uuid().nullable().optional(),
  tagline: z.string().trim().max(240).optional(),
  description: z.string().trim().max(10000).optional(),
  short_description: z.string().trim().max(1000).optional(),
  price: z.number().finite().min(0).max(9999999999),
  original_price: z.number().finite().min(0).max(9999999999).nullable().optional(),
  stock_quantity: z.number().int().min(0).max(2147483647).optional(),
  volume: z.string().trim().max(120).optional(),
  badge: z.enum(["Best Seller", "New", "Organic", "Award Winner", "Sale"]).optional(),
  ingredients: z.array(z.string().trim().min(1).max(240)).max(100).optional(),
  benefits: z.array(z.string().trim().min(1).max(240)).max(100).optional(),
  how_to_use: z.string().trim().max(5000).optional(),
  is_featured: z.boolean().optional(),
  is_best_seller: z.boolean().optional(),
  is_active: z.boolean().optional(),
  images: z.array(productImageSchema).max(12).optional(),
};

export const productCreateSchema = z.object(productFields).strict();

export const productUpdateSchema = productCreateSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, "At least one product field is required.");

export type ProductCreatePayload = z.infer<typeof productCreateSchema>;
export type ProductUpdatePayload = z.infer<typeof productUpdateSchema>;
