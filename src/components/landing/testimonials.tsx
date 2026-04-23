import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const testimonials = [
  {
    name: "Priya Sharma",
    role: "Head of Sales",
    company: "Northwind Roofing",
    initials: "PS",
    quote:
      "We moved off HubSpot and cancelled three other subscriptions. LeadStack does what we actually needed — contacts, pipeline, bookings — without the bloat or the bill.",
  },
  {
    name: "Tomás García",
    role: "Founder",
    company: "Atlas Home Services",
    initials: "TG",
    quote:
      "Our team was losing leads between Sheets, Calendly, and email threads. Now everything sits on the contact record. Close rate is up 22% in two months.",
  },
  {
    name: "Amelia Foster",
    role: "Agency Director",
    company: "Bright Lane Marketing",
    initials: "AF",
    quote:
      "I set LeadStack up for a client in 40 minutes. Their ops lead said it was the first CRM anyone on their team has actually kept using.",
  },
];

export function Testimonials() {
  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">
            Loved by sales teams
          </p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tighter sm:text-5xl">
            Built for teams who want to{" "}
            <span className="font-serif font-normal italic">close</span>, not
            configure.
          </h2>
        </div>

        <div className="mx-auto mt-12 grid max-w-5xl gap-6 md:grid-cols-3">
          {testimonials.map(({ name, role, company, initials, quote }) => (
            <Card key={name} className="flex flex-col">
              <CardContent className="flex-1 pt-6">
                <div className="mb-4 flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className="h-4 w-4 fill-yellow-500 text-yellow-500"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <blockquote className="text-sm leading-relaxed text-muted-foreground">
                  &ldquo;{quote}&rdquo;
                </blockquote>
              </CardContent>
              <CardHeader className="border-t pt-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="text-xs">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-semibold">{name}</p>
                    <p className="text-xs text-muted-foreground">
                      {role}, {company}
                    </p>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
