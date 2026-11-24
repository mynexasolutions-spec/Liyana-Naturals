import fs from "node:fs/promises";
import { createClient } from "@supabase/supabase-js";

function readEnv(raw: string): Record<string, string> {
  return Object.fromEntries(
    raw
      .split(/\r?\n/)
      .map((line) => line.match(/^([^#=]+)=(.*)$/))
      .filter((match): match is RegExpMatchArray => Boolean(match))
      .map((match) => [match[1].trim(), match[2].trim().replace(/^['\"]|['\"]$/g, "")]),
  );
}

const env = readEnv(await fs.readFile(".env", "utf8"));
const client = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
const auth = await client.auth.signInWithPassword({ email: env.Email, password: env.Password });
if (auth.error || !auth.data.session) throw new Error(auth.error?.message ?? "Admin sign-in failed.");

const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, {
  global: { headers: { Authorization: `Bearer ${auth.data.session.access_token}` } },
});

const tables = ["categories", "products", "reviews", "homepage_banners", "site_content", "store_settings", "media_assets"] as const;
const result: Record<string, unknown> = {};
for (const table of tables) {
  const query = await admin.from(table).select("id", { count: "exact", head: true });
  result[table] = { count: query.count, error: query.error?.message ?? null };
}

const blogs = await admin.from("site_content").select("section_key,body").like("section_key", "blog:%");
result.blogs = {
  count: blogs.data?.length ?? 0,
  allImageKit: (blogs.data ?? []).every(
    (row) => typeof row.body?.coverImage === "string" && row.body.coverImage.includes("imagekit"),
  ),
};

console.log(JSON.stringify(result, null, 2));
await client.auth.signOut();
