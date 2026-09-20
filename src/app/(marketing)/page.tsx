import {
  BookOpen,
  Check,
  ChevronRight,
  GraduationCap,
  Mic,
  Sparkles,
  TrendingUp,
  Zap,
} from "lucide-react";
import type { Metadata } from "next";

import { LearnerIllustration } from "@/components/marketing/learner-illustration";
import { PhoneShowcase } from "@/components/marketing/phone-showcase";
import { ButtonLink } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody } from "@/components/ui/card";
import { AI_TUTOR_ENABLED, APP, CEFR_LEVELS, LEVEL_LABELS, PLANS } from "@/lib/constants/app";

// No `title` here: the root layout's `title.default` already provides the
// exact SEO title for this page. Setting one would apply the `%s · OnTalk`
// template on top of it and duplicate the brand name.
export const metadata: Metadata = {
  description: APP.description,
};

const FEATURES = [
  {
    icon: GraduationCap,
    title: "Structured Lessons",
    description:
      "Short, focused lessons that build on each other — from your first introduction to a mock job interview.",
  },
  {
    icon: BookOpen,
    title: "Smart Vocabulary Review",
    description:
      "A spaced-repetition deck that brings words back right before you'd forget them, not on a fixed schedule.",
  },
  {
    icon: Mic,
    title: "Speaking Practice",
    description:
      "Listen to a model phrase, say it back, and see exactly which words matched — right in your browser.",
  },
  {
    icon: Sparkles,
    title: "AI English Tutor",
    description:
      "Chat, get grammar coaching, or run a mock interview with a tutor that adapts to your level.",
    comingSoon: !AI_TUTOR_ENABLED,
  },
  {
    icon: TrendingUp,
    title: "Progress Tracking",
    description:
      "XP, streaks, and a weekly activity chart so you can see the habit forming, not just guess at it.",
  },
];

const STEPS = [
  { title: "Choose your level", description: "Tell us where you're starting from — or let us guess." },
  { title: "Follow your learning path", description: "A demo curriculum from A1 introductions to B1 interviews." },
  { title: "Practice every day", description: "Lessons, vocabulary, speaking and the AI tutor, in short sessions." },
  { title: "Track your improvement", description: "Watch XP, streaks and lesson completion add up over time." },
];

const FAQS = [
  {
    q: "Is OnTalk free to use?",
    a: "Yes. The Free plan includes the core lesson path, vocabulary review, basic speaking practice, and 5 AI tutor messages a day. Premium raises the AI allowance and unlocks the full lesson library.",
  },
  {
    q: "Do I need to install anything?",
    a: "No. OnTalk runs in your browser on desktop, tablet and mobile, and can be installed as an app from your browser's menu.",
  },
  {
    q: "Does speaking practice really check my pronunciation?",
    a: "It compares the words your browser's speech recognition heard against the target phrase — useful feedback on what you said, but not a scientific pronunciation score.",
  },
  {
    q: "What levels does OnTalk cover?",
    a: "The demo curriculum spans A1 through B1, with more levels planned. Your lessons are chosen based on the level you set during onboarding.",
  },
];

