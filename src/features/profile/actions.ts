"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { profileUpdateSchema } from "@/lib/validation/profile";

export interface ProfileActionResult {
  error?: string;
  message?: string;
}

export async function updateProfileAction(
  input: unknown,
): Promise<ProfileActionResult> {
  const parsed = profileUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Your session expired. Please sign in again." };

  const { displayName, englishLevel, learningGoal, dailyMinutesGoal } = parsed.data;

  const { error } = await supabase
    .from("profiles")
    .update({
      display_name: displayName,
      english_level: englishLevel,
      learning_goal: learningGoal,
      daily_minutes_goal: dailyMinutesGoal,
    })
    .eq("id", user.id);

  if (error) {
    console.error("[profile] update", error.message);
    return { error: "We couldn't save your changes. Please try again." };
  }

  revalidatePath("/app", "layout");
  return { message: "Profile updated." };
}
