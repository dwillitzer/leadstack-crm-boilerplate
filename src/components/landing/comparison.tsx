import { Check, Minus, X } from "lucide-react";
import { cn } from "@/lib/utils";

type Cell = "yes" | "partial" | "no" | string;

const rows: { label: string; leadstack: Cell; hubspot: Cell; ghl: Cell }[] = [
  {
    label: "Price for a 5-person team",
    leadstack: "$29/mo flat",
    hubspot: "$250+/mo",
    ghl: "$297/mo",
  },
  { label: "Setup in under 10 minutes", leadstack: "yes", hubspot: "no", ghl: "partial" },
  { label: "Built for small teams (not agencies)", leadstack: "yes", hubspot: "partial", ghl: "no" },
  { label: "Real-time multi-seat updates", leadstack: "yes", hubspot: "yes", ghl: "yes" },
  { label: "Contacts, pipeline & booking included", leadstack: "yes", hubspot: "partial", ghl: "yes" },
  { label: "AI follow-up drafting", leadstack: "yes", hubspot: "partial", ghl: "yes" },
  { label: "No per-feature upsells", leadstack: "yes", hubspot: "no", ghl: "partial" },
  { label: "Export all data, anytime", leadstack: "yes", hubspot: "partial", ghl: "partial" },
  { label: "Owner-scoped Firestore rules", leadstack: "yes", hubspot: "no", ghl: "no" },
];

function Indicator({ value, emphasize }: { value: Cell; emphasize?: boolean }) {
  if (value === "yes") {
    return (
      <span
        className={cn(
          "inline-flex h-6 w-6 items-center justify-center rounded-full",
          emphasize
            ? "bg-emerald-500 text-white"
            : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
        )}
      >
        <Check className="h-3.5 w-3.5" />
      </span>
    );
  }
  if (value === "no") {
    return (
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-muted text-muted-foreground/60">
        <X className="h-3.5 w-3.5" />
      </span>
    );
  }
  if (value === "partial") {
    return (
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400">
        <Minus className="h-3.5 w-3.5" />
      </span>
    );
  }
  return (
    <span
      className={cn(
        "inline-block text-sm font-medium",
        emphasize ? "text-primary" : "text-foreground",
      )}
    >
      {value}
    </span>
  );
}

export function Comparison() {
  return (
    <section id="comparison" className="bg-muted/30 py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">
            How we stack up
          </p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tighter sm:text-5xl">
            Enterprise CRMs are overkill.
            <br className="hidden sm:inline" />{" "}
            <span className="font-serif font-normal italic">
              We&apos;re the right-sized alternative.
            </span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            We built LeadStack because GoHighLevel is agency-heavy and HubSpot
            bills like enterprise software. Small teams deserve better.
          </p>
        </div>

        <div className="mx-auto mt-12 max-w-4xl overflow-hidden rounded-2xl border bg-background shadow-sm">
          {/* Header */}
          <div className="grid grid-cols-[1.6fr_1fr_1fr_1fr] border-b bg-muted/40 px-4 py-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground sm:px-6">
            <div>Feature</div>
            <div className="text-center">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-pink-500 bg-clip-text text-sm font-bold text-transparent">
                <span className="inline-block h-2 w-2 rounded-sm bg-gradient-to-br from-indigo-500 via-violet-500 to-pink-500" />
                LeadStack
              </span>
            </div>
            <div className="text-center text-sm text-muted-foreground">
              HubSpot
            </div>
            <div className="text-center text-sm text-muted-foreground">
              GoHighLevel
            </div>
          </div>

          {/* Rows */}
          {rows.map((row, i) => (
            <div
              key={row.label}
              className={cn(
                "grid grid-cols-[1.6fr_1fr_1fr_1fr] items-center gap-2 px-4 py-3 text-sm sm:px-6",
                i !== rows.length - 1 && "border-b",
              )}
            >
              <div className="pr-2 text-foreground">{row.label}</div>
              <div className="flex justify-center">
                <Indicator value={row.leadstack} emphasize />
              </div>
              <div className="flex justify-center">
                <Indicator value={row.hubspot} />
              </div>
              <div className="flex justify-center">
                <Indicator value={row.ghl} />
              </div>
            </div>
          ))}
        </div>

        <p className="mx-auto mt-6 max-w-2xl text-center text-xs text-muted-foreground">
          Compared against HubSpot Sales Starter and GoHighLevel Unlimited,
          public pricing as of April 2026. Not affiliated with either.
        </p>
      </div>
    </section>
  );
}
