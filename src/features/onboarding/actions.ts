"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { onboardingSchema } from "@/lib/validation/profile";

export interface OnboardingResult {
  error?: string;
}

/** How many words are added to the review deck when onboarding finishes. */
const STARTER_DECK_SIZE = 20;

export async function completeOnboardingAction(
  input: unknown,
): Promise<OnboardingResult> {
  const parsed = onboardingSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please review your answers." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Your session expired. Please sign in again." };

  const {
    englishLevel,
    learningGoal,
    improvementAreas,
    dailyMinutesGoal,
    interests,
  } = parsed.data;

  // The row is matched on auth.uid() as well as RLS — user_id never comes from
  // the request body.
  const { error } = await supabase
    .from("profiles")
    .update({
      english_level: englishLevel,
      learning_goal: learningGoal,
      improvement_areas: improvementAreas,
      interests,
      daily_minutes_goal: dailyMinutesGoal,
      onboarding_completed: true,
    })
    .eq("id", user.id);

  if (error) {
    console.error("[onboarding]", error.message);
    return { error: "We couldn't save your plan. Please try again." };
  }

  const { error: enrollError } = await supabase.rpc(
    "enroll_vocabulary_for_level",
    { p_level: englishLevel, p_limit: STARTER_DECK_SIZE },
  );

  // A learner without a starter deck can still use the app, so this is logged
  // rather than surfaced as a failure.
  if (enrollError) console.error("[onboarding] enroll", enrollError.message);

  revalidatePath("/app", "layout");
  return {};
}
