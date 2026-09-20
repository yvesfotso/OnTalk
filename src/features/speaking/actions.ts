"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { XP_PER_SPEAKING_ATTEMPT } from "@/lib/constants/app";
import { compareSpeech } from "@/features/speaking/compare";
import { createClient } from "@/lib/supabase/server";

const attemptSchema = z.object({
  prompt: z.string().trim().min(1).max(300),
  transcript: z.string().trim().max(500),
});

export interface SpeakingAttemptResult {
  error?: string;
  xpEarned?: number;
  accuracy?: number;
}

/**
 * Stores one speaking attempt. Accuracy is recomputed here rather than trusted
 * from the client, using the same comparison the UI already showed.
 */
export async function saveSpeakingAttemptAction(
  input: unknown,
): Promise<SpeakingAttemptResult> {
  const parsed = attemptSchema.safeParse(input);
  if (!parsed.success) return { error: "That attempt could not be saved." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Your session expired. Please sign in again." };

  const { accuracy } = compareSpeech(parsed.data.prompt, parsed.data.transcript);

  const { error } = await supabase.from("speaking_attempts").insert({
    user_id: user.id,
    prompt_text: parsed.data.prompt,
    transcript: parsed.data.transcript,
    accuracy_percent: accuracy,
  });

  if (error) {
    console.error("[speaking] attempt", error.message);
    return { error: "We couldn't save that attempt. Please try again." };
  }

  const { error: activityError } = await supabase.rpc("record_activity", {
    p_minutes: 1,
    p_xp: XP_PER_SPEAKING_ATTEMPT,
    p_speaking: 1,
  });

  if (activityError) {
    console.error("[speaking] record_activity", activityError.message);
  }

  revalidatePath("/app", "layout");
  return { xpEarned: XP_PER_SPEAKING_ATTEMPT, accuracy };
}
