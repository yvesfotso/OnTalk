import type { LucideIcon } from "lucide-react";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  tone?: "primary" | "accent" | "success" | "neutral" | "dark";
  hint?: string;
  className?: string;
}

const ICON_TONE_CLASSES = {
  primary: "bg-primary-subtle text-primary",
  accent: "bg-primary text-primary-foreground",
  success: "bg-success-subtle text-success",
  neutral: "bg-subtle text-muted-foreground",
  dark: "bg-dark-subtle text-dark-foreground",
} as const;

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = "neutral",
  hint,
  className,
}: StatCardProps) {
  const dark = tone === "dark";

  return (
    <Card
      className={cn(
        "rounded-3xl p-4 sm:p-5",
        dark && "border-transparent bg-dark text-dark-foreground shadow-raised",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "grid size-10 shrink-0 place-items-center rounded-2xl",
            ICON_TONE_CLASSES[tone],
          )}
          aria-hidden
        >
          <Icon className="size-5" />
        </span>
        <div className="min-w-0">
          <p
            className={cn(
              "text-2xl leading-tight font-semibold tabular-nums",
              dark ? "text-dark-foreground" : "text-foreground",
            )}
          >
            {value}
          </p>
          <p
            className={cn(
              "truncate text-sm",
              dark ? "text-dark-foreground/60" : "text-muted-foreground",
            )}
          >
            {label}
          </p>
          {hint && (
            <p
              className={cn(
                "mt-0.5 truncate text-xs",
                dark ? "text-dark-foreground/40" : "text-faint-foreground",
              )}
            >
              {hint}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
