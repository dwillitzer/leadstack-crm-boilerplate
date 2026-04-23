import type { Timestamp, FieldValue } from "firebase/firestore";

export interface Task {
  id: string;
  title: string;
  notes: string;
  dueAt: Timestamp | FieldValue | null;
  completed: boolean;
  completedAt: Timestamp | FieldValue | null;
  contactId: string | null;
  dealId: string | null;
  eventId: string | null;
  ownerId: string;
  createdAt: Timestamp | FieldValue | null;
  updatedAt: Timestamp | FieldValue | null;
}

export type TaskFormData = {
  title: string;
  notes: string;
  dueAt: Date | null;
  contactId: string | null;
  dealId: string | null;
  eventId: string | null;
};

export type TaskFilter = "today" | "overdue" | "upcoming" | "done" | "all";
