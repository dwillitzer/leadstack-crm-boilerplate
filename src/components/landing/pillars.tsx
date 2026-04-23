"use client";

import { useState } from "react";
import {
  Sparkles,
  MessageSquare,
  Handshake,
  Repeat,
  Check,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

type PillarKey = "capture" | "nurture" | "close" | "grow";

const pillars: {
  key: PillarKey;
  label: string;
  eyebrow: string;
  title: string;
  description: string;
  features: string[];
  icon: typeof Sparkles;
  accent: string;
  mock: React.ReactNode;
}[] = [
  {
    key: "capture",
    label: "Capture",
    eyebrow: "Stage 1",
    title: "Turn every visit into a lead you can actually work",
    description:
      "Forms, booking links, inbox, and imports — one clean inbox for every new contact. No more copy-pasting leads between tabs.",
    features: [
      "Embeddable forms & booking widgets",
      "One-click CSV import from Sheets, HubSpot, Pipedrive",
      "Auto-tag by source (web, ads, referral, import)",
      "Owner routing so nothing sits unclaimed",
    ],
    icon: Sparkles,
    accent: "from-indigo-500 to-violet-500",
    mock: (
      <div className="space-y-3 rounded-xl border bg-background p-4 text-xs">
        <div className="flex items-center justify-between">
          <p className="font-semibold">New this week</p>
          <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
            +14 leads
          </span>
        </div>
        {[
          { name: "sarah@acme.io", src: "Website form", tone: "bg-blue-500/10 text-blue-700" },
          { name: "mp@northwind.co", src: "Google Ads", tone: "bg-amber-500/10 text-amber-700" },
          { name: "elena@brightlab.com", src: "Referral", tone: "bg-emerald-500/10 text-emerald-700" },
          { name: "jordan@fieldworks.io", src: "Import", tone: "bg-violet-500/10 text-violet-700" },
        ].map((r) => (
          <div
            key={r.name}
            className="flex items-center justify-between rounded-md border px-2.5 py-1.5"
          >
            <span className="truncate">{r.name}</span>
            <span className={`rounded-full px-2 py-0.5 text-[10px] ${r.tone}`}>
              {r.src}
            </span>
          </div>
        ))}
      </div>
    ),
  },
  {
    key: "nurture",
    label: "Nurture",
    eyebrow: "Stage 2",
    title: "Follow up faster than your competitors can",
    description:
      "AI drafts the next touch, the timeline keeps the whole thread in one place, and your team sees activity in real time.",
    features: [
      "AI-drafted follow-up emails (one click to send)",
      "Unified timeline: notes, emails, calls, bookings",
      "Real-time updates across every seat",
      "Tags & smart segments for warm / cold / stuck",
    ],
    icon: MessageSquare,
    accent: "from-violet-500 to-pink-500",
    mock: (
      <div className="space-y-3 rounded-xl border bg-background p-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-pink-500" />
          <div>
            <p className="font-semibold">Sarah Chen · Acme Studios</p>
            <p className="text-muted-foreground">Warm · Last touched 2d ago</p>
          </div>
        </div>
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
          <div className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold text-primary">
            <Sparkles className="h-3 w-3" /> AI draft ready
          </div>
          <p className="leading-relaxed text-muted-foreground">
            &ldquo;Hi Sarah — following up on Tuesday&apos;s call. Want me to send
            over the onboarding timeline we discussed?&rdquo;
          </p>
          <div className="mt-2 flex gap-1.5">
            <span className="rounded-md bg-primary px-2 py-1 text-[10px] text-primary-foreground">
              Send
            </span>
            <span className="rounded-md border px-2 py-1 text-[10px]">
              Edit
            </span>
          </div>
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span>Booked intro call · Tue 2:00pm</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
            <span>Email opened · 4 times</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    key: "close",
    label: "Close",
    eyebrow: "Stage 3",
    title: "Move deals forward, not files around",
    description:
      "A kanban pipeline your whole team can see live. Drag, drop, and close — no refresh, no stale data, no \u201CI thought you had it\u201D.",
    features: [
      "Drag-and-drop pipeline with custom stages",
      "Real-time sync so two seats can't collide",
      "Deal value, owner, and next-step on every card",
      "One-click booking link to close the meeting",
    ],
    icon: Handshake,
    accent: "from-emerald-500 to-teal-500",
    mock: (
      <div className="grid grid-cols-3 gap-2 rounded-xl border bg-background p-3 text-[10px]">
        {[
          {
            stage: "Qualified",
            cards: [
              { name: "Acme Studios", value: "$8.2k" },
              { name: "BrightLab", value: "$3.4k" },
            ],
            tone: "bg-blue-500/10 text-blue-700",
          },
          {
            stage: "Proposal",
            cards: [
              { name: "Northwind Co", value: "$12.9k" },
            ],
            tone: "bg-amber-500/10 text-amber-700",
          },
          {
            stage: "Won",
            cards: [
              { name: "Fieldworks", value: "$6.1k" },
              { name: "Pinecrest", value: "$4.8k" },
            ],
            tone: "bg-emerald-500/10 text-emerald-700",
          },
        ].map((col) => (
          <div key={col.stage} className="space-y-1.5">
            <span
              className={`inline-block rounded-full px-2 py-0.5 font-medium ${col.tone}`}
            >
              {col.stage}
            </span>
            {col.cards.map((c) => (
              <div key={c.name} className="rounded-md border p-2">
                <p className="truncate font-medium">{c.name}</p>
                <p className="text-muted-foreground">{c.value}</p>
              </div>
            ))}
          </div>
        ))}
      </div>
    ),
  },
  {
    key: "grow",
    label: "Grow",
    eyebrow: "Stage 4",
    title: "Turn customers into your next pipeline",
    description:
      "Revisit dormant leads, trigger renewal workflows, and get referral moments into the CRM automatically.",
    features: [
      "Reactivation lists for cold or lost deals",
      "Birthday / renewal workflows out of the box",
      "Referral tracking on every contact record",
      "Export any segment to Sheets or your ad tools",
    ],
    icon: Repeat,
    accent: "from-amber-500 to-orange-500",
    mock: (
      <div className="space-y-3 rounded-xl border bg-background p-4 text-xs">
        <div className="flex items-center justify-between">
          <p className="font-semibold">Winback · 62 contacts</p>
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] text-primary">
            Workflow ready
          </span>
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between rounded-md border p-2">
            <span>Closed-lost · 90d+ ago</span>
            <span className="text-muted-foreground">34</span>
          </div>
          <div className="flex items-center justify-between rounded-md border p-2">
            <span>Never replied</span>
            <span className="text-muted-foreground">18</span>
          </div>
          <div className="flex items-center justify-between rounded-md border p-2">
            <span>Past customer · 1yr+</span>
            <span className="text-muted-foreground">10</span>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-gradient-to-br from-amber-500/10 to-orange-500/10 p-2.5 text-[11px]">
          <Repeat className="h-3.5 w-3.5 text-amber-600" />
          <span>
            Send &ldquo;we&apos;ve missed you&rdquo; email to 62 contacts
          </span>
        </div>
      </div>
    ),
  },
];

export function Pillars() {
  const [active, setActive] = useState<PillarKey>("capture");
  const current = pillars.find((p) => p.key === active)!;

  return (
    <section id="pillars" className="relative py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">
            One platform, four jobs done right
          </p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tighter sm:text-5xl">
            Capture → Nurture → Close →{" "}
            <span className="font-serif font-normal italic">Grow.</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            The full revenue loop in one workspace — no Zapier tape, no
            per-feature upsells.
          </p>
        </div>

        {/* Tab bar */}
        <div className="mx-auto mt-12 flex max-w-3xl flex-wrap items-center justify-center gap-2 rounded-2xl border bg-muted/40 p-1.5">
          {pillars.map((p) => {
            const isActive = active === p.key;
            const Icon = p.icon;
            return (
              <button
                key={p.key}
                onClick={() => setActive(p.key)}
                className={cn(
                  "flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                  isActive
                    ? "bg-background shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <span
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br text-white transition-opacity",
                    p.accent,
                    isActive ? "opacity-100" : "opacity-40",
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                </span>
                {p.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="mx-auto mt-10 grid max-w-5xl gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border bg-muted/50 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
              <span
                className={cn(
                  "h-1.5 w-1.5 rounded-full bg-gradient-to-br",
                  current.accent,
                )}
              />
              {current.eyebrow}
            </div>
            <h3 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {current.title}
            </h3>
            <p className="mt-4 text-muted-foreground">{current.description}</p>
            <ul className="mt-6 space-y-3">
              {current.features.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm">
                  <span
                    className={cn(
                      "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-white",
                      current.accent,
                    )}
                  >
                    <Check className="h-3 w-3" />
                  </span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <a
              href="#features"
              className="mt-8 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
            >
              See every feature <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>

          <div className="relative">
            <div
              className={cn(
                "pointer-events-none absolute -inset-6 -z-10 rounded-3xl bg-gradient-to-br opacity-20 blur-3xl",
                current.accent,
              )}
            />
            <div className="rounded-2xl border bg-card/70 p-2 shadow-xl backdrop-blur">
              {current.mock}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
