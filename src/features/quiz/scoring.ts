/**
 * Quiz grading. Pure and unit tested — the same rules run in the UI for instant
 * feedback and again when the attempt is persisted.
 */

import type { Json, QuestionType, QuizQuestion } from "@/types/database";

export type AnswerValue = number | string | boolean;

export interface GradedQuestion {
  questionId: string;
  correct: boolean;
  given: AnswerValue | null;
}

export interface QuizResult {
  total: number;
  correctAnswers: number;
  /** Percentage, 0-100. */
  score: number;
  passed: boolean;
  graded: GradedQuestion[];
}

const asRecord = (value: Json): Record<string, Json> =>
  value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, Json>)
    : {};

/** Options offered for a question, if any. */
export function getOptions(question: QuizQuestion): string[] {
  const data = asRecord(question.answer_data);
  const options = data.options;
  if (!Array.isArray(options)) return [];
  return options.filter((o): o is string => typeof o === "string");
}

/** Normalises free text so "The Bill." matches "bill". */
export function normalizeText(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[.,!?;:'"]/g, "")
    .replace(/\s+/g, " ")
    .replace(/^(a|an|the)\s+/, "");
}

export function isCorrect(
  question: QuizQuestion,
  answer: AnswerValue | null,
): boolean {
  if (answer === null || answer === undefined) return false;

  const expected = asRecord(question.correct_answer);
  const type: QuestionType = question.question_type;

  if (type === "multiple_choice") {
    return typeof expected.index === "number" && answer === expected.index;
  }

  if (type === "true_false") {
    return typeof expected.value === "boolean" && answer === expected.value;
  }

  // fill_blank
  if (typeof expected.text !== "string" || typeof answer !== "string") {
    return false;
  }
  return normalizeText(answer) === normalizeText(expected.text);
}

export function scoreQuiz(
  questions: QuizQuestion[],
  answers: Record<string, AnswerValue | null>,
  passingScore: number,
): QuizResult {
  const graded = questions.map((question) => ({
    questionId: question.id,
    given: answers[question.id] ?? null,
    correct: isCorrect(question, answers[question.id] ?? null),
  }));

  const correctAnswers = graded.filter((g) => g.correct).length;
  const total = questions.length;
  const score = total === 0 ? 0 : Math.round((correctAnswers / total) * 100);

  return { total, correctAnswers, score, passed: score >= passingScore, graded };
}
