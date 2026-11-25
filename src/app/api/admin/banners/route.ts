import { NextResponse } from "next/server";
import { bannerCreateSchema } from "@/lib/banners/schema";
import {
  databaseError,
  requireBannerAdmin,
  validateImageAssets,
  validationMessage,
} from "@/lib/banners/admin";

export async function GET() {
  try {
    const admin = await requireBannerAdmin();
    if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { data, error } = await admin.supabase
      .from("homepage_banners")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });
    if (error) return databaseError(error, "loaded");
    return NextResponse.json({ homepage_banners: data ?? [] });
  } catch (error) {
    console.error("Homepage banner list failed", { error });
    return NextResponse.json(
      { error: "Homepage banners could not be loaded. Check the server configuration." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const admin = await requireBannerAdmin();
    if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid homepage banner data." }, { status: 400 });
    }

    const parsed = bannerCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: validationMessage(parsed.error.issues) }, { status: 400 });
    }

    const imageError = await validateImageAssets(admin.supabase, parsed.data);
    if (imageError) return imageError;

    const { data, error } = await admin.supabase
      .from("homepage_banners")
      .insert(parsed.data)
      .select("*")
      .single();
    if (error) return databaseError(error, "saved");
    return NextResponse.json({ homepage_banner: data }, { status: 201 });
  } catch (error) {
    console.error("Homepage banner create failed", { error });
    return NextResponse.json(
      { error: "Homepage banner could not be saved. Check the server configuration." },
      { status: 500 },
    );
  }
}
