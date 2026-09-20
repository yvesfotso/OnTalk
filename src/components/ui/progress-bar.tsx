import { cn } from "@/lib/utils/cn";

interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  /** Hides the numeric text but keeps it available to screen readers. */
  hideValue?: boolean;
  tone?: "primary" | "success" | "accent";
  size?: "sm" | "md";
  className?: string;
}

const TONE_CLASSES = {
  primary: "bg-primary",
  success: "bg-success",
  accent: "bg-accent",
} as const;

export function ProgressBar({
  value,
  max = 100,
  label,
  hideValue = false,
  tone = "primary",
  size = "md",
  className,
}: ProgressBarProps) {
  const safeMax = max > 0 ? max : 100;
  const clamped = Math.min(Math.max(value, 0), safeMax);
  const percent = Math.round((clamped / safeMax) * 100);

  return (
    <div className={className}>
      {(label || !hideValue) && (
        <div className="mb-1.5 flex items-baseline justify-between gap-2">
          {label && (
            <span className="text-xs font-medium text-muted-foreground">
              {label}
            </span>
          )}
          {!hideValue && (
            <span className="text-xs font-semibold text-foreground tabular-nums">
              {percent}%
            </span>
          )}
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={safeMax}
        aria-label={label ?? "Progress"}
        className={cn(
          "w-full overflow-hidden rounded-full bg-border",
          size === "sm" ? "h-1.5" : "h-2.5",
        )}
      >
        <div
          className={cn(
            "h-full rounded-full transition-[width] duration-500 ease-out",
            TONE_CLASSES[tone],
          )}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
