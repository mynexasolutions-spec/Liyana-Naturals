import "server-only";

import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/supabase/admin-auth";

const PAGE_SIZE = 1000;

/** For admin pages: returns the session or sends the visitor to the admin login. */
export async function requireAdminPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  return session;
}

/** The database returns at most 1000 rows per request, so read in pages. */
export async function fetchAll<T>(
  what: string,
  readPage: (from: number, to: number) => PromiseLike<{ data: unknown; error: { message: string } | null }>,
): Promise<T[]> {
  const rows: T[] = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await readPage(from, from + PAGE_SIZE - 1);
    if (error) throw new Error(`${what} could not be loaded: ${error.message}`);
    const page = (data ?? []) as T[];
    rows.push(...page);
    if (page.length < PAGE_SIZE) return rows;
  }
}
