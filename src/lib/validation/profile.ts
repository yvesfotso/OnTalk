import { z } from "zod";

import {
  CEFR_LEVELS,
  DAILY_MINUTE_OPTIONS,
  IMPROVEMENT_AREAS,
  INTERESTS,
  LEARNING_GOALS,
} from "@/lib/constants/app";

const level = z.enum(CEFR_LEVELS);
const goal = z.enum(LEARNING_GOALS.map((g) => g.value) as [string, ...string[]]);
const area = z.enum(
  IMPROVEMENT_AREAS.map((a) => a.value) as [string, ...string[]],
);
const interest = z.enum(INTERESTS as unknown as [string, ...string[]]);
const dailyMinutes = z
  .number()
  .int()
  .refine(
    (value) => (DAILY_MINUTE_OPTIONS as readonly number[]).includes(value),
    "Choose one of the suggested daily targets.",
  );

export const onboardingSchema = z.object({
  englishLevel: level,
  learningGoal: goal,
  improvementAreas: z
    .array(area)
    .min(1, "Pick at least one thing to improve.")
    .max(IMPROVEMENT_AREAS.length),
  dailyMinutesGoal: dailyMinutes,
  interests: z.array(interest).max(INTERESTS.length),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;

export const profileUpdateSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(2, "Your name needs at least 2 characters.")
    .max(60, "That name is a little too long."),
  englishLevel: level,
  learningGoal: goal,
  dailyMinutesGoal: dailyMinutes,
});

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;

export const deleteAccountSchema = z.object({
  confirmation: z.literal("DELETE", {
    error: "Type DELETE exactly to confirm.",
  }),
});

export type DeleteAccountInput = z.infer<typeof deleteAccountSchema>;
