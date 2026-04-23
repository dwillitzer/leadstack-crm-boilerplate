import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
  type Unsubscribe,
} from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase/client";
import { addActivity } from "@/lib/firestore/activities";
import type { CalendarEvent, EventFormData } from "@/types/events";

const EVENTS = "events";

export function subscribeToEvents(
  ownerId: string,
  callback: (events: CalendarEvent[]) => void,
  onError?: (err: Error) => void,
): Unsubscribe {
  const q = query(
    collection(getFirebaseDb(), EVENTS),
    where("ownerId", "==", ownerId),
  );
  return onSnapshot(
    q,
    (snap) => {
      const events = snap.docs.map(
        (d) => ({ id: d.id, ...(d.data() as Omit<CalendarEvent, "id">) }),
      );
      events.sort((a, b) => toMillis(a.startAt) - toMillis(b.startAt));
      callback(events);
    },
    (err) => onError?.(err),
  );
}

export async function createEvent(
  ownerId: string,
  data: EventFormData,
): Promise<string> {
  const ref = await addDoc(collection(getFirebaseDb(), EVENTS), {
    title: data.title,
    startAt: Timestamp.fromDate(data.startAt),
    endAt: Timestamp.fromDate(data.endAt),
    contactId: data.contactId,
    location: data.location,
    notes: data.notes,
    ownerId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  if (data.contactId) {
    await addActivity(data.contactId, {
      type: "booking_created",
      createdBy: ownerId,
      content: `Event "${data.title}" scheduled for ${formatShort(data.startAt)}`,
      meta: { bookingId: ref.id },
    });
  }
  return ref.id;
}

export async function updateEvent(
  id: string,
  data: Partial<EventFormData>,
): Promise<void> {
  const patch: Record<string, unknown> = { updatedAt: serverTimestamp() };
  if (data.title !== undefined) patch.title = data.title;
  if (data.startAt !== undefined)
    patch.startAt = Timestamp.fromDate(data.startAt);
  if (data.endAt !== undefined) patch.endAt = Timestamp.fromDate(data.endAt);
  if (data.contactId !== undefined) patch.contactId = data.contactId;
  if (data.location !== undefined) patch.location = data.location;
  if (data.notes !== undefined) patch.notes = data.notes;
  await updateDoc(doc(getFirebaseDb(), EVENTS, id), patch);
}

export async function deleteEvent(id: string): Promise<void> {
  await deleteDoc(doc(getFirebaseDb(), EVENTS, id));
}

function toMillis(v: unknown): number {
  if (!v) return 0;
  if (v instanceof Date) return v.getTime();
  const maybe = v as { toDate?: () => Date; seconds?: number };
  if (typeof maybe.toDate === "function") return maybe.toDate().getTime();
  if (typeof maybe.seconds === "number") return maybe.seconds * 1000;
  return 0;
}

function formatShort(d: Date): string {
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
