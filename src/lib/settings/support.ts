import "server-only";

import type { SupportContact } from "@/lib/email/templates";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

/** The support details shown in emails. Never throws: an email can go without them. */
export async function getSupportContact(): Promise<SupportContact> {
  try {
    const { data, error } = await createSupabaseAdminClient()
      .from("store_settings")
      .select("support_email,support_phone")
      .eq("id", true)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return { email: data?.support_email ?? "", phone: data?.support_phone ?? "" };
  } catch (error) {
    console.error("[email] Support details could not be read:", error instanceof Error ? error.message : error);
    return { email: "", phone: "" };
  }
}
