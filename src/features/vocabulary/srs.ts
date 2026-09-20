/**
 * A small SM-2-style spaced repetition scheduler.
 *
 * Deliberately simpler than real SM-2: there is no separate learning queue and
 * no fuzz. It is a pure function so the scheduling rules can be unit tested
 * without a database.
 */

import type { UserVocabulary, VocabularyStatus } from "@/types/database";

export const REVIEW_GRADES = ["again", "hard", "good", "easy"] as const;
export type ReviewGrade = (typeof REVIEW_GRADES)[number];

const MIN_EASE = 1.3;
const MAX_EASE = 3.0;
const MAX_INTERVAL_DAYS = 365;

/** A card is considered learned once it survives this interval. */
const LEARNED_INTERVAL_DAYS = 21;

/** "Again" comes back in the same session rather than the same day. */
const AGAIN_DELAY_MINUTES = 10;

export interface SrsState {
  easeScore: number;
  intervalDays: number;
  reviewCount: number;
  correctCount: number;
  incorrectCount: number;
}

export interface SrsUpdate extends SrsState {
  status: VocabularyStatus;
  nextReviewAt: Date;
  lastReviewedAt: Date;
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const round = (value: number) => Math.round(value * 100) / 100;

function nextInterval(
  grade: ReviewGrade,
  previousInterval: number,
  ease: number,
): number {
  const isFirstSuccess = previousInterval < 1;

  switch (grade) {
    case "again":
      return 0;
    case "hard":
      return isFirstSuccess ? 1 : Math.max(1, Math.round(previousInterval * 1.2));
    case "good":
      return isFirstSuccess ? 3 : Math.round(previousInterval * ease);
    case "easy":
      return isFirstSuccess ? 7 : Math.round(previousInterval * ease * 1.3);
  }
}

const EASE_DELTA: Record<ReviewGrade, number> = {
  again: -0.2,
  hard: -0.15,
  good: 0,
  easy: 0.15,
};

function statusFor(intervalDays: number, reviewCount: number): VocabularyStatus {
  if (intervalDays >= LEARNED_INTERVAL_DAYS) return "learned";
  if (reviewCount > 0 && intervalDays >= 1) return "reviewing";
  return "learning";
}

export function reviewCard(
  state: SrsState,
  grade: ReviewGrade,
  now: Date = new Date(),
): SrsUpdate {
  const ease = clamp(state.easeScore + EASE_DELTA[grade], MIN_EASE, MAX_EASE);
  const intervalDays = clamp(
    nextInterval(grade, state.intervalDays, ease),
    0,
    MAX_INTERVAL_DAYS,
  );

  const reviewCount = state.reviewCount + 1;
  const correct = grade !== "again";

  const nextReviewAt = new Date(now);
  if (intervalDays === 0) {
    nextReviewAt.setMinutes(nextReviewAt.getMinutes() + AGAIN_DELAY_MINUTES);
  } else {
    nextReviewAt.setDate(nextReviewAt.getDate() + intervalDays);
  }

  return {
    easeScore: round(ease),
    intervalDays,
    reviewCount,
    correctCount: state.correctCount + (correct ? 1 : 0),
    incorrectCount: state.incorrectCount + (correct ? 0 : 1),
    status: statusFor(intervalDays, reviewCount),
    nextReviewAt,
    lastReviewedAt: now,
  };
}

type SrsColumns = Pick<
  UserVocabulary,
  | "ease_score"
  | "interval_days"
  | "review_count"
  | "correct_count"
  | "incorrect_count"
>;

/** Adapts the scheduling columns of a database row to the pure scheduler. */
export function toSrsState(row: SrsColumns): SrsState {
  return {
    easeScore: Number(row.ease_score),
    intervalDays: row.interval_days,
    reviewCount: row.review_count,
    correctCount: row.correct_count,
    incorrectCount: row.incorrect_count,
  };
}

/** Human-readable preview shown on the flashcard buttons. */
export function describeNextInterval(
  state: SrsState,
  grade: ReviewGrade,
): string {
  const ease = clamp(state.easeScore + EASE_DELTA[grade], MIN_EASE, MAX_EASE);
  const days = clamp(
    nextInterval(grade, state.intervalDays, ease),
    0,
    MAX_INTERVAL_DAYS,
  );

  if (days === 0) return `${AGAIN_DELAY_MINUTES} min`;
  if (days === 1) return "1 day";
  if (days < 30) return `${days} days`;
  const months = Math.round(days / 30);
  return months === 1 ? "1 month" : `${months} months`;
}
