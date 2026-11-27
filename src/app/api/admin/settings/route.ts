import { NextResponse } from "next/server";
import { readAdminRequest } from "@/lib/security/admin-route";
import { jsonError } from "@/lib/security/request";
import { storeSettingsSchema } from "@/lib/settings/schema";
import { getAdminSession } from "@/lib/supabase/admin-auth";

const CONTENT_KEY = "store:settings";

const object = (value: unknown) => (value && typeof value === "object" ? (value as Record<string, unknown>) : {});

function failed(message: string) {
  console.error("[admin-settings] Save failed:", message);
  return jsonError("The settings could not be saved.", 500);
}

export async function PATCH(request: Request) {
  const body = await readAdminRequest(request, 8_000);
  if (!body.ok) return body.response;
  const parsed = storeSettingsSchema.safeParse(body.data);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Check the settings.", 400);
  }

  // The signed-in admin's own client, so database access rules apply too.
  const session = await getAdminSession();
  if (!session) return jsonError("Forbidden", 403);

  // Social links, support hours and the second announcement are kept with the store's content.
  const {
    support_hours,
    social_instagram,
    social_facebook,
    social_youtube,
    social_pinterest,
    announcement_second,
    ...store
  } = parsed.data;
  const content = await session.supabase.from("site_content").select("body").eq("section_key", CONTENT_KEY).maybeSingle();
  if (content.error) return failed(content.error.message);

  // There is exactly one settings row.
  const saved = await session.supabase.from("store_settings").upsert({ id: true, ...store });
  if (saved.error) return failed(saved.error.message);

  const current = object(content.data?.body);
  const savedContent = await session.supabase.from("site_content").upsert(
    {
      section_key: CONTENT_KEY,
      is_published: true,
      body: {
        ...current,
        announcement_second: announcement_second ?? "",
        contact:{ ...object(current.contact), hours: support_hours ?? "" },
        social: {
          ...object(current.social),
          instagram: social_instagram ?? "",
          facebook: social_facebook ?? "",
          youtube: social_youtube ?? "",
          pinterest: social_pinterest ?? "",
        },
      },
    },
    { onConflict: "section_key" },
  );
  if (savedContent.error) return failed(savedContent.error.message);
  return NextResponse.json({ ok: true });
}
