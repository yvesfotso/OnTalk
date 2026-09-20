"use client";

import { Check, RotateCcw, Trophy, X, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { ChoiceTile, Input } from "@/components/ui/form";
import { ProgressBar } from "@/components/ui/progress-bar";
import { InlineAlert } from "@/components/ui/states";
import { submitQuizAttemptAction } from "@/features/quiz/actions";
import {
  getOptions,
  isCorrect,
  type AnswerValue,
} from "@/features/quiz/scoring";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils/cn";
import type { QuizQuestion } from "@/types/database";

interface QuizRunnerProps {
  quizId: string;
  title: string;
  questions: QuizQuestion[];
  backHref: string;
}

interface Outcome {
  score: number;
  correctAnswers: number;
  total: number;
  passed: boolean;
  xpEarned: number;
}

export function QuizRunner({
  quizId,
  title,
  questions,
  backHref,
}: QuizRunnerProps) {
  const router = useRouter();

  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AnswerValue | null>>({});
  const [checked, setChecked] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [error, setError] = useState<string | null>(null);

  const question = questions[index];
  const total = questions.length;
  const isLast = index === total - 1;

  const given = question ? (answers[question.id] ?? null) : null;
  const correct = question ? isCorrect(question, given) : false;

  function restart() {
    setIndex(0);
    setAnswers({});
    setChecked(false);
    setOutcome(null);
    setError(null);
  }

  async function submit() {
    setSubmitting(true);
    setError(null);

    const result = await submitQuizAttemptAction({ quizId, answers });
    setSubmitting(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    track("quiz_completed", { quizId, score: result.score });
    setOutcome({
      score: result.score ?? 0,
      correctAnswers: result.correctAnswers ?? 0,
      total: result.total ?? total,
      passed: Boolean(result.passed),
      xpEarned: result.xpEarned ?? 0,
    });
    router.refresh();
  }

  if (outcome) {
    return (
      <Card className="animate-rise">
        <CardBody className="space-y-6 py-10 text-center">
          <span
            className={cn(
              "mx-auto grid size-14 place-items-center rounded-2xl",
              outcome.passed
                ? "bg-success-subtle text-success"
                : "bg-accent-subtle text-warning",
            )}
            aria-hidden
          >
            <Trophy className="size-7" />
          </span>

          <div>
            <h2 className="text-2xl font-semibold tracking-tight">
              {outcome.passed ? "Nice work!" : "Good effort"}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {outcome.passed
                ? `You passed "${title}".`
                : "Review the lesson and try again — repetition is the point."}
            </p>
          </div>

          <div className="mx-auto grid max-w-sm grid-cols-3 gap-3">
            <ResultStat label="Score" value={`${outcome.score}%`} />
            <ResultStat
              label="Correct"
              value={`${outcome.correctAnswers}/${outcome.total}`}
            />
            <ResultStat label="XP" value={`+${outcome.xpEarned}`} accent />
          </div>

          <div className="flex flex-col justify-center gap-2 sm:flex-row">
            <Button size="lg" variant="secondary" onClick={restart}>
              <RotateCcw className="size-4" aria-hidden />
              Retry
            </Button>
            <ButtonLink href={backHref} size="lg">
              Continue
            </ButtonLink>
          </div>
        </CardBody>
      </Card>
    );
  }

  if (!question) {
    return <InlineAlert>This quiz has no questions yet.</InlineAlert>;
  }

  const options = getOptions(question);

  return (
    <div className="space-y-5">
      <ProgressBar
        value={index + 1}
        max={total}
        label={`Question ${index + 1} of ${total}`}
        hideValue
        size="sm"
      />

      {error && <InlineAlert>{error}</InlineAlert>}

      <Card>
        <CardBody className="space-y-5 sm:p-8">
          <h2 className="text-lg font-medium text-foreground">
            {question.question_text}
          </h2>

          {question.question_type === "fill_blank" && options.length === 0 ? (
            <Input
              value={typeof given === "string" ? given : ""}
              disabled={checked}
              placeholder="Type your answer"
              aria-label="Your answer"
              onChange={(event) =>
                setAnswers((current) => ({
                  ...current,
                  [question.id]: event.target.value,
                }))
              }
            />
          ) : (
            <div className="space-y-2">
              {options.map((option, optionIndex) => {
                const value: AnswerValue =
                  question.question_type === "multiple_choice"
                    ? optionIndex
                    : question.question_type === "true_false"
                      ? option === "True"
                      : option;

                const isChosen = given === value;
                const isAnswer = isCorrect(question, value);

                return (
                  <ChoiceTile
                    key={option}
                    selected={isChosen}
                    disabled={checked}
                    onClick={() =>
                      setAnswers((current) => ({
                        ...current,
                        [question.id]: value,
                      }))
                    }
                    className={cn(
                      checked && isAnswer && "border-success bg-success-subtle",
                      checked &&
                        isChosen &&
                        !isAnswer &&
                        "border-danger bg-danger-subtle",
                      checked && "cursor-default",
                    )}
                  >
                    <span
                      className={cn(
                        "grid size-6 shrink-0 place-items-center rounded-full border text-xs font-semibold",
                        isChosen
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border-strong text-muted-foreground",
                        checked && isAnswer && "border-success bg-success text-white",
                      )}
                      aria-hidden
                    >
                      {String.fromCharCode(65 + optionIndex)}
                    </span>
                    {option}
                  </ChoiceTile>
                );
              })}
            </div>
          )}

          {checked && (
            <div
              role="status"
              className={cn(
                "flex items-start gap-3 rounded-xl border px-4 py-3 animate-rise",
                correct
                  ? "border-success-border bg-success-subtle"
                  : "border-danger-border bg-danger-subtle",
              )}
            >
              <span
                className={cn(
                  "mt-0.5 grid size-5 shrink-0 place-items-center rounded-full text-white",
                  correct ? "bg-success" : "bg-danger",
                )}
                aria-hidden
              >
                {correct ? <Check className="size-3.5" /> : <X className="size-3.5" />}
              </span>
              <div>
                <p
                  className={cn(
                    "text-sm font-semibold",
                    correct ? "text-success" : "text-danger",
                  )}
                >
                  {correct ? "Correct" : "Not quite"}
                </p>
                {question.explanation && (
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {question.explanation}
                  </p>
                )}
              </div>
            </div>
          )}
        </CardBody>
      </Card>

      <div className="flex justify-end">
        {!checked ? (
          <Button
            size="lg"
            disabled={given === null || given === ""}
            onClick={() => setChecked(true)}
          >
            Check answer
          </Button>
        ) : (
          <Button
            size="lg"
            loading={submitting}
            loadingText="Saving…"
            onClick={() => {
              if (isLast) {
                void submit();
              } else {
                setIndex((i) => i + 1);
                setChecked(false);
              }
            }}
          >
            {isLast ? (
              <>
                See results
                <Zap className="size-4" aria-hidden />
              </>
            ) : (
              "Next question"
            )}
          </Button>
        )}
      </div>
    </div>
  );
}

function ResultStat({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border bg-subtle px-3 py-3">
      <p
        className={cn(
          "text-xl font-semibold tabular-nums",
          accent ? "text-accent" : "text-foreground",
        )}
      >
        {value}
      </p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
