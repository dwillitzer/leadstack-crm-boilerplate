"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Plus, Search } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { createDeal } from "@/lib/firestore/deals";
import {
  DEAL_PRIORITIES,
  PIPELINE_STAGES,
  type DealFormData,
  type DealPriority,
  type PipelineStageId,
} from "@/types/deals";
import type { Contact } from "@/types/contacts";

interface NewDealDialogProps {
  contacts: Contact[];
  defaultContactId?: string;
  defaultStageId?: PipelineStageId;
  trigger?: React.ReactNode;
}

export function NewDealDialog({
  contacts,
  defaultContactId,
  defaultStageId = "new",
  trigger,
}: NewDealDialogProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  const [title, setTitle] = useState("");
  const [value, setValue] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [stageId, setStageId] = useState<PipelineStageId>(defaultStageId);
  const [priority, setPriority] = useState<DealPriority>("medium");
  const [contactId, setContactId] = useState(defaultContactId ?? "");
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      setTitle("");
      setValue("");
      setCurrency("USD");
      setStageId(defaultStageId);
      setPriority("medium");
      setContactId(defaultContactId ?? "");
      setSearch("");
      setErrors({});
    }
  }, [open, defaultContactId, defaultStageId]);

  const filteredContacts = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return contacts.slice(0, 50);
    return contacts
      .filter((c) =>
        [c.name, c.email, c.company]
          .filter(Boolean)
          .some((s) => s.toLowerCase().includes(q)),
      )
      .slice(0, 50);
  }, [contacts, search]);

  const selectedContact = contacts.find((c) => c.id === contactId);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!user) return;
    const next: Record<string, string> = {};
    if (!title.trim()) next.title = "Title is required";
    if (!contactId) next.contactId = "Pick a contact";
    const num = Number(value);
    if (value && (Number.isNaN(num) || num < 0)) next.value = "Enter a valid amount";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    const payload: DealFormData = {
      title: title.trim(),
      value: Number(value) || 0,
      currency,
      contactId,
      stageId,
      priority,
    };
    setSaving(true);
    try {
      await createDeal(user.uid, payload);
      toast.success("Deal created");
      setOpen(false);
    } catch (err) {
      console.error(err);
      toast.error("Couldn't create deal. Try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      {trigger ? (
        <button type="button" onClick={() => setOpen(true)} className="contents">
          {trigger}
        </button>
      ) : (
        <Button onClick={() => setOpen(true)}>
          <Plus className="mr-1 h-4 w-4" />
          New Deal
        </Button>
      )}

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>New Deal</SheetTitle>
            <SheetDescription>
              Track an opportunity against a contact. Deals live in your
              pipeline.
            </SheetDescription>
          </SheetHeader>

          <form className="space-y-4 p-4 pt-0" onSubmit={handleSubmit}>
            <div className="space-y-1.5">
              <Label htmlFor="deal-title">
                Deal title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="deal-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Website rebuild — Acme"
                aria-invalid={!!errors.title}
              />
              {errors.title && (
                <p className="text-xs text-destructive">{errors.title}</p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_auto]">
              <div className="space-y-1.5">
                <Label htmlFor="deal-value">Value</Label>
                <Input
                  id="deal-value"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.01"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder="5000"
                  aria-invalid={!!errors.value}
                />
                {errors.value && (
                  <p className="text-xs text-destructive">{errors.value}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="deal-currency">Currency</Label>
                <select
                  id="deal-currency"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="flex h-8 w-24 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
                >
                  {["USD", "AUD", "EUR", "GBP", "CAD"].map((c) => (
                    <option key={c} value={c} className="bg-background text-foreground">
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="deal-stage">Stage</Label>
              <select
                id="deal-stage"
                value={stageId}
                onChange={(e) => setStageId(e.target.value as PipelineStageId)}
                className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
              >
                {PIPELINE_STAGES.map((s) => (
                  <option key={s.id} value={s.id} className="bg-background text-foreground">
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="deal-priority">Priority</Label>
              <select
                id="deal-priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as DealPriority)}
                className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
              >
                {DEAL_PRIORITIES.map((p) => (
                  <option key={p.id} value={p.id} className="bg-background text-foreground">
                    {p.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label>
                Contact <span className="text-destructive">*</span>
              </Label>
              {selectedContact ? (
                <div className="flex items-center justify-between rounded-lg border bg-muted/40 px-3 py-2 text-sm">
                  <div className="min-w-0">
                    <p className="truncate font-medium">
                      {selectedContact.name || selectedContact.email}
                    </p>
                    {selectedContact.company && (
                      <p className="truncate text-xs text-muted-foreground">
                        {selectedContact.company}
                      </p>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setContactId("")}
                  >
                    Change
                  </Button>
                </div>
              ) : (
                <>
                  <div className="relative">
                    <Search className="pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search contacts by name, email, or company"
                      className="pl-8"
                    />
                  </div>
                  <div className="max-h-48 overflow-y-auto rounded-lg border">
                    {filteredContacts.length === 0 ? (
                      <p className="px-3 py-6 text-center text-xs text-muted-foreground">
                        {contacts.length === 0
                          ? "No contacts yet. Add one first."
                          : "No matches. Try a different search."}
                      </p>
                    ) : (
                      filteredContacts.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => setContactId(c.id)}
                          className="flex w-full items-center justify-between gap-2 border-b px-3 py-2 text-left text-sm last:border-b-0 hover:bg-muted"
                        >
                          <div className="min-w-0">
                            <p className="truncate font-medium">
                              {c.name || c.email}
                            </p>
                            {c.company && (
                              <p className="truncate text-xs text-muted-foreground">
                                {c.company}
                              </p>
                            )}
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                  {errors.contactId && (
                    <p className="text-xs text-destructive">{errors.contactId}</p>
                  )}
                </>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setOpen(false)}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Creating…" : "Create Deal"}
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </>
  );
}
