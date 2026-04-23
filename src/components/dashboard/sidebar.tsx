"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Users,
  GitBranch,
  Calendar,
  CheckSquare,
  FileText,
  BarChart3,
  Settings,
  LogOut,
} from "lucide-react";
import { signOutUser } from "@/lib/firebase/auth";
import { useDueTodayCount } from "@/hooks/use-due-today";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: Home, enabled: true },
  { href: "/contacts", label: "Contacts", icon: Users, enabled: true },
  { href: "/pipeline", label: "Pipeline", icon: GitBranch, enabled: true },
  { href: "/calendar", label: "Calendar", icon: Calendar, enabled: true },
  {
    href: "/tasks",
    label: "Tasks",
    icon: CheckSquare,
    enabled: true,
    badgeKey: "dueToday" as const,
  },
  { href: "/forms", label: "Forms", icon: FileText, enabled: true },
  { href: "/reports", label: "Reports", icon: BarChart3, enabled: true },
  { href: "/dashboard/settings", label: "Settings", icon: Settings, enabled: true },
];

interface SidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function SidebarContent() {
  const pathname = usePathname();
  const dueToday = useDueTodayCount();

  return (
    <div className="flex h-full flex-col">
      <div className="border-b px-6 py-4">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold">
          <span className="inline-block h-5 w-5 rounded-md bg-gradient-to-br from-indigo-500 via-violet-500 to-pink-500" />
          LeadStack
        </Link>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          if (!item.enabled) {
            return (
              <div
                key={item.href}
                className="flex cursor-not-allowed items-center justify-between gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground/50"
                title="Coming soon"
              >
                <span className="flex items-center gap-3">
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </span>
                <span className="rounded-full border px-1.5 text-[10px] uppercase tracking-wide">
                  Soon
                </span>
              </div>
            );
          }
          const badge =
            item.badgeKey === "dueToday" && dueToday > 0 ? dueToday : null;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center justify-between gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <span className="flex items-center gap-3">
                <item.icon className="h-4 w-4" />
                {item.label}
              </span>
              {badge !== null && (
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "bg-amber-500/15 text-amber-600 dark:text-amber-400",
                  )}
                >
                  {badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-4">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3"
          onClick={() => signOutUser()}
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}

export function Sidebar({ open, onOpenChange }: SidebarProps) {
  return (
    <>
      <aside className="hidden w-64 shrink-0 border-r bg-background md:block">
        <SidebarContent />
      </aside>

      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="left" className="w-64 p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation</SheetTitle>
          </SheetHeader>
          <SidebarContent />
        </SheetContent>
      </Sheet>
    </>
  );
}
