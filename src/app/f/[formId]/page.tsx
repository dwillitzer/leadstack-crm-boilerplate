import { notFound } from "next/navigation";
import { getAdminDb } from "@/lib/firebase/admin";
import type { LeadForm } from "@/types/forms";
import { PublicForm } from "@/components/forms/public-form";

export const dynamic = "force-dynamic";

export default async function PublicFormPage({
  params,
}: {
  params: Promise<{ formId: string }>;
}) {
  const { formId } = await params;
  const db = getAdminDb();
  const snap = await db.collection("forms").doc(formId).get();
  if (!snap.exists) notFound();
  const data = snap.data() as Omit<LeadForm, "id">;
  const form: LeadForm = { id: snap.id, ...data };

  if (!form.enabled) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30 p-6">
        <div className="w-full max-w-md rounded-2xl border bg-card p-8 text-center">
          <h1 className="text-xl font-semibold">This form is paused</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Please check back later.
          </p>
        </div>
      </div>
    );
  }

  // Serialize to a plain object (Firestore Timestamps can't cross server/client).
  const safe: LeadForm = {
    ...form,
    createdAt: null,
    updatedAt: null,
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-500/5 via-violet-500/5 to-pink-500/5 p-4 sm:p-6">
      <div className="w-full max-w-lg">
        <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
          <span className="inline-block h-4 w-4 rounded-sm bg-gradient-to-br from-indigo-500 via-violet-500 to-pink-500" />
          <span className="font-medium text-foreground">LeadStack</span>
        </div>
        <div className="rounded-2xl border bg-card p-6 shadow-sm sm:p-8">
          <h1 className="text-2xl font-semibold tracking-tight">{form.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Fill this out and we&apos;ll be in touch shortly.
          </p>
          <div className="mt-6">
            <PublicForm form={safe} />
          </div>
        </div>
        <p className="mt-4 text-center text-[11px] text-muted-foreground">
          Powered by LeadStack
        </p>
      </div>
    </div>
  );
}
