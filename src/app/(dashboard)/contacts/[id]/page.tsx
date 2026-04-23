"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { UserX } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { subscribeToContact } from "@/lib/firestore/contacts";
import { Button } from "@/components/ui/button";
import { ContactProfileHeader } from "@/components/contacts/contact-profile-header";
import { ContactDeals } from "@/components/contacts/contact-deals";
import { ContactTasks } from "@/components/contacts/contact-tasks";
import { ActivityTimeline } from "@/components/contacts/activity-timeline";
import { AddNoteInput } from "@/components/contacts/add-note-input";
import type { Contact } from "@/types/contacts";

export default function ContactProfilePage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const { user, loading: authLoading } = useAuth();
  const [contact, setContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading || !user || !id) return;
    setLoading(true);
    const unsub = subscribeToContact(id, (c) => {
      setContact(c);
      setLoading(false);
    });
    return () => unsub();
  }, [id, user, authLoading]);

  if (loading) {
    return <ProfileSkeleton />;
  }

  if (!contact) {
    return <NotFound />;
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
      <div className="space-y-6">
        <ContactProfileHeader contact={contact} />
        <ContactDeals contact={contact} />
        <ContactTasks contact={contact} />
      </div>

      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Activity</h2>
          <p className="text-sm text-muted-foreground">
            Notes and pipeline events for this contact.
          </p>
        </div>
        <AddNoteInput contactId={contact.id} />
        <ActivityTimeline contactId={contact.id} />
      </div>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
      <div className="space-y-4">
        <div className="h-4 w-24 animate-pulse rounded bg-muted" />
        <div className="h-8 w-64 animate-pulse rounded bg-muted" />
        <div className="h-40 w-full animate-pulse rounded-xl bg-muted" />
      </div>
      <div className="space-y-4">
        <div className="h-32 w-full animate-pulse rounded-xl bg-muted" />
        <div className="h-24 w-full animate-pulse rounded-xl bg-muted" />
      </div>
    </div>
  );
}

function NotFound() {
  return (
    <div className="mx-auto max-w-md rounded-xl border border-dashed bg-card/50 p-12 text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        <UserX className="h-6 w-6 text-muted-foreground" />
      </div>
      <h2 className="text-lg font-semibold">Contact not found</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        This contact may have been deleted or you don&apos;t have access.
      </p>
      <Button render={<Link href="/contacts" />} className="mt-6">
        Back to contacts
      </Button>
    </div>
  );
}
