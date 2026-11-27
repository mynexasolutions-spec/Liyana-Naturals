export async function sendAdminRequest<T = unknown>(
  url: string,
  body: unknown = {},
  method: "POST" | "PATCH" = "POST",
): Promise<{ ok: true; data: T } | { ok: false; error: string }> {
  try {
    const response = await fetch(url, {
      method,
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = (await response.json().catch(() => ({}))) as T & { error?: string };
    return response.ok
      ? { ok: true, data }
      : { ok: false, error: data.error ?? `Request failed (${response.status}).` };
  } catch {
    return { ok: false, error: "Network error. Please try again." };
  }
}
