"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { GitBranch } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { subscribeToContacts } from "@/lib/firestore/contacts";
import { subscribeToDeals } from "@/lib/firestore/deals";
import { formatCurrency } from "@/lib/format";
import { PIPELINE_STAGES, type Deal } from "@/types/deals";
import type { Contact } from "@/types/contacts";
import { Button } from "@/components/ui/button";
import { PipelineBoard } from "@/components/pipeline/pipeline-board";
import { NewDealDialog } from "@/components/pipeline/new-deal-dialog";

export default function PipelinePage() {
  const { user, loading: authLoading } = useAuth();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading || !user) return;
    setLoading(true);
    let dealsReady = false;
    let contactsReady = false;
    const settle = () => {
      if (dealsReady && contactsReady) setLoading(false);
    };
    const unsubDeals = subscribeToDeals(user.uid, (list) => {
      setDeals(list);
      dealsReady = true;
      settle();
    });
    const unsubContacts = subscribeToContacts(user.uid, (list) => {
      setContacts(list);
      contactsReady = true;
      settle();
    });
    return () => {
      unsubDeals();
      unsubContacts();
    };
  }, [user, authLoading]);

  const openDeals = useMemo(
    () => deals.filter((d) => d.stageId !== "won" && d.stageId !== "lost"),
    [deals],
  );
  const wonTotal = useMemo(
    () =>
      deals
        .filter((d) => d.stageId === "won")
        .reduce((sum, d) => sum + (d.value || 0), 0),
    [deals],
  );
  const openTotal = useMemo(
    () => openDeals.reduce((sum, d) => sum + (d.value || 0), 0),
    [openDeals],
  );
  const currency = deals[0]?.currency ?? "USD";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Pipeline</h1>
          <p className="text-sm text-muted-foreground">
            Drag deals across stages. Your team sees every move in real time.
          </p>
        </div>
        <NewDealDialog contacts={contacts} />
      </div>

      {!loading && deals.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-3">
          <StatCard label="Open deals" value={String(openDeals.length)} />
          <StatCard
            label="Open pipeline value"
            value={formatCurrency(openTotal, currency)}
          />
          <StatCard
            label="Won this view"
            value={formatCurrency(wonTotal, currency)}
            tone="text-emerald-600 dark:text-emerald-400"
          />
        </div>
      )}

      {loading ? (
        <BoardSkeleton />
      ) : deals.length === 0 ? (
        <EmptyState hasContacts={contacts.length > 0} contacts={contacts} />
      ) : (
        <PipelineBoard deals={deals} contacts={contacts} userId={user!.uid} />
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: string;
}) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className={`mt-1 text-2xl font-semibold tracking-tight ${tone ?? ""}`}>
        {value}
      </p>
    </div>
  );
}

function BoardSkeleton() {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {PIPELINE_STAGES.map((s) => (
        <div
          key={s.id}
          className="flex w-72 shrink-0 flex-col gap-2 rounded-xl border bg-muted/30 p-3"
        >
          <div className="h-4 w-24 animate-pulse rounded bg-muted" />
          {Array.from({ length: 2 }).map((_, i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-lg border bg-background"
            />
          ))}
        </div>
      ))}
    </div>
  );
}

function EmptyState({
  hasContacts,
  contacts,
}: {
  hasContacts: boolean;
  contacts: Contact[];
}) {
  return (
    <div className="rounded-xl border border-dashed bg-card/50 p-12 text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
        <GitBranch className="h-6 w-6 text-primary" />
      </div>
      <h3 className="text-base font-semibold">No deals yet</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        {hasContacts
          ? "Create your first deal to start tracking opportunities."
          : "Add a contact first, then open your first deal against them."}
      </p>
      <div className="mt-6 flex justify-center">
        {hasContacts ? (
          <NewDealDialog contacts={contacts} />
        ) : (
          <Button render={<Link href="/contacts" />}>Go to Contacts</Button>
        )}
      </div>
    </div>
  );
}
