import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CTA() {
  return (
    <section className="relative overflow-hidden py-24">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,oklch(0.62_0.25_290)_/_12%,transparent_60%)]" />

      <div className="container mx-auto px-4 text-center">
        <h2 className="mx-auto max-w-2xl text-3xl font-semibold tracking-tighter sm:text-5xl">
          Your team&apos;s next deal is waiting on a{" "}
          <span className="font-serif font-normal italic">cleaner workspace.</span>
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
          Start free in under a minute. Import your contacts, invite your team,
          and ship your first pipeline the same afternoon.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button
            render={<Link href="/signup" />}
            size="lg"
            className="px-6 text-base"
          >
            Start free for 14 days
            <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
          <Button
            render={<a href="#pricing" />}
            variant="outline"
            size="lg"
            className="px-6 text-base"
          >
            See pricing
          </Button>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          No credit card · Cancel in two clicks · Export your data anytime
        </p>
      </div>
    </section>
  );
}
