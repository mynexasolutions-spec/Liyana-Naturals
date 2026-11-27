// Browser side of the Subscribe forms.

import { subscribeSchema, type SubscribeSource } from "@/lib/newsletter/schema";

/** Returns an error message, or an empty string once the address is saved. */
export async function subscribeToNewsletter(email: string, source: SubscribeSource): Promise<string> {
  const parsed = subscribeSchema.safeParse({ email, source });
  if (!parsed.success) return "Please enter a valid email address.";
  try {
    const response = await fetch("/api/newsletter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
    });
    if (response.ok) return "";
    const result = (await response.json().catch(() => ({}))) as { error?: string };
    return result.error ?? "Could not subscribe right now. Please try again.";
  } catch {
    return "Network error. Please try again.";
  }
}
