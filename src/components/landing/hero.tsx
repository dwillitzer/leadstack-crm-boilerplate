import Link from "next/link";
import {
  ArrowRight,
  Mail,
  Phone,
  Building2,
  Users,
  Sparkles,
  Star,
  TrendingUp,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative overflow-hidden py-20 md:py-28">
      {/* Gradient background effects */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,oklch(0.62_0.25_290)_/_16%,transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_bottom_left,oklch(0.65_0.2_220)_/_12%,transparent_55%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[1px] bg-gradient-to-r from-transparent via-foreground/10 to-transparent" />

      {/* Subtle grid overlay */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mx-auto mb-8 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium">
            <Sparkles className="h-3.5 w-3.5 text-violet-500" />
            <span className="bg-gradient-to-r from-indigo-500 via-violet-500 to-pink-500 bg-clip-text text-transparent">
              New: AI follow-ups, pipeline & booking rolling out now
            </span>
          </div>

          <h1 className="text-balance text-4xl font-semibold tracking-tighter sm:text-5xl md:text-6xl lg:text-[5.5rem] lg:leading-[1.02]">
            The CRM that{" "}
            <span className="bg-gradient-to-r from-indigo-500 via-violet-500 to-pink-500 bg-clip-text font-serif font-normal italic text-transparent">
              closes deals
            </span>
            , not tabs.
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg text-muted-foreground md:text-xl">
            Capture leads, run pipelines, and book meetings from one clean
            workspace. Built for small teams who&apos;d rather close than
            configure — and ready to replace five tools with one!
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              render={<Link href="/signup" />}
              size="lg"
              className="px-6 text-base"
            >
              Start free for 14 days
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
            <Button
              render={<a href="#how-it-works" />}
              variant="outline"
              size="lg"
              className="px-6 text-base"
            >
              See it in action
            </Button>
          </div>

          <p className="mt-4 text-sm text-muted-foreground">
            No credit card · 2-minute setup · Import your contacts in one click
          </p>

          {/* Inline trust strip */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-3.5 w-3.5 fill-amber-400 text-amber-400"
                  />
                ))}
              </div>
              <span className="font-medium text-foreground">4.8</span>
              <span>on G2 & Capterra</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-primary" />
              <span className="font-medium text-foreground">12,400+</span>
              <span>teams closing with LeadStack</span>
            </div>
            <div className="flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
              <span className="font-medium text-foreground">22% avg lift</span>
              <span>in close rate</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5 text-indigo-500" />
              <span>SOC 2 · GDPR · owner-scoped data</span>
            </div>
          </div>
        </div>

        {/* Product preview card */}
        <div className="mx-auto mt-16 max-w-5xl">
          <div className="relative rounded-2xl border bg-card/80 p-1 shadow-2xl shadow-indigo-500/10 backdrop-blur">
            {/* Floating AI tag */}
            <div className="absolute -top-3 right-6 z-10 hidden items-center gap-1.5 rounded-full border border-primary/20 bg-background px-2.5 py-1 text-[10px] font-semibold shadow-md sm:inline-flex">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
              </span>
              LIVE · 3 deals moved today
            </div>

            <div className="rounded-[14px] border bg-background">
              <div className="flex items-center gap-2 border-b px-4 py-3">
                <div className="flex gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-red-400/60" />
                  <div className="h-2.5 w-2.5 rounded-full bg-amber-400/60" />
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-400/60" />
                </div>
                <span className="ml-4 text-xs text-muted-foreground">
                  app.leadstack.io / contacts
                </span>
              </div>
              <div className="grid gap-4 p-4 sm:grid-cols-[200px_1fr]">
                <div className="hidden space-y-1 rounded-lg bg-muted/40 p-2 text-sm sm:block">
                  {[
                    ["Dashboard", false],
                    ["Contacts", true],
                    ["Pipeline", false],
                    ["Calendar", false],
                    ["Automations", false],
                  ].map(([label, active]) => (
                    <div
                      key={label as string}
                      className={
                        active
                          ? "rounded-md bg-primary/10 px-2 py-1.5 text-xs font-medium text-primary"
                          : "rounded-md px-2 py-1.5 text-xs text-muted-foreground"
                      }
                    >
                      {label}
                    </div>
                  ))}
                  <div className="mt-4 rounded-md border border-dashed border-primary/30 bg-primary/5 p-2">
                    <div className="flex items-center gap-1.5 text-[10px] font-semibold text-primary">
                      <Sparkles className="h-3 w-3" />
                      AI Suggestion
                    </div>
                    <p className="mt-1 text-[10px] text-muted-foreground">
                      3 leads look hot — draft follow-ups?
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold">Contacts</h3>
                    <span className="rounded-md bg-primary px-2 py-1 text-[10px] font-medium text-primary-foreground">
                      + Add contact
                    </span>
                  </div>
                  {[
                    {
                      name: "Sarah Chen",
                      email: "sarah@acme.io",
                      company: "Acme Studios",
                      icon: Users,
                      source: "Website",
                      color: "bg-blue-500/10 text-blue-700",
                    },
                    {
                      name: "Marcus Patel",
                      email: "mp@northwind.co",
                      company: "Northwind Co",
                      icon: Mail,
                      source: "Referral",
                      color: "bg-emerald-500/10 text-emerald-700",
                    },
                    {
                      name: "Elena Rossi",
                      email: "elena@brightlab.com",
                      company: "BrightLab",
                      icon: Phone,
                      source: "Ads",
                      color: "bg-amber-500/10 text-amber-700",
                    },
                    {
                      name: "Jordan Reyes",
                      email: "jordan@fieldworks.io",
                      company: "Fieldworks",
                      icon: Building2,
                      source: "Website",
                      color: "bg-blue-500/10 text-blue-700",
                    },
                  ].map((row) => (
                    <div
                      key={row.email}
                      className="flex items-center justify-between gap-3 rounded-md border px-3 py-2 text-xs"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted">
                          <row.icon className="h-3.5 w-3.5 text-muted-foreground" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-medium">{row.name}</p>
                          <p className="truncate text-muted-foreground">
                            {row.email} · {row.company}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${row.color} dark:opacity-80`}
                      >
                        {row.source}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
