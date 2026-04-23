import type { Timestamp, FieldValue } from "firebase/firestore";

export interface CalendarEvent {
  id: string;
  title: string;
  startAt: Timestamp | FieldValue | null;
  endAt: Timestamp | FieldValue | null;
  contactId: string | null;
  location: string;
  notes: string;
  ownerId: string;
  createdAt: Timestamp | FieldValue | null;
  updatedAt: Timestamp | FieldValue | null;
}

export type EventFormData = {
  title: string;
  startAt: Date;
  endAt: Date;
  contactId: string | null;
  location: string;
  notes: string;
};
