import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-colors " +
    "disabled:pointer-events-none disabled:opacity-50 " +
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-primary-foreground hover:bg-primary-hover shadow-card",
        secondary:
          "bg-surface text-foreground border border-border hover:bg-subtle",
        ghost: "text-muted-foreground hover:bg-subtle hover:text-foreground",
        subtle: "bg-primary-subtle text-primary hover:bg-primary-border/60",
        dark: "bg-dark text-dark-foreground hover:bg-dark-subtle",
        danger: "bg-danger text-white hover:bg-danger/90",
      },
      size: {
        sm: "h-9 px-4 text-sm",
        md: "h-11 px-5 text-sm",
        lg: "h-13 px-7 text-base",
        icon: "h-10 w-10",
      },
      block: { true: "w-full", false: "" },
    },
    defaultVariants: { variant: "primary", size: "md", block: false },
  },
);

type Variants = VariantProps<typeof buttonVariants>;

interface ButtonProps extends ComponentProps<"button">, Variants {
  loading?: boolean;
  /** Announced while `loading` is true. */
  loadingText?: string;
}

export function Button({
  className,
  variant,
  size,
  block,
  loading = false,
  loadingText,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size, block }), className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && <Loader2 className="size-4 animate-spin" aria-hidden />}
      {loading && loadingText ? loadingText : children}
    </button>
  );
}

interface ButtonLinkProps extends ComponentProps<typeof Link>, Variants {
  children: ReactNode;
}

export function ButtonLink({
  className,
  variant,
  size,
  block,
  children,
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      className={cn(buttonVariants({ variant, size, block }), className)}
      {...props}
    >
      {children}
    </Link>
  );
}

export { buttonVariants };
