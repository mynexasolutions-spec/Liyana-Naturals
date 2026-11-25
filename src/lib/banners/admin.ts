import "server-only";

import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getAdminSession } from "@/lib/supabase/admin-auth";
import type { BannerCreatePayload } from "@/lib/banners/schema";

type SupabaseAdminClient = ReturnType<typeof createSupabaseAdminClient>;

type BannerImage = {
  label: string;
  url?: string | null;
  fileId?: string | null;
};

export function validationMessage(issues: { path: PropertyKey[]; message: string }[]): string {
  return issues
    .map((issue) => `${issue.path.join(".") || "Banner"}: ${issue.message}`)
    .join(" ");
}

export function databaseError(error: { code?: string; message?: string }, action: string) {
  if (error.code === "23514") {
    return NextResponse.json(
      { error: "The banner contains an image value that does not match the database rules." },
      { status: 400 },
    );
  }
  console.error(`Homepage banner ${action} failed`, {
    code: error.code,
    message: error.message,
  });
  return NextResponse.json(
    { error: `Homepage banner could not be ${action}. Try again.` },
    { status: 500 },
  );
}

export async function validateImageAssets(
  supabase: SupabaseAdminClient,
  payload: Partial<BannerCreatePayload>,
): Promise<NextResponse | null> {
  const images: BannerImage[] = [
    {
      label: "desktop hero image",
      url: payload.desktop_image_url,
      fileId: payload.desktop_image_file_id,
    },
    {
      label: "mobile hero image",
      url: payload.mobile_image_url,
      fileId: payload.mobile_image_file_id,
    },
    {
      label: "legacy banner image",
      url: payload.image_url,
      fileId: payload.image_file_id,
    },
  ];

  for (const image of images) {
    if (image.url === undefined && image.fileId === undefined) continue;
    if (!image.url || !image.fileId) {
      return NextResponse.json(
        { error: `${image.label} must include both its URL and ImageKit file ID.` },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from("media_assets")
      .select("imagekit_file_id,url")
      .eq("imagekit_file_id", image.fileId)
      .limit(1)
      .maybeSingle();
    if (error) return databaseError(error, "image validation");
    if (!data) {
      return NextResponse.json(
        { error: `The selected ${image.label} was not saved in ImageKit metadata. Upload it again.` },
        { status: 400 },
      );
    }
    if (data.url !== image.url) {
      return NextResponse.json(
        { error: `The ${image.label} URL does not match its ImageKit asset. Upload it again.` },
        { status: 400 },
      );
    }
  }

  return null;
}

export async function requireBannerAdmin() {
  const session = await getAdminSession();
  if (!session) return null;
  return { supabase: createSupabaseAdminClient() };
}
