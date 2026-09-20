"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { scoreQuiz, type AnswerValue } from "@/features/quiz/scoring";
import { XP_PER_QUIZ_QUESTION } from "@/lib/constants/app";
import { createClient } from "@/lib/supabase/server";

const submitSchema = z.object({
  quizId: z.uuid(),
  answers: z.record(
    z.uuid(),
    z.union([z.number().int(), z.string().max(200), z.boolean()]).nullable(),
  ),
});

export interface QuizSubmitResult {
  error?: string;
  score?: number;
  correctAnswers?: number;
  total?: number;
  passed?: boolean;
  xpEarned?: number;
}

/**
 * Grades a quiz attempt server-side.
 *
 * The client shows instant feedback using the same pure `scoreQuiz`, but the
 * stored score is always recomputed here against the database rows — the
 * submitted payload only ever contains the learner's raw answers.
 */
export async function submitQuizAttemptAction(
  input: unknown,
): Promise<QuizSubmitResult> {
  const parsed = submitSchema.safeParse(input);
  if (!parsed.success) return { error: "That attempt could not be saved." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Your session expired. Please sign in again." };

  const [{ data: quiz }, { data: questions }] = await Promise.all([
    supabase
      .from("quizzes")
      .select("id, passing_score, xp_reward")
      .eq("id", parsed.data.quizId)
      .maybeSingle(),
    supabase
      .from("quiz_questions")
      .select(
        "id, quiz_id, question_type, question_text, answer_data, correct_answer, explanation, order_index",
      )
      .eq("quiz_id", parsed.data.quizId)
      .order("order_index", { ascending: true }),
  ]);

  if (!quiz || !questions || questions.length === 0) {
    return { error: "That quiz could not be found." };
  }

  const result = scoreQuiz(
    questions,
    parsed.data.answers as Record<string, AnswerValue | null>,
    quiz.passing_score,
  );

  const { error: insertError } = await supabase.from("quiz_attempts").insert({
    user_id: user.id,
    quiz_id: quiz.id,
    score: result.score,
    total_questions: result.total,
    correct_answers: result.correctAnswers,
  });

  if (insertError) {
    console.error("[quiz] attempt", insertError.message);
    return { error: "We couldn't save your attempt. Please try again." };
  }

  // XP scales with correct answers, plus the quiz bonus for a pass.
  const xp =
    result.correctAnswers * XP_PER_QUIZ_QUESTION +
    (result.passed ? quiz.xp_reward : 0);

  const { error: activityError } = await supabase.rpc("record_activity", {
    p_minutes: 3,
    p_xp: xp,
  });

  if (activityError) {
    console.error("[quiz] record_activity", activityError.message);
  }

  revalidatePath("/app", "layout");

  return {
    score: result.score,
    correctAnswers: result.correctAnswers,
    total: result.total,
    passed: result.passed,
    xpEarned: xp,
  };
}
