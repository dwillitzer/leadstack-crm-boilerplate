import type { Timestamp, FieldValue } from "firebase/firestore";

export type ContactSource = "website" | "referral" | "ads" | "other" | "";

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  source: ContactSource;
  tags: string[];
  pipelineStage: string | null;
  ownerId: string;
  createdAt: Timestamp | FieldValue | null;
  updatedAt: Timestamp | FieldValue | null;
}

export type ContactFormData = Pick<
  Contact,
  "name" | "email" | "phone" | "company" | "source" | "tags"
>;

export type ActivityType =
  | "note_added"
  | "booking_created"
  | "pipeline_moved"
  | "task_completed"
  | "form_submitted"
  | "email_sent"
  | "sms_sent";

export interface Note {
  id: string;
  content: string;
  createdBy: string;
  createdAt: Timestamp | FieldValue | null;
}

export interface ActivityItem {
  id: string;
  type: ActivityType;
  content: string;
  createdAt: Timestamp | FieldValue | null;
  createdBy: string;
}
