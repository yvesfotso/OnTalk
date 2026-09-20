"use client";

import { ArrowLeft, ArrowRight, PartyPopper, Zap } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { LessonSectionRenderer } from "@/components/lessons/section-renderer";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { InlineAlert } from "@/components/ui/states";
import {
  completeLessonAction,
  openLessonAction,
  saveLessonProgressAction,
} from "@/features/lessons/actions";
import { track } from "@/lib/analytics";
import type { ParsedSection } from "@/types/lesson";

interface LessonRunnerProps {
  lessonId: string;
  title: string;
  level: string;
  sections: ParsedSection[];
  quizSlug: string | null;
  alreadyCompleted: boolean;
}

interface Outcome {
  xpEarned: number;
  alreadyCompleted: boolean;
}

export function LessonRunner({
  lessonId,
  title,
  level,
  sections,
  quizSlug,
  alreadyCompleted,
}: LessonRunnerProps) {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const [finishing, setFinishing] = useState(false);
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [error, setError] = useState<string | null>(null);

  const headingRef = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);

  const total = sections.length;
  const section = sections[index];
  const isLast = index === total - 1;
  const percent = total === 0 ? 100 : Math.round(((index + 1) / total) * 100);

  useEffect(() => {
    void openLessonAction(lessonId);
    track("lesson_started", { lessonId });
  }, [lessonId]);

  // Persist progress as the learner advances, and move focus so screen-reader
  // and keyboard users land on the new section instead of the page top.
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    void saveLessonProgressAction(lessonId, percent);
    headingRef.current?.focus();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [index, lessonId, percent]);

  async function finish() {
    setFinishing(true);
    setError(null);

    const answered = Object.values(answers);
    const score =
      answered.length > 0
        ? Math.round(
            (answered.filter(Boolean).length / answered.length) * 100,
          )
        : null;

    const result = await completeLessonAction(lessonId, score);
    setFinishing(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    track("lesson_completed", { lessonId });
    setOutcome({
      xpEarned: result.xpEarned ?? 0,
      alreadyCompleted: Boolean(result.alreadyCompleted),
    });
    router.refresh();
  }

  if (outcome) {
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
              {outcome.alreadyCompleted
                ? "Lesson reviewed!"
                : `Lesson complete! You earned ${outcome.xpEarned} XP.`}
            </h2>
            <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
              {outcome.alreadyCompleted
                ? "You'd already finished this one, so no new XP this time — but revisiting is never wasted."
                : `Nice work on "${title}". Keep the streak going.`}
            </p>
          </div>

          <div className="flex flex-col justify-center gap-2 sm:flex-row">
            {quizSlug && (
              <ButtonLink href={`/app/quiz/${quizSlug}`} size="lg">
                Take the quiz
              </ButtonLink>
            )}
            <ButtonLink
              href="/app/learn"
              size="lg"
              variant={quizSlug ? "secondary" : "primary"}
            >
              Back to lessons
            </ButtonLink>
          </div>
        </CardBody>
      </Card>
    );
  }

  if (total === 0) {
    return (
      <InlineAlert>
        This lesson has no content yet. Please pick another one.
      </InlineAlert>
    );
  }

  return (
    <div className="space-y-5">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/app/learn"
            className="inline-flex items-center gap-1 rounded text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" aria-hidden />
            Lessons
          </Link>
          <Badge tone="primary">{level}</Badge>
          {alreadyCompleted && <Badge tone="success">Completed</Badge>}
        </div>

        <ProgressBar
          value={index + 1}
          max={total}
          label={`Section ${index + 1} of ${total}`}
          hideValue
          size="sm"
        />
      </div>

      <Card>
        <CardBody className="sm:p-8">
          <div ref={headingRef} tabIndex={-1} className="outline-none">
            <LessonSectionRenderer
              key={section.id}
              section={section}
              onAnswered={(correct) =>
                setAnswers((current) =>
                  // Only the first attempt counts toward the score.
                  section.id in current
                    ? current
                    : { ...current, [section.id]: correct },
                )
              }
            />
          </div>
        </CardBody>
      </Card>

      {error && <InlineAlert>{error}</InlineAlert>}

      <div className="flex items-center gap-3">
        <Button
          variant="secondary"
          disabled={index === 0 || finishing}
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
        >
          <ArrowLeft className="size-4" aria-hidden />
          Back
        </Button>

        <Button
          className="ml-auto"
          size="lg"
          loading={finishing}
          loadingText="Saving…"
          onClick={() => {
            if (isLast) void finish();
            else setIndex((i) => i + 1);
          }}
        >
          {isLast ? (
            <>
              Finish lesson
              <Zap className="size-4" aria-hidden />
            </>
          ) : (
            <>
              Continue
              <ArrowRight className="size-4" aria-hidden />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
