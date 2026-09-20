import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/states";
import { LessonRunner } from "@/features/lessons/lesson-runner";
import { parseSections } from "@/features/lessons/parse-section";
import { canOpenLesson } from "@/lib/billing";
import { createClient, getSessionContext } from "@/lib/supabase/server";
import { Lock } from "lucide-react";

export const metadata: Metadata = { robots: { index: false } };

interface LessonPageProps {
  /** Route segment is a lesson slug — friendlier in the URL than a UUID. */
  params: Promise<{ lessonId: string }>;
}

export default async function LessonPage({ params }: LessonPageProps) {
  const { lessonId: slug } = await params;

  const session = await getSessionContext();
  if (!session) redirect("/login");

  const supabase = await createClient();

  const { data: lesson } = await supabase
    .from("lessons")
    .select("id, slug, title, level, is_premium")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  if (!lesson) notFound();

  if (!canOpenLesson(session.profile.plan, lesson.is_premium)) {
    return (
      <EmptyState
        icon={Lock}
        title="This lesson is part of Premium"
        description="Upgrade to unlock the full lesson library. Your progress on free lessons stays exactly where it is."
        action={<ButtonLink href="/app/settings">See plans</ButtonLink>}
      />
    );
  }

  const [sectionsResult, progressResult, quizResult] = await Promise.all([
    supabase
      .from("lesson_sections")
      .select("id, lesson_id, section_type, title, content, order_index")
      .eq("lesson_id", lesson.id)
      .order("order_index", { ascending: true }),
    supabase
      .from("lesson_progress")
      .select("status")
      .eq("user_id", session.userId)
      .eq("lesson_id", lesson.id)
      .maybeSingle(),
    supabase.from("quizzes").select("slug").eq("lesson_id", lesson.id).maybeSingle(),
  ]);

  const sections = parseSections(sectionsResult.data ?? []);

  return (
    <LessonRunner
      lessonId={lesson.id}
      title={lesson.title}
      level={lesson.level}
      sections={sections}
      quizSlug={quizResult.data?.slug ?? null}
      alreadyCompleted={progressResult.data?.status === "completed"}
    />
  );
}
