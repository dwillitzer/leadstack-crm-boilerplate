import { Badge } from "@/components/ui/badge";
import type { ContactSource } from "@/types/contacts";

const LABELS: Record<Exclude<ContactSource, "">, string> = {
  website: "Website",
  referral: "Referral",
  ads: "Ads",
  other: "Other",
};

const STYLES: Record<Exclude<ContactSource, "">, string> = {
  website:
    "bg-blue-500/10 text-blue-700 dark:bg-blue-400/15 dark:text-blue-300",
  referral:
    "bg-emerald-500/10 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300",
  ads: "bg-amber-500/10 text-amber-700 dark:bg-amber-400/15 dark:text-amber-300",
  other:
    "bg-zinc-500/10 text-zinc-700 dark:bg-zinc-400/15 dark:text-zinc-300",
};

export function SourceBadge({ source }: { source: ContactSource }) {
  if (!source) {
    return (
      <span className="text-xs text-muted-foreground">—</span>
    );
  }
  return (
    <Badge variant="secondary" className={STYLES[source]}>
      {LABELS[source]}
    </Badge>
  );
}
