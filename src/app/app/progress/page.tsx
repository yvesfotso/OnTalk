import {
  BookOpen,
  Flame,
  GraduationCap,
  Mic,
  Sparkles,
  Trophy,
  Zap,
} from "lucide-react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { WeeklyChart } from "@/components/progress/weekly-chart";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody, CardDescription, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { ProgressBar } from "@/components/ui/progress-bar";
import { StatCard } from "@/components/ui/stat-card";
import { getAchievements } from "@/features/progress/achievements";
import { countCompleted, getLessonsWithProgress, levelBreakdown } from "@/features/lessons/queries";
import { getLearnerCounts, getRecentActivity } from "@/features/progress/queries";
import { getSessionContext } from "@/lib/supabase/server";
import { cn } from "@/lib/utils/cn";

export const metadata: Metadata = {
  title: "Progress",
  robots: { index: false },
};

export default async function ProgressPage() {
  const session = await getSessionContext();
  if (!session) redirect("/login");

  const { userId, profile } = session;

  const [lessons, counts, week] = await Promise.all([
    getLessonsWithProgress(userId),
    getLearnerCounts(userId),
    getRecentActivity(userId, 7),
  ]);

  const lessonsCompleted = countCompleted(lessons);
  const levels = levelBreakdown(lessons);

  const achievements = getAchievements({
    lessonsCompleted,
    streak: profile.streak,
    wordsLearned: counts.wordsLearned,
    quizzesCompleted: counts.quizzesCompleted,
    speakingSessions: counts.speakingSessions,
    xp: profile.xp,
  });

  const weeklyMinutes = week.reduce((sum, day) => sum + day.minutes, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Your progress"
        description="A running record of everything you've practised."
      />

      <section aria-label="Summary">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard label="Total XP" value={profile.xp} icon={Zap} tone="primary" />
          <StatCard
            label="Day streak"
            value={profile.streak}
            icon={Flame}
            tone="accent"
          />
          <StatCard
            label="Lessons completed"
            value={lessonsCompleted}
            icon={GraduationCap}
            tone="success"
          />
          <StatCard
            label="Words learned"
            value={counts.wordsLearned}
            icon={BookOpen}
            tone="neutral"
          />
          <StatCard
            label="Quizzes completed"
            value={counts.quizzesCompleted}
            icon={Trophy}
            tone="neutral"
          />
          <StatCard
            label="Speaking practices"
            value={counts.speakingSessions}
            icon={Mic}
            tone="neutral"
          />
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardBody>
            <CardTitle>Weekly activity</CardTitle>
            <CardDescription>
              {weeklyMinutes} minutes studied in the last 7 days
            </CardDescription>
            <div className="mt-5">
              <WeeklyChart days={week} goalMinutes={profile.daily_minutes_goal} />
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <CardTitle>Course progress</CardTitle>
            <CardDescription>Completion by CEFR level</CardDescription>
            <div className="mt-5 space-y-4">
              {levels.map((level) => (
                <ProgressBar
                  key={level.level}
                  value={level.completed}
                  max={level.total}
                  label={`${level.level} — ${level.completed}/${level.total} lessons`}
                />
              ))}
            </div>
          </CardBody>
        </Card>
      </div>

      <section aria-label="Achievements">
        <Card>
          <CardBody>
            <CardTitle>Recent achievements</CardTitle>
            <CardDescription>
              Unlocked automatically as you practise.
            </CardDescription>

            <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {achievements.map((achievement) => (
                <li key={achievement.id}>
                  <div
                    className={cn(
                      "flex h-full flex-col gap-2 rounded-xl border p-4",
                      achievement.earned
                        ? "border-success-border bg-success-subtle"
                        : "border-border bg-subtle",
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span
                        className={cn(
                          "grid size-9 shrink-0 place-items-center rounded-lg",
                          achievement.earned
                            ? "bg-success text-white"
                            : "bg-border text-muted-foreground",
                        )}
                        aria-hidden
                      >
                        <Sparkles className="size-4" />
                      </span>
                      {achievement.earned && <Badge tone="success">Earned</Badge>}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {achievement.title}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {achievement.description}
                      </p>
                    </div>
                    {!achievement.earned && (
                      <ProgressBar
                        value={achievement.percent}
                        size="sm"
                        hideValue
                        className="mt-auto"
                      />
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>
      </section>
    </div>
  );
}
