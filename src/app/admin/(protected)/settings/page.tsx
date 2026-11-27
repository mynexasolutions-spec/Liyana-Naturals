import { redirect } from "next/navigation";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { toPaymentSettings } from "@/lib/checkout/pricing";
import { toBadges } from "@/lib/content/badges";
import { toSecondAnnouncement } from "@/lib/settings/announcement";
import { toStoreContact } from "@/lib/settings/contact";
import { getAdminSession } from "@/lib/supabase/admin-auth";

export default async function SettingsPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const [{ data, error }, content] = await Promise.all([
    session.supabase.from("store_settings").select("*").eq("id", true).maybeSingle(),
    session.supabase.from("site_content").select("body").eq("section_key", "store:settings").maybeSingle(),
  ]);
  if (error || content.error) throw new Error(`Settings could not be loaded: ${(error ?? content.error)?.message}`);
  const body = content.data?.body as Record<string, unknown> | undefined;
  const contact = toStoreContact(data, body);

  // Database numbers arrive like "60.00"; show them as "60".
  const numberText = (value: unknown, fallback = "") =>
    value === null || value === undefined ? fallback : String(Number(value));

  return (
    <SettingsForm
      initial={{
        store_name: data?.store_name ?? "Liyana Naturals",
        support_email: data?.support_email ?? "",
        support_phone: data?.support_phone ?? "",
        address: data?.address ?? "",
        support_hours: contact.hours,
        social_instagram: contact.social.instagram ?? "",
        social_facebook: contact.social.facebook ?? "",
        social_youtube: contact.social.youtube ?? "",
        social_pinterest: contact.social.pinterest ?? "",
        announcement_enabled: data?.announcement_enabled ?? false,
        announcement_text: data?.announcement_text ?? "",
        announcement_second: toSecondAnnouncement(body),
        shipping_fee: numberText(data?.shipping_fee, "0"),
        free_shipping_threshold: numberText(data?.free_shipping_threshold),
        online_payment_enabled: toPaymentSettings(data).onlineEnabled,
        cod_enabled: toPaymentSettings(data).codEnabled,
        cod_fee: String(toPaymentSettings(data).codFee),
        product_badges: toBadges(data?.product_badges),
      }}
    />
  );
}
