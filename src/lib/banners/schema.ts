import { z } from "zod";
import { isSafeBannerLink } from "@/lib/banners/link";

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
  .min(1, "Image URL is required.")
  .max(2048)
  .refine(isSupportedImageUrl, "Image URL must be an absolute HTTP(S) URL or a local path.");

const imageFileId = z.string().trim().min(1).max(300);

const bannerFields = {
  title: z.string().trim().min(1, "Banner title is required.").max(160),
  subtitle: z.string().trim().max(1000).nullable().optional(),
  image_url: imageUrl.nullable().optional(),
  image_file_id: imageFileId.nullable().optional(),
  desktop_image_url: imageUrl,
  desktop_image_file_id: imageFileId,
  mobile_image_url: imageUrl,
  mobile_image_file_id: imageFileId,
  link_url: z
    .string()
    .trim()
    .max(2048)
    .refine((value) => value === "" || isSafeBannerLink(value), "The link must start with / or https://")
    .nullable()
    .optional(),
  eyebrow: z.string().trim().max(60, "The small label must be 60 characters or fewer.").nullable().optional(),
  button_label: z.string().trim().max(40, "The button text must be 40 characters or fewer.").nullable().optional(),
  show_text: z.boolean().optional(),
  is_active: z.boolean().optional(),
  sort_order: z.number().int().min(0).max(2147483647).optional(),
};

export const bannerCreateSchema = z.object(bannerFields).strict();

export const bannerUpdateSchema = bannerCreateSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, "At least one banner field is required.");

export type BannerCreatePayload = z.infer<typeof bannerCreateSchema>;
