export function LogoBar() {
  const logos = [
    "Northwind",
    "Acme Studios",
    "BrightLab",
    "Fieldworks",
    "Atlas Home",
    "Pinecrest",
    "Roamlink",
    "OrbitDesk",
    "Bluefin",
    "Redcoast",
  ];

  return (
    <section className="border-y bg-muted/30 py-8">
      <div className="container mx-auto px-4">
        <p className="mb-6 text-center text-sm font-medium text-muted-foreground">
          Trusted by growing teams in agencies, home services, and SaaS
        </p>

        <div className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-background to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-background to-transparent" />

          <div className="flex animate-marquee items-center gap-12">
            {[...logos, ...logos].map((name, i) => (
              <div
                key={`${name}-${i}`}
                className="flex shrink-0 items-center gap-2 text-lg font-semibold text-muted-foreground/60"
              >
                <div className="h-8 w-8 rounded-md bg-muted-foreground/10" />
                {name}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
