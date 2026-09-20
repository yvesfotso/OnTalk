import { BookOpen, ChevronRight, Clock, Flame, GraduationCap, Mic, Sparkles, Trophy, Zap } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { LessonsTable } from "@/components/dashboard/lessons-table";
import { PracticeTip } from "@/components/dashboard/practice-tip";
import { WeeklyChart } from "@/components/progress/weekly-chart";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardBody, InteractiveCard } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { StatCard } from "@/components/ui/stat-card";
import { EmptyState } from "@/components/ui/states";
import {
  countCompleted,
  getLessonsWithProgress,
  pickRecommendedLesson,
} from "@/features/lessons/queries";
import { getLearnerCounts, getRecentActivity, getTodayActivity } from "@/features/progress/queries";
import { getSessionContext } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false },
};

function greeting(date = new Date()): string {
  const hour = date.getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default async function DashboardPage() {
  const session = await getSessionContext();
  if (!session) redirect("/login");

  const { userId, profile } = session;

  const [lessons, counts, today, week] = await Promise.all([
    getLessonsWithProgress(userId),
    getLearnerCounts(userId),
    getTodayActivity(userId),
    getRecentActivity(userId),
  ]);

  const recommended = pickRecommendedLesson(lessons, profile.english_level);
  const lessonsCompleted = countCompleted(lessons);
  const goalPercent =
    profile.daily_minutes_goal > 0
      ? Math.min(
          Math.round((today.minutes_studied / profile.daily_minutes_goal) * 100),
          100,
        )
      : 0;

  const weeklyMinutes = week.reduce((sum, day) => sum + day.minutes, 0);
  const weeklyXp = week.reduce((sum, day) => sum + day.xp, 0);

  // Recommended lesson first, then the rest in curriculum order — five rows,
  // the same rhythm as the reference's transaction list.
  const tableLessons = recommended
    ? [recommended, ...lessons.filter((l) => l.id !== recommended.id)]
    : lessons;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {greeting()}, {profile.display_name} 👋
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Control your streak, XP, and daily practice.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge tone="primary" size="md">
            Level {profile.english_level}
          </Badge>
          {recommended && (
            <ButtonLink href={`/app/lessons/${recommended.slug}`}>
              {recommended.progress ? "Continue learning" : "Start lesson"}
              <ChevronRight className="size-4" aria-hidden />
            </ButtonLink>
          )}
        </div>
      </header>

      <div className="grid gap-4 lg:grid-cols-3">
        <section className="lg:col-span-2" aria-label="This week">
          <Card className="h-full">
            <CardBody className="space-y-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold text-foreground">
                    Your week
                  </h2>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    Track your performance.
                  </p>
                </div>
                <Badge>Last 7 days</Badge>
              </div>

              <div className="flex flex-wrap gap-6">
                <div>
                  <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="size-3.5" aria-hidden />
                    Minutes studied
                  </p>
                  <p className="mt-1 text-2xl font-semibold tabular-nums text-foreground">
                    {weeklyMinutes}
                  </p>
                </div>
                <div>
                  <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Zap className="size-3.5 text-primary" aria-hidden />
                    XP earned
                  </p>
                  <p className="mt-1 text-2xl font-semibold tabular-nums text-foreground">
                    {weeklyXp}
                  </p>
                </div>
              </div>

              <WeeklyChart days={week} goalMinutes={profile.daily_minutes_goal} />
            </CardBody>
          </Card>
        </section>

        <section aria-label="Activity">
          <Card className="h-full">
            <CardBody className="space-y-4">
              <div>
                <h2 className="text-base font-semibold text-foreground">
                  Activity
                </h2>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  Track your activity.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <ActivityTile
                  icon={BookOpen}
                  label="Words"
                  value={counts.wordsLearned}
                />
                <ActivityTile
                  icon={Trophy}
                  label="Quizzes"
                  value={counts.quizzesCompleted}
                />
                <ActivityTile
                  icon={Flame}
                  label="Streak"
                  value={profile.streak}
                  dark
                />
              </div>
            </CardBody>
          </Card>
        </section>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4">
          <Card className="p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <span
                className="grid size-10 shrink-0 place-items-center rounded-2xl bg-primary-subtle text-primary"
                aria-hidden
              >
                <Clock className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-2xl leading-tight font-semibold tabular-nums text-foreground">
                  {today.minutes_studied} min
                </p>
                <p className="text-sm text-muted-foreground">Today</p>
              </div>
            </div>
            <ProgressBar
              className="mt-4"
              value={goalPercent}
              tone={goalPercent >= 100 ? "success" : "primary"}
              label={`Daily goal: ${profile.daily_minutes_goal} min`}
              size="sm"
            />
          </Card>
          <StatCard label="Lessons done" value={lessonsCompleted} icon={GraduationCap} tone="success" />
        </div>

        <section className="lg:col-span-2" aria-label="Lessons">
          {tableLessons.length === 0 ? (
            <EmptyState
              icon={GraduationCap}
              title="No lessons yet"
              description="Lessons will show up here once your curriculum is seeded."
            />
          ) : (
            <Card className="h-full">
              <CardBody>
                <div className="mb-1 flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-semibold text-foreground">
                      Lessons
                    </h2>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      Track your history.
                    </p>
                  </div>
                  <Link
                    href="/app/learn"
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    View all
                  </Link>
                </div>
                <LessonsTable lessons={tableLessons.slice(0, 5)} />
              </CardBody>
            </Card>
          )}
        </section>
      </div>

      <PracticeTip
        question="How is your English practice going?"
        answer={
          today.minutes_studied >= profile.daily_minutes_goal
            ? "You've hit today's goal already — a quick vocabulary review keeps the streak building."
            : `You're ${Math.max(profile.daily_minutes_goal - today.minutes_studied, 0)} minutes from today's goal of ${profile.daily_minutes_goal}.`
        }
      />

      <section aria-label="Practice" className="grid gap-4 sm:grid-cols-3">
        <ActionCard
          href="/app/vocabulary/review"
          icon={BookOpen}
          title="Words to review"
          description={
            counts.wordsDue > 0
              ? `${counts.wordsDue} ${counts.wordsDue === 1 ? "word is" : "words are"} ready for review.`
              : "No words to review right now. Great job!"
          }
          cta={counts.wordsDue > 0 ? "Start review" : "Browse my words"}
        />
        <ActionCard
          href="/app/speaking"
          icon={Mic}
          title="Speaking practice"
          description="Practise speaking for 5 minutes."
          cta="Practise now"
        />
        <ActionCard
          href="/app/tutor"
          icon={Sparkles}
          title="Practice with your AI tutor"
          description="Ask a question or just have a chat in English."
          cta="Start a conversation"
        />
      </section>
    </div>
  );
}

