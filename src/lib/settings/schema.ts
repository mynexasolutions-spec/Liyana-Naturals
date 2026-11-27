import { z } from "zod";
import { badgeSchema, MAX_BADGES } from "@/lib/content/badges";

// Used by the admin settings form and its API. Empty optional text is saved as
// null, and the website then hides that detail.
const optionalText = (max: number, label: string) =>
  z
    .string()
    .trim()
    .max(max, `${label} must be ${max} characters or fewer.`)
    .transform((value) => value || null);

const amount = (label: string, max: number) =>
  z
    .number(`Enter a valid ${label.toLowerCase()}.`)
    .min(0, `${label} cannot be negative.`)
    .max(max, `${label} is too large.`);

const webLink = (label: string) =>
  optionalText(300, `${label} link`).refine(
    (value) => value === null || /^https:\/\/[^\s]+$/i.test(value),
    `Enter the full ${label} link, starting with https://`,
  );

export const storeSettingsSchema = z.strictObject({
  support_hours: optionalText(80, "Support hours"),
  social_instagram: webLink("Instagram"),
  social_facebook: webLink("Facebook"),
  social_youtube: webLink("YouTube"),
  social_pinterest: webLink("Pinterest"),
  store_name: z.string().trim().min(2, "Enter the store name.").max(100, "Store name is too long."),
  support_email: optionalText(254, "Support email").refine(
    (value) => value === null || z.email().safeParse(value).success,
    "Enter a valid support email.",
  ),
  support_phone: optionalText(30, "Support phone").refine(
    (value) => value === null || (/^[+\d\s()-]+$/.test(value) && value.replace(/\D/g, "").length >= 10),
    "Enter a valid support phone number.",
  ),
  address: optionalText(300, "Address"),
  announcement_enabled: z.boolean(),
  announcement_text: optionalText(120, "Announcement"),
  announcement_second: optionalText(60, "Second message"),
  shipping_fee: amount("Shipping fee", 10_000),
  free_shipping_threshold: amount("Free shipping amount", 10_000_000).nullable(),
  online_payment_enabled: z.boolean(),
  cod_enabled: z.boolean(),
  cod_fee: amount("Cash on Delivery fee", 10_000),
  // Shown under the buy buttons on every product page.
  product_badges: z.array(badgeSchema).max(MAX_BADGES, "Up to 4 badges can be shown."),
});
