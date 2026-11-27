// Used by the Subscribe forms and their API.

import { z } from "zod";

export const SUBSCRIBE_SOURCES = {
  home: "Home page",
  shop: "Shop page",
  contact: "Contact page",
} as const;

export type SubscribeSource = keyof typeof SUBSCRIBE_SOURCES;

export const subscribeSchema = z.strictObject({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .max(254, "Please enter a valid email address.")
    .pipe(z.email("Please enter a valid email address.")),
  source: z.enum(["home", "shop", "contact"]),
});
