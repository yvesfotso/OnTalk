"use client";

import { ArrowLeft, Check, PartyPopper } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { ChoiceTile } from "@/components/ui/form";
import { ProgressBar } from "@/components/ui/progress-bar";
import { InlineAlert } from "@/components/ui/states";
import { completeOnboardingAction } from "@/features/onboarding/actions";
import { track } from "@/lib/analytics";
import {
  CEFR_LEVELS,
  DAILY_MINUTE_OPTIONS,
  IMPROVEMENT_AREAS,
  INTERESTS,
  LEARNING_GOALS,
  LEVEL_LABELS,
  type CefrLevel,
} from "@/lib/constants/app";
import { cn } from "@/lib/utils/cn";

/** "I'm not sure" maps to A2 — a safe middle starting point. */
const UNSURE_LEVEL: CefrLevel = "A2";

const STEP_COUNT = 5;

interface Answers {
  englishLevel: CefrLevel | null;
  unsure: boolean;
  learningGoal: string | null;
  improvementAreas: string[];
  dailyMinutesGoal: number | null;
  interests: string[];
}

const INITIAL: Answers = {
  englishLevel: null,
  unsure: false,
  learningGoal: null,
  improvementAreas: [],
  dailyMinutesGoal: 15,
  interests: [],
};

function toggle(list: string[], value: string): string[] {
  return list.includes(value)
    ? list.filter((item) => item !== value)
    : [...list, value];
}

