import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { getAuthErrorMessage } from "@/lib/auth/errors";

type AdminProfile = {
  role: string;
  is_active: boolean;
};

function copyCookies(source: NextResponse, target: NextResponse) {
  source.cookies.getAll().forEach((cookie) => target.cookies.set(cookie));
  return target;
}

function errorResponse(
  sessionResponse: NextResponse,
  error: string,
  status: number,
) {
  return copyCookies(
    sessionResponse,
    NextResponse.json({ error }, { status }),
  );
}

function isAdminProfile(profile: AdminProfile | null): boolean {
  return Boolean(
    profile?.is_active && ["admin", "manager"].includes(profile.role),
  );
}

export async function POST(request: NextRequest) {
  let body: { email?: unknown; password?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid login request." }, { status: 400 });
  }
  const email = body.email;
  const password = body.password;
  if (
    typeof email !== "string" ||
    typeof password !== "string" ||
    password.length < 6
  ) {
    return NextResponse.json({ error: "Enter a valid email and password." }, { status: 400 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_Publishable_key;
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json(
      { error: "Supabase authentication is not configured on the server." },
      { status: 500 },
    );
  }

  const sessionResponse = NextResponse.next();
  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            sessionResponse.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });
  if (error || !data.user) {
    return errorResponse(
      sessionResponse,
      getAuthErrorMessage(error, "login"),
      401,
    );
  }

  let { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role,is_active")
    .eq("id", data.user.id)
    .maybeSingle();

  if (profileError) {
    await supabase.auth.signOut();
    return errorResponse(
      sessionResponse,
      `Admin profile lookup failed: ${profileError.message}. Apply the admin migrations, then try again.`,
      500,
    );
  }

  const adminEmail = (
    process.env.ADMIN_EMAIL ??
    process.env.NEXT_PUBLIC_ADMIN_EMAIL ??
    "adminliyana@gmail.com"
  ).trim().toLowerCase();

  if (
    !isAdminProfile(profile) &&
    data.user.email?.trim().toLowerCase() === adminEmail
  ) {
    // This function is SECURITY DEFINER and is the only safe bootstrap path for
    // an existing Auth user whose profile trigger did not run.
    const { data: bootstrappedProfile, error: bootstrapError } = await supabase
      .rpc("ensure_admin_profile");
    if (bootstrapError) {
      await supabase.auth.signOut();
      return errorResponse(
        sessionResponse,
        `Admin profile setup failed: ${bootstrapError.message}. Apply the admin migrations, then try again.`,
        500,
      );
    }
    profile = bootstrappedProfile as AdminProfile | null;
  }

  if (!profile?.is_active) {
    await supabase.auth.signOut();
    return errorResponse(
      sessionResponse,
      "Your account is inactive or does not have an admin profile.",
      403,
    );
  }
  if (!["admin", "manager"].includes(profile.role)) {
    await supabase.auth.signOut();
    return errorResponse(
      sessionResponse,
      "This account does not have permission to access the admin panel.",
      403,
    );
  }

  return copyCookies(sessionResponse, NextResponse.json({ ok: true }));
}
