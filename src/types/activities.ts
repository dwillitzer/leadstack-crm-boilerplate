import type { Timestamp, FieldValue } from "firebase/firestore";
import type { ActivityType } from "@/types/contacts";

export type ActivityMeta = {
  dealId?: string;
  fromStageId?: string;
  toStageId?: string;
  bookingId?: string;
} | null;

export interface ActivityDoc {
  id: string;
  type: ActivityType;
  content: string;
  createdBy: string;
  createdAt: Timestamp | FieldValue | null;
  meta: ActivityMeta;
}
