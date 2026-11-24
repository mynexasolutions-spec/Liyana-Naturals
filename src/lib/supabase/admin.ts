import "server-only";

import { createClient } from "@supabase/supabase-js";

export function createSupabaseAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.SUPABASE_SECRET_KEY ??
    process.env.SUPABASE_Secret_key;
  if (!url || !key) {
    throw new Error("Missing server-only Supabase service key configuration.");
  }

  return createClient(
    url,
    key,
    {
      auth: { persistSession: false, autoRefreshToken: false },
    },
  );
}
