import { describe, expect, it } from "vitest";

import { compareSpeech } from "@/features/speaking/compare";

describe("compareSpeech", () => {
  it("scores an exact match as 100%", () => {
    const result = compareSpeech(
      "Could I see the menu, please?",
      "Could I see the menu please",
    );
    expect(result.accuracy).toBe(100);
    expect(result.diff.every((d) => d.status === "match")).toBe(true);
  });

  it("is case and punctuation insensitive", () => {
    const result = compareSpeech("Hello there", "hello, THERE!");
    expect(result.accuracy).toBe(100);
  });

  it("flags a missing word without failing the rest", () => {
    const result = compareSpeech(
      "Could I see the menu please",
      "Could I see menu please",
    );
    expect(result.diff.some((d) => d.status === "missing" && d.word === "the")).toBe(
      true,
    );
    expect(result.accuracy).toBeGreaterThan(50);
  });

  it("flags extra words the learner added", () => {
    const result = compareSpeech("I like tea", "I really like tea");
    expect(
      result.diff.some((d) => d.status === "extra" && d.word === "really"),
    ).toBe(true);
  });

  it("scores an empty transcript as 0%", () => {
    const result = compareSpeech("Hello there", "");
    expect(result.accuracy).toBe(0);
    expect(result.message).toMatch(/didn't catch anything/i);
  });

  it("never claims a pronunciation score in its message", () => {
    const result = compareSpeech("Hello there", "hello there");
    expect(result.message.toLowerCase()).not.toContain("pronunciation");
  });
});
