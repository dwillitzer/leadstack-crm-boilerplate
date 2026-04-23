import "server-only";

import { Resend } from "resend";

let _client: Resend | null = null;

export function getResend(): Resend {
  if (!_client) {
    const key = process.env.RESEND_API_KEY;
    if (!key) {
      throw new Error(
        "RESEND_API_KEY is not set. Add it to .env.local to enable email.",
      );
    }
    _client = new Resend(key);
  }
  return _client;
}

export function emailIsConfigured(): boolean {
  return !!process.env.RESEND_API_KEY && !!process.env.EMAIL_FROM;
}

export async function sendEmail({
  to,
  subject,
  text,
  replyTo,
}: {
  to: string;
  subject: string;
  text: string;
  replyTo?: string;
}): Promise<{ id: string }> {
  const from = process.env.EMAIL_FROM;
  if (!from) {
    throw new Error(
      "EMAIL_FROM is not set. It must be a sender on a Resend-verified domain.",
    );
  }
  const client = getResend();
  const result = await client.emails.send({
    from,
    to,
    subject,
    text,
    replyTo,
  });
  if (result.error) {
    throw new Error(result.error.message || "Resend send failed");
  }
  if (!result.data?.id) {
    throw new Error("Resend send failed: no message id returned");
  }
  return { id: result.data.id };
}
