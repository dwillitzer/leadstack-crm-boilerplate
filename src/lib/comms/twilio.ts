import "server-only";

import twilio, { type Twilio } from "twilio";

let _client: Twilio | null = null;

export function getTwilio(): Twilio {
  if (!_client) {
    const sid = process.env.TWILIO_ACCOUNT_SID;
    const token = process.env.TWILIO_AUTH_TOKEN;
    if (!sid || !token) {
      throw new Error(
        "TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN are not set. Add them to .env.local to enable SMS.",
      );
    }
    _client = twilio(sid, token);
  }
  return _client;
}

export function smsIsConfigured(): boolean {
  return (
    !!process.env.TWILIO_ACCOUNT_SID &&
    !!process.env.TWILIO_AUTH_TOKEN &&
    !!process.env.TWILIO_FROM_NUMBER
  );
}

export async function sendSms({
  to,
  body,
}: {
  to: string;
  body: string;
}): Promise<{ sid: string }> {
  const from = process.env.TWILIO_FROM_NUMBER;
  if (!from) {
    throw new Error("TWILIO_FROM_NUMBER is not set.");
  }
  const client = getTwilio();
  const msg = await client.messages.create({ from, to, body });
  return { sid: msg.sid };
}
