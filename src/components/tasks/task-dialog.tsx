"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Trash2, Search } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { createTask, updateTask, deleteTask } from "@/lib/firestore/tasks";
import { toDate } from "@/lib/format";
import type { Task, TaskFormData } from "@/types/tasks";
import type { Contact } from "@/types/contacts";

interface TaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contacts: Contact[];
  task?: Task | null;
  defaultContactId?: string | null;
}

function toDateInput(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function toTimeInput(d: Date): string {
  const h = String(d.getHours()).padStart(2, "0");
  const m = String(d.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

export function TaskDialog({
  open,
  onOpenChange,
  contacts,
  task,
  defaultContactId,
}: TaskDialogProps) {
  const { user } = useAuth();
  const isEdit = !!task;

  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [dueTime, setDueTime] = useState("");
  const [contactId, setContactId] = useState<string | null>(null);
  const [contactSearch, setContactSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;
    if (task) {
      const d = toDate(task.dueAt);
      setTitle(task.title);
      setNotes(task.notes ?? "");
      setDueDate(d ? toDateInput(d) : "");
      setDueTime(d ? toTimeInput(d) : "");
      setContactId(task.contactId);
    } else {
      setTitle("");
      setNotes("");
      setDueDate("");
      setDueTime("");
      setContactId(defaultContactId ?? null);
    }
    setContactSearch("");
    setErrors({});
  }, [open, task, defaultContactId]);

  const filteredContacts = useMemo(() => {
    const q = contactSearch.trim().toLowerCase();
    if (!q) return contacts.slice(0, 20);
    return contacts
      .filter((c) =>
        [c.name, c.email, c.company]
          .filter(Boolean)
          .some((s) => s.toLowerCase().includes(q)),
      )
      .slice(0, 20);
  }, [contacts, contactSearch]);

  const selectedContact = contacts.find((c) => c.id === contactId) ?? null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!user) return;
    const next: Record<string, string> = {};
    if (!title.trim()) next.title = "Title is required";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    let dueAt: Date | null = null;
    if (dueDate) {
      const time = dueTime || "23:59";
      dueAt = new Date(`${dueDate}T${time}:00`);
    }

    const payload: TaskFormData = {
      title: title.trim(),
      notes: notes.trim(),
      dueAt,
      contactId,
      dealId: task?.dealId ?? null,
      eventId: task?.eventId ?? null,
    };

    setSaving(true);
    try {
      if (isEdit && task) {
        await updateTask(task.id, payload);
        toast.success("Task updated");
      } else {
        await createTask(user.uid, payload);
        toast.success("Task created");
      }
      onOpenChange(false);
    } catch (err) {
      console.error(err);
      toast.error("Couldn't save task. Try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!task) return;
    if (!confirm(`Delete task "${task.title}"?`)) return;
    setDeleting(true);
    try {
      await deleteTask(task.id);
      toast.success("Task deleted");
      onOpenChange(false);
    } catch (err) {
      console.error(err);
      toast.error("Couldn't delete task.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{isEdit ? "Edit Task" : "New Task"}</SheetTitle>
          <SheetDescription>
            {isEdit
              ? "Update this task."
              : "A follow-up, a reminder, or anything you don't want to forget."}
          </SheetDescription>
        </SheetHeader>

        <form className="space-y-4 p-4 pt-0" onSubmit={handleSubmit}>
          <div className="space-y-1.5">
            <Label htmlFor="task-title">
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="task-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Follow up with Sarah"
              aria-invalid={!!errors.title}
            />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="task-date">Due date</Label>
              <Input
                id="task-date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="task-time">Time</Label>
              <Input
                id="task-time"
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                disabled={!dueDate}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Linked contact</Label>
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
                  onClick={() => setContactId(null)}
                >
                  Change
                </Button>
              </div>
            ) : (
              <>
                <div className="relative">
                  <Search className="pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={contactSearch}
                    onChange={(e) => setContactSearch(e.target.value)}
                    placeholder="Optional — link to a contact"
                    className="pl-8"
                  />
                </div>
                {contactSearch && (
                  <div className="max-h-40 overflow-y-auto rounded-lg border">
                    {filteredContacts.length === 0 ? (
                      <p className="px-3 py-4 text-center text-xs text-muted-foreground">
                        No matches.
                      </p>
                    ) : (
                      filteredContacts.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => {
                            setContactId(c.id);
                            setContactSearch("");
                          }}
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
                )}
              </>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="task-notes">Notes</Label>
            <Textarea
              id="task-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any context, agenda, or prep."
              rows={3}
            />
          </div>

          <div className="flex items-center justify-between gap-2 pt-2">
            {isEdit ? (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={saving || deleting}
              >
                <Trash2 className="mr-1 h-3.5 w-3.5" />
                {deleting ? "Deleting…" : "Delete"}
              </Button>
            ) : (
              <span />
            )}
            <div className="flex gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Saving…" : isEdit ? "Save Changes" : "Create Task"}
              </Button>
            </div>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
