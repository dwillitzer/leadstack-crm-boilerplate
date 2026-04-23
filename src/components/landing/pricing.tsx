"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { createCheckoutSession } from "@/lib/stripe/checkout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Plan = {
  name: string;
  tagline: string;
  monthly: number;
  annual: number;
  features: string[];
  cta: string;
  highlighted?: boolean;
  href?: string;
  isPro?: boolean;
  enterprise?: boolean;
};

const plans: Plan[] = [
  {
    name: "Starter",
    tagline: "Perfect for solo operators getting off spreadsheets.",
    monthly: 0,
    annual: 0,
    features: [
      "Up to 100 contacts",
      "Real-time contacts list",
      "Notes & activity timeline",
      "1 team seat",
      "Community support",
    ],
    cta: "Get started free",
    href: "/signup",
  },
  {
    name: "Pro",
    tagline: "For small teams running real pipelines.",
    monthly: 29,
    annual: 23,
    features: [
      "Unlimited contacts",
      "Pipeline with custom stages",
      "Booking links with reminders",
      "Up to 5 team seats",
      "AI follow-up drafts",
      "CSV import & export",
      "Priority email support",
    ],
    cta: "Start 14-day free trial",
    highlighted: true,
    isPro: true,
  },
  {
    name: "Scale",
    tagline: "For growing teams with serious volume.",
    monthly: 79,
    annual: 63,
    features: [
      "Everything in Pro",
      "Unlimited team seats",
      "Advanced automations",
      "Reactivation workflows",
      "Audit logs & SSO",
      "Dedicated CSM",
      "SLA-backed support",
    ],
    cta: "Talk to sales",
    href: "/signup?plan=scale",
    enterprise: true,
  },
];

const PRO_PRICE_ID = process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID ?? "";

export function Pricing() {
  const { user } = useAuth();
  const [annual, setAnnual] = useState(true);

  async function handleSubscribe() {
    if (!user) return;
    const url = await createCheckoutSession(PRO_PRICE_ID, user.uid);
    if (url) {
      window.location.href = url;
    }
  }

  return (
    <section id="pricing" className="py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">
            Pricing
          </p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tighter sm:text-5xl">
            One flat price.{" "}
            <span className="font-serif font-normal italic">
              No per-feature upsells.
            </span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Start free, upgrade when your team grows. Cancel anytime.
          </p>

          {/* Billing toggle */}
          <div className="mx-auto mt-8 inline-flex items-center gap-1 rounded-full border bg-muted/50 p-1">
            <button
              onClick={() => setAnnual(false)}
              className={cn(
                "rounded-full px-4 py-1.5 text-sm font-medium transition-all",
                !annual
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={cn(
                "flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-all",
                annual
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              Annual
              <span className="rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                -20%
              </span>
            </button>
          </div>
        </div>

        <div className="mx-auto mt-12 grid max-w-5xl gap-6 md:grid-cols-3">
          {plans.map((plan) => {
            const price = annual ? plan.annual : plan.monthly;
            return (
              <Card
                key={plan.name}
                className={cn(
                  "flex flex-col",
                  plan.highlighted &&
                    "relative border-primary shadow-xl shadow-primary/10 ring-2 ring-primary/30",
                )}
              >
                {plan.highlighted && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 gap-1 px-3">
                    <Sparkles className="h-3 w-3" />
                    Most popular
                  </Badge>
                )}
                <CardHeader>
                  <CardTitle className="text-lg">{plan.name}</CardTitle>
                  <CardDescription>{plan.tagline}</CardDescription>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-4xl font-bold tracking-tight">
                      ${price}
                    </span>
                    <span className="text-muted-foreground">
                      {price === 0 ? "/forever" : "/mo"}
                    </span>
                  </div>
                  {price > 0 && (
                    <p className="text-xs text-muted-foreground">
                      {annual
                        ? `Billed $${price * 12}/yr · save $${(plan.monthly - plan.annual) * 12}`
                        : "Billed monthly"}
                    </p>
                  )}
                </CardHeader>
                <CardContent className="flex-1">
                  <ul className="space-y-3">
                    {plan.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-2 text-sm"
                      >
                        <span
                          className={cn(
                            "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full",
                            plan.highlighted
                              ? "bg-primary text-primary-foreground"
                              : "bg-primary/10 text-primary",
                          )}
                        >
                          <Check className="h-3 w-3" />
                        </span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  {plan.isPro ? (
                    user ? (
                      <Button className="w-full" onClick={handleSubscribe}>
                        {plan.cta}
                      </Button>
                    ) : (
                      <Button render={<Link href="/signup" />} className="w-full">
                        {plan.cta}
                      </Button>
                    )
                  ) : (
                    <Button
                      render={<Link href={plan.href ?? "/signup"} />}
                      variant={plan.highlighted ? "default" : "outline"}
                      className="w-full"
                    >
                      {plan.cta}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>

        <p className="mx-auto mt-8 max-w-lg text-center text-xs text-muted-foreground">
          Every plan includes contacts, pipeline, booking, SOC 2-ready
          infrastructure, and one-click data export. No contracts, no hidden
          seats, no &ldquo;call us&rdquo; pricing.
        </p>
      </div>
    </section>
  );
}
