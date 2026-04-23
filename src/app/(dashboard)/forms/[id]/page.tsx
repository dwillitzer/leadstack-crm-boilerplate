"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  AtSign,
  Building2,
  ChevronDown,
  ChevronUp,
  Copy,
  ExternalLink,
  Hash,
  ListChecks,
  Phone as PhoneIcon,
  Plus,
  TextCursor,
  Trash2,
  Type,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { subscribeToForm, updateForm } from "@/lib/firestore/forms";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PIPELINE_STAGES, type PipelineStageId } from "@/types/deals";
import type {
  FormField,
  FormFieldType,
  FormSettings,
  LeadForm,
} from "@/types/forms";

const FIELD_TYPES: {
  value: FormFieldType;
  label: string;
  icon: typeof Type;
  /** Static Tailwind classes — avoid dynamic concatenation so JIT keeps them. */
  tone: {
    border: string;
    iconBg: string;
    iconText: string;
  };
}[] = [
  {
    value: "text",
    label: "Short text",
    icon: Type,
    tone: {
      border: "border-slate-400/30 hover:border-slate-400/60",
      iconBg: "bg-slate-500/10",
      iconText: "text-slate-600 dark:text-slate-300",
    },
  },
  {
    value: "email",
    label: "Email",
    icon: AtSign,
    tone: {
      border: "border-blue-400/30 hover:border-blue-400/60",
      iconBg: "bg-blue-500/10",
      iconText: "text-blue-600 dark:text-blue-300",
    },
  },
  {
    value: "phone",
    label: "Phone",
    icon: PhoneIcon,
    tone: {
      border: "border-emerald-400/30 hover:border-emerald-400/60",
      iconBg: "bg-emerald-500/10",
      iconText: "text-emerald-600 dark:text-emerald-300",
    },
  },
  {
    value: "company",
    label: "Company",
    icon: Building2,
    tone: {
      border: "border-amber-400/30 hover:border-amber-400/60",
      iconBg: "bg-amber-500/10",
      iconText: "text-amber-600 dark:text-amber-300",
    },
  },
  {
    value: "textarea",
    label: "Long text",
    icon: TextCursor,
    tone: {
      border: "border-violet-400/30 hover:border-violet-400/60",
      iconBg: "bg-violet-500/10",
      iconText: "text-violet-600 dark:text-violet-300",
    },
  },
  {
    value: "select",
    label: "Dropdown",
    icon: ListChecks,
    tone: {
      border: "border-pink-400/30 hover:border-pink-400/60",
      iconBg: "bg-pink-500/10",
      iconText: "text-pink-600 dark:text-pink-300",
    },
  },
];

function typeMeta(value: FormFieldType) {
  return FIELD_TYPES.find((t) => t.value === value) ?? FIELD_TYPES[0];
}

const MAP_OPTIONS: { value: FormField["mapsTo"]; label: string }[] = [
  { value: null, label: "Don't map (store only)" },
  { value: "name", label: "Contact name" },
  { value: "email", label: "Contact email" },
  { value: "phone", label: "Contact phone" },
  { value: "company", label: "Company" },
  { value: "notes", label: "Initial note" },
];

const DEFAULTS_BY_TYPE: Record<
  FormFieldType,
  { label: string; placeholder: string; mapsTo: FormField["mapsTo"] }
> = {
  text: { label: "Text field", placeholder: "", mapsTo: null },
  email: { label: "Email", placeholder: "jane@example.com", mapsTo: "email" },
  phone: { label: "Phone", placeholder: "+1 555 000 0000", mapsTo: "phone" },
  company: { label: "Company", placeholder: "Acme Inc.", mapsTo: "company" },
  textarea: { label: "Message", placeholder: "", mapsTo: "notes" },
  select: { label: "Dropdown", placeholder: "", mapsTo: null },
};

function newField(type: FormFieldType = "text"): FormField {
  const d = DEFAULTS_BY_TYPE[type];
  return {
    id: `f_${Math.random().toString(36).slice(2, 9)}`,
    type,
    label: d.label,
    placeholder: d.placeholder,
    required: false,
    options: [],
    mapsTo: d.mapsTo,
  };
}

