import {
  Users,
  GitBranch,
  CalendarClock,
  Sparkles,
  Workflow,
  Shield,
  Zap,
  Tag,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function Features() {
  return (
    <section id="features" className="bg-muted/30 py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">
            Everything in one workspace
          </p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tighter sm:text-5xl">
            Replace five tools with one you&apos;ll{" "}
            <span className="font-serif font-normal italic">actually</span>{" "}
            use.
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            A CRM, pipeline, booking tool, and AI assistant that work together
            — built for teams that want to stop juggling tabs and start closing.
          </p>
        </div>

        <div className="mx-auto mt-14 grid max-w-6xl grid-cols-1 gap-4 md:grid-cols-6 md:grid-rows-[auto_auto_auto]">
          {/* Contact hub — large */}
          <BentoCard className="md:col-span-4 md:row-span-1">
            <div className="flex h-full flex-col justify-between gap-6 p-6 sm:p-8">
              <div>
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-lg shadow-indigo-500/20">
                  <Users className="h-5 w-5" />
                </div>
                <h3 className="text-xl font-semibold tracking-tight">
                  Contact hub, not a spreadsheet
                </h3>
                <p className="mt-2 max-w-md text-sm text-muted-foreground">
                  Every lead and customer in one searchable place. Tags,
                  sources, notes, and a full activity timeline attached to every
                  record.
                </p>
              </div>
              <div className="space-y-2">
                {[
                  { name: "Sarah Chen", tag: "Hot lead", tone: "bg-emerald-500/10 text-emerald-700" },
                  { name: "Marcus Patel", tag: "Demo booked", tone: "bg-blue-500/10 text-blue-700" },
                  { name: "Elena Rossi", tag: "Needs follow-up", tone: "bg-amber-500/10 text-amber-700" },
                ].map((r) => (
                  <div
                    key={r.name}
                    className="flex items-center justify-between rounded-lg border bg-background/80 px-3 py-2 text-xs shadow-sm backdrop-blur"
                  >
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-gradient-to-br from-indigo-400 to-pink-400" />
                      <span className="font-medium">{r.name}</span>
                    </div>
                    <span className={cn("rounded-full px-2 py-0.5", r.tone)}>
                      {r.tag}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </BentoCard>

          {/* AI assistant — small */}
          <BentoCard className="md:col-span-2 md:row-span-1">
            <div className="relative flex h-full flex-col justify-between gap-6 p-6">
              <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gradient-to-br from-violet-500/30 to-pink-500/30 blur-3xl" />
              <div>
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-pink-500 text-white shadow-lg shadow-violet-500/20">
                  <Sparkles className="h-5 w-5" />
                </div>
                <h3 className="text-xl font-semibold tracking-tight">
                  AI that drafts the next touch
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Personalized follow-ups, summaries, and next-best-actions
                  from your timeline context.
                </p>
              </div>
              <div className="rounded-lg border bg-background/80 p-3 text-[11px] shadow-sm backdrop-blur">
                <div className="mb-1 flex items-center gap-1 font-semibold text-violet-600">
                  <Sparkles className="h-3 w-3" />
                  Suggested reply
                </div>
                <p className="leading-relaxed text-muted-foreground">
                  &ldquo;Following up on our call — want me to send over a
                  quick onboarding plan?&rdquo;
                </p>
              </div>
            </div>
          </BentoCard>

          {/* Pipeline */}
          <BentoCard className="md:col-span-2 md:row-span-1">
            <div className="flex h-full flex-col gap-4 p-6">
              <div>
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/20">
                  <GitBranch className="h-5 w-5" />
                </div>
                <h3 className="text-xl font-semibold tracking-tight">
                  Pipelines that stay in sync
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Drag deals across stages. Your team sees every move in real
                  time.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {["New", "Qualified", "Won"].map((s, i) => (
                  <div key={s} className="space-y-1">
                    <div className="rounded-sm bg-muted px-1.5 py-0.5 text-center text-[9px] font-medium">
                      {s}
                    </div>
                    <div className="h-6 rounded-sm border bg-background" />
                    {i !== 2 && <div className="h-6 rounded-sm border bg-background" />}
                  </div>
                ))}
              </div>
            </div>
          </BentoCard>

          {/* Booking */}
          <BentoCard className="md:col-span-2 md:row-span-1">
            <div className="flex h-full flex-col gap-4 p-6">
              <div>
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/20">
                  <CalendarClock className="h-5 w-5" />
                </div>
                <h3 className="text-xl font-semibold tracking-tight">
                  Booking in two clicks
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Share a link, meetings land on the right contact with notes
                  and reminders.
                </p>
              </div>
              <div className="rounded-lg border bg-background p-2 text-[10px]">
                <div className="mb-1 flex items-center justify-between font-medium">
                  <span>Tue, Apr 21</span>
                  <span className="text-muted-foreground">GMT+10</span>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  {["9:00", "10:00", "2:00"].map((t, i) => (
                    <div
                      key={t}
                      className={cn(
                        "rounded-sm border px-1 py-0.5 text-center",
                        i === 1 && "border-primary bg-primary/10 font-medium text-primary",
                      )}
                    >
                      {t}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </BentoCard>

          {/* Automations */}
          <BentoCard className="md:col-span-2 md:row-span-1">
            <div className="flex h-full flex-col gap-4 p-6">
              <div>
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/20">
                  <Workflow className="h-5 w-5" />
                </div>
                <h3 className="text-xl font-semibold tracking-tight">
                  Automations, not Zapier
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Move stages, send welcome emails, tag by source — all
                  built-in.
                </p>
              </div>
              <div className="flex items-center gap-1.5 rounded-lg border bg-background p-2 text-[10px]">
                <span className="rounded-sm bg-indigo-500/10 px-1.5 py-0.5 font-medium text-indigo-700">
                  On booking
                </span>
                <span className="text-muted-foreground">→</span>
                <span className="rounded-sm bg-emerald-500/10 px-1.5 py-0.5 font-medium text-emerald-700">
                  Send welcome
                </span>
              </div>
            </div>
          </BentoCard>

          {/* Row 3: three smaller */}
          <BentoCard className="md:col-span-2 md:row-span-1">
            <div className="p-6">
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-pink-500/10 text-pink-600">
                <Tag className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold">Smart segments</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Build lists on the fly by tag, stage, source, or activity — and
                act on them in one click.
              </p>
            </div>
          </BentoCard>

          <BentoCard className="md:col-span-2 md:row-span-1">
            <div className="p-6">
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
                <Zap className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold">Real-time sync</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Every seat sees changes live. No refreshes, no merge conflicts,
                no stepping on teammates&apos; toes.
              </p>
            </div>
          </BentoCard>

          <BentoCard className="md:col-span-2 md:row-span-1">
            <div className="p-6">
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600">
                <Shield className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold">Secure by default</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Owner-scoped data, SOC 2-ready infrastructure, and one-click
                export anytime you want it.
              </p>
            </div>
          </BentoCard>
        </div>
      </div>
    </section>
  );
}

function BentoCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border bg-background/60 backdrop-blur-sm transition-all hover:border-primary/30 hover:shadow-md",
        className,
      )}
    >
      {children}
    </div>
  );
}
