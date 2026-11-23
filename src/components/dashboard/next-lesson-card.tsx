import { ArrowUpRight, BookOpen, Clock3, Sparkles, Zap } from "lucide-react";
import Link from "next/link";

import type { LessonWithProgress } from "@/features/lessons/queries";

interface NextLessonCardProps {
  lesson: LessonWithProgress | null;
  level: string;
}

export function NextLessonCard({ lesson, level }: NextLessonCardProps) {
  const href = lesson ? `/app/lessons/${lesson.slug}` : "/app/learn";
  const isContinue = lesson?.progress?.status === "in_progress";

  return (
    <section className="relative isolate overflow-hidden rounded-[1.75rem] bg-dark p-6 text-dark-foreground shadow-raised sm:p-8" aria-labelledby="next-lesson-title">
      <div className="pointer-events-none absolute -right-12 -top-20 -z-10 size-64 rounded-full bg-primary/35 blur-2xl" aria-hidden />
      <div className="pointer-events-none absolute -bottom-20 right-24 -z-10 size-48 rounded-full bg-accent/20 blur-3xl" aria-hidden />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.16em] text-dark-foreground/65 uppercase">
          <Sparkles className="size-4 text-accent" aria-hidden />
          Your next lesson
        </p>
        <span className="rounded-full border border-dark-foreground/15 bg-dark-foreground/10 px-3 py-1 text-xs font-medium">
          Level {level}
        </span>
      </div>

      <div className="mt-7 grid items-end gap-7 sm:grid-cols-[minmax(0,1fr)_auto]">
        <div className="max-w-lg">
          <h2 id="next-lesson-title" className="text-2xl leading-tight font-semibold tracking-tight sm:text-3xl">
            {lesson?.title ?? "Your learning journey starts here"}
          </h2>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-dark-foreground/70 sm:text-base">
            {lesson?.description ?? "Explore your learning path and find a first lesson that feels right."}
          </p>
          {lesson && (
            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-medium text-dark-foreground/70">
              <span className="inline-flex items-center gap-1.5 capitalize">
                <BookOpen className="size-3.5" aria-hidden />
                {lesson.topic}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock3 className="size-3.5" aria-hidden />
                {lesson.estimated_minutes} min
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Zap className="size-3.5 text-accent" aria-hidden />
                {lesson.xp_reward} XP
              </span>
            </div>
          )}
        </div>

        <Link
          href={href}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-accent px-5 text-sm font-semibold text-dark transition-transform hover:-translate-y-0.5 hover:bg-accent/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          {lesson ? (isContinue ? "Continue lesson" : "Start lesson") : "Explore lessons"}
          <ArrowUpRight className="size-4" aria-hidden />
        </Link>
      </div>
    </section>
  );
}
