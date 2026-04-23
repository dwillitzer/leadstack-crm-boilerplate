const stats = [
  { value: "12,400+", label: "Teams closing on LeadStack" },
  { value: "4.2M", label: "Contacts under management" },
  { value: "22%", label: "Average lift in close rate" },
  { value: "4.8/5", label: "Rating on G2 & Capterra" },
];

export function Stats() {
  return (
    <section className="relative overflow-hidden border-y bg-gradient-to-br from-indigo-600 via-violet-600 to-pink-600 py-16 text-white">
      {/* Decorative orbs */}
      <div className="pointer-events-none absolute -left-20 top-0 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-0 h-64 w-64 rounded-full bg-pink-300/20 blur-3xl" />

      <div className="container relative mx-auto px-4">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-white/70">
            The numbers
          </p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
            Momentum, measured.
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {stats.map(({ value, label }) => (
            <div
              key={label}
              className="text-center"
            >
              <div className="bg-gradient-to-b from-white to-white/70 bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-5xl">
                {value}
              </div>
              <p className="mt-2 text-sm text-white/80">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
