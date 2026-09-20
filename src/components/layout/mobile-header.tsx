"use client";

import { Flame, Menu, X, Zap } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { Logo } from "@/components/brand/logo";
import { SignOutButton } from "@/components/layout/sign-out-button";
import { PRIMARY_NAV, SECONDARY_NAV } from "@/lib/constants/nav";
import { cn } from "@/lib/utils/cn";

interface MobileHeaderProps {
  displayName: string;
  xp: number;
  streak: number;
}

export function MobileHeader({ displayName, xp, streak }: MobileHeaderProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close the sheet whenever the route changes. Adjusting state during render
  // (rather than in an effect) avoids an extra commit-then-rerender pass.
  const [lastPathname, setLastPathname] = useState(pathname);
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setOpen(false);
  }

  return (
    <>
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-surface/95 px-4 backdrop-blur-sm lg:hidden">
        <Logo href="/app/dashboard" />

        <div className="flex items-center gap-3">
          <p className="flex items-center gap-2.5 text-xs font-medium text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Zap className="size-3.5 text-accent" aria-hidden />
              <span className="tabular-nums">{xp}</span>
              <span className="sr-only">XP</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <Flame className="size-3.5 text-accent" aria-hidden />
              <span className="tabular-nums">{streak}</span>
              <span className="sr-only">day streak</span>
            </span>
          </p>

          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            className="grid size-9 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-subtle hover:text-foreground"
          >
            {open ? (
              <X className="size-5" aria-hidden />
            ) : (
              <Menu className="size-5" aria-hidden />
            )}
          </button>
        </div>
      </header>

      {open && (
        <div className="lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="fixed inset-0 top-14 z-20 bg-slate-900/30"
          />
          <div
            id="mobile-menu"
            className="fixed inset-x-0 top-14 z-30 max-h-[70vh] overflow-y-auto border-b border-border bg-surface p-3 shadow-pop animate-rise"
          >
            <p className="px-3 py-2 text-xs font-semibold tracking-wide text-faint-foreground uppercase">
              Signed in as {displayName}
            </p>
            <ul className="space-y-1">
              {[...PRIMARY_NAV, ...SECONDARY_NAV].map((item) => {
                const active =
                  pathname === item.href || pathname.startsWith(`${item.href}/`);
                const Icon = item.icon;

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors",
                        active
                          ? "bg-primary-subtle text-primary"
                          : "text-muted-foreground hover:bg-subtle hover:text-foreground",
                      )}
                    >
                      <Icon className="size-[18px]" aria-hidden />
                      <span className="min-w-0 flex-1 truncate">{item.label}</span>
                      {item.comingSoon && (
                        <span className="shrink-0 rounded-full bg-primary-subtle px-2 py-0.5 text-[10px] font-semibold tracking-wide text-primary uppercase">
                          Soon
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
            <div className="mt-1 border-t border-border pt-1">
              <SignOutButton className="py-3" />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
