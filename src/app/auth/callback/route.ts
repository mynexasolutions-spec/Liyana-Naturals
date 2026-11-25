import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function getSafeNextPath(value: string | null): string {
  return value && value.startsWith("/") && !value.startsWith("//")
    ? value
    : "/login";
}

function redirectWithResetError(request: NextRequest, nextPath: string) {
  const url = new URL(nextPath, request.url);
  url.searchParams.set("reset_error", "1");
  return NextResponse.redirect(url);
}

export async function GET(request: NextRequest) {
  const nextPath = getSafeNextPath(request.nextUrl.searchParams.get("next"));
  const code = request.nextUrl.searchParams.get("code");

  if (!code) {
    return redirectWithResetError(request, nextPath);
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      return redirectWithResetError(request, nextPath);
    }
  } catch {
    return redirectWithResetError(request, nextPath);
  }

  const url = new URL(nextPath, request.url);
  url.searchParams.set("reset", "1");
  return NextResponse.redirect(url);
}
