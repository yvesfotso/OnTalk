import type { DayActivity } from "@/features/progress/queries";
import { cn } from "@/lib/utils/cn";

interface WeeklyChartProps {
  days: DayActivity[];
  goalMinutes: number;
}

/**
 * Seven CSS bars. A chart library would be more code and more JavaScript than
 * this view is worth.
 */
export function WeeklyChart({ days, goalMinutes }: WeeklyChartProps) {
  const peak = Math.max(goalMinutes, ...days.map((day) => day.minutes), 1);

  return (
    <div>
      <ul className="flex h-32 items-end justify-between gap-2">
        {days.map((day) => {
          const heightPercent = Math.round((day.minutes / peak) * 100);
          const metGoal = day.minutes >= goalMinutes && goalMinutes > 0;

          return (
            <li key={day.date} className="flex flex-1 flex-col items-center gap-2">
              <div className="flex h-full w-full items-end justify-center">
                <div
                  className={cn(
                    "w-full max-w-9 rounded-t-md transition-[height] duration-500",
                    day.minutes === 0
                      ? "bg-border"
                      : metGoal
                        ? "bg-success"
                        : "bg-primary",
                  )}
                  style={{
                    height: day.minutes === 0 ? "4px" : `${Math.max(heightPercent, 6)}%`,
                  }}
                />
              </div>
              <span
                className={cn(
                  "text-xs",
                  day.isToday
                    ? "font-semibold text-foreground"
                    : "text-muted-foreground",
                )}
              >
                {day.label}
              </span>
            </li>
          );
        })}
      </ul>

      <table className="sr-only">
        <caption>Minutes studied over the last 7 days</caption>
        <thead>
          <tr>
            <th scope="col">Day</th>
            <th scope="col">Minutes</th>
          </tr>
        </thead>
        <tbody>
          {days.map((day) => (
            <tr key={day.date}>
              <th scope="row">{day.date}</th>
              <td>{day.minutes}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
