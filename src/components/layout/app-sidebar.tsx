"use client";

import { Flame, Zap } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Logo } from "@/components/brand/logo";
import { SignOutButton } from "@/components/layout/sign-out-button";
import { PRIMARY_NAV, SECONDARY_NAV, type NavItem } from "@/lib/constants/nav";
import { cn } from "@/lib/utils/cn";

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex items-center gap-3 rounded-full px-4 py-2.5 text-sm font-medium transition-colors",
        active
          ? "bg-dark text-dark-foreground shadow-card"
          : "text-muted-foreground hover:bg-subtle hover:text-foreground",
      )}
    >
      <Icon className="size-[18px] shrink-0" aria-hidden />
      {item.label}
    </Link>
  );
}

interface AppSidebarProps {
  displayName: string;
  xp: number;
  streak: number;
}

export function AppSidebar({ displayName, xp, streak }: AppSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-4 left-4 hidden w-64 flex-col rounded-[2rem] border border-border/60 bg-surface shadow-card lg:flex">
      <div className="px-5 py-5">
        <Logo href="/app/dashboard" />
      </div>

      <nav aria-label="Main" className="flex-1 space-y-1 overflow-y-auto px-3">
        {PRIMARY_NAV.map((item) => (
          <NavLink key={item.href} item={item} active={isActive(pathname, item.href)} />
        ))}
      </nav>

      <div className="space-y-1 border-t border-border px-3 py-3">
        <div className="mb-2 flex items-center gap-3 rounded-2xl bg-subtle px-3 py-2.5">
          <span
            className="grid size-9 shrink-0 place-items-center rounded-full bg-primary text-sm font-semibold text-primary-foreground"
            aria-hidden
          >
            {displayName.charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">
              {displayName}
            </p>
            <p className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Zap className="size-3 text-primary" aria-hidden />
                <span className="tabular-nums">{xp}</span>
                <span className="sr-only">XP</span>
              </span>
              <span className="inline-flex items-center gap-1">
                <Flame className="size-3 text-primary" aria-hidden />
                <span className="tabular-nums">{streak}</span>
                <span className="sr-only">day streak</span>
              </span>
            </p>
          </div>
        </div>

        {SECONDARY_NAV.map((item) => (
          <NavLink key={item.href} item={item} active={isActive(pathname, item.href)} />
        ))}
        <SignOutButton className="rounded-full" />
      </div>
    </aside>
  );
}
