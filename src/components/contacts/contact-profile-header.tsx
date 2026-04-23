"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Mail,
  Phone,
  Building2,
  Pencil,
  Tag,
  ArrowLeft,
  CircleDot,
  MessageSquare,
} from "lucide-react";
import Link from "next/link";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SourceBadge } from "@/components/contacts/source-badge";
import { ContactForm } from "@/components/contacts/contact-form";
import { SendEmailDialog } from "@/components/contacts/send-email-dialog";
import { SendSmsDialog } from "@/components/contacts/send-sms-dialog";
import { updateContact } from "@/lib/firestore/contacts";
import { formatContactDate } from "@/lib/format";
import type { Contact, ContactFormData } from "@/types/contacts";

export function ContactProfileHeader({ contact }: { contact: Contact }) {
  const [editing, setEditing] = useState(false);
  const [emailOpen, setEmailOpen] = useState(false);
  const [smsOpen, setSmsOpen] = useState(false);

  async function handleSave(data: ContactFormData) {
    await updateContact(contact.id, data);
    toast.success("Contact updated");
    setEditing(false);
  }

  return (
    <>
      <div className="space-y-6">
        <Link
          href="/contacts"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to contacts
        </Link>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-2xl font-bold tracking-tight sm:text-3xl">
              {contact.name || "Unnamed contact"}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Added {formatContactDate(contact.createdAt)}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEmailOpen(true)}
              disabled={!contact.email}
              title={!contact.email ? "No email on this contact" : "Send email"}
            >
              <Mail className="mr-1 h-3.5 w-3.5" />
              Email
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSmsOpen(true)}
              disabled={!contact.phone}
              title={!contact.phone ? "No phone on this contact" : "Send SMS"}
            >
              <MessageSquare className="mr-1 h-3.5 w-3.5" />
              SMS
            </Button>
            <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
              <Pencil className="mr-1 h-3.5 w-3.5" />
              Edit
            </Button>
          </div>
        </div>

        <dl className="space-y-3 rounded-xl border bg-card p-4 text-sm">
          {contact.email && (
            <Row icon={<Mail className="h-4 w-4 text-muted-foreground" />} label="Email">
              <a
                href={`mailto:${contact.email}`}
                className="text-foreground hover:text-primary hover:underline"
              >
                {contact.email}
              </a>
            </Row>
          )}
          {contact.phone && (
            <Row icon={<Phone className="h-4 w-4 text-muted-foreground" />} label="Phone">
              <a
                href={`tel:${contact.phone}`}
                className="text-foreground hover:text-primary hover:underline"
              >
                {contact.phone}
              </a>
            </Row>
          )}
          {contact.company && (
            <Row
              icon={<Building2 className="h-4 w-4 text-muted-foreground" />}
              label="Company"
            >
              <span className="text-foreground">{contact.company}</span>
            </Row>
          )}
          <Row
            icon={<CircleDot className="h-4 w-4 text-muted-foreground" />}
            label="Source"
          >
            <SourceBadge source={contact.source} />
          </Row>
          <Row
            icon={<Tag className="h-4 w-4 text-muted-foreground" />}
            label="Tags"
          >
            {contact.tags && contact.tags.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {contact.tags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            ) : (
              <span className="text-xs text-muted-foreground">No tags</span>
            )}
          </Row>
        </dl>

      </div>

      <Sheet open={editing} onOpenChange={setEditing}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>Edit Contact</SheetTitle>
            <SheetDescription>
              Update {contact.name || "this contact"}&apos;s details.
            </SheetDescription>
          </SheetHeader>
          <div className="p-4 pt-0">
            <ContactForm
              initial={contact}
              submitLabel="Save Changes"
              onSubmit={handleSave}
              onCancel={() => setEditing(false)}
            />
          </div>
        </SheetContent>
      </Sheet>

      <SendEmailDialog
        contact={contact}
        open={emailOpen}
        onOpenChange={setEmailOpen}
      />
      <SendSmsDialog
        contact={contact}
        open={smsOpen}
        onOpenChange={setSmsOpen}
      />
    </>
  );
}

function Row({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5">{icon}</div>
      <div className="min-w-0 flex-1">
        <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </dt>
        <dd className="mt-0.5 min-w-0 break-words">{children}</dd>
      </div>
    </div>
  );
}
