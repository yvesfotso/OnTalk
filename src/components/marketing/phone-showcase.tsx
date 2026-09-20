import { BookOpen, Check, Clock, Flame, GraduationCap, Zap } from "lucide-react";

import { cn } from "@/lib/utils/cn";

/**
 * A phone bezel around miniature, hand-built recreations of real app screens
 * (not screenshots) so it always matches the live design tokens and never
 * goes stale.
 */
function PhoneFrame({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "w-[240px] rounded-[2.75rem] border-[6px] border-dark bg-dark p-2 shadow-pop",
        className,
      )}
    >
      <div className="relative h-[500px] overflow-hidden rounded-[2.1rem] bg-background">
        <span
          className="absolute top-2.5 left-1/2 z-10 h-5 w-24 -translate-x-1/2 rounded-full bg-dark"
          aria-hidden
        />
        <div className="h-full overflow-hidden px-3 pt-8 pb-4">{children}</div>
        <span
          className="absolute bottom-2 left-1/2 h-1 w-24 -translate-x-1/2 rounded-full bg-foreground/20"
          aria-hidden
        />
      </div>
    </div>
  );
}

function DashboardScreen() {
  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] text-muted-foreground">Good morning, Ana 👋</p>
          <p className="text-xs font-semibold text-foreground">
            Ready for today&apos;s practice?
          </p>
        </div>
        <span className="rounded-full bg-primary-subtle px-2 py-1 text-[9px] font-semibold text-primary">
          A2
        </span>
      </div>

      <div className="grid grid-cols-3 gap-1.5">
        <MiniStat icon={Flame} value="12" label="streak" />
        <MiniStat icon={Zap} value="860" label="XP" />
        <MiniStat icon={GraduationCap} value="9" label="lessons" />
      </div>

      <div className="rounded-2xl bg-surface p-3 shadow-card">
        <p className="flex items-center gap-1.5 text-[9px] font-semibold text-primary">
          <span className="rounded-full bg-primary-subtle px-1.5 py-0.5">A2</span>
          Continue learning
        </p>
        <p className="mt-1.5 text-[11px] font-semibold text-foreground">
          Ordering Food at a Restaurant
        </p>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-primary-subtle">
          <div className="h-full w-3/5 rounded-full bg-primary" />
        </div>
      </div>

      <div className="rounded-2xl bg-surface p-3 shadow-card">
        <p className="text-[9px] font-semibold text-muted-foreground uppercase">
          Lessons
        </p>
        <ul className="mt-2 space-y-1.5">
          {["Introductions", "Daily Routine", "Family and Friends"].map((title) => (
            <li
              key={title}
              className="flex items-center justify-between rounded-xl bg-subtle px-2 py-1.5"
            >
              <span className="text-[10px] font-medium text-foreground">{title}</span>
              <Check className="size-3 text-success" aria-hidden />
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-auto flex justify-around rounded-full bg-surface py-2.5 shadow-card">
        {[GraduationCap, BookOpen, Flame, Zap].map((Icon, index) => (
          <Icon
            key={index}
            className={cn("size-4", index === 0 ? "text-primary" : "text-faint-foreground")}
            aria-hidden
          />
        ))}
      </div>
    </div>
  );
}

function MiniStat({
  icon: Icon,
  value,
  label,
}: {
  icon: typeof Flame;
  value: string;
  label: string;
}) {
  return (
    <div className="rounded-xl bg-surface px-1.5 py-2 text-center shadow-card">
      <Icon className="mx-auto size-3.5 text-primary" aria-hidden />
      <p className="mt-1 text-[11px] font-semibold text-foreground tabular-nums">
        {value}
      </p>
      <p className="text-[8px] text-muted-foreground">{label}</p>
    </div>
  );
}

function VocabularyScreen() {
  return (
    <div className="flex h-full flex-col">
      <p className="text-center text-[10px] font-semibold text-muted-foreground uppercase">
        Review
      </p>
      <div className="mt-4 flex flex-1 flex-col items-center justify-center gap-3 rounded-3xl bg-surface p-5 text-center shadow-card">
        <span className="rounded-full bg-primary-subtle px-2 py-0.5 text-[9px] font-semibold text-primary">
          A2
        </span>
        <p className="text-lg font-semibold text-foreground">recommend</p>
        <p className="font-mono text-[10px] text-muted-foreground">
          /ˌrekəˈmend/
        </p>
        <p className="text-[11px] text-muted-foreground">
          to suggest something because you think it is good
        </p>
        <p className="border-l-2 border-primary-border pl-2 text-left text-[10px] text-foreground italic">
          What do you recommend?
        </p>
      </div>
      <div className="mt-3 grid grid-cols-4 gap-1.5">
        {[
          ["Again", "text-danger bg-danger-subtle"],
          ["Hard", "text-warning bg-primary-subtle"],
          ["Good", "text-primary bg-primary-subtle"],
          ["Easy", "text-success bg-success-subtle"],
        ].map(([label, classes]) => (
          <div
            key={label}
            className={cn(
              "rounded-xl py-2 text-center text-[9px] font-semibold",
              classes,
            )}
          >
            {label}
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-center gap-1.5 text-[9px] text-muted-foreground">
        <Clock className="size-3" aria-hidden />
        17 words ready today
      </div>
    </div>
  );
}

export function PhoneShowcase() {
  return (
    <div className="relative mx-auto flex justify-center py-4 sm:py-0" aria-hidden>
      <PhoneFrame className="hidden -rotate-6 sm:block">
        <VocabularyScreen />
      </PhoneFrame>
      <PhoneFrame className="animate-rise z-10 -ml-16 rotate-3 sm:-ml-20">
        <DashboardScreen />
      </PhoneFrame>
    </div>
  );
}
