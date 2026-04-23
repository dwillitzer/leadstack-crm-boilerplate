"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { updateProfile } from "firebase/auth";
import {
  User as UserIcon,
  Mail,
  CreditCard,
  Download,
  LogOut,
  Sparkles,
  Shield,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { getFirebaseAuth } from "@/lib/firebase/client";
import { signOutUser } from "@/lib/firebase/auth";
import { getUserDoc, updateUserDoc } from "@/lib/firestore/users";
import { subscribeToContacts } from "@/lib/firestore/contacts";
import { serializeCsv, downloadCsv } from "@/lib/csv";
import { toDate } from "@/lib/format";
import { createBillingPortalSession } from "@/lib/stripe/portal";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { UserDoc, SubscriptionStatus } from "@/types";
import type { Contact } from "@/types/contacts";

const PLAN_LABEL: Record<SubscriptionStatus, { label: string; tone: string }> =
  {
    active: {
      label: "Pro · Active",
      tone: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    },
    trialing: {
      label: "Pro · Trial",
      tone: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
    },
    past_due: {
      label: "Pro · Past due",
      tone: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
    },
    canceled: {
      label: "Canceled",
      tone: "bg-rose-500/10 text-rose-700 dark:text-rose-400",
    },
    inactive: {
      label: "Free plan",
      tone: "bg-muted text-muted-foreground",
    },
  };

export default function SettingsPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserDoc | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [openingPortal, setOpeningPortal] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([]);

  useEffect(() => {
    if (!user) return;
    setDisplayName(user.displayName ?? "");
    getUserDoc(user.uid).then((d) => setProfile(d));
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToContacts(user.uid, setContacts);
    return () => unsub();
  }, [user]);

  async function handleProfileSave(e: FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSavingProfile(true);
    try {
      const trimmed = displayName.trim();
      await updateProfile(getFirebaseAuth().currentUser!, {
        displayName: trimmed,
      });
      await updateUserDoc(user.uid, { displayName: trimmed });
      toast.success("Profile updated");
      setProfile((p) => (p ? { ...p, displayName: trimmed } : p));
    } catch (err) {
      console.error(err);
      toast.error("Couldn't update profile.");
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleOpenPortal() {
    if (!profile?.stripeCustomerId) {
      toast.error("No billing account yet — subscribe to a paid plan first.");
      return;
    }
    setOpeningPortal(true);
    try {
      const url = await createBillingPortalSession(profile.stripeCustomerId);
      if (url) window.location.href = url;
    } catch (err) {
      console.error(err);
      toast.error("Couldn't open billing portal.");
    } finally {
      setOpeningPortal(false);
    }
  }

  function handleExportContacts() {
    if (contacts.length === 0) {
      toast.error("No contacts to export yet.");
      return;
    }
    const headers = [
      "name",
      "email",
      "phone",
      "company",
      "source",
      "tags",
      "pipelineStage",
      "createdAt",
    ];
    const rows = contacts.map((c) => ({
      name: c.name,
      email: c.email,
      phone: c.phone,
      company: c.company,
      source: c.source,
      tags: c.tags ?? [],
      pipelineStage: c.pipelineStage ?? "",
      createdAt: toDate(c.createdAt)?.toISOString() ?? "",
    }));
    const csv = serializeCsv(headers, rows);
    const stamp = new Date().toISOString().slice(0, 10);
    downloadCsv(`leadstack-contacts-${stamp}.csv`, csv);
    toast.success(`Exported ${rows.length} contacts`);
  }

  async function handleSignOut() {
    await signOutUser();
    window.location.href = "/";
  }

  const plan = profile?.subscriptionStatus
    ? PLAN_LABEL[profile.subscriptionStatus]
    : PLAN_LABEL.inactive;

  const initials = (user?.displayName || user?.email || "U")
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your profile, subscription, and workspace data.
        </p>
      </div>

      {/* Profile */}
      <section className="rounded-2xl border bg-card p-5">
        <div className="mb-4 flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            <UserIcon className="h-4 w-4" />
          </span>
          <div>
            <h2 className="text-sm font-semibold">Profile</h2>
            <p className="text-xs text-muted-foreground">
              How you appear across LeadStack.
            </p>
          </div>
        </div>

        <form onSubmit={handleProfileSave} className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14">
              <AvatarImage
                src={user?.photoURL ?? undefined}
                alt={user?.displayName ?? "User"}
              />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1.5">
              <Label htmlFor="displayName">Display name</Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Jane Doe"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                value={user?.email ?? ""}
                disabled
                className="cursor-not-allowed pl-8 text-muted-foreground"
              />
            </div>
            <p className="text-[11px] text-muted-foreground">
              Email changes require re-auth and aren&apos;t supported in this MVP.
            </p>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={savingProfile}>
              {savingProfile ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </form>
      </section>

      {/* Appearance */}
      <section className="rounded-2xl border bg-card p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400">
              <Sparkles className="h-4 w-4" />
            </span>
            <div>
              <h2 className="text-sm font-semibold">Appearance</h2>
              <p className="text-xs text-muted-foreground">
                Light, dark, or system.
              </p>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </section>

      {/* Subscription */}
      <section className="rounded-2xl border bg-card p-5">
        <div className="mb-4 flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <CreditCard className="h-4 w-4" />
          </span>
          <div>
            <h2 className="text-sm font-semibold">Subscription</h2>
            <p className="text-xs text-muted-foreground">
              Your plan and billing.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-background p-4">
          <div className="flex items-center gap-3">
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-medium ${plan.tone}`}
            >
              {plan.label}
            </span>
            {profile?.subscriptionPriceId && (
              <span className="text-xs text-muted-foreground">
                Plan ID: {profile.subscriptionPriceId.slice(0, 14)}…
              </span>
            )}
          </div>
          <div className="flex gap-2">
            {profile?.stripeCustomerId ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenPortal}
                disabled={openingPortal}
              >
                {openingPortal ? "Opening…" : "Manage subscription"}
              </Button>
            ) : (
              <Button size="sm" render={<Link href="/#pricing" />}>
                See plans
              </Button>
            )}
          </div>
        </div>
        <p className="mt-2 text-[11px] text-muted-foreground">
          Subscriptions are managed through Stripe. You can change plan, update
          card, or cancel from the billing portal.
        </p>
      </section>

      {/* Data */}
      <section className="rounded-2xl border bg-card p-5">
        <div className="mb-4 flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <Download className="h-4 w-4" />
          </span>
          <div>
            <h2 className="text-sm font-semibold">Data</h2>
            <p className="text-xs text-muted-foreground">
              Take your data with you, any time.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-background p-4">
          <div>
            <p className="text-sm font-medium">Export contacts</p>
            <p className="text-xs text-muted-foreground">
              {contacts.length} contact{contacts.length === 1 ? "" : "s"} ·
              CSV with tags, source, and timestamps
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportContacts}
            disabled={contacts.length === 0}
          >
            <Download className="mr-1 h-3.5 w-3.5" />
            Download CSV
          </Button>
        </div>
      </section>

      {/* Security / account */}
      <section className="rounded-2xl border bg-card p-5">
        <div className="mb-4 flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400">
            <Shield className="h-4 w-4" />
          </span>
          <div>
            <h2 className="text-sm font-semibold">Account</h2>
            <p className="text-xs text-muted-foreground">
              Sign out or get support.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-background p-4">
          <div>
            <p className="text-sm font-medium">Sign out of LeadStack</p>
            <p className="text-xs text-muted-foreground">
              Ends this session on this device.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={handleSignOut}>
            <LogOut className="mr-1 h-3.5 w-3.5" />
            Sign out
          </Button>
        </div>
      </section>
    </div>
  );
}
