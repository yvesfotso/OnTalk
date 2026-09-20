"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

const lessonIdSchema = z.uuid();
const percentSchema = z.number().int().min(0).max(100);

export interface CompleteLessonResult {
  error?: string;
  xpEarned?: number;
  totalXp?: number;
  streak?: number;
  /** True when the lesson had already been completed, so no XP was re-awarded. */
  alreadyCompleted?: boolean;
}

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

/** Records that the learner opened the lesson. Safe to call repeatedly. */
export async function openLessonAction(lessonId: unknown): Promise<void> {
  const parsed = lessonIdSchema.safeParse(lessonId);
  if (!parsed.success) return;

  const { supabase, user } = await requireUser();
  if (!user) return;

  const { data: existing } = await supabase
    .from("lesson_progress")
    .select("id, status")
    .eq("user_id", user.id)
    .eq("lesson_id", parsed.data)
    .maybeSingle();

  if (existing) {
    // Never demote a completed lesson back to in_progress.
    await supabase
      .from("lesson_progress")
      .update({ last_opened_at: new Date().toISOString() })
      .eq("id", existing.id);
    return;
  }

  await supabase.from("lesson_progress").insert({
    user_id: user.id,
    lesson_id: parsed.data,
    status: "in_progress",
    progress_percent: 0,
    score: null,
    completed_at: null,
  });
}

export async function saveLessonProgressAction(
  lessonId: unknown,
  percent: unknown,
): Promise<void> {
  const parsedId = lessonIdSchema.safeParse(lessonId);
  const parsedPercent = percentSchema.safeParse(percent);
  if (!parsedId.success || !parsedPercent.success) return;

  const { supabase, user } = await requireUser();
  if (!user) return;

  const { data: existing } = await supabase
    .from("lesson_progress")
    .select("id, status, progress_percent")
    .eq("user_id", user.id)
    .eq("lesson_id", parsedId.data)
    .maybeSingle();

  if (!existing || existing.status === "completed") return;
  if (parsedPercent.data <= existing.progress_percent) return;

  await supabase
    .from("lesson_progress")
    .update({
      progress_percent: parsedPercent.data,
      last_opened_at: new Date().toISOString(),
    })
    .eq("id", existing.id);
}

/**
 * Marks a lesson complete and awards its XP.
 *
 * The XP amount is read from the lesson row, never from the client, and the
 * award is skipped if the lesson was already completed.
 */
export async function completeLessonAction(
  lessonId: unknown,
  score: unknown,
): Promise<CompleteLessonResult> {
  const parsedId = lessonIdSchema.safeParse(lessonId);
  if (!parsedId.success) return { error: "That lesson could not be found." };

  const parsedScore = z.number().int().min(0).max(100).nullable().safeParse(score);
  const finalScore = parsedScore.success ? parsedScore.data : null;

  const { supabase, user } = await requireUser();
  if (!user) return { error: "Your session expired. Please sign in again." };

  const { data: lesson, error: lessonError } = await supabase
    .from("lessons")
    .select("id, xp_reward, estimated_minutes")
    .eq("id", parsedId.data)
    .eq("is_published", true)
    .single();

  if (lessonError || !lesson) {
    return { error: "That lesson could not be found." };
  }

  const { data: existing } = await supabase
    .from("lesson_progress")
    .select("id, status")
    .eq("user_id", user.id)
    .eq("lesson_id", lesson.id)
    .maybeSingle();

  const alreadyCompleted = existing?.status === "completed";
  const now = new Date().toISOString();

  if (existing) {
    await supabase
      .from("lesson_progress")
      .update({
        status: "completed",
        progress_percent: 100,
        score: finalScore,
        completed_at: alreadyCompleted ? undefined : now,
        last_opened_at: now,
      })
      .eq("id", existing.id);
  } else {
    await supabase.from("lesson_progress").insert({
      user_id: user.id,
      lesson_id: lesson.id,
      status: "completed",
      progress_percent: 100,
      score: finalScore,
      completed_at: now,
    });
  }

  revalidatePath("/app", "layout");

  if (alreadyCompleted) {
    return { alreadyCompleted: true, xpEarned: 0 };
  }

  const { data: profile, error: activityError } = await supabase.rpc(
    "record_activity",
    {
      p_minutes: lesson.estimated_minutes,
      p_xp: lesson.xp_reward,
      p_lessons: 1,
    },
  );

  if (activityError) {
    console.error("[lessons] record_activity", activityError.message);
    return { xpEarned: lesson.xp_reward };
  }

  return {
    xpEarned: lesson.xp_reward,
    totalXp: profile?.xp,
    streak: profile?.streak,
  };
}
