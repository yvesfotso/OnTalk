"use client";

import { PartyPopper, RotateCcw, Volume2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { InlineAlert } from "@/components/ui/states";
import { useSpeechSynthesis } from "@/features/speaking/use-speech";
import {
  finishReviewSessionAction,
  reviewCardAction,
} from "@/features/vocabulary/actions";
import {
  describeNextInterval,
  REVIEW_GRADES,
  type ReviewGrade,
} from "@/features/vocabulary/srs";
import type { VocabularyCard } from "@/features/vocabulary/queries";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils/cn";

const GRADE_LABELS: Record<ReviewGrade, string> = {
  again: "Again",
  hard: "Hard",
  good: "Good",
  easy: "Easy",
};

const GRADE_CLASSES: Record<ReviewGrade, string> = {
  again: "border-danger-border bg-danger-subtle text-danger hover:bg-danger-subtle/70",
  hard: "border-accent/30 bg-accent-subtle text-warning hover:bg-accent-subtle/70",
  good: "border-primary-border bg-primary-subtle text-primary hover:bg-primary-border/50",
  easy: "border-success-border bg-success-subtle text-success hover:bg-success-subtle/70",
};

export function ReviewSession({ cards }: { cards: VocabularyCard[] }) {
  const router = useRouter();
  const { supported: canSpeak, speak } = useSpeechSynthesis();

  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ reviewed: number; xp: number } | null>(null);

  const startedAt = useRef(Date.now());
  const reviewedCount = useRef(0);

  const card = cards[index];
  const total = cards.length;

  async function grade(grade: ReviewGrade) {
    if (!card || saving) return;

    setSaving(true);
    setError(null);

    const result = await reviewCardAction({
      userVocabularyId: card.id,
      grade,
    });

    if (result.error) {
      setSaving(false);
      setError(result.error);
      return;
    }

    reviewedCount.current += 1;
    track("vocabulary_reviewed", { grade });

    const isLast = index === total - 1;

    if (!isLast) {
      setIndex((i) => i + 1);
      setRevealed(false);
      setSaving(false);
      return;
    }

    const minutes = Math.min(
      Math.round((Date.now() - startedAt.current) / 60_000),
      60,
    );

    const session = await finishReviewSessionAction({
      reviewed: reviewedCount.current,
      minutes,
    });

    setSaving(false);
    setDone({ reviewed: reviewedCount.current, xp: session.xpEarned ?? 0 });
    router.refresh();
  }

  if (done) {
    return (
      <Card className="animate-rise">
        <CardBody className="space-y-5 py-12 text-center">
          <span
            className="mx-auto grid size-14 place-items-center rounded-2xl bg-success-subtle text-success"
            aria-hidden
          >
            <PartyPopper className="size-7" />
          </span>
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">
              Review complete
            </h2>
            <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
              You reviewed {done.reviewed}{" "}
              {done.reviewed === 1 ? "word" : "words"} and earned {done.xp} XP.
              Each card is scheduled to come back at the right moment.
            </p>
          </div>
          <div className="flex flex-col justify-center gap-2 sm:flex-row">
            <ButtonLink href="/app/dashboard" size="lg">
              Back to dashboard
            </ButtonLink>
            <ButtonLink href="/app/vocabulary" size="lg" variant="secondary">
              See my words
            </ButtonLink>
          </div>
        </CardBody>
      </Card>
    );
  }

  if (!card) return null;

  const srsState = {
    easeScore: card.easeScore,
    intervalDays: card.intervalDays,
    reviewCount: card.reviewCount,
    correctCount: card.correctCount,
    incorrectCount: card.incorrectCount,
  };

  return (
    <div className="space-y-5">
      <ProgressBar
        value={index + (revealed ? 1 : 0)}
        max={total}
        label={`Card ${index + 1} of ${total}`}
        hideValue
        size="sm"
      />

      {error && <InlineAlert>{error}</InlineAlert>}

      <Card className="min-h-72">
        <CardBody className="flex min-h-72 flex-col items-center justify-center gap-4 py-10 text-center sm:p-8">
          <div className="flex items-center gap-2">
            <Badge tone="primary">{card.word.level}</Badge>
            {card.word.part_of_speech && <Badge>{card.word.part_of_speech}</Badge>}
          </div>

          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {card.word.word}
            </h2>
            {canSpeak && (
              <button
                type="button"
                onClick={() => speak(card.word.word)}
                aria-label={`Listen to ${card.word.word}`}
                className="grid size-10 place-items-center rounded-xl text-muted-foreground transition-colors hover:bg-subtle hover:text-primary"
              >
                <Volume2 className="size-5" aria-hidden />
              </button>
            )}
          </div>

          {card.word.phonetic && (
            <p className="font-mono text-sm text-muted-foreground">
              {card.word.phonetic}
            </p>
          )}

          {revealed ? (
            <div className="animate-rise space-y-3">
              <p className="text-lg text-foreground">{card.word.definition}</p>
              {card.word.example_sentence && (
                <p className="mx-auto max-w-md border-l-2 border-primary-border pl-3 text-left text-sm text-muted-foreground italic">
                  {card.word.example_sentence}
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-faint-foreground">
              Try to recall the meaning, then show the answer.
            </p>
          )}
        </CardBody>
      </Card>

      {revealed ? (
        <div>
          <p className="mb-2 text-center text-xs text-muted-foreground">
            How well did you know it?
          </p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {REVIEW_GRADES.map((value) => (
              <button
                key={value}
                type="button"
                disabled={saving}
                onClick={() => void grade(value)}
                className={cn(
                  "rounded-xl border px-3 py-3 text-sm font-semibold transition-colors disabled:opacity-60",
                  GRADE_CLASSES[value],
                )}
              >
                {GRADE_LABELS[value]}
                <span className="mt-0.5 block text-xs font-normal opacity-75">
                  {describeNextInterval(srsState, value)}
                </span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <Button block size="lg" onClick={() => setRevealed(true)}>
          <RotateCcw className="size-4" aria-hidden />
          Show answer
        </Button>
      )}
    </div>
  );
}
