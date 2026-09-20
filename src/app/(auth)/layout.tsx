import Link from "next/link";
import type { ReactNode } from "react";

import { Logo } from "@/components/brand/logo";
import { APP } from "@/lib/constants/app";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-subtle">
      <header className="px-4 py-5 sm:px-6">
        <Logo />
      </header>

      <main
        id="main"
        className="flex flex-1 items-center justify-center px-4 py-6 sm:px-6"
      >
        <div className="w-full max-w-md">{children}</div>
      </main>

      <footer className="px-4 py-6 text-center text-xs text-muted-foreground sm:px-6">
        <nav aria-label="Legal" className="flex justify-center gap-4">
          <Link href="/privacy" className="hover:text-foreground">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-foreground">
            Terms
          </Link>
        </nav>
        <p className="mt-2">
          © {new Date().getFullYear()} {APP.name}
        </p>
      </footer>
    </div>
  );
}
