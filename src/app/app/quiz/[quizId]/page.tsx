import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { PageHeader } from "@/components/ui/page-header";
import { QuizRunner } from "@/features/quiz/quiz-runner";
import { createClient, getSessionContext } from "@/lib/supabase/server";

export const metadata: Metadata = { robots: { index: false } };

interface QuizPageProps {
  /** Route segment is a quiz slug. */
  params: Promise<{ quizId: string }>;
}

export default async function QuizPage({ params }: QuizPageProps) {
  const { quizId: slug } = await params;

  const session = await getSessionContext();
  if (!session) redirect("/login");

  const supabase = await createClient();

  const { data: quiz } = await supabase
    .from("quizzes")
    .select("id, title, lesson_id, passing_score")
    .eq("slug", slug)
    .maybeSingle();

  if (!quiz) notFound();

  const [{ data: questions }, { data: lesson }] = await Promise.all([
    supabase
      .from("quiz_questions")
      .select(
        "id, quiz_id, question_type, question_text, answer_data, correct_answer, explanation, order_index",
      )
      .eq("quiz_id", quiz.id)
      .order("order_index", { ascending: true }),
    quiz.lesson_id
      ? supabase.from("lessons").select("slug").eq("id", quiz.lesson_id).maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        title={quiz.title}
        description={`Pass with ${quiz.passing_score}% or more. You can retry as many times as you like.`}
      />

      <QuizRunner
        quizId={quiz.id}
        title={quiz.title}
        questions={questions ?? []}
        backHref={lesson?.slug ? `/app/lessons/${lesson.slug}` : "/app/learn"}
      />
    </div>
  );
}
