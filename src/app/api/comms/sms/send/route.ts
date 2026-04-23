import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase/admin";
import { sendSms, smsIsConfigured } from "@/lib/comms/twilio";
import { requireContactOwner, requireUid } from "@/lib/comms/route-auth";
import { recordSend } from "@/lib/comms/usage";

type Body = { contactId?: string; body?: string };

export async function POST(request: Request) {
  if (!smsIsConfigured()) {
    return NextResponse.json(
      { error: "SMS is not configured on this deployment." },
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
  const body = payload.body?.trim();

  if (!contactId || !body) {
    return NextResponse.json(
      { error: "contactId and body are required" },
      { status: 400 },
    );
  }

  const contact = await requireContactOwner(auth.uid, contactId);
  if (contact instanceof NextResponse) return contact;

  if (!contact.phone) {
    return NextResponse.json(
      { error: "This contact has no phone number." },
      { status: 400 },
    );
  }

  let sid: string;
  try {
    const result = await sendSms({ to: contact.phone, body });
    sid = result.sid;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to send SMS";
    return NextResponse.json({ error: message }, { status: 502 });
  }

  const preview = body.length > 80 ? `${body.slice(0, 80)}…` : body;

  try {
    await getAdminDb()
      .collection("contacts")
      .doc(contactId)
      .collection("activities")
      .add({
        type: "sms_sent",
        content: `SMS: ${preview}`,
        createdBy: auth.uid,
        meta: { sid },
        createdAt: FieldValue.serverTimestamp(),
      });
  } catch (err) {
    console.warn("[sms/send] activity write failed", err);
  }

  await recordSend(auth.uid, "sms");

  return NextResponse.json({ ok: true, sid });
}
