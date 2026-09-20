import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";

import { cn } from "@/lib/utils/cn";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full font-medium whitespace-nowrap",
  {
    variants: {
      tone: {
        neutral: "bg-subtle text-muted-foreground border border-border",
        primary: "bg-primary-subtle text-primary border border-primary-border",
        success: "bg-success-subtle text-success border border-success-border",
        accent: "bg-accent-subtle text-warning border border-accent/30",
        danger: "bg-danger-subtle text-danger border border-danger-border",
      },
      size: {
        sm: "px-2 py-0.5 text-xs",
        md: "px-2.5 py-1 text-xs",
      },
    },
    defaultVariants: { tone: "neutral", size: "sm" },
  },
);

const DOT_CLASSES = {
  neutral: "bg-faint-foreground",
  primary: "bg-primary",
  success: "bg-success",
  accent: "bg-accent",
  danger: "bg-danger",
} as const;

interface BadgeProps
  extends ComponentProps<"span">,
    VariantProps<typeof badgeVariants> {
  /** Small status dot before the label, matching a "Completed / Pending" pill. */
  dot?: boolean;
}

export function Badge({ className, tone, size, dot, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ tone, size }), className)} {...props}>
      {dot && (
        <span
          className={cn("size-1.5 shrink-0 rounded-full", DOT_CLASSES[tone ?? "neutral"])}
          aria-hidden
        />
      )}
      {children}
    </span>
  );
}
