import Link from "next/link";

import { Logo } from "@/components/brand/logo";
import { APP } from "@/lib/constants/app";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <Logo />
          <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <Link href="/privacy" className="text-muted-foreground hover:text-foreground">
              Privacy
            </Link>
            <Link href="/terms" className="text-muted-foreground hover:text-foreground">
              Terms
            </Link>
            <a
              href={`mailto:${APP.supportEmail}`}
              className="text-muted-foreground hover:text-foreground"
            >
              Contact
            </a>
          </nav>
        </div>
        <p className="mt-6 text-xs text-faint-foreground">
          © {new Date().getFullYear()} {APP.name}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