export default function LandingPage() {
  return (
    <>
      <section className="mx-auto max-w-6xl px-4 pt-14 pb-16 sm:px-6 sm:pt-20 sm:pb-24">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-8">
          <div>
            <Badge tone="primary" size="md">
              Free to start — no credit card
            </Badge>
            <h1 className="mt-5 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              Speak English with confidence.
            </h1>
            <p className="mt-4 max-w-lg text-lg leading-relaxed text-muted-foreground">
              Build your vocabulary, improve your grammar, practice speaking, and
              learn with an AI tutor — one short lesson at a time.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/register" size="lg">
                Start Learning Free
                <ChevronRight className="size-4" aria-hidden />
              </ButtonLink>
              <ButtonLink href="#how-it-works" variant="secondary" size="lg">
                See How It Works
              </ButtonLink>
            </div>
          </div>

          <PhoneShowcase />
        </div>
      </section>

      <section id="features" className="border-t border-border bg-surface py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto max-w-xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight">
              Everything you need to build the habit
            </h2>
            <p className="mt-3 text-muted-foreground">
              Five tools that work together, not five separate apps.
            </p>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <Card key={feature.title} className="p-6">
                <div className="flex items-start justify-between gap-2">
                  <span
                    className="grid size-11 place-items-center rounded-xl bg-primary-subtle text-primary"
                    aria-hidden
                  >
                    <feature.icon className="size-5" />
                  </span>
                  {"comingSoon" in feature && feature.comingSoon && (
                    <Badge tone="primary">Coming soon</Badge>
                  )}
                </div>
                <h3 className="mt-4 text-base font-semibold">{feature.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto max-w-xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight">How it works</h2>
          </div>

          <ol className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step, index) => (
              <li key={step.title} className="relative">
                <span
                  className="grid size-9 place-items-center rounded-full bg-primary text-sm font-semibold text-primary-foreground"
                  aria-hidden
                >
                  {index + 1}
                </span>
                <h3 className="mt-3 text-base font-semibold">{step.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {step.description}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="border-t border-border bg-surface py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <LearnerIllustration className="mx-auto w-full max-w-sm" />
            <div>
              <h2 className="text-3xl font-semibold tracking-tight">
                Practice fits into the time you already have
              </h2>
              <p className="mt-4 text-muted-foreground">
                No classroom, no schedule to plan around. Open OnTalk on your
                phone during a commute, a coffee break, or the last ten
                minutes before bed, and pick up exactly where you left off.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  "Short lessons that fit a spare five minutes",
                  "Vocabulary review that adapts to what you're forgetting",
                  "Speaking practice you can do quietly, headphones in",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-foreground">
                    <span
                      className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-primary-subtle text-primary"
                      aria-hidden
                    >
                      <Check className="size-3" />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
              <ButtonLink href="/register" className="mt-7">
                Start Learning Free
                <ChevronRight className="size-4" aria-hidden />
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto max-w-xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight">
              Wherever you&apos;re starting from
            </h2>
            <p className="mt-3 text-muted-foreground">
              Onboarding places you on the CEFR scale, from complete beginner to
              proficient.
            </p>
          </div>

          <div className="mx-auto mt-10 grid max-w-3xl grid-cols-3 gap-3 sm:grid-cols-6">
            {CEFR_LEVELS.map((level) => (
              <div
                key={level}
                className="rounded-xl border border-border bg-background px-3 py-4 text-center"
              >
                <p className="text-lg font-semibold text-primary">{level}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {LEVEL_LABELS[level]}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto max-w-xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight">
              Simple pricing
            </h2>
            <p className="mt-3 text-muted-foreground">
              Start free. Upgrade later if you want more from the AI tutor.
            </p>
          </div>

          <div className="mx-auto mt-10 grid max-w-2xl gap-4 sm:grid-cols-2">
            {(Object.keys(PLANS) as Array<keyof typeof PLANS>).map((planId) => {
              const plan = PLANS[planId];
              const featured = planId === "premium";

              return (
                <Card
                  key={planId}
                  className={
                    featured ? "border-primary shadow-raised" : undefined
                  }
                >
                  <CardBody>
                    {featured && (
                      <Badge tone="primary" className="mb-3">
                        Most popular
                      </Badge>
                    )}
                    <h3 className="text-lg font-semibold">{plan.name}</h3>
                    <p className="mt-1">
                      <span className="text-3xl font-semibold tracking-tight">
                        {plan.price}
                      </span>{" "}
                      <span className="text-sm text-muted-foreground">
                        {plan.period}
                      </span>
                    </p>
                    <ul className="mt-5 space-y-2.5">
                      {plan.features.map((feature) => (
                        <li
                          key={feature}
                          className="flex items-start gap-2 text-sm text-muted-foreground"
                        >
                          <Zap className="mt-0.5 size-3.5 shrink-0 text-accent" aria-hidden />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <ButtonLink
                      href="/register"
                      block
                      className="mt-6"
                      variant={featured ? "primary" : "secondary"}
                    >
                      Get started
                    </ButtonLink>
                  </CardBody>
                </Card>
              );
            })}
          </div>
          <p className="mt-4 text-center text-xs text-faint-foreground">
            Payments are not yet implemented — Premium is illustrative during
            development.
          </p>
        </div>
      </section>

      <section className="border-t border-border bg-surface py-16 sm:py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <h2 className="text-center text-3xl font-semibold tracking-tight">
            Frequently asked questions
          </h2>

          <dl className="mt-10 space-y-4">
            {FAQS.map((item) => (
              <Card key={item.q} className="p-5 sm:p-6">
                <dt className="text-base font-semibold text-foreground">
                  {item.q}
                </dt>
                <dd className="mt-1.5 text-sm text-muted-foreground">{item.a}</dd>
              </Card>
            ))}
          </dl>
        </div>
      </section>

      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2 className="text-3xl font-semibold tracking-tight">
            Ready to start?
          </h2>
          <p className="mx-auto mt-3 max-w-md text-muted-foreground">
            Your first lesson takes less than ten minutes.
          </p>
          <ButtonLink href="/register" size="lg" className="mt-6">
            Start Learning Free
            <ChevronRight className="size-4" aria-hidden />
          </ButtonLink>
        </div>
      </section>
    </>
  );
}

