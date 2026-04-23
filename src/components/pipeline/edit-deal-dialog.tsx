"use client";

import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
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
import { moveDeal, updateDeal } from "@/lib/firestore/deals";
import {
  DEAL_PRIORITIES,
  PIPELINE_STAGES,
  type Deal,
  type DealPriority,
  type PipelineStageId,
} from "@/types/deals";

interface EditDealDialogProps {
  deal: Deal | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
}

export function EditDealDialog({
  deal,
  open,
  onOpenChange,
  userId,
}: EditDealDialogProps) {
  const [title, setTitle] = useState("");
  const [value, setValue] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [stageId, setStageId] = useState<PipelineStageId>("new");
  const [priority, setPriority] = useState<DealPriority>("medium");
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open && deal) {
      setTitle(deal.title);
      setValue(deal.value ? String(deal.value) : "");
      setCurrency(deal.currency || "USD");
      setStageId(deal.stageId);
      setPriority(deal.priority ?? "medium");
      setErrors({});
    }
  }, [open, deal]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!deal) return;
    const next: Record<string, string> = {};
    if (!title.trim()) next.title = "Title is required";
    const num = Number(value);
    if (value && (Number.isNaN(num) || num < 0)) next.value = "Enter a valid amount";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSaving(true);
    try {
      await updateDeal(deal.id, {
        title: title.trim(),
        value: Number(value) || 0,
        currency,
        priority,
      });
      if (stageId !== deal.stageId) {
        await moveDeal(deal, stageId, { userId });
      }
      toast.success("Deal updated");
      onOpenChange(false);
    } catch (err) {
      console.error(err);
      toast.error("Couldn't update deal. Try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Edit Deal</SheetTitle>
          <SheetDescription>
            Update the deal&apos;s details. Stage changes are logged on the
            contact&apos;s timeline.
          </SheetDescription>
        </SheetHeader>

        <form className="space-y-4 p-4 pt-0" onSubmit={handleSubmit}>
          <div className="space-y-1.5">
            <Label htmlFor="edit-deal-title">
              Deal title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="edit-deal-title"
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
              <Label htmlFor="edit-deal-value">Value</Label>
              <Input
                id="edit-deal-value"
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
              <Label htmlFor="edit-deal-currency">Currency</Label>
              <select
                id="edit-deal-currency"
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
            <Label htmlFor="edit-deal-stage">Stage</Label>
            <select
              id="edit-deal-stage"
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
            <Label htmlFor="edit-deal-priority">Priority</Label>
            <select
              id="edit-deal-priority"
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

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
