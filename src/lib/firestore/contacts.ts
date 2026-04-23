import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  query,
  orderBy,
  where,
  type Unsubscribe,
} from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase/client";
import type { Contact, ContactFormData, Note } from "@/types/contacts";

const CONTACTS = "contacts";

export function subscribeToContacts(
  ownerId: string,
  callback: (contacts: Contact[]) => void,
  onError?: (err: Error) => void,
): Unsubscribe {
  // Filter by ownerId in the query so Firestore security rules (which scope
  // reads to docs where ownerId == uid) accept the listener. Sort client-side
  // to avoid the ownerId+createdAt composite index.
  const q = query(
    collection(getFirebaseDb(), CONTACTS),
    where("ownerId", "==", ownerId),
  );
  return onSnapshot(
    q,
    (snap) => {
      const contacts = snap.docs.map(
        (d) => ({ id: d.id, ...(d.data() as Omit<Contact, "id">) }),
      );
      contacts.sort((a, b) => toMillis(b.createdAt) - toMillis(a.createdAt));
      callback(contacts);
    },
    (err) => onError?.(err),
  );
}

function toMillis(v: unknown): number {
  if (!v) return 0;
  if (v instanceof Date) return v.getTime();
  const maybe = v as { toDate?: () => Date; seconds?: number };
  if (typeof maybe.toDate === "function") return maybe.toDate().getTime();
  if (typeof maybe.seconds === "number") return maybe.seconds * 1000;
  return 0;
}

export async function getContact(id: string): Promise<Contact | null> {
  const snap = await getDoc(doc(getFirebaseDb(), CONTACTS, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...(snap.data() as Omit<Contact, "id">) };
}

export function subscribeToContact(
  id: string,
  callback: (contact: Contact | null) => void,
  onError?: (err: Error) => void,
): Unsubscribe {
  return onSnapshot(
    doc(getFirebaseDb(), CONTACTS, id),
    (snap) => {
      if (!snap.exists()) {
        callback(null);
        return;
      }
      callback({ id: snap.id, ...(snap.data() as Omit<Contact, "id">) });
    },
    (err) => onError?.(err),
  );
}

export async function createContact(
  ownerId: string,
  data: ContactFormData,
): Promise<string> {
  const ref = await addDoc(collection(getFirebaseDb(), CONTACTS), {
    ...data,
    ownerId,
    pipelineStage: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateContact(
  id: string,
  data: Partial<ContactFormData>,
): Promise<void> {
  await updateDoc(doc(getFirebaseDb(), CONTACTS, id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function addNote(
  contactId: string,
  content: string,
  userId: string,
): Promise<string> {
  const ref = await addDoc(
    collection(getFirebaseDb(), CONTACTS, contactId, "notes"),
    {
      content,
      createdBy: userId,
      createdAt: serverTimestamp(),
    },
  );
  return ref.id;
}

export function subscribeToNotes(
  contactId: string,
  callback: (notes: Note[]) => void,
  onError?: (err: Error) => void,
): Unsubscribe {
  const q = query(
    collection(getFirebaseDb(), CONTACTS, contactId, "notes"),
    orderBy("createdAt", "desc"),
  );
  return onSnapshot(
    q,
    (snap) => {
      callback(
        snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Note, "id">) })),
      );
    },
    (err) => onError?.(err),
  );
}
