// The messages in the strip at the top of the website, all from admin Settings.
// Shared by the website and the admin preview.

import { freeShippingOffer, type ShippingSettings } from "@/lib/checkout/pricing";

/** The second message, kept with the store's content (site_content "store:settings"). */
export function toSecondAnnouncement(content: Record<string, unknown> | null | undefined): string {
  const value = content?.announcement_second;
  return typeof value === "string" ? value.trim() : "";
}

/**
 * `first` is the admin's own message when it is switched on, otherwise the free
 * delivery offer. An empty string means there is nothing to show in that place.
 */
export function announcementMessages(input: {
  ownMessageOn: boolean;
  ownMessage: string | null | undefined;
  secondMessage: string;
  shipping: ShippingSettings;
}): { first: string; second: string } {
  const own = input.ownMessageOn ? input.ownMessage?.trim() : "";
  return {
    first: own || (freeShippingOffer(input.shipping) ?? ""),
    second: input.secondMessage.trim(),
  };
}
