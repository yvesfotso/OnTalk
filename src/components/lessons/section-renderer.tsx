"use client";

import { Check, Lightbulb, Target, Volume2, X } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { ChoiceTile } from "@/components/ui/form";
import { useSpeechSynthesis } from "@/features/speaking/use-speech";
import { cn } from "@/lib/utils/cn";
import type { ParsedSection } from "@/types/lesson";

interface SectionRendererProps {
  section: ParsedSection;
  /** Called with true/false the first time an interactive section is answered. */
  onAnswered?: (correct: boolean) => void;
}

/**
 * Dispatches a parsed section to the component that knows how to draw it.
 * Adding a new section type means adding a case here and a shape in
 * `src/types/lesson.ts`.
 */
export function LessonSectionRenderer({
  section,
  onAnswered,
}: SectionRendererProps) {
  switch (section.type) {
    case "introduction":
      return <IntroductionSection content={section.content} />;
    case "text":
      return <TextSection content={section.content} title={section.title} />;
    case "vocabulary":
      return <VocabularySection content={section.content} title={section.title} />;
    case "grammar":
      return <GrammarSection content={section.content} title={section.title} />;
    case "example":
      return <ExampleSection content={section.content} title={section.title} />;
    case "reading":
      return <ReadingSection content={section.content} />;
    case "multiple_choice":
      return (
        <MultipleChoiceSection
          content={section.content}
          title={section.title}
          onAnswered={onAnswered}
        />
      );
    case "fill_blank":
      return (
        <FillBlankSection
          content={section.content}
          title={section.title}
          onAnswered={onAnswered}
        />
      );
    case "speaking_prompt":
      return <SpeakingPromptSection content={section.content} title={section.title} />;
    case "summary":
      return <SummarySection content={section.content} title={section.title} />;
  }
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-lg font-semibold tracking-tight text-foreground">
      {children}
    </h2>
  );
}

