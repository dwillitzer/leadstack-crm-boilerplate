"use client";

import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import { toast } from "sonner";
import { Trash2, Search, MapPin, StickyNote } from "lucide-react";
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
import { createEvent, updateEvent, deleteEvent } from "@/lib/firestore/events";
import { toDate } from "@/lib/format";
import type { CalendarEvent, EventFormData } from "@/types/events";
import type { Contact } from "@/types/contacts";

interface EventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contacts: Contact[];
  event?: CalendarEvent | null;
  defaultDate?: Date | null;
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

function fromInputs(date: string, time: string): Date {
  return new Date(`${date}T${time}:00`);
}

function roundedNowHour(): Date {
  const d = new Date();
  d.setMinutes(0, 0, 0);
  d.setHours(d.getHours() + 1);
  return d;
}

export function EventDialog({
  open,
  onOpenChange,
  contacts,
  event,
  defaultDate,
}: EventDialogProps) {
  const { user } = useAuth();
  const isEdit = !!event;

  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [contactId, setContactId] = useState<string | null>(null);
  const [contactSearch, setContactSearch] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;
    if (event) {
      const start = toDate(event.startAt) ?? new Date();
      const end = toDate(event.endAt) ?? new Date(start.getTime() + 30 * 60000);
      setTitle(event.title);
      setDate(toDateInput(start));
      setStartTime(toTimeInput(start));
      setEndTime(toTimeInput(end));
      setContactId(event.contactId);
      setLocation(event.location ?? "");
      setNotes(event.notes ?? "");
    } else {
      const start = defaultDate
        ? (() => {
            const d = new Date(defaultDate);
            const rounded = roundedNowHour();
            d.setHours(rounded.getHours(), 0, 0, 0);
            return d;
          })()
        : roundedNowHour();
      const end = new Date(start.getTime() + 30 * 60000);
      setTitle("");
      setDate(toDateInput(start));
      setStartTime(toTimeInput(start));
      setEndTime(toTimeInput(end));
      setContactId(null);
      setLocation("");
      setNotes("");
    }
    setContactSearch("");
    setErrors({});
  }, [open, event, defaultDate]);

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
    if (!date) next.date = "Date is required";
    if (!startTime) next.startTime = "Start time is required";
    if (!endTime) next.endTime = "End time is required";
    const startDt = date && startTime ? fromInputs(date, startTime) : null;
    const endDt = date && endTime ? fromInputs(date, endTime) : null;
    if (startDt && endDt && endDt.getTime() <= startDt.getTime()) {
      next.endTime = "End must be after start";
    }
    setErrors(next);
    if (Object.keys(next).length > 0 || !startDt || !endDt) return;

    const payload: EventFormData = {
      title: title.trim(),
      startAt: startDt,
      endAt: endDt,
      contactId: contactId || null,
      location: location.trim(),
      notes: notes.trim(),
    };

    setSaving(true);
    try {
      if (isEdit && event) {
        await updateEvent(event.id, payload);
        toast.success("Event updated");
      } else {
        await createEvent(user.uid, payload);
        toast.success("Event created");
      }
      onOpenChange(false);
    } catch (err) {
      console.error(err);
      toast.error("Couldn't save event. Try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!event) return;
    if (!confirm(`Delete "${event.title}"?`)) return;
    setDeleting(true);
    try {
      await deleteEvent(event.id);
      toast.success("Event deleted");
      onOpenChange(false);
    } catch (err) {
      console.error(err);
      toast.error("Couldn't delete event.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{isEdit ? "Edit Event" : "New Event"}</SheetTitle>
          <SheetDescription>
            {isEdit
              ? "Update this event on your calendar."
              : "Add a meeting, call, or any calendar event."}
          </SheetDescription>
        </SheetHeader>

        <form className="space-y-4 p-4 pt-0" onSubmit={handleSubmit}>
          <div className="space-y-1.5">
            <Label htmlFor="ev-title">
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="ev-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Demo with Sarah"
              aria-invalid={!!errors.title}
            />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ev-date">
              Date <span className="text-destructive">*</span>
            </Label>
            <Input
              id="ev-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              aria-invalid={!!errors.date}
            />
            {errors.date && (
              <p className="text-xs text-destructive">{errors.date}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="ev-start">
                Start <span className="text-destructive">*</span>
              </Label>
              <Input
                id="ev-start"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                aria-invalid={!!errors.startTime}
              />
              {errors.startTime && (
                <p className="text-xs text-destructive">{errors.startTime}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ev-end">
                End <span className="text-destructive">*</span>
              </Label>
              <Input
                id="ev-end"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                aria-invalid={!!errors.endTime}
              />
              {errors.endTime && (
                <p className="text-xs text-destructive">{errors.endTime}</p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Contact</Label>
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
                    placeholder="Optional — search contacts"
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
            <Label htmlFor="ev-location">
              <MapPin className="mr-1 inline h-3.5 w-3.5" />
              Location
            </Label>
            <Input
              id="ev-location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Zoom, meeting room, phone…"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ev-notes">
              <StickyNote className="mr-1 inline h-3.5 w-3.5" />
              Notes
            </Label>
            <Textarea
              id="ev-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Agenda, prep, reminders…"
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
                {saving ? "Saving…" : isEdit ? "Save Changes" : "Create Event"}
              </Button>
            </div>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
