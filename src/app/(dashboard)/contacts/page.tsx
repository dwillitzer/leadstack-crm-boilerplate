"use client";

import { useEffect, useState } from "react";
import { Download, Search, Upload, Users } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { subscribeToContacts } from "@/lib/firestore/contacts";
import { serializeCsv, downloadCsv } from "@/lib/csv";
import { toDate } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ContactsTable } from "@/components/contacts/contacts-table";
import { AddContactModal } from "@/components/contacts/add-contact-modal";
import { ImportContactsDialog } from "@/components/contacts/import-contacts-dialog";
import type { Contact } from "@/types/contacts";

export default function ContactsPage() {
  const { user, loading: authLoading } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [importOpen, setImportOpen] = useState(false);

  useEffect(() => {
    if (authLoading || !user) return;
    setLoading(true);
    const unsub = subscribeToContacts(user.uid, (list) => {
      setContacts(list);
      setLoading(false);
    });
    return () => unsub();
  }, [user, authLoading]);

  function handleExport() {
    if (contacts.length === 0) {
      toast.error("No contacts to export.");
      return;
    }
    const headers = ["name", "email", "phone", "company", "source", "tags", "pipelineStage", "createdAt"];
    const rows = contacts.map((c) => ({
      name: c.name,
      email: c.email,
      phone: c.phone,
      company: c.company,
      source: c.source,
      tags: c.tags ?? [],
      pipelineStage: c.pipelineStage ?? "",
      createdAt: toDate(c.createdAt)?.toISOString() ?? "",
    }));
    const csv = serializeCsv(headers, rows);
    const stamp = new Date().toISOString().slice(0, 10);
    downloadCsv(`leadstack-contacts-${stamp}.csv`, csv);
    toast.success(`Exported ${rows.length} contacts`);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Contacts</h1>
          <p className="text-sm text-muted-foreground">
            Everyone in your pipeline, in one place.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setImportOpen(true)}
          >
            <Upload className="mr-1 h-4 w-4" />
            Import CSV
          </Button>
          <Button
            variant="outline"
            onClick={handleExport}
            disabled={contacts.length === 0}
          >
            <Download className="mr-1 h-4 w-4" />
            Export
          </Button>
          <AddContactModal />
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email, or company"
          className="pl-8"
        />
      </div>

      {loading ? (
        <TableSkeleton />
      ) : contacts.length === 0 ? (
        <EmptyState onImport={() => setImportOpen(true)} />
      ) : (
        <ContactsTable contacts={contacts} search={search} />
      )}

      <ImportContactsDialog open={importOpen} onOpenChange={setImportOpen} />
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <div className="border-b bg-muted/40 px-4 py-3">
        <div className="h-3 w-24 animate-pulse rounded bg-muted" />
      </div>
      <div className="divide-y">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-4">
            <div className="h-4 w-40 animate-pulse rounded bg-muted" />
            <div className="h-4 w-48 animate-pulse rounded bg-muted" />
            <div className="ml-auto h-5 w-16 animate-pulse rounded-full bg-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}

function EmptyState({ onImport }: { onImport: () => void }) {
  return (
    <div className="rounded-xl border border-dashed bg-card/50 p-12 text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
        <Users className="h-6 w-6 text-primary" />
      </div>
      <h3 className="text-base font-semibold">No contacts yet</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Add your first lead or import a CSV from your old CRM.
      </p>
      <div className="mt-6 flex justify-center gap-2">
        <AddContactModal />
        <Button variant="outline" onClick={onImport}>
          <Upload className="mr-1 h-4 w-4" />
          Import CSV
        </Button>
      </div>
    </div>
  );
}