function ActivityTile({
  icon: Icon,
  label,
  value,
  dark = false,
}: {
  icon: typeof BookOpen;
  label: string;
  value: number;
  dark?: boolean;
}) {
  return (
    <div
      className={
        dark
          ? "flex flex-col gap-2 rounded-2xl bg-dark p-3 text-dark-foreground"
          : "flex flex-col gap-2 rounded-2xl bg-subtle p-3"
      }
    >
      <span
        className={
          dark
            ? "grid size-7 place-items-center rounded-full bg-dark-subtle text-dark-foreground"
            : "grid size-7 place-items-center rounded-full bg-surface text-primary"
        }
        aria-hidden
      >
        <Icon className="size-3.5" />
      </span>
      <div>
        <p className="text-lg font-semibold tabular-nums">{value}</p>
        <p className={dark ? "text-xs text-dark-foreground/60" : "text-xs text-muted-foreground"}>
          {label}
        </p>
      </div>
    </div>
  );
}

function ActionCard({
  href,
  icon: Icon,
  title,
  description,
  cta,
}: {
  href: string;
  icon: typeof BookOpen;
  title: string;
  description: string;
  cta: string;
}) {
  return (
    <InteractiveCard className="h-full">
      <Link href={href} className="flex h-full flex-col rounded-card p-5">
        <span
          className="grid size-10 place-items-center rounded-2xl bg-primary-subtle text-primary"
          aria-hidden
        >
          <Icon className="size-5" />
        </span>
        <h3 className="mt-3 text-base font-semibold">{title}</h3>
        <p className="mt-1 flex-1 text-sm text-muted-foreground">{description}</p>
        <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
          {cta}
          <ChevronRight className="size-4" aria-hidden />
        </span>
      </Link>
    </InteractiveCard>
  );
}
