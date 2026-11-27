import "server-only";

import { createHash } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";

type Rule = {
  scope: string;
  identifier: string;
  limit: number;
  windowSeconds: number;
};

/** Returns false if any rule is exceeded. Throws if limits cannot be checked. */
export async function withinRateLimits(admin: SupabaseClient, rules: Rule[]): Promise<boolean> {
  for (const rule of rules) {
    // Hashed so raw IP addresses and emails are not stored.
    const digest = createHash("sha256").update(rule.identifier).digest("hex");
    const { data, error } = await admin.rpc("hit_rate_limit", {
      p_key: `${rule.scope}:${digest}`,
      p_limit: rule.limit,
      p_window_seconds: rule.windowSeconds,
    });
    if (error) throw new Error(`Rate limit check failed: ${error.message}`);
    if (data !== true) return false;
  }
  return true;
}
