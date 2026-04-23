"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Contact, ContactFormData, ContactSource } from "@/types/contacts";

const SOURCES: { value: ContactSource; label: string }[] = [
  { value: "", label: "—" },
  { value: "website", label: "Website" },
  { value: "referral", label: "Referral" },
  { value: "ads", label: "Ads" },
  { value: "other", label: "Other" },
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface ContactFormProps {
  initial?: Partial<Contact>;
  submitLabel?: string;
  onSubmit: (data: ContactFormData) => Promise<void>;
  onCancel?: () => void;
}

export function ContactForm({
  initial,
  submitLabel = "Save Contact",
  onSubmit,
  onCancel,
}: ContactFormProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [phone, setPhone] = useState(initial?.phone ?? "");
  const [company, setCompany] = useState(initial?.company ?? "");
  const [source, setSource] = useState<ContactSource>(initial?.source ?? "");
  const [tagsInput, setTagsInput] = useState((initial?.tags ?? []).join(", "));

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = "Name is required";
    if (!email.trim()) next.email = "Email is required";
    else if (!EMAIL_RE.test(email.trim())) next.email = "Enter a valid email";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    setSaving(true);
    try {
      await onSubmit({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        company: company.trim(),
        source,
        tags,
      });
    } catch (err) {
      console.error(err);
      toast.error("Failed to save contact. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="c-name">
          Full name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="c-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Jane Doe"
          aria-invalid={!!errors.name}
        />
        {errors.name && (
          <p className="text-xs text-destructive">{errors.name}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="c-email">
          Email <span className="text-destructive">*</span>
        </Label>
        <Input
          id="c-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="jane@example.com"
          aria-invalid={!!errors.email}
        />
        {errors.email && (
          <p className="text-xs text-destructive">{errors.email}</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="c-phone">Phone</Label>
          <Input
            id="c-phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+61 400 000 000"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="c-company">Company</Label>
          <Input
            id="c-company"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="Acme Inc."
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="c-source">Source</Label>
        <select
          id="c-source"
          value={source}
          onChange={(e) => setSource(e.target.value as ContactSource)}
          className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
        >
          {SOURCES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="c-tags">Tags</Label>
        <Input
          id="c-tags"
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
          placeholder="lead, warm, 2026-q2"
        />
        <p className="text-xs text-muted-foreground">
          Separate tags with commas
        </p>
      </div>

      <div className="flex items-center justify-end gap-2 pt-2">
        {onCancel && (
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            disabled={saving}
          >
            <X className="mr-1 h-4 w-4" />
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : submitLabel}
        </Button>
      </div>
    </form>
  );
}
