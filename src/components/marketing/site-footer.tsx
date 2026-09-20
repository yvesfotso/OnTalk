import Link from "next/link";

import { Logo } from "@/components/brand/logo";
import { APP } from "@/lib/constants/app";

const PRODUCT_LINKS = [
  { href: "/#features", label: "Features" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/register", label: "Get started" },
];

const COMPANY_LINKS = [
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: `mailto:${APP.supportEmail}`, label: "Contact" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="mt-3 max-w-xs text-sm text-muted-foreground">
              {APP.tagline} Structured lessons, vocabulary review, speaking
              practice and progress tracking, in one place.
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold tracking-wide text-faint-foreground uppercase">
              Product
            </p>
            <ul className="mt-3 space-y-2.5">
              {PRODUCT_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold tracking-wide text-faint-foreground uppercase">
              Company
            </p>
            <ul className="mt-3 space-y-2.5">
              {COMPANY_LINKS.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="mt-12 border-t border-border pt-6 text-xs text-faint-foreground">
          © {new Date().getFullYear()} {APP.name}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
