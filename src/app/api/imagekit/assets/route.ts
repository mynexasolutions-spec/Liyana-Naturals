import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getAdminSession } from "@/lib/supabase/admin-auth";
import { renderableImageUrl } from "@/lib/media/image-url";

type AssetBody = {
  fileId?: unknown;
  name?: unknown;
  url?: unknown;
  thumbnailUrl?: unknown;
  mime?: unknown;
  sizeBytes?: unknown;
  folder?: unknown;
};

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const supabase = createSupabaseAdminClient();

  let body: AssetBody;
  try {
    body = (await request.json()) as AssetBody;
  } catch {
    return NextResponse.json({ error: "Invalid media metadata." }, { status: 400 });
  }

  const normalizedUrl = renderableImageUrl(body.url);
  if (
    typeof body.fileId !== "string" ||
    typeof body.name !== "string" ||
    !normalizedUrl ||
    !normalizedUrl.startsWith("http")
  ) {
    return NextResponse.json({ error: "fileId, name, and url are required." }, { status: 400 });
  }

  const { data: existingAsset, error: lookupError } = await supabase
    .from("media_assets")
    .select("id")
    .eq("imagekit_file_id", body.fileId)
    .limit(1)
    .maybeSingle();
  if (lookupError) return NextResponse.json({ error: lookupError.message }, { status: 500 });
  if (existingAsset) return NextResponse.json({ ok: true, existing: true });

  const { error } = await supabase.from("media_assets").insert({
    imagekit_file_id: body.fileId,
    name: body.name,
    url: normalizedUrl,
    thumbnail_url: typeof body.thumbnailUrl === "string" ? body.thumbnailUrl : null,
    mime: typeof body.mime === "string" ? body.mime : null,
    size_bytes: typeof body.sizeBytes === "number" ? body.sizeBytes : null,
    folder: typeof body.folder === "string" ? body.folder : null,
    created_by: session.user.id,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
