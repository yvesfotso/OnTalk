import {
  BookOpen,
  ChevronRight,
  Clock,
  Flame,
  GraduationCap,
  Mic,
  Sparkles,
  Zap,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { WeeklyChart } from "@/components/progress/weekly-chart";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import {
  Card,
  CardBody,
  CardDescription,
  CardTitle,
  InteractiveCard,
} from "@/components/ui/card";
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

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {greeting()}, {profile.display_name} 👋
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Ready for today&apos;s English practice?
          </p>
        </div>
        <Badge tone="primary" size="md">
          Level {profile.english_level}
        </Badge>
      </header>

      <section aria-label="Your statistics">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard
            label="Day streak"
            value={profile.streak}
            icon={Flame}
            tone="accent"
          />
          <StatCard label="Total XP" value={profile.xp} icon={Zap} tone="primary" />
          <StatCard
            label="Lessons done"
            value={lessonsCompleted}
            icon={GraduationCap}
            tone="success"
          />
          <StatCard
            label="Words learned"
            value={counts.wordsLearned}
            icon={BookOpen}
            tone="neutral"
            hint={`${counts.wordsTotal} in your deck`}
          />
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-3">
        <section className="lg:col-span-2" aria-label="Continue learning">
          {recommended ? (
            <Card className="h-full">
              <CardBody className="flex h-full flex-col">
                <div className="flex items-center gap-2">
                  <Badge tone="primary">{recommended.level}</Badge>
                  <Badge>{recommended.topic}</Badge>
                </div>

                <h2 className="mt-3 text-xl font-semibold tracking-tight">
                  {recommended.title}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {recommended.description}
                </p>

                <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Clock className="size-3.5" aria-hidden />
                    {recommended.estimated_minutes} min
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Zap className="size-3.5 text-accent" aria-hidden />
                    {recommended.xp_reward} XP
                  </span>
                </div>

                {(recommended.progress?.progress_percent ?? 0) > 0 && (
                  <ProgressBar
                    className="mt-4"
                    value={recommended.progress?.progress_percent ?? 0}
                    label="Your progress"
                    size="sm"
                  />
                )}

                <div className="mt-auto pt-5">
                  <ButtonLink
                    href={`/app/lessons/${recommended.slug}`}
                    size="lg"
                  >
                    {recommended.progress ? "Continue learning" : "Start lesson"}
                    <ChevronRight className="size-4" aria-hidden />
                  </ButtonLink>
                </div>
              </CardBody>
            </Card>
          ) : (
            <EmptyState
              icon={GraduationCap}
              title="You've finished the demo curriculum"
              description="More lessons are on the way. In the meantime, keep your vocabulary sharp."
              action={
                <ButtonLink href="/app/vocabulary/review">
                  Review vocabulary
                </ButtonLink>
              }
            />
          )}
        </section>

        <section aria-label="Today's goal">
          <Card className="h-full">
            <CardBody className="flex h-full flex-col">
              <CardTitle as="h2">Daily goal</CardTitle>
              <CardDescription>
                {today.minutes_studied} / {profile.daily_minutes_goal} minutes
              </CardDescription>

              <div className="mt-5">
                <ProgressBar
                  value={goalPercent}
                  tone={goalPercent >= 100 ? "success" : "primary"}
                  hideValue
                />
                <p className="mt-2 text-sm text-muted-foreground">
                  {goalPercent >= 100
                    ? "Goal reached. Nice work today."
                    : `${profile.daily_minutes_goal - today.minutes_studied} minutes to go.`}
                </p>
              </div>

              <div className="mt-6 flex-1">
                <p className="mb-3 text-xs font-semibold tracking-wide text-faint-foreground uppercase">
                  Last 7 days
                </p>
                <WeeklyChart days={week} goalMinutes={profile.daily_minutes_goal} />
              </div>
            </CardBody>
          </Card>
        </section>
      </div>

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
          className="grid size-10 place-items-center rounded-xl bg-primary-subtle text-primary"
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
