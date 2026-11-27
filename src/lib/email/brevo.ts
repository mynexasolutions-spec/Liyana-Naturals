import "server-only";

export function isEmailConfigured(): boolean {
  return Boolean(process.env.BREVO_API_KEY && process.env.BREVO_SENDER_EMAIL);
}

/** Returns true only when Brevo accepted the message. Never throws. */
export async function sendEmail(input: {
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<boolean> {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  if (!apiKey || !senderEmail) {
    console.error("[email] BREVO_API_KEY or BREVO_SENDER_EMAIL is not set.");
    return false;
  }

  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        accept: "application/json",
        "api-key": apiKey,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        sender: { name: process.env.BREVO_SENDER_NAME || "Liyana Naturals", email: senderEmail },
        to: [{ email: input.to }],
        subject: input.subject,
        htmlContent: input.html,
        textContent: input.text,
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.error(`[email] Brevo rejected the message (${response.status}): ${detail.slice(0, 300)}`);
      return false;
    }
    return true;
  } catch (error) {
    console.error("[email] Brevo request failed:", error instanceof Error ? error.message : error);
    return false;
  }
}
