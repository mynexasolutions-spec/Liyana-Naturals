import { NextResponse } from "next/server";
import ImageKit from "imagekit";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getAdminSession } from "@/lib/supabase/admin-auth";

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const supabase = createSupabaseAdminClient();

  let body: { fileId?: unknown };
  try {
    body = (await request.json()) as { fileId?: unknown };
  } catch {
    return NextResponse.json({ error: "Invalid delete request." }, { status: 400 });
  }

  const { fileId } = body;
  if (!fileId || typeof fileId !== "string") {
    return NextResponse.json({ error: "fileId is required" }, { status: 400 });
  }

  const publicKey = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY;
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
  const urlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT;
  if (!publicKey || !privateKey || !urlEndpoint) {
    return NextResponse.json({ error: "Image upload is not configured on the server." }, { status: 500 });
  }

  const imagekit = new ImageKit({ publicKey, privateKey, urlEndpoint });
  try {
    await imagekit.deleteFile(fileId);
  } catch {
    return NextResponse.json({ error: "ImageKit could not delete the requested file." }, { status: 502 });
  }
  const { error } = await supabase
    .from("media_assets")
    .delete()
    .eq("imagekit_file_id", fileId);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
