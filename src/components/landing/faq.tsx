"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const faqs = [
  {
    question: "How is LeadStack different from HubSpot or Pipedrive?",
    answer:
      "LeadStack is built for small teams that want the essentials done well — contacts, pipelines, and booking in one place — without the enterprise sprawl or enterprise pricing. If you need heavy marketing automation or a 40-person sales org, the big CRMs are still a fit. If you want something your team will actually use on day one, that's us.",
  },
  {
    question: "Can I import my existing contacts?",
    answer:
      "Yes. Drop in a CSV from Sheets, HubSpot, Pipedrive, or an export from almost anywhere, and we'll map the fields for you. Tags, source, and company all come across.",
  },
  {
    question: "Does it work for teams or just solo users?",
    answer:
      "Teams. Every contact, pipeline stage, and note updates in real time for everyone — no refresh, no stale data. Built so two or twenty people can work the same pipeline without stepping on each other.",
  },
  {
    question: "What about the pipeline and booking features?",
    answer:
      "The contacts module is live today. Pipeline ships next, followed by the booking tool. All three are included in every paid plan — no surprise upsells.",
  },
  {
    question: "Is there a free tier?",
    answer:
      "You can try LeadStack free for 14 days with no credit card. After that, Pro is $29/month for up to five seats. No forced annual plans.",
  },
  {
    question: "Can I cancel anytime?",
    answer:
      "Yes. Cancel from your dashboard in two clicks. You keep access until the end of your current billing period and can export your data at any time.",
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tighter sm:text-5xl">
            Frequently <span className="font-serif font-normal italic">asked</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Can&apos;t find what you&apos;re looking for? Email
            hello@leadstack.io.
          </p>
        </div>

        <div className="mx-auto mt-12 max-w-2xl divide-y">
          {faqs.map(({ question, answer }, index) => (
            <div key={question}>
              <button
                onClick={() =>
                  setOpenIndex(openIndex === index ? null : index)
                }
                className="flex w-full items-center justify-between py-5 text-left text-sm font-medium transition-colors hover:text-primary"
              >
                {question}
                <ChevronDown
                  className={cn(
                    "ml-4 h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
                    openIndex === index && "rotate-180",
                  )}
                />
              </button>
              <div
                className={cn(
                  "grid transition-all duration-200",
                  openIndex === index
                    ? "grid-rows-[1fr] pb-5"
                    : "grid-rows-[0fr]",
                )}
              >
                <div className="overflow-hidden">
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {answer}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
