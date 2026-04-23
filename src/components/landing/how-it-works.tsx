import { UserPlus, GitBranch, CalendarClock, TrendingUp } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    step: "1",
    title: "Capture the lead",
    description:
      "Add a contact in ten seconds or import your existing list. Every lead gets a full profile with notes, tags, and timeline.",
  },
  {
    icon: GitBranch,
    step: "2",
    title: "Move them through the pipeline",
    description:
      "Drag contacts through your stages — from new lead, to qualified, to won. The whole team stays in sync in real time.",
  },
  {
    icon: CalendarClock,
    step: "3",
    title: "Book the meeting",
    description:
      "Share a scheduling link. New bookings land on the right contact with a note and activity entry, automatically.",
  },
  {
    icon: TrendingUp,
    step: "4",
    title: "Close and repeat",
    description:
      "See what&apos;s working at a glance. Focus on the deals that matter and keep momentum going across every stage.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">
            How it works
          </p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tighter sm:text-5xl">
            Lead → meeting → customer,{" "}
            <span className="font-serif font-normal italic">
              in one place.
            </span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            From first touch to signed deal without leaving the tab.
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-5xl gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map(({ icon: Icon, step, title, description }) => (
            <div key={step} className="relative text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white">
                <Icon className="h-6 w-6" />
              </div>
              <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-primary">
                Step {step}
              </span>
              <h3 className="mb-2 text-lg font-semibold">{title}</h3>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
