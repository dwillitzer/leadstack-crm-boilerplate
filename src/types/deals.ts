import type { Timestamp, FieldValue } from "firebase/firestore";

export type PipelineStageId =
  | "new"
  | "contacted"
  | "qualified"
  | "proposal"
  | "won"
  | "lost";

export interface PipelineStage {
  id: PipelineStageId;
  label: string;
  tone: string;
  terminal?: "won" | "lost";
}

export const PIPELINE_STAGES: PipelineStage[] = [
  { id: "new", label: "New", tone: "bg-slate-500/10 text-slate-700 dark:text-slate-300" },
  { id: "contacted", label: "Contacted", tone: "bg-blue-500/10 text-blue-700 dark:text-blue-300" },
  { id: "qualified", label: "Qualified", tone: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300" },
  { id: "proposal", label: "Proposal", tone: "bg-amber-500/10 text-amber-700 dark:text-amber-300" },
  { id: "won", label: "Won", tone: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300", terminal: "won" },
  { id: "lost", label: "Lost", tone: "bg-rose-500/10 text-rose-700 dark:text-rose-300", terminal: "lost" },
];

export function getStage(id: PipelineStageId | string | null | undefined): PipelineStage {
  return (
    PIPELINE_STAGES.find((s) => s.id === id) ?? PIPELINE_STAGES[0]
  );
}

export type DealPriority = "high" | "medium" | "low";

export interface DealPriorityOption {
  id: DealPriority;
  label: string;
  badge: string;
}

export const DEAL_PRIORITIES: DealPriorityOption[] = [
  {
    id: "high",
    label: "High",
    badge: "bg-rose-500/15 text-rose-700 ring-1 ring-rose-500/30 dark:text-rose-300",
  },
  {
    id: "medium",
    label: "Medium",
    badge: "bg-amber-500/15 text-amber-700 ring-1 ring-amber-500/30 dark:text-amber-300",
  },
  {
    id: "low",
    label: "Low",
    badge: "bg-emerald-500/15 text-emerald-700 ring-1 ring-emerald-500/30 dark:text-emerald-300",
  },
];

export function getPriority(
  id: DealPriority | string | null | undefined,
): DealPriorityOption {
  return (
    DEAL_PRIORITIES.find((p) => p.id === id) ??
    DEAL_PRIORITIES[1]
  );
}

export interface Deal {
  id: string;
  title: string;
  value: number;
  currency: string;
  contactId: string;
  stageId: PipelineStageId;
  priority: DealPriority;
  ownerId: string;
  lostReason: string | null;
  createdAt: Timestamp | FieldValue | null;
  updatedAt: Timestamp | FieldValue | null;
  stageChangedAt: Timestamp | FieldValue | null;
}

export type DealFormData = {
  title: string;
  value: number;
  currency: string;
  contactId: string;
  stageId: PipelineStageId;
  priority: DealPriority;
};
