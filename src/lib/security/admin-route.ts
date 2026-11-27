import "server-only";

import type { NextResponse } from "next/server";
import { z } from "zod";
import { jsonError, readJsonBody } from "@/lib/security/request";
import { getAdminSession } from "@/lib/supabase/admin-auth";

/** Checks the admin session and reads the JSON body of an admin mutation. */
export async function readAdminRequest(
  request: Request,
  maxBytes = 2_000,
): Promise<{ ok: true; data: unknown } | { ok: false; response: NextResponse }> {
  if (!(await getAdminSession())) return { ok: false, response: jsonError("Forbidden", 403) };
  return readJsonBody(request, maxBytes);
}

export const orderIdSchema = z.uuid();
