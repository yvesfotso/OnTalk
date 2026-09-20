import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { CefrLevel } from "@/lib/constants/app";
import { CEFR_LEVELS } from "@/lib/constants/app";
import type { Lesson, LessonProgress } from "@/types/database";

export type LessonListItem = Pick<
  Lesson,
  | "id"
  | "slug"
  | "title"
  | "description"
  | "level"
  | "topic"
  | "estimated_minutes"
  | "xp_reward"
  | "order_index"
  | "is_premium"
>;

export type ProgressSummary = Pick<
  LessonProgress,
  "lesson_id" | "status" | "progress_percent" | "last_opened_at"
>;

export interface LessonWithProgress extends LessonListItem {
  progress: ProgressSummary | null;
}

const LESSON_COLUMNS =
  "id, slug, title, description, level, topic, estimated_minutes, xp_reward, order_index, is_premium";

/**
 * The published curriculum plus this learner's progress.
 *
 * The demo curriculum is 12 lessons, so both sides are fetched whole and joined
 * in memory. Add pagination here once the library outgrows a single screen.
 */
export async function getLessonsWithProgress(
  userId: string,
): Promise<LessonWithProgress[]> {
  const supabase = await createClient();

  const [lessonsResult, progressResult] = await Promise.all([
    supabase
      .from("lessons")
      .select(LESSON_COLUMNS)
      .eq("is_published", true)
      .order("order_index", { ascending: true }),
    supabase
      .from("lesson_progress")
      .select("lesson_id, status, progress_percent, last_opened_at")
      .eq("user_id", userId),
  ]);

  if (lessonsResult.error) throw lessonsResult.error;
  if (progressResult.error) throw progressResult.error;

  const byLesson = new Map(
    (progressResult.data ?? []).map((row) => [row.lesson_id, row]),
  );

  return (lessonsResult.data ?? []).map((lesson) => ({
    ...lesson,
    progress: byLesson.get(lesson.id) ?? null,
  }));
}

/**
 * What to show behind "Continue Learning": whatever was opened most recently
 * and left unfinished, otherwise the first lesson at or below the learner's
 * level that they have not completed.
 */
export function pickRecommendedLesson(
  lessons: LessonWithProgress[],
  level: CefrLevel,
): LessonWithProgress | null {
  const inProgress = lessons
    .filter((lesson) => lesson.progress?.status === "in_progress")
    .sort((a, b) =>
      (b.progress?.last_opened_at ?? "").localeCompare(
        a.progress?.last_opened_at ?? "",
      ),
    );

  if (inProgress.length > 0) return inProgress[0];

  const levelRank = CEFR_LEVELS.indexOf(level);
  const atOrBelowLevel = lessons.filter(
    (lesson) =>
      CEFR_LEVELS.indexOf(lesson.level) <= levelRank &&
      lesson.progress?.status !== "completed",
  );

  if (atOrBelowLevel.length > 0) return atOrBelowLevel[0];

  // Everything at their level is done — offer the next lesson up.
  return lessons.find((lesson) => lesson.progress?.status !== "completed") ?? null;
}

export function countCompleted(lessons: LessonWithProgress[]): number {
  return lessons.filter((lesson) => lesson.progress?.status === "completed")
    .length;
}

/** Per-level completion, used by the progress page. */
export function levelBreakdown(lessons: LessonWithProgress[]) {
  const levels = [...new Set(lessons.map((lesson) => lesson.level))].sort(
    (a, b) => CEFR_LEVELS.indexOf(a) - CEFR_LEVELS.indexOf(b),
  );

  return levels.map((level) => {
    const inLevel = lessons.filter((lesson) => lesson.level === level);
    const completed = inLevel.filter(
      (lesson) => lesson.progress?.status === "completed",
    ).length;

    return {
      level,
      completed,
      total: inLevel.length,
      percent:
        inLevel.length === 0
          ? 0
          : Math.round((completed / inLevel.length) * 100),
    };
  });
}
