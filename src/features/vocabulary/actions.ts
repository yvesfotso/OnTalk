"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { XP_PER_VOCABULARY_REVIEW } from "@/lib/constants/app";
import { createClient } from "@/lib/supabase/server";
import { REVIEW_GRADES, reviewCard, toSrsState } from "@/features/vocabulary/srs";

const reviewSchema = z.object({
  userVocabularyId: z.uuid(),
  grade: z.enum(REVIEW_GRADES),
});

export interface ReviewResult {
  error?: string;
  nextReviewAt?: string;
}

/**
 * Applies one flashcard grade.
 *
 * The scheduler runs on the server against the row's stored state, so a client
 * cannot push a card's interval out or claim XP for reviews it never did.
 */
export async function reviewCardAction(input: unknown): Promise<ReviewResult> {
  const parsed = reviewSchema.safeParse(input);
  if (!parsed.success) return { error: "That review could not be saved." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Your session expired. Please sign in again." };

  const { data: row, error: readError } = await supabase
    .from("user_vocabulary")
    .select(
      "id, ease_score, interval_days, review_count, correct_count, incorrect_count",
    )
    .eq("id", parsed.data.userVocabularyId)
    .eq("user_id", user.id)
    .single();

  if (readError || !row) return { error: "That card could not be found." };

  const update = reviewCard(toSrsState(row), parsed.data.grade);

  const { error: writeError } = await supabase
    .from("user_vocabulary")
    .update({
      status: update.status,
      ease_score: update.easeScore,
      interval_days: update.intervalDays,
      review_count: update.reviewCount,
      correct_count: update.correctCount,
      incorrect_count: update.incorrectCount,
      last_reviewed_at: update.lastReviewedAt.toISOString(),
      next_review_at: update.nextReviewAt.toISOString(),
    })
    .eq("id", row.id)
    .eq("user_id", user.id);

  if (writeError) {
    console.error("[vocabulary] review", writeError.message);
    return { error: "We couldn't save that review. Please try again." };
  }

  return { nextReviewAt: update.nextReviewAt.toISOString() };
}

const sessionSchema = z.object({
  reviewed: z.number().int().min(1).max(200),
  minutes: z.number().int().min(0).max(120),
});

/** Called once when a review session ends, to bank XP and activity. */
export async function finishReviewSessionAction(
  input: unknown,
): Promise<{ error?: string; xpEarned?: number }> {
  const parsed = sessionSchema.safeParse(input);
  if (!parsed.success) return { error: "That session could not be saved." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Your session expired. Please sign in again." };

  const xp = parsed.data.reviewed * XP_PER_VOCABULARY_REVIEW;

  const { error } = await supabase.rpc("record_activity", {
    p_minutes: parsed.data.minutes,
    p_xp: xp,
    p_words: parsed.data.reviewed,
  });

  if (error) {
    console.error("[vocabulary] record_activity", error.message);
    return { error: "We couldn't save your session." };
  }

  revalidatePath("/app", "layout");
  return { xpEarned: xp };
}
