import { NextResponse } from "next/server";
import { subscribeSchema } from "@/lib/newsletter/schema";
import { withinRateLimits } from "@/lib/security/rate-limit";
import { getClientIp, jsonError, readJsonBody } from "@/lib/security/request";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const body = await readJsonBody(request, 1_000);
  if (!body.ok) return body.response;
  const parsed = subscribeSchema.safeParse(body.data);
  if (!parsed.success) return jsonError("Please enter a valid email address.", 400);

  try {
    const admin = createSupabaseAdminClient();
    const allowed = await withinRateLimits(admin, [
      { scope: "newsletter-ip", identifier: getClientIp(request), limit: 5, windowSeconds: 3600 },
    ]);
    if (!allowed) return jsonError("Too many attempts. Please try again later.", 429);

    // An address already on the list gets the same answer, so nobody can use
    // this form to find out who has subscribed.
    const { error } = await admin
      .from("newsletter_subscribers")
      .upsert(parsed.data, { onConflict: "email", ignoreDuplicates: true });
    if (error) throw new Error(error.message);
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    console.error("[newsletter] Subscribe failed:", error instanceof Error ? error.message : error);
    return jsonError("Could not subscribe right now. Please try again.", 500);
  }
}
