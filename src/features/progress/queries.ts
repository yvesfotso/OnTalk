import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { DailyActivity } from "@/types/database";

export interface DayActivity {
  date: string;
  label: string;
  minutes: number;
  xp: number;
  isToday: boolean;
}

/** Local-date key (YYYY-MM-DD) — `toISOString` would shift by timezone. */
function dateKey(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export async function getRecentActivity(
  userId: string,
  days = 7,
): Promise<DayActivity[]> {
  const supabase = await createClient();

  const start = new Date();
  start.setDate(start.getDate() - (days - 1));

  const { data, error } = await supabase
    .from("daily_activity")
    .select("activity_date, minutes_studied, xp_earned")
    .eq("user_id", userId)
    .gte("activity_date", dateKey(start));

  if (error) throw error;

  const byDate = new Map(
    (data ?? []).map((row) => [row.activity_date, row]),
  );
  const todayKey = dateKey(new Date());

  return Array.from({ length: days }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    const key = dateKey(date);
    const row = byDate.get(key);

    return {
      date: key,
      label: date.toLocaleDateString("en-US", { weekday: "short" }),
      minutes: row?.minutes_studied ?? 0,
      xp: row?.xp_earned ?? 0,
      isToday: key === todayKey,
    };
  });
}

export async function getTodayActivity(
  userId: string,
): Promise<Pick<DailyActivity, "minutes_studied" | "xp_earned" | "lessons_completed" | "words_reviewed" | "speaking_sessions">> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("daily_activity")
    .select(
      "minutes_studied, xp_earned, lessons_completed, words_reviewed, speaking_sessions",
    )
    .eq("user_id", userId)
    .eq("activity_date", dateKey(new Date()))
    .maybeSingle();

  return (
    data ?? {
      minutes_studied: 0,
      xp_earned: 0,
      lessons_completed: 0,
      words_reviewed: 0,
      speaking_sessions: 0,
    }
  );
}

export interface LearnerCounts {
  wordsDue: number;
  wordsLearned: number;
  wordsTotal: number;
  quizzesCompleted: number;
  speakingSessions: number;
}

/** Head-only count queries — no rows are transferred. */
export async function getLearnerCounts(userId: string): Promise<LearnerCounts> {
  const supabase = await createClient();
  const nowIso = new Date().toISOString();

  const [due, learned, total, quizzes, speaking] = await Promise.all([
    supabase
      .from("user_vocabulary")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .lte("next_review_at", nowIso),
    supabase
      .from("user_vocabulary")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("status", "learned"),
    supabase
      .from("user_vocabulary")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId),
    supabase
      .from("quiz_attempts")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId),
    supabase
      .from("speaking_attempts")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId),
  ]);

  return {
    wordsDue: due.count ?? 0,
    wordsLearned: learned.count ?? 0,
    wordsTotal: total.count ?? 0,
    quizzesCompleted: quizzes.count ?? 0,
    speakingSessions: speaking.count ?? 0,
  };
}