export default function FormBuilderPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const { user, loading: authLoading } = useAuth();
  const [form, setForm] = useState<LeadForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copiedTag, setCopiedTag] = useState("");

  useEffect(() => {
    if (authLoading || !user || !id) return;
    setLoading(true);
    const unsub = subscribeToForm(id, (f) => {
      setForm(f);
      setLoading(false);
    });
    return () => unsub();
  }, [id, user, authLoading]);

  if (loading) return <BuilderSkeleton />;
  if (!form) return <NotFound />;

  async function save(patch: Partial<LeadForm>) {
    if (!form) return;
    setSaving(true);
    try {
      await updateForm(form.id, patch);
    } catch (err) {
      console.error(err);
      toast.error("Couldn't save. Try again.");
    } finally {
      setSaving(false);
    }
  }

  function updateField(fid: string, patch: Partial<FormField>) {
    const next = form!.fields.map((f) =>
      f.id === fid ? { ...f, ...patch } : f,
    );
    save({ fields: next });
  }

  function addField(type: FormFieldType = "text") {
    save({ fields: [...form!.fields, newField(type)] });
  }

  function removeField(fid: string) {
    save({ fields: form!.fields.filter((f) => f.id !== fid) });
  }

  function moveField(fid: string, dir: -1 | 1) {
    const idx = form!.fields.findIndex((f) => f.id === fid);
    if (idx < 0) return;
    const next = [...form!.fields];
    const target = idx + dir;
    if (target < 0 || target >= next.length) return;
    [next[idx], next[target]] = [next[target], next[idx]];
    save({ fields: next });
  }

  function updateSettings(patch: Partial<FormSettings>) {
    save({ settings: { ...form!.settings, ...patch } });
  }

  function copyTag(kind: "link" | "script") {
    const origin =
      typeof window !== "undefined" ? window.location.origin : "";
    const text =
      kind === "link"
        ? `${origin}/f/${form!.id}`
        : `<iframe src="${origin}/f/${form!.id}" width="100%" height="600" style="border:0"></iframe>`;
    navigator.clipboard.writeText(text);
    setCopiedTag(kind);
    toast.success(kind === "link" ? "Link copied" : "Embed snippet copied");
    setTimeout(() => setCopiedTag(""), 2000);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href="/forms"
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3 w-3" />
            Back to forms
          </Link>
          <div className="mt-2 flex items-center gap-3">
            <Input
              value={form.name}
              onChange={(e) => save({ name: e.target.value })}
              className="h-auto border-none bg-transparent px-0 text-2xl font-semibold tracking-tight shadow-none focus-visible:ring-0"
            />
            <span
              className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                form.enabled
                  ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {form.enabled ? "Live" : "Paused"}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            {saving ? "Saving…" : "All changes saved"}
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => save({ enabled: !form.enabled })}
          >
            {form.enabled ? "Pause form" : "Resume form"}
          </Button>
          <Button size="sm" variant="outline" onClick={() => copyTag("link")}>
            <Copy className="mr-1 h-3.5 w-3.5" />
            {copiedTag === "link" ? "Copied" : "Copy link"}
          </Button>
          <Button
            size="sm"
            render={<a href={`/f/${form.id}`} target="_blank" rel="noreferrer" />}
          >
            <ExternalLink className="mr-1 h-3.5 w-3.5" />
            Preview
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        {/* Fields column */}
        <section className="rounded-2xl border bg-card p-5">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold">Fields</h2>
              <p className="text-[11px] text-muted-foreground">
                {form.fields.length} total · drag order with the arrows
              </p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button size="sm">
                    <Plus className="mr-1 h-3.5 w-3.5" />
                    Add field
                    <ChevronDown className="ml-0.5 h-3 w-3 opacity-70" />
                  </Button>
                }
              />
              <DropdownMenuContent align="end" className="w-44">
                {FIELD_TYPES.map((t) => (
                  <DropdownMenuItem
                    key={t.value}
                    onClick={() => addField(t.value)}
                  >
                    <t.icon className="mr-2 h-3.5 w-3.5" />
                    {t.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="space-y-1.5">
            {form.fields.map((f, i) => {
              const meta = typeMeta(f.type);
              const Icon = meta.icon;
              return (
                <div
                  key={f.id}
                  className={`group/field overflow-hidden rounded-lg border bg-background transition-colors ${meta.tone.border}`}
                >
                  {/* Header row */}
                  <div className="flex items-center gap-1 px-2 py-1.5">
                    <div className="flex flex-col gap-px">
                      <button
                        type="button"
                        onClick={() => moveField(f.id, -1)}
                        disabled={i === 0}
                        className="rounded text-muted-foreground/50 transition-colors hover:bg-muted hover:text-foreground disabled:opacity-20"
                        aria-label="Move up"
                      >
                        <ChevronUp className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveField(f.id, 1)}
                        disabled={i === form.fields.length - 1}
                        className="rounded text-muted-foreground/50 transition-colors hover:bg-muted hover:text-foreground disabled:opacity-20"
                        aria-label="Move down"
                      >
                        <ChevronDown className="h-3 w-3" />
                      </button>
                    </div>
                    <span
                      className={`ml-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md ${meta.tone.iconBg} ${meta.tone.iconText}`}
                      title={meta.label}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    <Input
                      value={f.label}
                      onChange={(e) =>
                        updateField(f.id, { label: e.target.value })
                      }
                      placeholder="Field label"
                      className="h-7 flex-1 border-none bg-transparent px-1.5 text-sm font-medium shadow-none focus-visible:ring-0"
                    />
                    <label className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded px-1.5 py-1 text-[11px] text-muted-foreground transition-colors hover:bg-muted">
                      <Checkbox
                        checked={f.required}
                        onCheckedChange={(v) =>
                          updateField(f.id, { required: !!v })
                        }
                      />
                      Required
                    </label>
                    <Button
                      size="icon-xs"
                      variant="ghost"
                      onClick={() => removeField(f.id)}
                      aria-label="Remove field"
                      className="text-muted-foreground/60 opacity-0 transition-opacity hover:text-destructive group-hover/field:opacity-100"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>

                  {/* Compact meta strip */}
                  <div className="grid grid-cols-1 gap-1.5 border-t bg-muted/20 px-2 py-1.5 text-xs sm:grid-cols-[110px_180px_1fr]">
                    <select
                      value={f.type}
                      onChange={(e) =>
                        updateField(f.id, {
                          type: e.target.value as FormFieldType,
                        })
                      }
                      aria-label="Field type"
                      className="h-7 rounded-md border border-input bg-transparent px-1.5 text-[11px] outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 dark:bg-input/30"
                    >
                      {FIELD_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                    <select
                      value={f.mapsTo ?? ""}
                      onChange={(e) =>
                        updateField(f.id, {
                          mapsTo:
                            (e.target.value || null) as FormField["mapsTo"],
                        })
                      }
                      aria-label="Maps to contact"
                      className="h-7 rounded-md border border-input bg-transparent px-1.5 text-[11px] outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 dark:bg-input/30"
                    >
                      {MAP_OPTIONS.map((o) => (
                        <option key={o.label} value={o.value ?? ""}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                    <Input
                      value={f.placeholder}
                      onChange={(e) =>
                        updateField(f.id, { placeholder: e.target.value })
                      }
                      placeholder="Placeholder (optional)"
                      className="h-7 px-2 text-[11px]"
                    />
                  </div>

                  {f.type === "select" && (
                    <div className="space-y-1 border-t bg-muted/20 px-2 py-1.5">
                      <Label className="flex items-center gap-1 text-[10px] uppercase tracking-wide text-muted-foreground">
                        <Hash className="h-3 w-3" /> Options · one per line
                      </Label>
                      <Textarea
                        rows={3}
                        value={f.options.join("\n")}
                        onChange={(e) =>
                          updateField(f.id, {
                            options: e.target.value
                              .split("\n")
                              .map((s) => s.trim())
                              .filter(Boolean),
                          })
                        }
                        className="min-h-0 text-xs"
                        placeholder={"Low budget\nMedium\nEnterprise"}
                      />
                    </div>
                  )}
                </div>
              );
            })}
            {form.fields.length === 0 && (
              <div className="rounded-lg border border-dashed py-8 text-center text-xs text-muted-foreground">
                No fields yet. Use <span className="font-medium">Add field</span> above to get started.
              </div>
            )}
          </div>
        </section>

        {/* Settings column */}
        <aside className="space-y-4">
          <section className="rounded-2xl border bg-card p-5">
            <h2 className="mb-3 text-sm font-semibold">On submission</h2>
            <div className="space-y-3 text-sm">
              <div className="space-y-1.5">
                <Label>Land new leads in pipeline stage</Label>
                <select
                  value={form.settings.pipelineStageId ?? ""}
                  onChange={(e) =>
                    updateSettings({
                      pipelineStageId:
                        (e.target.value || null) as PipelineStageId | null,
                    })
                  }
                  className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
                >
                  <option value="">— None (contact only)</option>
                  {PIPELINE_STAGES.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>Auto-tags (comma separated)</Label>
                <Input
                  value={form.settings.autoTags.join(", ")}
                  onChange={(e) =>
                    updateSettings({
                      autoTags: e.target.value
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean),
                    })
                  }
                  className="h-8 text-sm"
                />
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={form.settings.createDeal}
                  onCheckedChange={(v) =>
                    updateSettings({ createDeal: !!v })
                  }
                />
                <span>Also open a deal</span>
              </div>
              {form.settings.createDeal && (
                <div className="space-y-2 pl-6">
                  <div className="space-y-1.5">
                    <Label>Deal title template</Label>
                    <Input
                      value={form.settings.dealTitleTemplate}
                      onChange={(e) =>
                        updateSettings({
                          dealTitleTemplate: e.target.value,
                        })
                      }
                      className="h-8 text-sm"
                      placeholder="New lead — {name}"
                    />
                    <p className="text-[11px] text-muted-foreground">
                      Use <code>{`{name}`}</code>, <code>{`{email}`}</code>,{" "}
                      <code>{`{company}`}</code> as placeholders.
                    </p>
                  </div>
                  <div className="grid grid-cols-[1fr_auto] gap-2">
                    <div className="space-y-1.5">
                      <Label>Default value</Label>
                      <Input
                        type="number"
                        value={form.settings.dealValue}
                        onChange={(e) =>
                          updateSettings({
                            dealValue: Number(e.target.value) || 0,
                          })
                        }
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Currency</Label>
                      <select
                        value={form.settings.dealCurrency}
                        onChange={(e) =>
                          updateSettings({ dealCurrency: e.target.value })
                        }
                        className="flex h-8 w-24 rounded-lg border border-input bg-transparent px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
                      >
                        {["USD", "AUD", "EUR", "GBP", "CAD"].map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>

          <section className="rounded-2xl border bg-card p-5">
            <h2 className="mb-3 text-sm font-semibold">After submit</h2>
            <div className="space-y-3 text-sm">
              <div className="space-y-1.5">
                <Label>Thank-you message</Label>
                <Textarea
                  rows={3}
                  value={form.settings.thankYouMessage}
                  onChange={(e) =>
                    updateSettings({ thankYouMessage: e.target.value })
                  }
                  className="text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Redirect URL (optional)</Label>
                <Input
                  value={form.settings.redirectUrl}
                  onChange={(e) =>
                    updateSettings({ redirectUrl: e.target.value })
                  }
                  placeholder="https://…"
                  className="h-8 text-sm"
                />
              </div>
            </div>
          </section>

          <section className="rounded-2xl border bg-gradient-to-br from-indigo-500/5 via-violet-500/5 to-pink-500/5 p-5">
            <h2 className="mb-3 text-sm font-semibold">Share</h2>
            <div className="space-y-2 text-sm">
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyTag("link")}
                className="w-full justify-start"
              >
                <Copy className="mr-1 h-3.5 w-3.5" />
                {copiedTag === "link" ? "Link copied" : "Copy public link"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyTag("script")}
                className="w-full justify-start"
              >
                <Copy className="mr-1 h-3.5 w-3.5" />
                {copiedTag === "script" ? "Embed copied" : "Copy iframe embed"}
              </Button>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

function BuilderSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-10 w-64 animate-pulse rounded bg-muted" />
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div className="h-96 animate-pulse rounded-2xl border bg-muted/30" />
        <div className="h-96 animate-pulse rounded-2xl border bg-muted/30" />
      </div>
    </div>
  );
}

function NotFound() {
  return (
    <div className="rounded-xl border border-dashed p-12 text-center">
      <h2 className="text-lg font-semibold">Form not found</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        It may have been deleted.
      </p>
      <Button render={<Link href="/forms" />} className="mt-6">
        Back to forms
      </Button>
    </div>
  );
}
