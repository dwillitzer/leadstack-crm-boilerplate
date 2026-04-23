import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase/admin";
import type { FormField, LeadForm } from "@/types/forms";

type SubmitBody = {
  values: Record<string, string>;
};

function interpolate(template: string, values: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_m, key: string) => values[key] ?? "");
}

function contactFieldsFromSubmission(
  fields: FormField[],
  values: Record<string, string>,
): {
  name: string;
  email: string;
  phone: string;
  company: string;
  notes: string;
} {
  const out = { name: "", email: "", phone: "", company: "", notes: "" };
  for (const f of fields) {
    if (!f.mapsTo) continue;
    const v = (values[f.id] ?? "").toString().trim();
    if (!v) continue;
    out[f.mapsTo] = v;
  }
  return out;
}

export async function POST(
  request: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  let body: SubmitBody;
  try {
    body = (await request.json()) as SubmitBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body || typeof body.values !== "object") {
    return NextResponse.json({ error: "Missing values" }, { status: 400 });
  }

  const db = getAdminDb();
  const formRef = db.collection("forms").doc(id);
  const formSnap = await formRef.get();
  if (!formSnap.exists) {
    return NextResponse.json({ error: "Form not found" }, { status: 404 });
  }
  const form = { id: formSnap.id, ...(formSnap.data() as Omit<LeadForm, "id">) };
  if (!form.enabled) {
    return NextResponse.json({ error: "Form is paused" }, { status: 410 });
  }

  // Validate required fields
  for (const field of form.fields) {
    if (field.required) {
      const v = body.values[field.id];
      if (!v || !v.toString().trim()) {
        return NextResponse.json(
          { error: `Missing required field: ${field.label}` },
          { status: 400 },
        );
      }
    }
  }

  const mapped = contactFieldsFromSubmission(form.fields, body.values);

  // Build the combined placeholder bag for templates.
  const bag: Record<string, string> = { ...mapped };
  for (const f of form.fields) {
    bag[f.id] = body.values[f.id] ?? "";
  }

  // Create the contact.
  const contactRef = await db.collection("contacts").add({
    name: mapped.name,
    email: mapped.email,
    phone: mapped.phone,
    company: mapped.company,
    source: "website",
    tags: form.settings.autoTags ?? [],
    pipelineStage: form.settings.pipelineStageId ?? null,
    ownerId: form.ownerId,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  // Initial note from "notes"-mapped field (if present).
  if (mapped.notes) {
    await db
      .collection("contacts")
      .doc(contactRef.id)
      .collection("notes")
      .add({
        content: mapped.notes,
        createdBy: form.ownerId,
        createdAt: FieldValue.serverTimestamp(),
      });
  }

  // Optional: open a deal in the configured pipeline stage.
  let dealId: string | null = null;
  if (form.settings.createDeal) {
    const stageId = form.settings.pipelineStageId ?? "new";
    const title =
      interpolate(form.settings.dealTitleTemplate || "New lead", bag) ||
      "New lead";
    const dealRef = await db.collection("deals").add({
      title,
      value: form.settings.dealValue || 0,
      currency: form.settings.dealCurrency || "USD",
      contactId: contactRef.id,
      stageId,
      priority: "medium",
      ownerId: form.ownerId,
      lostReason: null,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      stageChangedAt: FieldValue.serverTimestamp(),
    });
    dealId = dealRef.id;
  }

  // Store submission record (admin-side only; rules deny client writes).
  await formRef.collection("submissions").add({
    formId: id,
    values: body.values,
    contactId: contactRef.id,
    dealId,
    createdAt: FieldValue.serverTimestamp(),
  });

  // Bump form submission counter.
  await formRef.update({
    submissionCount: FieldValue.increment(1),
    updatedAt: FieldValue.serverTimestamp(),
  });

  // Activity on the new contact.
  await db
    .collection("contacts")
    .doc(contactRef.id)
    .collection("activities")
    .add({
      type: "form_submitted",
      content: `Submitted form "${form.name}"`,
      createdBy: form.ownerId,
      meta: { formId: id, dealId: dealId ?? undefined },
      createdAt: FieldValue.serverTimestamp(),
    });

  return NextResponse.json({
    ok: true,
    contactId: contactRef.id,
    dealId,
    thankYouMessage: form.settings.thankYouMessage,
    redirectUrl: form.settings.redirectUrl || null,
  });
}
