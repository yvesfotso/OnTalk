import Link from "next/link";

import { APP } from "@/lib/constants/app";
import { cn } from "@/lib/utils/cn";

/** Wordmark. The glyph is drawn inline so there is no image request. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "grid size-8 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground",
        className,
      )}
      aria-hidden
    >
      <svg viewBox="0 0 24 24" className="size-5" fill="none">
        <path
          d="M12 4c-4.4 0-8 2.9-8 6.5 0 2 1.1 3.8 2.9 5L6 20l4.2-2.2c.6.1 1.2.2 1.8.2 4.4 0 8-2.9 8-6.5S16.4 4 12 4Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <circle cx="9" cy="10.5" r="1.05" fill="currentColor" />
        <circle cx="12" cy="10.5" r="1.05" fill="currentColor" />
        <circle cx="15" cy="10.5" r="1.05" fill="currentColor" />
      </svg>
    </span>
  );
}

export function Logo({
  href = "/",
  className,
}: {
  href?: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn("inline-flex items-center gap-2.5 rounded-lg", className)}
    >
      <LogoMark />
      <span className="text-lg font-semibold tracking-tight text-foreground">
        {APP.name}
      </span>
    </Link>
  );
}
