import "server-only";

import { NextResponse } from "next/server";

export function jsonError(error: string, status: number) {
  return NextResponse.json({ error }, { status });
}

/**
 * Reads a size-limited JSON body. Requiring the JSON content type also stops
 * other websites from posting here with a plain HTML form.
 */
export async function readJsonBody(
  request: Request,
  maxBytes = 20_000,
): Promise<{ ok: true; data: unknown } | { ok: false; response: NextResponse }> {
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
    return { ok: false, response: jsonError("Invalid request.", 415) };
  }
  try {
    const raw = await request.text();
    if (Buffer.byteLength(raw) > maxBytes) {
      return { ok: false, response: jsonError("Request is too large.", 413) };
    }
    return { ok: true, data: JSON.parse(raw) };
  } catch {
    return { ok: false, response: jsonError("Invalid request.", 400) };
  }
}

// These headers are set by the hosting proxy (for example Vercel). If the app is
// ever exposed without such a proxy, clients could spoof them.
export function getClientIp(request: Request): string {
  return (
    request.headers.get("x-real-ip")?.trim() ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown"
  );
}
