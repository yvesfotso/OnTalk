import { AlertCircle, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <Card className={cn("px-6 py-12 text-center", className)}>
      <span
        className="mx-auto grid size-12 place-items-center rounded-2xl bg-primary-subtle text-primary"
        aria-hidden
      >
        <Icon className="size-6" />
      </span>
      <h3 className="mt-4 text-base font-semibold text-foreground">{title}</h3>
      {description && (
        <p className="mx-auto mt-1.5 max-w-sm text-sm text-muted-foreground">
          {description}
        </p>
      )}
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </Card>
  );
}

interface ErrorStateProps {
  title?: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function ErrorState({
  title = "Something went wrong",
  description = "We couldn't load this right now. Please try again.",
  action,
  className,
}: ErrorStateProps) {
  return (
    <Card
      role="alert"
      className={cn(
        "border-danger-border bg-danger-subtle px-6 py-10 text-center",
        className,
      )}
    >
      <span
        className="mx-auto grid size-12 place-items-center rounded-2xl bg-white text-danger"
        aria-hidden
      >
        <AlertCircle className="size-6" />
      </span>
      <h3 className="mt-4 text-base font-semibold text-foreground">{title}</h3>
      <p className="mx-auto mt-1.5 max-w-sm text-sm text-muted-foreground">
        {description}
      </p>
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </Card>
  );
}

/** Inline, non-blocking message used for form-level errors. */
export function InlineAlert({
  tone = "danger",
  children,
  className,
}: {
  tone?: "danger" | "success" | "info";
  children: ReactNode;
  className?: string;
}) {
  const toneClasses = {
    danger: "border-danger-border bg-danger-subtle text-danger",
    success: "border-success-border bg-success-subtle text-success",
    info: "border-primary-border bg-primary-subtle text-primary",
  } as const;

  return (
    <p
      role={tone === "danger" ? "alert" : "status"}
      className={cn(
        "rounded-xl border px-3.5 py-2.5 text-sm",
        toneClasses[tone],
        className,
      )}
    >
      {children}
    </p>
  );
}
