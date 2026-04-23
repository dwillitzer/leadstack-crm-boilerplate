import "server-only";

import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import type { Contact } from "@/types/contacts";

export function requireUid(request: Request):
  | { uid: string; email: string }
  | NextResponse {
  const uid = request.headers.get("x-user-uid");
  if (!uid) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  const email = request.headers.get("x-user-email") ?? "";
  return { uid, email };
}

export async function requireContactOwner(
  uid: string,
  contactId: string,
): Promise<Contact | NextResponse> {
  if (!contactId) {
    return NextResponse.json(
      { error: "Missing contactId" },
      { status: 400 },
    );
  }
  const db = getAdminDb();
  const snap = await db.collection("contacts").doc(contactId).get();
  if (!snap.exists) {
    return NextResponse.json({ error: "Contact not found" }, { status: 404 });
  }
  const data = snap.data() as Omit<Contact, "id">;
  if (data.ownerId !== uid) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return { id: snap.id, ...data };
}
