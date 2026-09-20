import { GraduationCap } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { LessonCard } from "@/components/lessons/lesson-card";
import { StudyResources } from "@/components/lessons/study-resources";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { ProgressBar } from "@/components/ui/progress-bar";
import { EmptyState } from "@/components/ui/states";
import {
  countCompleted,
  getLessonsWithProgress,
  type LessonWithProgress,
} from "@/features/lessons/queries";
import { canOpenLesson } from "@/lib/billing";
import { CEFR_LEVELS, LEVEL_LABELS } from "@/lib/constants/app";
import { getSessionContext } from "@/lib/supabase/server";
import { cn } from "@/lib/utils/cn";

export const metadata: Metadata = {
  title: "Learn",
  robots: { index: false },
};

interface LearnPageProps {
  searchParams: Promise<{ level?: string; topic?: string }>;
}

export default async function LearnPage({ searchParams }: LearnPageProps) {
  const session = await getSessionContext();
  if (!session) redirect("/login");

  const { level: levelParam, topic: topicParam } = await searchParams;
  const lessons = await getLessonsWithProgress(session.userId);

  const topics = [...new Set(lessons.map((lesson) => lesson.topic))].sort();
  const activeLevel = CEFR_LEVELS.find((l) => l === levelParam) ?? null;
  const activeTopic = topics.includes(topicParam ?? "") ? topicParam! : null;

  const filtered = lessons.filter(
    (lesson) =>
      (!activeLevel || lesson.level === activeLevel) &&
      (!activeTopic || lesson.topic === activeTopic),
  );

  const completed = countCompleted(lessons);
  const overallPercent =
    lessons.length === 0 ? 0 : Math.round((completed / lessons.length) * 100);

  const buildHref = (next: { level?: string | null; topic?: string | null }) => {
    const params = new URLSearchParams();
    const level = next.level === undefined ? activeLevel : next.level;
    const topic = next.topic === undefined ? activeTopic : next.topic;
    if (level) params.set("level", level);
    if (topic) params.set("topic", topic);
    const query = params.toString();
    return query ? `/app/learn?${query}` : "/app/learn";
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Learning path"
        description="Short lessons, in order. Finish one a day and the rest takes care of itself."
        eyebrow={
          <Badge tone="primary" size="md">
            Your level: {session.profile.english_level} ·{" "}
            {LEVEL_LABELS[session.profile.english_level]}
          </Badge>
        }
      />

      <Card>
        <CardBody>
          <ProgressBar
            value={overallPercent}
            label={`${completed} of ${lessons.length} lessons completed`}
          />
        </CardBody>
      </Card>

      <StudyResources />

      <section aria-label="Filters" className="space-y-3">
        <FilterRow label="Level">
          <FilterChip href={buildHref({ level: null })} active={!activeLevel}>
            All
          </FilterChip>
          {CEFR_LEVELS.filter((level) =>
            lessons.some((lesson) => lesson.level === level),
          ).map((level) => (
            <FilterChip
              key={level}
              href={buildHref({ level })}
              active={activeLevel === level}
            >
              {level}
            </FilterChip>
          ))}
        </FilterRow>

        <FilterRow label="Topic">
          <FilterChip href={buildHref({ topic: null })} active={!activeTopic}>
            All
          </FilterChip>
          {topics.map((topic) => (
            <FilterChip
              key={topic}
              href={buildHref({ topic })}
              active={activeTopic === topic}
            >
              {topic}
            </FilterChip>
          ))}
        </FilterRow>
      </section>

      {filtered.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title="No lessons match those filters"
          description="Try clearing the level or topic filter."
        />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((lesson: LessonWithProgress) => (
            <li key={lesson.id}>
              <LessonCard
                lesson={lesson}
                locked={!canOpenLesson(session.profile.plan, lesson.is_premium)}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function FilterRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="w-12 shrink-0 text-xs font-semibold tracking-wide text-faint-foreground uppercase">
        {label}
      </span>
      {children}
    </div>
  );
}

function FilterChip({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "true" : undefined}
      className={cn(
        "rounded-full border px-3.5 py-1.5 text-sm font-medium capitalize transition-colors",
        active
          ? "border-primary bg-primary-subtle text-primary"
          : "border-border bg-surface text-muted-foreground hover:border-border-strong hover:text-foreground",
      )}
    >
      {children}
    </Link>
  );
}
