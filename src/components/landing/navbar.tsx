"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";

export function Navbar() {
  const { user, loading } = useAuth();
  const [open, setOpen] = useState(false);

  const navItems = (
    <>
      <a
        href="#features"
        className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        Features
      </a>
      <a
        href="#how-it-works"
        className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        How it works
      </a>
      <a
        href="#pricing"
        className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        Pricing
      </a>
      {!loading && (
        <>
          {user ? (
            <Button render={<Link href="/dashboard" />} size="sm">
              Dashboard
            </Button>
          ) : (
            <>
              <Button render={<Link href="/login" />} variant="ghost" size="sm">
                Login
              </Button>
              <Button render={<Link href="/signup" />} size="sm">
                Sign Up
              </Button>
            </>
          )}
        </>
      )}
    </>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold">
          <span className="inline-block h-6 w-6 rounded-md bg-gradient-to-br from-indigo-500 via-violet-500 to-pink-500" />
          LeadStack
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-4 md:flex">
          <ThemeToggle />
          {navItems}
        </nav>

        {/* Mobile nav */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetContent side="right">
            <SheetHeader>
              <SheetTitle>Menu</SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col gap-4 p-4">
              <SheetClose
                render={<a href="#pricing" />}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Pricing
              </SheetClose>
              {!loading && (
                <>
                  {user ? (
                    <SheetClose render={<span />}>
                      <Button render={<Link href="/dashboard" />} className="w-full" size="sm">
                        Dashboard
                      </Button>
                    </SheetClose>
                  ) : (
                    <>
                      <SheetClose render={<span />}>
                        <Button
                          render={<Link href="/login" />}
                          variant="ghost"
                          className="w-full"
                          size="sm"
                        >
                          Login
                        </Button>
                      </SheetClose>
                      <SheetClose render={<span />}>
                        <Button render={<Link href="/signup" />} className="w-full" size="sm">
                          Sign Up
                        </Button>
                      </SheetClose>
                    </>
                  )}
                </>
              )}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
