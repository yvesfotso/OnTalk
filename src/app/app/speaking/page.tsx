import { Mic } from "lucide-react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { ButtonLink } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/states";
import {
  SpeakingPractice,
  type SpeakingPrompt,
} from "@/features/speaking/practice";
import { CEFR_LEVELS } from "@/lib/constants/app";
import { createClient, getSessionContext } from "@/lib/supabase/server";
import type { Json } from "@/types/database";

export const metadata: Metadata = {
  title: "Speaking practice",
  robots: { index: false },
};

interface PromptRow {
  id: string;
  content: Json;
  lessons: { title: string; level: string } | null;
}

export default async function SpeakingPage() {
  const session = await getSessionContext();
  if (!session) redirect("/login");

  const supabase = await createClient();

  // Prompts come from the lesson content itself, so speaking practice always
  // matches what the learner has been studying.
  const { data } = await supabase
    .from("lesson_sections")
    .select("id, content, lessons!inner(title, level, is_published)")
    .eq("section_type", "speaking_prompt")
    .eq("lessons.is_published", true)
    .order("order_index", { ascending: true })
    .returns<PromptRow[]>();

  const levelRank = CEFR_LEVELS.indexOf(session.profile.english_level);

  const prompts: SpeakingPrompt[] = (data ?? [])
    .flatMap((row) => {
      const content = row.content;
      if (typeof content !== "object" || content === null || Array.isArray(content)) {
        return [];
      }

      const phrase = content.phrase;
      if (typeof phrase !== "string" || phrase.trim() === "") return [];

      const level = row.lessons?.level ?? "A1";
      const rank = CEFR_LEVELS.indexOf(level as (typeof CEFR_LEVELS)[number]);
      if (rank > levelRank + 1) return [];

      return [
        {
          id: row.id,
          phrase,
          tip: typeof content.tip === "string" ? content.tip : null,
          level,
          lessonTitle: row.lessons?.title ?? "Lesson",
        },
      ];
    })
    .slice(0, 12);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        title="Speaking practice"
        description="Listen to the phrase, then say it out loud. We compare what your browser heard with the target phrase."
      />

      {prompts.length === 0 ? (
        <EmptyState
          icon={Mic}
          title="No speaking phrases yet"
          description="Speaking prompts come from lessons. Start a lesson and they will show up here."
          action={<ButtonLink href="/app/learn">Browse lessons</ButtonLink>}
        />
      ) : (
        <SpeakingPractice prompts={prompts} />
      )}
    </div>
  );
}
