import { CalendarDays } from "lucide-react";

import type { DayActivity } from "@/features/progress/queries";

export function DashboardWeek({ days }: { days: DayActivity[] }) {
  const month = new Date().toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <section aria-labelledby="class-schedule-title" className="rounded-[1.5rem] border border-border/70 bg-surface p-5 shadow-card sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold tracking-[0.15em] text-muted-foreground uppercase">Your rhythm</p>
          <h2 id="class-schedule-title" className="mt-1 text-lg font-semibold tracking-tight">Class schedule</h2>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-subtle px-3 py-1.5 text-xs font-medium text-muted-foreground">
          <CalendarDays className="size-3.5" aria-hidden />
          {month}
        </span>
      </div>

      <ol className="mt-5 grid grid-cols-7 gap-1.5 sm:gap-2" aria-label="Study activity over the last seven days">
        {days.map((day) => {
          const dayNumber = Number(day.date.slice(-2));
          const active = day.isToday;

          return (
            <li key={day.date}>
              <div
                aria-current={active ? "date" : undefined}
                className={active
                  ? "flex min-h-[4.75rem] flex-col items-center justify-center gap-1 rounded-2xl bg-primary px-1 py-2 text-primary-foreground shadow-card"
                  : "flex min-h-[4.75rem] flex-col items-center justify-center gap-1 rounded-2xl bg-background px-1 py-2 text-foreground"}
              >
                <span className={active ? "text-[10px] font-medium text-primary-foreground/75" : "text-[10px] font-medium text-muted-foreground"}>
                  {day.label}
                </span>
                <span className="text-sm font-semibold tabular-nums">{dayNumber}</span>
                <span className={active ? "h-1 w-1 rounded-full bg-accent" : day.minutes > 0 ? "h-1 w-1 rounded-full bg-primary" : "h-1 w-1 rounded-full bg-border"} aria-hidden />
              </div>
            </li>
          );
        })}
      </ol>

      <div className="mt-5 flex items-end justify-between border-t border-border pt-4">
        <div>
          <p className="text-xs text-muted-foreground">Minutes this week</p>
          <p className="mt-1 text-2xl font-semibold tracking-tight tabular-nums">
            {days.reduce((sum, day) => sum + day.minutes, 0)}
            <span className="ml-1 text-sm font-medium text-muted-foreground">min</span>
          </p>
        </div>
        <div className="flex h-9 items-end gap-1" aria-hidden>
          {days.map((day) => (
            <span
              key={day.date}
              className={day.isToday ? "w-2 rounded-full bg-primary" : "w-2 rounded-full bg-primary/25"}
              style={{ height: `${Math.max(8, Math.min(36, day.minutes * 1.5))}px` }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
