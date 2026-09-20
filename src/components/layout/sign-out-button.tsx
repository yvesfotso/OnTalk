"use client";

import { LogOut } from "lucide-react";
import { useTransition } from "react";

import { signOutAction } from "@/features/auth/actions";
import { cn } from "@/lib/utils/cn";

export function SignOutButton({ className }: { className?: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => startTransition(() => signOutAction())}
      className={cn(
        "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-subtle hover:text-foreground disabled:opacity-60",
        className,
      )}
    >
      <LogOut className="size-[18px] shrink-0" aria-hidden />
      {pending ? "Signing out…" : "Sign out"}
    </button>
  );
}
