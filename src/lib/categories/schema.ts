import { z } from "zod";

function isSupportedImageUrl(value: string): boolean {
  if (value.startsWith("/")) return true;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

const imageUrl = z.string()
  .trim()
  .min(1)
  .max(2048)
  .refine(isSupportedImageUrl, "Image URL must be an absolute HTTP(S) URL or a local path.");

const categoryFields = {
  name: z.string().trim().min(1, "Category name is required.").max(120),
  slug: z.string()
    .trim()
    .min(1, "Slug is required.")
    .max(160)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must use lowercase letters, numbers, and hyphens."),
  description: z.string().trim().max(2000).nullable().optional(),
  image_url: imageUrl.nullable().optional(),
  image_file_id: z.string().trim().min(1).max(300).nullable().optional(),
  is_featured: z.boolean().optional(),
  is_active: z.boolean().optional(),
  sort_order: z.number().int().min(0).max(2147483647).optional(),
};

export const categoryCreateSchema = z.object(categoryFields).strict();

export const categoryUpdateSchema = categoryCreateSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, "At least one category field is required.");

export type CategoryCreatePayload = z.infer<typeof categoryCreateSchema>;
