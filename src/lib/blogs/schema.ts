import { z } from "zod";
import { renderableImageUrl } from "@/lib/media/image-url";

const imageUrl = z.string()
  .trim()
  .min(1)
  .max(2048)
  .refine((value) => Boolean(renderableImageUrl(value)), "Image URL must be an absolute HTTP(S) URL or a local path.");

const stringList = z.array(z.string().trim().min(1).max(300)).max(100);

// Articles split into headed sections. The storefront shows these instead of
// the plain `content` text whenever there is at least one.
const section = z.object({
  id: z.string().trim().min(1).max(120),
  heading: z.string().trim().min(1, "Every section needs a heading.").max(240),
  paragraphs: z.array(z.string().trim().min(1).max(10000, "A paragraph is too long.")).max(100),
  bullets: z.array(z.string().trim().min(1).max(2000, "A bullet point is too long.")).max(100),
  highlightTip: z.string().trim().max(2000, "The expert tip is too long.").optional(),
});

const blogFields = {
  sections: z.array(section).max(50, "An article can have at most 50 sections.").optional(),
  slug: z.string()
    .trim()
    .min(1, "Slug is required.")
    .max(160)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must use lowercase letters, numbers, and hyphens."),
  title: z.string().trim().min(1, "Title is required.").max(240),
  subtitle: z.string().trim().max(500).nullable().optional(),
  excerpt: z.string().trim().min(1, "Excerpt is required.").max(2000),
  category: z.string().trim().min(1, "Category is required.").max(120),
  read_time: z.string().trim().max(80).default(""),
  published_at: z.string().trim().max(100).default(""),
  cover_image: imageUrl,
  cover_image_file_id: z.string().trim().min(1).max(300),
  tags: stringList,
  key_takeaways: stringList,
  content: z.string().trim().max(100000).nullable().optional(),
  author_name: z.string().trim().min(1, "Author name is required.").max(160),
  author_role: z.string().trim().max(160).nullable().optional(),
  author_bio: z.string().trim().max(2000).nullable().optional(),
  is_featured: z.boolean().default(false),
  is_published: z.boolean().default(true),
};

export const blogCreateSchema = z.object(blogFields).strict();
// No defaults here: a default would be filled in for every field left out of an
// update, silently resetting it.
export const blogUpdateSchema = z.object({
  ...blogFields,
  read_time: z.string().trim().max(80),
  published_at: z.string().trim().max(100),
  is_featured: z.boolean(),
  is_published: z.boolean(),
}).strict().partial()
  .refine((value) => Object.keys(value).length > 0, "At least one blog field is required.");

export type BlogCreatePayload = z.infer<typeof blogCreateSchema>;
export type BlogUpdatePayload = z.infer<typeof blogUpdateSchema>;
