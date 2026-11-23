import {
  ArrowRight,
  BookOpen,
  Check,
  Clock3,
  Flame,
  GraduationCap,
  Mic2,
  Sparkles,
  Trophy,
  Zap,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { DashboardWeek } from "@/components/dashboard/dashboard-week";
import { NextLessonCard } from "@/components/dashboard/next-lesson-card";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/states";
import {
  countCompleted,
  getLessonsWithProgress,
  pickRecommendedLesson,
} from "@/features/lessons/queries";
import {
  getLearnerCounts,
  getRecentActivity,
  getTodayActivity,
} from "@/features/progress/queries";
import { AI_TUTOR_ENABLED } from "@/lib/constants/app";
import { getSessionContext } from "@/lib/supabase/server";
import type { LessonWithProgress } from "@/features/lessons/queries";

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
  const completed = countCompleted(lessons);
  const goalPercent = profile.daily_minutes_goal > 0
    ? Math.min(Math.round((today.minutes_studied / profile.daily_minutes_goal) * 100), 100)
    : 0;
  const lessonList = recommended
    ? [recommended, ...lessons.filter((lesson) => lesson.id !== recommended.id)]
    : lessons;

  return (
    <div className="mx-auto max-w-6xl space-y-6 sm:space-y-7">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-primary">Your learning space</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
            {greeting()}, {profile.display_name}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Small steps make fluent days. Ready for today&apos;s practice?
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge tone="primary" size="md">Level {profile.english_level}</Badge>
          <Link
            href="/app/profile"
            aria-label={`View ${profile.display_name}'s profile`}
            className="grid size-11 place-items-center rounded-full border border-primary/15 bg-primary-subtle text-sm font-semibold text-primary"
          >
            {profile.display_name.slice(0, 1).toUpperCase()}
          </Link>
        </div>
      </header>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.55fr)_minmax(310px,0.9fr)]">
        <div className="min-w-0 space-y-5">
          <NextLessonCard lesson={recommended} level={profile.english_level} />

          <section aria-labelledby="todays-lessons-title" className="rounded-[1.5rem] border border-border/70 bg-surface p-5 shadow-card sm:p-6">
            <div className="mb-4 flex items-end justify-between gap-3">
              <div>
                <p className="text-xs font-semibold tracking-[0.15em] text-muted-foreground uppercase">Keep your momentum</p>
                <h2 id="todays-lessons-title" className="mt-1 text-lg font-semibold tracking-tight">Today&apos;s lessons</h2>
              </div>
              <Link href="/app/learn" className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
                All lessons <ArrowRight className="size-4" aria-hidden />
              </Link>
            </div>

            {lessonList.length === 0 ? (
              <EmptyState
                icon={GraduationCap}
                title="Your classroom is ready"
                description="Lessons will appear here as soon as your learning path is available."
                action={<Link href="/app/learn" className="text-sm font-semibold text-primary hover:underline">Explore learning path</Link>}
              />
            ) : (
              <ul className="space-y-2.5">
                {lessonList.slice(0, 4).map((lesson, index) => (
                  <LessonRow key={lesson.id} lesson={lesson} featured={index === 0} />
                ))}
              </ul>
            )}
          </section>

          <section aria-labelledby="practice-tools-title">
            <div className="mb-3 flex items-end justify-between">
              <div>
                <p className="text-xs font-semibold tracking-[0.15em] text-muted-foreground uppercase">Pick up a skill</p>
                <h2 id="practice-tools-title" className="mt-1 text-lg font-semibold tracking-tight">Practice your way</h2>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <PracticeLink href="/app/vocabulary/review" icon={BookOpen} title="Vocabulary" detail={counts.wordsDue > 0 ? `${counts.wordsDue} words to review` : `${counts.wordsLearned} words learned`} tone="green" />
              <PracticeLink href="/app/speaking" icon={Mic2} title="Speaking" detail="Find your voice" tone="lilac" />
              <PracticeLink href="/app/tutor" icon={Sparkles} title="AI tutor" detail={AI_TUTOR_ENABLED ? "Start a conversation" : "Coming soon"} tone="peach" />
            </div>
          </section>
        </div>

        <aside className="min-w-0 space-y-5" aria-label="Your progress">
          <DashboardWeek days={week} />

          <section aria-labelledby="daily-goal-title" className="rounded-[1.5rem] border border-border/70 bg-surface p-5 shadow-card sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold tracking-[0.15em] text-muted-foreground uppercase">A little every day</p>
                <h2 id="daily-goal-title" className="mt-1 text-lg font-semibold tracking-tight">Daily goal</h2>
              </div>
              <span className="grid size-10 place-items-center rounded-2xl bg-accent-subtle text-warning" aria-hidden>
                <Flame className="size-5" />
              </span>
            </div>
            <div className="mt-5 flex items-end justify-between gap-3">
              <p className="text-3xl font-semibold tracking-tight tabular-nums">
                {today.minutes_studied}<span className="ml-1 text-base font-medium text-muted-foreground">min</span>
              </p>
              <p className="pb-1 text-sm text-muted-foreground">of {profile.daily_minutes_goal} min</p>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-subtle" role="progressbar" aria-label="Daily study goal" aria-valuemin={0} aria-valuemax={100} aria-valuenow={goalPercent}>
              <div className="h-full rounded-full bg-primary transition-[width]" style={{ width: `${goalPercent}%` }} />
            </div>
            <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
              <span>{goalPercent >= 100 ? "Daily goal complete" : `${Math.max(profile.daily_minutes_goal - today.minutes_studied, 0)} minutes to go`}</span>
              {goalPercent >= 100 && <Check className="size-4 text-success" aria-label="Complete" />}
            </div>
          </section>

          <section className="grid grid-cols-2 gap-3" aria-label="Learning highlights">
            <MetricCard icon={Flame} label="Day streak" value={profile.streak} suffix="days" tone="peach" />
            <MetricCard icon={GraduationCap} label="Lessons done" value={completed} suffix="total" tone="green" />
            <MetricCard icon={Zap} label="This week" value={week.reduce((sum, day) => sum + day.xp, 0)} suffix="XP earned" tone="yellow" />
            <MetricCard icon={Trophy} label="Quizzes" value={counts.quizzesCompleted} suffix="completed" tone="lilac" />
          </section>
        </aside>
      </div>
    </div>
  );
}

