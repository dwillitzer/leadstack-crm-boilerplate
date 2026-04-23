import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase/admin";
import { emailIsConfigured, sendEmail } from "@/lib/comms/resend";
import { requireContactOwner, requireUid } from "@/lib/comms/route-auth";
import { recordSend } from "@/lib/comms/usage";

type Body = { contactId?: string; subject?: string; body?: string };

export async function POST(request: Request) {
  if (!emailIsConfigured()) {
    return NextResponse.json(
      { error: "Email is not configured on this deployment." },
      { status: 503 },
    );
  }

  const auth = requireUid(request);
  if (auth instanceof NextResponse) return auth;

  let payload: Body;
  try {
    payload = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const contactId = payload.contactId?.trim();
  const subject = payload.subject?.trim();
  const body = payload.body?.trim();

  if (!contactId || !subject || !body) {
    return NextResponse.json(
      { error: "contactId, subject, and body are required" },
      { status: 400 },
    );
  }

  const contact = await requireContactOwner(auth.uid, contactId);
  if (contact instanceof NextResponse) return contact;

  if (!contact.email) {
    return NextResponse.json(
      { error: "This contact has no email address." },
      { status: 400 },
    );
  }

  let messageId: string;
  try {
    const result = await sendEmail({
      to: contact.email,
      subject,
      text: body,
      replyTo: auth.email || undefined,
    });
    messageId = result.id;
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to send email";
    return NextResponse.json({ error: message }, { status: 502 });
  }

  try {
    await getAdminDb()
      .collection("contacts")
      .doc(contactId)
      .collection("activities")
      .add({
        type: "email_sent",
        content: `Email: ${subject}`,
        createdBy: auth.uid,
        meta: { messageId, subject },
        createdAt: FieldValue.serverTimestamp(),
      });
  } catch (err) {
    console.warn("[email/send] activity write failed", err);
  }

  await recordSend(auth.uid, "email");

  return NextResponse.json({ ok: true, id: messageId });
}
