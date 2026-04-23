"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ContactForm } from "@/components/contacts/contact-form";
import { createContact } from "@/lib/firestore/contacts";
import { useAuth } from "@/hooks/use-auth";
import type { ContactFormData } from "@/types/contacts";

export function AddContactModal() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  async function handleCreate(data: ContactFormData) {
    if (!user) return;
    await createContact(user.uid, data);
    toast.success("Contact added");
    setOpen(false);
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="mr-1 h-4 w-4" />
        Add Contact
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>Add Contact</SheetTitle>
            <SheetDescription>
              Capture a new lead. They&apos;ll appear in your list instantly.
            </SheetDescription>
          </SheetHeader>
          <div className="p-4 pt-0">
            <ContactForm
              onSubmit={handleCreate}
              onCancel={() => setOpen(false)}
              submitLabel="Add Contact"
            />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