function LessonRow({ lesson, featured }: { lesson: LessonWithProgress; featured: boolean }) {
  const status = lesson.progress?.status;
  const statusText = status === "completed" ? "Completed" : status === "in_progress" || status === "started" ? "In progress" : "Ready to start";

  return (
    <li>
      <Link href={`/app/lessons/${lesson.slug}`} className="group flex items-center gap-3 rounded-2xl border border-transparent bg-background p-3 transition-colors hover:border-primary/15 hover:bg-primary-subtle/70 sm:gap-4 sm:p-3.5">
        <span className={featured ? "grid size-11 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground" : "grid size-11 shrink-0 place-items-center rounded-2xl bg-surface text-primary shadow-card"} aria-hidden>
          {status === "completed" ? <Check className="size-5" /> : <BookOpen className="size-5" />}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <span className="truncate text-sm font-semibold text-foreground">{lesson.title}</span>
            <span className="text-[11px] font-medium text-muted-foreground">{lesson.level}</span>
          </span>
          <span className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span className="capitalize">{lesson.topic}</span>
            <span className="inline-flex items-center gap-1"><Clock3 className="size-3" aria-hidden />{lesson.estimated_minutes} min</span>
          </span>
        </span>
        <span className="hidden text-right sm:block">
          <span className={status === "completed" ? "block text-xs font-medium text-success" : status === "in_progress" ? "block text-xs font-medium text-primary" : "block text-xs text-muted-foreground"}>{statusText}</span>
          <span className="mt-1 inline-flex items-center gap-1 text-[11px] text-muted-foreground"><Zap className="size-3 text-primary" aria-hidden />{lesson.xp_reward} XP</span>
        </span>
        <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" aria-hidden />
      </Link>
    </li>
  );
}

function PracticeLink({ href, icon: Icon, title, detail, tone }: { href: string; icon: typeof BookOpen; title: string; detail: string; tone: "green" | "lilac" | "peach" }) {
  const toneClass = {
    green: "bg-primary-subtle text-primary",
    lilac: "bg-[#eee9f8] text-[#705a9e]",
    peach: "bg-[#f7e9df] text-[#a05d32]",
  }[tone];

  return (
    <Link href={href} className="group flex min-h-28 flex-col justify-between rounded-[1.25rem] border border-border/70 bg-surface p-4 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-raised">
      <span className={`grid size-9 place-items-center rounded-xl ${toneClass}`} aria-hidden><Icon className="size-4.5" /></span>
      <span className="mt-3 block">
        <span className="block text-sm font-semibold">{title}</span>
        <span className="mt-0.5 block truncate text-xs text-muted-foreground">{detail}</span>
      </span>
    </Link>
  );
}

function MetricCard({ icon: Icon, label, value, suffix, tone }: { icon: typeof BookOpen; label: string; value: number; suffix: string; tone: "peach" | "green" | "yellow" | "lilac" }) {
  const toneClass = {
    peach: "bg-[#f7e9df] text-[#a05d32]",
    green: "bg-primary-subtle text-primary",
    yellow: "bg-accent-subtle text-warning",
    lilac: "bg-[#eee9f8] text-[#705a9e]",
  }[tone];

  return (
    <Card className="rounded-[1.25rem] p-4 shadow-card sm:p-5">
      <span className={`grid size-9 place-items-center rounded-xl ${toneClass}`} aria-hidden><Icon className="size-4.5" /></span>
      <p className="mt-3 text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-xl font-semibold tracking-tight tabular-nums">{value}<span className="ml-1 text-xs font-medium text-muted-foreground">{suffix}</span></p>
    </Card>
  );
}
