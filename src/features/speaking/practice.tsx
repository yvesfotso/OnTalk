"use client";

import { ChevronRight, Info, Mic, Square, Volume2 } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { InlineAlert } from "@/components/ui/states";
import { getSpeechAnalyzer } from "@/features/speaking/analyzer";
import type { SpeakingFeedback } from "@/features/speaking/compare";
import { saveSpeakingAttemptAction } from "@/features/speaking/actions";
import {
  recognitionErrorMessage,
  useSpeechRecognition,
  useSpeechSynthesis,
} from "@/features/speaking/use-speech";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils/cn";

export interface SpeakingPrompt {
  id: string;
  phrase: string;
  tip: string | null;
  level: string;
  lessonTitle: string;
}

const analyzer = getSpeechAnalyzer();

export function SpeakingPractice({ prompts }: { prompts: SpeakingPrompt[] }) {
  const [index, setIndex] = useState(0);
  const [feedback, setFeedback] = useState<SpeakingFeedback | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [xpEarned, setXpEarned] = useState<number | null>(null);

  const prompt = prompts[index];

  const { supported: canSpeak, speaking, speak } = useSpeechSynthesis();

  const {
    supported: canListen,
    listening,
    transcript,
    error: recognitionError,
    start,
    stop,
    reset,
  } = useSpeechRecognition({
    onFinalResult: (finalTranscript) => {
      const result = analyzer.analyze(prompt.phrase, finalTranscript);
      setFeedback(result);
      track("speaking_attempted", { accuracy: result.accuracy });

      void saveSpeakingAttemptAction({
        prompt: prompt.phrase,
        transcript: finalTranscript,
      }).then((saved) => {
        if (saved.error) setSaveError(saved.error);
        else setXpEarned(saved.xpEarned ?? null);
      });
    },
  });

  function goToPrompt(nextIndex: number) {
    setIndex(nextIndex);
    setFeedback(null);
    setSaveError(null);
    setXpEarned(null);
    reset();
  }

  if (!prompt) return null;

  return (
    <div className="space-y-5">
      <Card>
        <CardBody className="space-y-5 sm:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="primary">{prompt.level}</Badge>
            <Badge>{prompt.lessonTitle}</Badge>
            <span className="ml-auto text-xs text-muted-foreground tabular-nums">
              {index + 1} / {prompts.length}
            </span>
          </div>

          <p className="text-xl leading-relaxed font-medium text-foreground sm:text-2xl">
            &ldquo;{prompt.phrase}&rdquo;
          </p>

          {prompt.tip && (
            <p className="text-sm text-muted-foreground">{prompt.tip}</p>
          )}

          <div className="flex flex-wrap gap-2">
            {canSpeak && (
              <Button
                variant="secondary"
                onClick={() => speak(prompt.phrase)}
                loading={speaking}
                loadingText="Playing…"
              >
                <Volume2 className="size-4" aria-hidden />
                Listen
              </Button>
            )}

            {canListen &&
              (listening ? (
                <Button variant="danger" onClick={stop}>
                  <Square className="size-4" aria-hidden />
                  Stop
                </Button>
              ) : (
                <Button
                  onClick={() => {
                    setFeedback(null);
                    setSaveError(null);
                    setXpEarned(null);
                    start();
                  }}
                >
                  <Mic className="size-4" aria-hidden />
                  {feedback ? "Try again" : "Start speaking"}
                </Button>
              ))}
          </div>

          {listening && (
            <p
              role="status"
              className="flex items-center gap-2 text-sm font-medium text-primary"
            >
              <span className="relative flex size-2.5" aria-hidden>
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-60" />
                <span className="relative inline-flex size-2.5 rounded-full bg-primary" />
              </span>
              Listening… say the phrase out loud.
            </p>
          )}

          {transcript && (
            <div className="rounded-xl border border-border bg-subtle px-4 py-3">
              <p className="text-xs font-semibold tracking-wide text-faint-foreground uppercase">
                What we heard
              </p>
              <p className="mt-1 text-sm text-foreground">{transcript}</p>
            </div>
          )}

          {!canListen && (
            <InlineAlert tone="info">
              Speech recognition is not supported in this browser. You can still
              listen and practice aloud.
            </InlineAlert>
          )}

          {recognitionError && (
            <InlineAlert>{recognitionErrorMessage(recognitionError)}</InlineAlert>
          )}

          {saveError && <InlineAlert>{saveError}</InlineAlert>}
        </CardBody>
      </Card>

      {feedback && (
        <Card className="animate-rise">
          <CardBody className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-base font-semibold">{analyzer.label}</h2>
              <Badge
                tone={
                  feedback.accuracy >= 90
                    ? "success"
                    : feedback.accuracy >= 70
                      ? "primary"
                      : "accent"
                }
                size="md"
              >
                {feedback.accuracy}% word match
              </Badge>
            </div>

            <p className="text-sm text-foreground">{feedback.message}</p>

            <div>
              <p className="mb-2 text-xs font-semibold tracking-wide text-faint-foreground uppercase">
                Word by word
              </p>
              <p className="flex flex-wrap gap-1.5">
                {feedback.diff.map((word, wordIndex) => (
                  <span
                    key={`${word.word}-${wordIndex}`}
                    className={cn(
                      "rounded-md px-2 py-1 text-sm",
                      word.status === "match" &&
                        "bg-success-subtle text-success",
                      word.status === "missing" &&
                        "bg-danger-subtle text-danger line-through",
                      word.status === "extra" &&
                        "bg-subtle text-muted-foreground italic",
                    )}
                  >
                    {word.word}
                  </span>
                ))}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                Green matched the phrase, red was missing, grey was extra.
              </p>
            </div>

            <p className="flex items-start gap-2 rounded-xl bg-subtle px-3.5 py-2.5 text-xs text-muted-foreground">
              <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden />
              This compares the words your browser recognised against the target
              phrase. It is not a pronunciation score.
            </p>

            {xpEarned !== null && (
              <p className="text-sm font-medium text-success">
                +{xpEarned} XP recorded.
              </p>
            )}

            {index < prompts.length - 1 && (
              <Button onClick={() => goToPrompt(index + 1)}>
                Next phrase
                <ChevronRight className="size-4" aria-hidden />
              </Button>
            )}
          </CardBody>
        </Card>
      )}

      <nav aria-label="All phrases" className="flex flex-wrap gap-2">
        {prompts.map((item, itemIndex) => (
          <button
            key={item.id}
            type="button"
            aria-current={itemIndex === index ? "true" : undefined}
            onClick={() => goToPrompt(itemIndex)}
            className={cn(
              "size-9 rounded-lg border text-sm font-medium tabular-nums transition-colors",
              itemIndex === index
                ? "border-primary bg-primary-subtle text-primary"
                : "border-border bg-surface text-muted-foreground hover:border-border-strong hover:text-foreground",
            )}
          >
            {itemIndex + 1}
            <span className="sr-only">: {item.phrase}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
