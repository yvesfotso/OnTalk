import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { UserVocabulary, Vocabulary } from "@/types/database";

export interface VocabularyCard {
  id: string;
  status: UserVocabulary["status"];
  easeScore: number;
  intervalDays: number;
  reviewCount: number;
  correctCount: number;
  incorrectCount: number;
  nextReviewAt: string;
  lastReviewedAt: string | null;
  word: Pick<
    Vocabulary,
    "id" | "word" | "definition" | "example_sentence" | "part_of_speech" | "phonetic" | "level" | "topic"
  >;
}

type JoinedRow = Omit<UserVocabulary, "user_id"> & {
  vocabulary: VocabularyCard["word"] | null;
};

const SELECT =
  "id, vocabulary_id, status, ease_score, interval_days, review_count, correct_count, " +
  "incorrect_count, last_reviewed_at, next_review_at, created_at, " +
  "vocabulary!inner(id, word, definition, example_sentence, part_of_speech, phonetic, level, topic)";

function toCard(row: JoinedRow): VocabularyCard | null {
  if (!row.vocabulary) return null;

  return {
    id: row.id,
    status: row.status,
    easeScore: Number(row.ease_score),
    intervalDays: row.interval_days,
    reviewCount: row.review_count,
    correctCount: row.correct_count,
    incorrectCount: row.incorrect_count,
    nextReviewAt: row.next_review_at,
    lastReviewedAt: row.last_reviewed_at,
    word: row.vocabulary,
  };
}

export async function getVocabularyCards(
  userId: string,
): Promise<VocabularyCard[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("user_vocabulary")
    .select(SELECT)
    .eq("user_id", userId)
    .order("next_review_at", { ascending: true })
    .returns<JoinedRow[]>();

  if (error) throw error;

  return (data ?? []).flatMap((row) => {
    const card = toCard(row);
    return card ? [card] : [];
  });
}

/** Cards whose next_review_at has passed, oldest first. */
export async function getDueCards(
  userId: string,
  limit = 20,
): Promise<VocabularyCard[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("user_vocabulary")
    .select(SELECT)
    .eq("user_id", userId)
    .lte("next_review_at", new Date().toISOString())
    .order("next_review_at", { ascending: true })
    .limit(limit)
    .returns<JoinedRow[]>();

  if (error) throw error;

  return (data ?? []).flatMap((row) => {
    const card = toCard(row);
    return card ? [card] : [];
  });
}
