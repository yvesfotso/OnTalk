import { Check, Clock, Lock, Zap } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { InteractiveCard } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import type { LessonWithProgress } from "@/features/lessons/queries";
import { cn } from "@/lib/utils/cn";

interface LessonCardProps {
  lesson: LessonWithProgress;
  locked?: boolean;
}

export function LessonCard({ lesson, locked = false }: LessonCardProps) {
  const status = lesson.progress?.status ?? null;
  const percent = lesson.progress?.progress_percent ?? 0;
  const completed = status === "completed";

  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge tone="primary">{lesson.level}</Badge>
          <Badge>{lesson.topic}</Badge>
          {locked && (
            <Badge tone="accent">
              <Lock className="size-3" aria-hidden />
              Premium
            </Badge>
          )}
        </div>

        {completed && (
          <span
            className="grid size-7 shrink-0 place-items-center rounded-full bg-success-subtle text-success"
            title="Completed"
          >
            <Check className="size-4" aria-hidden />
            <span className="sr-only">Completed</span>
          </span>
        )}
      </div>

      <h3 className="mt-3 text-base font-semibold text-foreground">
        {lesson.title}
      </h3>
      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
        {lesson.description}
      </p>

      <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <Clock className="size-3.5" aria-hidden />
          {lesson.estimated_minutes} min
        </span>
        <span className="inline-flex items-center gap-1">
          <Zap className="size-3.5 text-accent" aria-hidden />
          {lesson.xp_reward} XP
        </span>
      </div>

      {status === "in_progress" && percent > 0 && (
        <ProgressBar
          className="mt-4"
          value={percent}
          label="In progress"
          size="sm"
        />
      )}
    </>
  );

  if (locked) {
    return (
      <InteractiveCard className="h-full p-5 opacity-75">
        {body}
        <p className="mt-4 text-xs font-medium text-warning">
          Upgrade to Premium to open this lesson.
        </p>
      </InteractiveCard>
    );
  }

  return (
    <InteractiveCard className="h-full">
      <Link
        href={`/app/lessons/${lesson.slug}`}
        className={cn(
          "block h-full rounded-card p-5",
          "focus-visible:outline-none",
        )}
      >
        {body}
      </Link>
    </InteractiveCard>
  );
}
