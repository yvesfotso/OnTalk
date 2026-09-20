import { Clock, Zap } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import type { LessonWithProgress } from "@/features/lessons/queries";
import { cn } from "@/lib/utils/cn";
import type { LessonStatus } from "@/types/database";

interface LessonsTableProps {
  lessons: LessonWithProgress[];
}

function statusMeta(status: LessonStatus | null) {
  switch (status) {
    case "completed":
      return { label: "Completed", tone: "success" as const };
    case "in_progress":
    case "started":
      return { label: "In progress", tone: "primary" as const };
    default:
      return { label: "Upcoming", tone: "neutral" as const };
  }
}

export function LessonsTable({ lessons }: LessonsTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[520px] border-separate border-spacing-y-1.5 text-sm">
        <thead>
          <tr className="text-left text-xs font-medium text-faint-foreground">
            <th className="px-3 pb-1 font-medium">Lesson</th>
            <th className="px-3 pb-1 font-medium">Status</th>
            <th className="px-3 pb-1 font-medium">Duration</th>
            <th className="px-3 pb-1 text-right font-medium">XP</th>
          </tr>
        </thead>
        <tbody>
          {lessons.map((lesson) => {
            const status = statusMeta(lesson.progress?.status ?? null);

            return (
              <tr key={lesson.id} className="group">
                <td className="rounded-l-2xl bg-subtle px-3 py-3 group-hover:bg-primary-subtle">
                  <Link
                    href={`/app/lessons/${lesson.slug}`}
                    className="flex min-w-0 items-center gap-3"
                  >
                    <span
                      className="grid size-9 shrink-0 place-items-center rounded-full bg-surface text-xs font-semibold text-primary"
                      aria-hidden
                    >
                      {lesson.level}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate font-medium text-foreground">
                        {lesson.title}
                      </span>
                      <span className="block truncate text-xs text-muted-foreground capitalize">
                        {lesson.topic}
                      </span>
                    </span>
                  </Link>
                </td>
                <td className="bg-subtle px-3 py-3 group-hover:bg-primary-subtle">
                  <Badge tone={status.tone} dot>
                    {status.label}
                  </Badge>
                </td>
                <td className="bg-subtle px-3 py-3 text-muted-foreground group-hover:bg-primary-subtle">
                  <span className="inline-flex items-center gap-1">
                    <Clock className="size-3.5" aria-hidden />
                    {lesson.estimated_minutes} min
                  </span>
                </td>
                <td
                  className={cn(
                    "rounded-r-2xl bg-subtle px-3 py-3 text-right font-medium text-foreground group-hover:bg-primary-subtle",
                  )}
                >
                  <span className="inline-flex items-center justify-end gap-1">
                    <Zap className="size-3.5 text-primary" aria-hidden />
                    {lesson.xp_reward}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
