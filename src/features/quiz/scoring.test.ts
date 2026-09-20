import { describe, expect, it } from "vitest";

import { getOptions, isCorrect, normalizeText, scoreQuiz } from "@/features/quiz/scoring";
import type { QuizQuestion } from "@/types/database";

function question(overrides: Partial<QuizQuestion>): QuizQuestion {
  return {
    id: "q1",
    quiz_id: "quiz1",
    question_type: "multiple_choice",
    question_text: "",
    answer_data: {},
    correct_answer: {},
    explanation: null,
    order_index: 0,
    ...overrides,
  };
}

describe("isCorrect", () => {
  it("checks multiple choice by option index", () => {
    const q = question({
      question_type: "multiple_choice",
      correct_answer: { index: 1 },
    });
    expect(isCorrect(q, 1)).toBe(true);
    expect(isCorrect(q, 0)).toBe(false);
  });

  it("checks true/false by boolean value", () => {
    const q = question({
      question_type: "true_false",
      correct_answer: { value: true },
    });
    expect(isCorrect(q, true)).toBe(true);
    expect(isCorrect(q, false)).toBe(false);
  });

  it("checks fill-blank case-insensitively and trims punctuation", () => {
    const q = question({
      question_type: "fill_blank",
      correct_answer: { text: "bill" },
    });
    expect(isCorrect(q, "Bill")).toBe(true);
    expect(isCorrect(q, "  the bill. ")).toBe(true);
    expect(isCorrect(q, "menu")).toBe(false);
  });

  it("treats a null answer as incorrect", () => {
    const q = question({ correct_answer: { index: 0 } });
    expect(isCorrect(q, null)).toBe(false);
  });
});

describe("normalizeText", () => {
  it("strips leading articles, case and punctuation", () => {
    expect(normalizeText("The Bill.")).toBe("bill");
    expect(normalizeText("a menu")).toBe("menu");
    expect(normalizeText("  An   Apple!  ")).toBe("apple");
  });
});

describe("getOptions", () => {
  it("returns the string options array", () => {
    const q = question({ answer_data: { options: ["a", "b", "c"] } });
    expect(getOptions(q)).toEqual(["a", "b", "c"]);
  });

  it("returns an empty array when there are no options", () => {
    expect(getOptions(question({ answer_data: {} }))).toEqual([]);
  });
});

describe("scoreQuiz", () => {
  const questions: QuizQuestion[] = [
    question({ id: "q1", correct_answer: { index: 0 } }),
    question({ id: "q2", correct_answer: { index: 1 } }),
  ];

  it("scores a perfect attempt as 100 and passed", () => {
    const result = scoreQuiz(questions, { q1: 0, q2: 1 }, 60);
    expect(result.score).toBe(100);
    expect(result.correctAnswers).toBe(2);
    expect(result.passed).toBe(true);
  });

  it("scores a half-correct attempt as 50", () => {
    const result = scoreQuiz(questions, { q1: 0, q2: 0 }, 60);
    expect(result.score).toBe(50);
    expect(result.passed).toBe(false);
  });

  it("treats unanswered questions as incorrect, not as errors", () => {
    const result = scoreQuiz(questions, { q1: 0 }, 60);
    expect(result.correctAnswers).toBe(1);
    expect(result.total).toBe(2);
  });

  it("respects a custom passing score", () => {
    const result = scoreQuiz(questions, { q1: 0, q2: 0 }, 50);
    expect(result.passed).toBe(true);
  });
});
