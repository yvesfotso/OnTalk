import type { LucideIcon } from "lucide-react";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  tone?: "primary" | "accent" | "success" | "neutral";
  hint?: string;
  className?: string;
}

const TONE_CLASSES = {
  primary: "bg-primary-subtle text-primary",
  accent: "bg-accent-subtle text-accent",
  success: "bg-success-subtle text-success",
  neutral: "bg-subtle text-muted-foreground",
} as const;

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = "neutral",
  hint,
  className,
}: StatCardProps) {
  return (
    <Card className={cn("p-4 sm:p-5", className)}>
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "grid size-10 shrink-0 place-items-center rounded-xl",
            TONE_CLASSES[tone],
          )}
          aria-hidden
        >
          <Icon className="size-5" />
        </span>
        <div className="min-w-0">
          <p className="text-2xl leading-tight font-semibold tabular-nums text-foreground">
            {value}
          </p>
          <p className="truncate text-sm text-muted-foreground">{label}</p>
          {hint && (
            <p className="mt-0.5 truncate text-xs text-faint-foreground">
              {hint}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