function IntroductionSection({
  content,
}: {
  content: Extract<ParsedSection, { type: "introduction" }>["content"];
}) {
  return (
    <div className="space-y-4">
      <SectionTitle>{content.heading}</SectionTitle>
      <p className="text-[15px] leading-relaxed text-muted-foreground">
        {content.body}
      </p>

      {content.objectives && content.objectives.length > 0 && (
        <Card className="bg-primary-subtle border-primary-border">
          <CardBody className="p-4 sm:p-5">
            <p className="flex items-center gap-2 text-sm font-semibold text-primary">
              <Target className="size-4" aria-hidden />
              By the end you will be able to
            </p>
            <ul className="mt-2.5 space-y-1.5">
              {content.objectives.map((objective) => (
                <li
                  key={objective}
                  className="flex items-start gap-2 text-sm text-foreground"
                >
                  <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                  {objective}
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>
      )}
    </div>
  );
}

function TextSection({
  content,
  title,
}: {
  content: Extract<ParsedSection, { type: "text" }>["content"];
  title: string | null;
}) {
  return (
    <div className="space-y-3">
      {title && <SectionTitle>{title}</SectionTitle>}
      {content.paragraphs.map((paragraph, index) => (
        <p key={index} className="text-[15px] leading-relaxed text-muted-foreground">
          {paragraph}
        </p>
      ))}
    </div>
  );
}

function VocabularySection({
  content,
  title,
}: {
  content: Extract<ParsedSection, { type: "vocabulary" }>["content"];
  title: string | null;
}) {
  const { supported, speak } = useSpeechSynthesis();

  return (
    <div className="space-y-4">
      <SectionTitle>{title ?? "Useful words"}</SectionTitle>
      <ul className="space-y-2.5">
        {content.items.map((item) => (
          <li key={item.word}>
            <Card>
              <CardBody className="p-4 sm:p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-base font-semibold text-foreground">
                    {item.word}
                  </span>
                  {item.phonetic && (
                    <span className="font-mono text-xs text-muted-foreground">
                      {item.phonetic}
                    </span>
                  )}
                  {supported && (
                    <button
                      type="button"
                      onClick={() => speak(item.word)}
                      aria-label={`Listen to ${item.word}`}
                      className="ml-auto grid size-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-subtle hover:text-primary"
                    >
                      <Volume2 className="size-4" aria-hidden />
                    </button>
                  )}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {item.definition}
                </p>
                {item.example && (
                  <p className="mt-2 border-l-2 border-primary-border pl-3 text-sm text-foreground italic">
                    {item.example}
                  </p>
                )}
              </CardBody>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}

function GrammarSection({
  content,
  title,
}: {
  content: Extract<ParsedSection, { type: "grammar" }>["content"];
  title: string | null;
}) {
  return (
    <div className="space-y-4">
      <SectionTitle>{title ?? "Grammar"}</SectionTitle>

      <Card className="border-primary-border bg-primary-subtle">
        <CardBody className="p-4 sm:p-5">
          <p className="font-mono text-sm font-semibold text-primary">
            {content.rule}
          </p>
        </CardBody>
      </Card>

      <p className="text-[15px] leading-relaxed text-muted-foreground">
        {content.explanation}
      </p>

      {content.examples.length > 0 && (
        <ul className="space-y-2">
          {content.examples.map((example) => (
            <li
              key={example}
              className="rounded-xl border border-border bg-surface px-4 py-3 text-sm text-foreground"
            >
              {example}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ExampleSection({
  content,
  title,
}: {
  content: Extract<ParsedSection, { type: "example" }>["content"];
  title: string | null;
}) {
  const { supported, speak } = useSpeechSynthesis();

  return (
    <div className="space-y-4">
      <SectionTitle>{content.heading ?? title ?? "Examples"}</SectionTitle>
      <ul className="space-y-2">
        {content.items.map((item) => (
          <li
            key={item.text}
            className="flex items-start gap-3 rounded-xl border border-border bg-surface px-4 py-3"
          >
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground">{item.text}</p>
              {item.note && (
                <p className="mt-0.5 text-xs text-muted-foreground">{item.note}</p>
              )}
            </div>
            {supported && (
              <button
                type="button"
                onClick={() => speak(item.text)}
                aria-label={`Listen to: ${item.text}`}
                className="grid size-8 shrink-0 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-subtle hover:text-primary"
              >
                <Volume2 className="size-4" aria-hidden />
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ReadingSection({
  content,
}: {
  content: Extract<ParsedSection, { type: "reading" }>["content"];
}) {
  return (
    <div className="space-y-4">
      <SectionTitle>{content.title ?? "Reading"}</SectionTitle>

      <Card>
        <CardBody className="space-y-2.5">
          {content.paragraphs.map((paragraph, index) => (
            <p key={index} className="text-[15px] leading-relaxed text-foreground">
              {paragraph}
            </p>
          ))}
        </CardBody>
      </Card>

      {content.questions && content.questions.length > 0 && (
        <div>
          <p className="text-sm font-semibold text-foreground">Think about</p>
          <ul className="mt-2 space-y-1.5">
            {content.questions.map((question) => (
              <li
                key={question}
                className="flex items-start gap-2 text-sm text-muted-foreground"
              >
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
                {question}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function Feedback({
  correct,
  explanation,
}: {
  correct: boolean;
  explanation?: string;
}) {
  return (
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
      <div className="min-w-0">
        <p
          className={cn(
            "text-sm font-semibold",
            correct ? "text-success" : "text-danger",
          )}
        >
          {correct ? "Correct" : "Not quite"}
        </p>
        {explanation && (
          <p className="mt-0.5 text-sm text-muted-foreground">{explanation}</p>
        )}
      </div>
    </div>
  );
}

function MultipleChoiceSection({
  content,
  title,
  onAnswered,
}: {
  content: Extract<ParsedSection, { type: "multiple_choice" }>["content"];
  title: string | null;
  onAnswered?: (correct: boolean) => void;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);

  const correct = selected === content.correctIndex;

  return (
    <div className="space-y-4">
      <SectionTitle>{title ?? "Practice"}</SectionTitle>
      <p className="text-[15px] font-medium text-foreground">{content.question}</p>

      <div className="space-y-2">
        {content.options.map((option, index) => {
          const isChosen = selected === index;
          const isAnswer = index === content.correctIndex;

          return (
            <ChoiceTile
              key={option}
              selected={isChosen}
              disabled={checked}
              onClick={() => setSelected(index)}
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
                {String.fromCharCode(65 + index)}
              </span>
              {option}
            </ChoiceTile>
          );
        })}
      </div>

      {!checked ? (
        <Button
          disabled={selected === null}
          onClick={() => {
            setChecked(true);
            onAnswered?.(correct);
          }}
        >
          Check answer
        </Button>
      ) : (
        <Feedback correct={correct} explanation={content.explanation} />
      )}
    </div>
  );
}

function FillBlankSection({
  content,
  title,
  onAnswered,
}: {
  content: Extract<ParsedSection, { type: "fill_blank" }>["content"];
  title: string | null;
  onAnswered?: (correct: boolean) => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);

  const normalize = (value: string) => value.trim().toLowerCase();
  const correct = selected !== null && normalize(selected) === normalize(content.answer);

  const [before, after] = content.sentence.split(/_{2,}/);

  return (
    <div className="space-y-4">
      <SectionTitle>{title ?? "Fill in the blank"}</SectionTitle>

      <p className="rounded-xl border border-border bg-surface px-4 py-4 text-[15px] leading-relaxed text-foreground">
        {before}
        <span
          className={cn(
            "mx-1 inline-block min-w-24 rounded-md border-b-2 px-2 text-center font-semibold",
            checked
              ? correct
                ? "border-success text-success"
                : "border-danger text-danger"
              : "border-primary text-primary",
          )}
        >
          {selected ?? " "}
        </span>
        {after}
      </p>

      {content.options && (
        <div className="flex flex-wrap gap-2">
          {content.options.map((option) => (
            <button
              key={option}
              type="button"
              disabled={checked}
              aria-pressed={selected === option}
              onClick={() => setSelected(option)}
              className={cn(
                "rounded-full border px-4 py-2 text-sm font-medium transition-colors disabled:cursor-default",
                selected === option
                  ? "border-primary bg-primary-subtle text-primary"
                  : "border-border bg-surface text-muted-foreground hover:border-border-strong hover:text-foreground",
              )}
            >
              {option}
            </button>
          ))}
        </div>
      )}

      {!checked ? (
        <Button
          disabled={selected === null}
          onClick={() => {
            setChecked(true);
            onAnswered?.(correct);
          }}
        >
          Check answer
        </Button>
      ) : (
        <Feedback
          correct={correct}
          explanation={
            correct
              ? content.explanation
              : `The answer is "${content.answer}". ${content.explanation ?? ""}`.trim()
          }
        />
      )}
    </div>
  );
}

function SpeakingPromptSection({
  content,
  title,
}: {
  content: Extract<ParsedSection, { type: "speaking_prompt" }>["content"];
  title: string | null;
}) {
  const { supported, speaking, speak } = useSpeechSynthesis();

  return (
    <div className="space-y-4">
      <SectionTitle>{title ?? "Say it out loud"}</SectionTitle>

      <Card className="border-primary-border bg-primary-subtle">
        <CardBody className="space-y-4">
          <p className="text-lg leading-relaxed font-medium text-foreground">
            &ldquo;{content.phrase}&rdquo;
          </p>

          {supported ? (
            <Button
              variant="secondary"
              onClick={() => speak(content.phrase)}
              loading={speaking}
              loadingText="Playing…"
            >
              <Volume2 className="size-4" aria-hidden />
              Listen
            </Button>
          ) : (
            <p className="text-xs text-muted-foreground">
              Audio playback isn&apos;t supported in this browser. Read the phrase
              aloud a few times instead.
            </p>
          )}
        </CardBody>
      </Card>

      {content.tip && (
        <p className="flex items-start gap-2 text-sm text-muted-foreground">
          <Lightbulb className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden />
          {content.tip}
        </p>
      )}
    </div>
  );
}

function SummarySection({
  content,
  title,
}: {
  content: Extract<ParsedSection, { type: "summary" }>["content"];
  title: string | null;
}) {
  return (
    <div className="space-y-4">
      <SectionTitle>{title ?? "What you learned"}</SectionTitle>

      <ul className="space-y-2.5">
        {content.points.map((point) => (
          <li key={point} className="flex items-start gap-3">
            <span
              className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-success-subtle text-success"
              aria-hidden
            >
              <Check className="size-3.5" />
            </span>
            <span className="text-[15px] text-foreground">{point}</span>
          </li>
        ))}
      </ul>

      {content.nextStep && (
        <Card className="bg-subtle">
          <CardBody className="p-4 sm:p-5">
            <Badge tone="primary">Next</Badge>
            <p className="mt-2 text-sm text-muted-foreground">
              {content.nextStep}
            </p>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
