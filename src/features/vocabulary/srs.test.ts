import { describe, expect, it } from "vitest";

import { describeNextInterval, reviewCard, type SrsState } from "@/features/vocabulary/srs";

const FRESH: SrsState = {
  easeScore: 2.5,
  intervalDays: 0,
  reviewCount: 0,
  correctCount: 0,
  incorrectCount: 0,
};

const NOW = new Date("2026-01-01T00:00:00Z");

describe("reviewCard", () => {
  it("schedules 'again' a few minutes later, not a day later", () => {
    const result = reviewCard(FRESH, "again", NOW);
    expect(result.intervalDays).toBe(0);
    expect(result.status).toBe("learning");
    expect(result.nextReviewAt.getTime()).toBeGreaterThan(NOW.getTime());
    expect(result.nextReviewAt.getTime() - NOW.getTime()).toBeLessThan(
      60 * 60 * 1000,
    );
  });

  it("schedules a first 'good' review 3 days out", () => {
    const result = reviewCard(FRESH, "good", NOW);
    expect(result.intervalDays).toBe(3);
    const days =
      (result.nextReviewAt.getTime() - NOW.getTime()) / (24 * 60 * 60 * 1000);
    expect(days).toBeCloseTo(3, 5);
  });

  it("schedules a first 'easy' review further than a first 'good' review", () => {
    const good = reviewCard(FRESH, "good", NOW);
    const easy = reviewCard(FRESH, "easy", NOW);
    expect(easy.intervalDays).toBeGreaterThan(good.intervalDays);
  });

  it("grows the interval on repeated 'good' reviews", () => {
    let state: SrsState = FRESH;
    let previousInterval = 0;

    for (let i = 0; i < 4; i++) {
      const result = reviewCard(state, "good", NOW);
      expect(result.intervalDays).toBeGreaterThanOrEqual(previousInterval);
      previousInterval = result.intervalDays;
      state = result;
    }

    expect(previousInterval).toBeGreaterThan(3);
  });

  it("resets progress toward 'learned' after an 'again' following growth", () => {
    let state = reviewCard(FRESH, "good", NOW);
    state = reviewCard(state, "good", NOW);
    expect(state.status).not.toBe("learning");

    const afterLapse = reviewCard(state, "again", NOW);
    expect(afterLapse.intervalDays).toBe(0);
    expect(afterLapse.status).toBe("learning");
  });

  it("marks a card learned once its interval passes the threshold", () => {
    let state = reviewCard(FRESH, "easy", NOW);
    for (let i = 0; i < 7; i++) {
      state = reviewCard(state, "easy", NOW);
    }
    expect(state.status).toBe("learned");
  });

  it("tracks correct and incorrect counts separately", () => {
    let state = reviewCard(FRESH, "good", NOW);
    state = reviewCard(state, "again", NOW);
    expect(state.correctCount).toBe(1);
    expect(state.incorrectCount).toBe(1);
    expect(state.reviewCount).toBe(2);
  });

  it("keeps ease within its documented bounds after many lapses", () => {
    let state: SrsState = FRESH;
    for (let i = 0; i < 20; i++) {
      state = reviewCard(state, "again", NOW);
    }
    expect(state.easeScore).toBeGreaterThanOrEqual(1.3);
  });
});

describe("describeNextInterval", () => {
  it("describes a same-day interval in minutes", () => {
    expect(describeNextInterval(FRESH, "again")).toMatch(/min/);
  });

  it("describes a first 'good' review in days", () => {
    expect(describeNextInterval(FRESH, "good")).toBe("3 days");
  });
});
