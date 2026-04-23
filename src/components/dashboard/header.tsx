"use client";

import { useRouter, usePathname } from "next/navigation";
import { Menu, LogOut, User, CreditCard, Search } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { signOutUser } from "@/lib/firebase/auth";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  onMenuClick: () => void;
  onOpenSearch?: () => void;
}

const TITLES: Array<[RegExp, string]> = [
  [/^\/dashboard\/settings/, "Settings"],
  [/^\/dashboard$/, "Dashboard"],
  [/^\/contacts\/[^/]+/, "Contact"],
  [/^\/contacts/, "Contacts"],
  [/^\/pipeline/, "Pipeline"],
  [/^\/calendar/, "Calendar"],
  [/^\/tasks/, "Tasks"],
  [/^\/forms\/[^/]+/, "Form builder"],
  [/^\/forms/, "Forms"],
  [/^\/reports/, "Reports"],
];

function titleFor(pathname: string): string {
  for (const [re, label] of TITLES) {
    if (re.test(pathname)) return label;
  }
  return "LeadStack";
}

export function Header({ onMenuClick, onOpenSearch }: HeaderProps) {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const title = titleFor(pathname);
  const isMac =
    typeof navigator !== "undefined" && /Mac/.test(navigator.platform);

  async function handleSignOut() {
    await signOutUser();
    router.push("/");
  }

  const initials = user?.displayName
    ? user.displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : user?.email?.[0]?.toUpperCase() ?? "U";

  return (
    <header className="flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={onMenuClick}
        aria-label="Open sidebar"
      >
        <Menu className="h-5 w-5" />
      </Button>

      <h1 className="text-lg font-semibold">{title}</h1>

      <button
        type="button"
        onClick={onOpenSearch}
        className="ml-6 hidden h-9 flex-1 max-w-md items-center gap-2 rounded-lg border bg-muted/40 px-3 text-sm text-muted-foreground transition-colors hover:bg-muted sm:flex"
      >
        <Search className="h-4 w-4 shrink-0" />
        <span className="flex-1 text-left">Search everything…</span>
        <kbd className="rounded border bg-background px-1.5 py-0.5 text-[10px] font-medium">
          {isMac ? "⌘" : "Ctrl"} K
        </kbd>
      </button>

      <div className="ml-auto flex items-center gap-2 sm:ml-0">
        <Button
          variant="ghost"
          size="icon"
          className="sm:hidden"
          onClick={onOpenSearch}
          aria-label="Search"
        >
          <Search className="h-4 w-4" />
        </Button>
        <ThemeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="ghost" className="relative h-9 w-9 rounded-full" />}>
              <Avatar className="h-9 w-9">
                <AvatarImage
                  src={user?.photoURL ?? undefined}
                  alt={user?.displayName ?? "User"}
                />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium">
                {user?.displayName ?? "User"}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {user?.email}
              </p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem>
              <CreditCard className="mr-2 h-4 w-4" />
              Billing
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
