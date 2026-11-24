import { NextResponse } from "next/server";
import ImageKit from "imagekit";
import { getAdminSession } from "@/lib/supabase/admin-auth";

export async function GET(request: Request) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const publicKey = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY;
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
  const urlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT;
  if (!publicKey || !privateKey || !urlEndpoint) {
    return NextResponse.json({ error: "Image upload is not configured on the server." }, { status: 500 });
  }

  const imagekit = new ImageKit({ publicKey, privateKey, urlEndpoint });
  const folder = new URL(request.url).searchParams.get("folder") ?? "/liyana-naturals";
  return NextResponse.json({
    ...imagekit.getAuthenticationParameters(),
    publicKey,
    folder,
  });
}
