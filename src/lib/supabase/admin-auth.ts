import "server-only";

import type { User } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AdminProfile = {
  role: string;
  is_active: boolean;
};

export type AdminSession = {
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>;
  user: User;
  profile: AdminProfile;
};

export function isAdminProfile(
  profile: AdminProfile | null | undefined,
): profile is AdminProfile {
  return Boolean(
    profile?.is_active && ["admin", "manager"].includes(profile.role),
  );
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role,is_active")
    .eq("id", user.id)
    .maybeSingle();

  if (error || !isAdminProfile(profile)) return null;

  return { supabase, user, profile };
}
