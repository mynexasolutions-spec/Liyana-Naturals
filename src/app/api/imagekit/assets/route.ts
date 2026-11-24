import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/supabase/admin-auth";

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

  let body: AssetBody;
  try {
    body = (await request.json()) as AssetBody;
  } catch {
    return NextResponse.json({ error: "Invalid media metadata." }, { status: 400 });
  }

  if (
    typeof body.fileId !== "string" ||
    typeof body.name !== "string" ||
    typeof body.url !== "string"
  ) {
    return NextResponse.json({ error: "fileId, name, and url are required." }, { status: 400 });
  }

  const { error } = await session.supabase.from("media_assets").insert({
    imagekit_file_id: body.fileId,
    name: body.name,
    url: body.url,
    thumbnail_url: typeof body.thumbnailUrl === "string" ? body.thumbnailUrl : null,
    mime: typeof body.mime === "string" ? body.mime : null,
    size_bytes: typeof body.sizeBytes === "number" ? body.sizeBytes : null,
    folder: typeof body.folder === "string" ? body.folder : null,
    created_by: session.user.id,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
