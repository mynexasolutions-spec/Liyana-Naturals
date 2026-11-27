// The store's contact details and social links, as set in admin Settings.
// Shared by server and browser code. An empty detail is not shown anywhere.

export const SOCIAL_NETWORKS = {
  instagram: "Instagram",
  facebook: "Facebook",
  youtube: "YouTube",
  pinterest: "Pinterest",
} as const;

export type SocialNetwork = keyof typeof SOCIAL_NETWORKS;

export type StoreContact = {
  phone: string;
  email: string;
  address: string;
  hours: string;
  social: Partial<Record<SocialNetwork, string>>;
};

export const EMPTY_CONTACT: StoreContact = { phone: "", email: "", address: "", hours: "", social: {} };

export const telHref = (phone: string) => `tel:${phone.replace(/[^+\d]/g, "")}`;

const text = (value: unknown) => (typeof value === "string" ? value.trim() : "");
const object = (value: unknown) => (value && typeof value === "object" ? (value as Record<string, unknown>) : {});

export function toStoreContact(
  row: { support_phone?: string | null; support_email?: string | null; address?: string | null } | null | undefined,
  /** The "store:settings" content: social links and support hours. */
  content: Record<string, unknown> | null | undefined,
): StoreContact {
  const social = object(content?.social);
  const links: StoreContact["social"] = {};
  for (const network of Object.keys(SOCIAL_NETWORKS) as SocialNetwork[]) {
    const link = text(social[network]);
    // Only web addresses are ever used as links.
    if (/^https?:\/\/[^\s]+$/i.test(link)) links[network] = link;
  }
  return {
    phone: text(row?.support_phone),
    email: text(row?.support_email),
    address: text(row?.address),
    hours: text(object(content?.contact).hours),
    social: links,
  };
}
