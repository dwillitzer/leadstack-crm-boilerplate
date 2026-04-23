"use client";

import Link from "next/link";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency, daysSince } from "@/lib/format";
import { getPriority, type Deal } from "@/types/deals";
import type { Contact } from "@/types/contacts";

interface DealCardProps {
  deal: Deal;
  contact: Contact | undefined;
  dragging?: boolean;
  overlay?: boolean;
  listeners?: React.HTMLAttributes<HTMLElement>;
  attributes?: React.HTMLAttributes<HTMLElement>;
  setNodeRef?: (node: HTMLElement | null) => void;
  style?: React.CSSProperties;
  onEdit?: () => void;
}

export function DealCard({
  deal,
  contact,
  dragging,
  overlay,
  listeners,
  attributes,
  setNodeRef,
  style,
  onEdit,
}: DealCardProps) {
  const days = daysSince(deal.stageChangedAt);
  const daysLabel =
    days === 0 ? "today" : days === 1 ? "1d in stage" : `${days}d in stage`;
  const priority = getPriority(deal.priority);

  const initials = (contact?.name || contact?.email || "?")
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative rounded-lg border bg-card p-3 text-sm shadow-sm transition-all",
        "before:absolute before:inset-y-2 before:left-0 before:w-0.5 before:rounded-r-full before:bg-gradient-to-b before:from-indigo-500 before:via-violet-500 before:to-pink-500 before:opacity-0 before:transition-opacity",
        !overlay && "cursor-grab hover:border-primary/40 hover:shadow-md hover:before:opacity-100 active:cursor-grabbing",
        dragging && "opacity-40",
        overlay && "rotate-1 scale-[1.02] cursor-grabbing shadow-lg ring-2 ring-primary/40",
      )}
      {...attributes}
      {...listeners}
      onDoubleClick={
        onEdit && !overlay
          ? (e) => {
              e.stopPropagation();
              onEdit();
            }
          : undefined
      }
    >
      <div className="flex items-start justify-between gap-2">
        <p className="pr-1 font-medium leading-snug">{deal.title}</p>
        <span
          className={cn(
            "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
            priority.badge,
          )}
        >
          {priority.label}
        </span>
      </div>

      <div className="mt-2 flex items-center justify-between gap-2">
        <span className="text-sm font-semibold tabular-nums">
          {formatCurrency(deal.value, deal.currency)}
        </span>
        <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
          <Clock className="h-3 w-3" />
          {daysLabel}
        </span>
      </div>

      <div className="mt-3 flex items-center gap-2 border-t pt-2">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400/80 via-violet-400/80 to-pink-400/80 text-[9px] font-semibold text-white">
          {initials}
        </span>
        {contact ? (
          <Link
            href={`/contacts/${contact.id}`}
            className="min-w-0 flex-1 truncate text-xs text-muted-foreground hover:text-primary hover:underline"
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
          >
            {contact.name || contact.email || "Contact"}
          </Link>
        ) : (
          <span className="min-w-0 flex-1 truncate text-xs italic text-muted-foreground/60">
            Unknown contact
          </span>
        )}
      </div>
    </div>
  );
}