export function OnboardingWizard({ displayName }: { displayName: string }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState<Answers>(INITIAL);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canContinue = (() => {
    switch (step) {
      case 1:
        return answers.englishLevel !== null;
      case 2:
        return answers.learningGoal !== null;
      case 3:
        return answers.improvementAreas.length > 0;
      case 4:
        return answers.dailyMinutesGoal !== null;
      case 5:
        return true;
      default:
        return false;
    }
  })();

  async function finish() {
    setSubmitting(true);
    setError(null);

    const result = await completeOnboardingAction({
      englishLevel: answers.englishLevel,
      learningGoal: answers.learningGoal,
      improvementAreas: answers.improvementAreas,
      dailyMinutesGoal: answers.dailyMinutesGoal,
      interests: answers.interests,
    });

    setSubmitting(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    track("onboarding_completed");
    setDone(true);
  }

  if (done) {
    return (
      <Card className="animate-rise text-center">
        <CardBody className="space-y-5 py-12">
          <span
            className="mx-auto grid size-14 place-items-center rounded-2xl bg-success-subtle text-success"
            aria-hidden
          >
            <PartyPopper className="size-7" />
          </span>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Your learning plan is ready.
            </h1>
            <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
              We&apos;ve set you up at {answers.englishLevel} with a{" "}
              {answers.dailyMinutesGoal}-minute daily goal and a starter deck of
              words to review.
            </p>
          </div>
          <Button
            size="lg"
            onClick={() => {
              router.replace("/app/dashboard");
              router.refresh();
            }}
          >
            Go to my dashboard
          </Button>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardBody className="space-y-6">
        <div>
          <ProgressBar
            value={step}
            max={STEP_COUNT}
            label={`Step ${step} of ${STEP_COUNT}`}
            hideValue
            size="sm"
          />
        </div>

        {error && <InlineAlert>{error}</InlineAlert>}

        {step === 1 && (
          <StepShell
            title={`Welcome, ${displayName}. What is your current English level?`}
            hint="Not sure? Pick the last option and we'll start you in the middle."
          >
            <div className="grid gap-2 sm:grid-cols-2">
              {CEFR_LEVELS.map((level) => (
                <ChoiceTile
                  key={level}
                  selected={!answers.unsure && answers.englishLevel === level}
                  onClick={() =>
                    setAnswers((a) => ({ ...a, englishLevel: level, unsure: false }))
                  }
                >
                  <span className="font-semibold">{level}</span>
                  <span className="text-muted-foreground">
                    {LEVEL_LABELS[level]}
                  </span>
                </ChoiceTile>
              ))}
              <ChoiceTile
                className="sm:col-span-2"
                selected={answers.unsure}
                onClick={() =>
                  setAnswers((a) => ({
                    ...a,
                    englishLevel: UNSURE_LEVEL,
                    unsure: true,
                  }))
                }
              >
                I&apos;m not sure
              </ChoiceTile>
            </div>
          </StepShell>
        )}

        {step === 2 && (
          <StepShell title="Why are you learning English?">
            <div className="grid gap-2 sm:grid-cols-2">
              {LEARNING_GOALS.map((goal) => (
                <ChoiceTile
                  key={goal.value}
                  selected={answers.learningGoal === goal.value}
                  onClick={() =>
                    setAnswers((a) => ({ ...a, learningGoal: goal.value }))
                  }
                >
                  {goal.label}
                </ChoiceTile>
              ))}
            </div>
          </StepShell>
        )}

        {step === 3 && (
          <StepShell
            title="What would you like to improve most?"
            hint="Choose as many as you like."
          >
            <div className="grid gap-2 sm:grid-cols-2">
              {IMPROVEMENT_AREAS.map((area) => {
                const selected = answers.improvementAreas.includes(area.value);
                return (
                  <ChoiceTile
                    key={area.value}
                    selected={selected}
                    onClick={() =>
                      setAnswers((a) => ({
                        ...a,
                        improvementAreas: toggle(a.improvementAreas, area.value),
                      }))
                    }
                  >
                    <Check
                      className={cn(
                        "size-4 shrink-0",
                        selected ? "text-primary" : "text-transparent",
                      )}
                      aria-hidden
                    />
                    {area.label}
                  </ChoiceTile>
                );
              })}
            </div>
          </StepShell>
        )}

        {step === 4 && (
          <StepShell title="How much do you want to study each day?">
            <div className="grid gap-2 sm:grid-cols-2">
              {DAILY_MINUTE_OPTIONS.map((minutes) => (
                <ChoiceTile
                  key={minutes}
                  selected={answers.dailyMinutesGoal === minutes}
                  onClick={() =>
                    setAnswers((a) => ({ ...a, dailyMinutesGoal: minutes }))
                  }
                >
                  {minutes} minutes
                </ChoiceTile>
              ))}
            </div>
          </StepShell>
        )}

        {step === 5 && (
          <StepShell
            title="Choose a few interests"
            hint="We use these to pick topics you'll actually want to read about. Optional."
          >
            <div className="flex flex-wrap gap-2">
              {INTERESTS.map((interest) => {
                const selected = answers.interests.includes(interest);
                return (
                  <button
                    key={interest}
                    type="button"
                    aria-pressed={selected}
                    onClick={() =>
                      setAnswers((a) => ({
                        ...a,
                        interests: toggle(a.interests, interest),
                      }))
                    }
                    className={cn(
                      "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                      selected
                        ? "border-primary bg-primary-subtle text-primary"
                        : "border-border bg-surface text-muted-foreground hover:border-border-strong hover:text-foreground",
                    )}
                  >
                    {interest}
                  </button>
                );
              })}
            </div>
          </StepShell>
        )}

        <div className="flex items-center gap-3 pt-2">
          {step > 1 && (
            <Button
              variant="ghost"
              onClick={() => setStep((s) => s - 1)}
              disabled={submitting}
            >
              <ArrowLeft className="size-4" aria-hidden />
              Back
            </Button>
          )}
          <Button
            className="ml-auto"
            size="lg"
            disabled={!canContinue}
            loading={submitting}
            loadingText="Building your plan…"
            onClick={() => {
              if (step < STEP_COUNT) setStep((s) => s + 1);
              else void finish();
            }}
          >
            {step < STEP_COUNT ? "Continue" : "Finish"}
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}

function StepShell({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
          {title}
        </h1>
        {hint && <p className="mt-1 text-sm text-muted-foreground">{hint}</p>}
      </div>
      {children}
    </div>
  );
}
