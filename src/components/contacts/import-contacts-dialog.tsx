"use client";

import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Upload, FileSpreadsheet, CheckCircle2, AlertCircle } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { createContact } from "@/lib/firestore/contacts";
import { parseCsv, guessContactField, isValidEmail } from "@/lib/csv";
import type { ContactFormData, ContactSource } from "@/types/contacts";

type MappableField = "name" | "email" | "phone" | "company" | "source" | "tags";

const CONTACT_FIELDS: { value: MappableField | ""; label: string }[] = [
  { value: "", label: "— Skip column —" },
  { value: "name", label: "Name" },
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone" },
  { value: "company", label: "Company" },
  { value: "source", label: "Source" },
  { value: "tags", label: "Tags" },
];

const VALID_SOURCES: ContactSource[] = ["website", "referral", "ads", "other", ""];

interface ImportContactsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ImportContactsDialog({
  open,
  onOpenChange,
}: ImportContactsDialogProps) {
  const { user } = useAuth();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [fileName, setFileName] = useState("");
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [mapping, setMapping] = useState<Record<string, MappableField | "">>({});
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{
    created: number;
    skipped: number;
    errors: string[];
  } | null>(null);

  function reset() {
    setFileName("");
    setHeaders([]);
    setRows([]);
    setMapping({});
    setResult(null);
    setImporting(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function handleFile(file: File) {
    const text = await file.text();
    const { headers: hdrs, rows: parsed } = parseCsv(text);
    if (hdrs.length === 0 || parsed.length === 0) {
      toast.error("That file looks empty or isn't valid CSV.");
      return;
    }
    setFileName(file.name);
    setHeaders(hdrs);
    setRows(parsed);
    const next: Record<string, MappableField | ""> = {};
    for (const h of hdrs) {
      next[h] = guessContactField(h) ?? "";
    }
    setMapping(next);
    setResult(null);
  }

  const mappedCount = useMemo(
    () => Object.values(mapping).filter(Boolean).length,
    [mapping],
  );
  const hasEmailColumn = Object.values(mapping).includes("email");

  async function runImport() {
    if (!user) return;
    if (!hasEmailColumn) {
      toast.error("Map at least one column to Email before importing.");
      return;
    }
    setImporting(true);
    const errors: string[] = [];
    let created = 0;
    let skipped = 0;
    try {
      for (let idx = 0; idx < rows.length; idx++) {
        const row = rows[idx];
        const data: ContactFormData = {
          name: "",
          email: "",
          phone: "",
          company: "",
          source: "",
          tags: [],
        };
        for (const [header, field] of Object.entries(mapping)) {
          if (!field) continue;
          const value = (row[header] ?? "").trim();
          if (!value) continue;
          if (field === "tags") {
            data.tags = value
              .split(/[,;]/)
              .map((t) => t.trim())
              .filter(Boolean);
          } else if (field === "source") {
            const normalized = value.toLowerCase();
            const matched = VALID_SOURCES.find(
              (s) => s && s === normalized,
            );
            data.source = (matched ?? "other") as ContactSource;
          } else {
            data[field] = value;
          }
        }
        if (!data.email || !isValidEmail(data.email)) {
          skipped++;
          if (errors.length < 5) {
            errors.push(`Row ${idx + 2}: missing or invalid email`);
          }
          continue;
        }
        try {
          await createContact(user.uid, data);
          created++;
        } catch (err) {
          skipped++;
          if (errors.length < 5) {
            errors.push(
              `Row ${idx + 2}: ${(err as Error).message ?? "failed to save"}`,
            );
          }
        }
      }
      setResult({ created, skipped, errors });
      if (created > 0) {
        toast.success(
          `Imported ${created} contact${created === 1 ? "" : "s"}${
            skipped ? ` · ${skipped} skipped` : ""
          }`,
        );
      } else {
        toast.error("No contacts imported — check the errors below.");
      }
    } finally {
      setImporting(false);
    }
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(v) => {
        if (!v) reset();
        onOpenChange(v);
      }}
    >
      <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>Import contacts from CSV</SheetTitle>
          <SheetDescription>
            Drop a CSV export from Sheets, HubSpot, Pipedrive, or anywhere else
            — we&apos;ll auto-match the columns.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-5 p-4 pt-0">
          {headers.length === 0 ? (
            <label
              htmlFor="csv-file"
              className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed bg-muted/20 p-10 text-center transition-colors hover:border-primary/40 hover:bg-primary/5"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Upload className="h-5 w-5" />
              </div>
              <p className="text-sm font-medium">Choose a CSV file</p>
              <p className="text-xs text-muted-foreground">
                First row should be headers. Email column is required.
              </p>
              <input
                ref={inputRef}
                id="csv-file"
                type="file"
                accept=".csv,text/csv"
                className="sr-only"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFile(file);
                }}
              />
            </label>
          ) : (
            <>
              <div className="flex items-center justify-between rounded-lg border bg-muted/30 px-3 py-2">
                <div className="flex min-w-0 items-center gap-2">
                  <FileSpreadsheet className="h-4 w-4 text-primary" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{fileName}</p>
                    <p className="text-xs text-muted-foreground">
                      {rows.length} rows · {mappedCount} of {headers.length} columns mapped
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={reset}>
                  Pick another
                </Button>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Column mapping
                </Label>
                <div className="overflow-hidden rounded-lg border">
                  <table className="w-full text-sm">
                    <thead className="border-b bg-muted/40 text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                      <tr>
                        <th className="px-3 py-2 font-semibold">CSV column</th>
                        <th className="px-3 py-2 font-semibold">Preview</th>
                        <th className="px-3 py-2 font-semibold">Maps to</th>
                      </tr>
                    </thead>
                    <tbody>
                      {headers.map((h) => (
                        <tr key={h} className="border-b last:border-b-0">
                          <td className="px-3 py-2 font-medium">{h}</td>
                          <td className="px-3 py-2 text-xs text-muted-foreground">
                            {rows.slice(0, 2).map((r) => r[h]).filter(Boolean).join(" · ") ||
                              "—"}
                          </td>
                          <td className="px-3 py-2">
                            <select
                              value={mapping[h] ?? ""}
                              onChange={(e) =>
                                setMapping((prev) => ({
                                  ...prev,
                                  [h]: e.target.value as MappableField | "",
                                }))
                              }
                              className="h-7 w-full rounded-md border border-input bg-transparent px-2 text-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 dark:bg-input/30"
                            >
                              {CONTACT_FIELDS.map((f) => (
                                <option key={f.value} value={f.value}>
                                  {f.label}
                                </option>
                              ))}
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {!hasEmailColumn && (
                  <p className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
                    <AlertCircle className="h-3.5 w-3.5" />
                    Map at least one column to Email — rows without emails get
                    skipped.
                  </p>
                )}
              </div>

              {result && (
                <div className="space-y-2 rounded-lg border bg-card p-3 text-sm">
                  <p className="flex items-center gap-2 font-medium">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    Import finished · {result.created} created · {result.skipped} skipped
                  </p>
                  {result.errors.length > 0 && (
                    <ul className="ml-6 list-disc space-y-0.5 text-xs text-muted-foreground">
                      {result.errors.map((err, i) => (
                        <li key={i}>{err}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="ghost"
                  onClick={() => onOpenChange(false)}
                  disabled={importing}
                >
                  Close
                </Button>
                <Button
                  onClick={runImport}
                  disabled={importing || !hasEmailColumn}
                >
                  {importing
                    ? "Importing…"
                    : `Import ${rows.length} row${rows.length === 1 ? "" : "s"}`}
                </Button>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
