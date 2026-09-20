"use client";

import type { ComponentProps, ReactNode } from "react";
import { useId } from "react";

import { cn } from "@/lib/utils/cn";

const controlClasses =
  "w-full rounded-xl border border-border bg-surface px-3.5 text-sm text-foreground " +
  "placeholder:text-faint-foreground transition-colors " +
  "hover:border-border-strong focus:border-primary focus:outline-none " +
  "focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-primary " +
  "disabled:bg-subtle disabled:text-muted-foreground " +
  "aria-[invalid=true]:border-danger aria-[invalid=true]:focus-visible:outline-danger";

export function Label({ className, ...props }: ComponentProps<"label">) {
  return (
    <label
      className={cn("text-sm font-medium text-foreground", className)}
      {...props}
    />
  );
}

export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input className={cn(controlClasses, "h-11", className)} {...props} />;
}

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return (
    <textarea className={cn(controlClasses, "py-3", className)} {...props} />
  );
}

export function Select({ className, ...props }: ComponentProps<"select">) {
  return (
    <select
      className={cn(controlClasses, "h-11 appearance-none pr-9", className)}
      {...props}
    />
  );
}

interface FieldProps {
  label: string;
  error?: string;
  hint?: ReactNode;
  /** Receives the generated id plus the aria wiring for the error message. */
  children: (props: {
    id: string;
    "aria-invalid": boolean;
    "aria-describedby": string | undefined;
  }) => ReactNode;
  className?: string;
}

/**
 * Wires a label, control, hint and error message together. Errors are linked
 * with aria-describedby so screen readers announce them on focus.
 */
export function Field({ label, error, hint, children, className }: FieldProps) {
  const id = useId();
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;

  const describedBy =
    [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(" ") ||
    undefined;

  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={id}>{label}</Label>
      {children({ id, "aria-invalid": Boolean(error), "aria-describedby": describedBy })}
      {hint && (
        <div id={hintId} className="text-xs text-muted-foreground">
          {hint}
        </div>
      )}
      {error && (
        <p id={errorId} className="text-xs font-medium text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

/** Large tappable option used across onboarding and quizzes. */
export function ChoiceTile({
  selected,
  className,
  children,
  ...props
}: ComponentProps<"button"> & { selected?: boolean }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={cn(
        "flex w-full items-center gap-3 rounded-xl border px-4 py-3.5 text-left text-sm transition-colors",
        "hover:border-border-strong hover:bg-subtle",
        selected
          ? "border-primary bg-primary-subtle text-foreground hover:bg-primary-subtle"
          : "border-border bg-surface text-foreground",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
