// Small "icon + words" items the admin writes: product highlight boxes and the
// store badges under the buy buttons. Shared by server and browser code.

import { z } from "zod";

/** The icons the admin can choose from, with their names in the dropdown. */
export const BADGE_ICONS = {
  leaf: "Leaf",
  shield: "Shield",
  sparkles: "Sparkles",
  droplet: "Drop",
  heart: "Heart",
  flask: "Flask",
  sun: "Sun",
  check: "Tick",
  lock: "Lock",
} as const;

export type BadgeIconKey = keyof typeof BADGE_ICONS;
export type Badge = { icon: BadgeIconKey; label: string };

export const BADGE_ICON_KEYS = Object.keys(BADGE_ICONS) as [BadgeIconKey, ...BadgeIconKey[]];
export const MAX_BADGES = 4;

export const badgeSchema = z
  .object({
    icon: z.enum(BADGE_ICON_KEYS, "Choose an icon."),
    label: z.string().trim().min(2, "Each box needs a few words.").max(40, "Keep each box to 40 characters."),
  })
  .strict();

/** Reads a stored list, skipping anything that is not a complete item. */
export function toBadges(value: unknown): Badge[] {
  if (!Array.isArray(value)) return [];
  return value
    .flatMap((item) => {
      const parsed = badgeSchema.safeParse(item);
      return parsed.success ? [parsed.data] : [];
    })
    .slice(0, MAX_BADGES);
}
