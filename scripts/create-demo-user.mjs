#!/usr/bin/env node
/**
 * Creates (or resets) a fully-populated demo account for OnTalk:
 * onboarding completed, a few lessons finished, XP/streak, a review
 * deck with some cards already graded, a quiz attempt, a week of
 * activity for the dashboard chart, and Premium enabled.
 *
 * Uses the Supabase service-role key, which is why this is a standalone
 * script and not part of the app. It is never read by the Next.js app
 * itself (see src/lib/supabase/{client,server}.ts — anon key only).
 *
 * Usage:
 *   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key npm run demo:create
 *
 * The service-role key is in the Supabase dashboard under
 * Project Settings -> API -> service_role (the "secret" key, not "anon").
 * Do NOT put it in .env.local — pass it inline as shown above so it never
 * lingers in a file that could be committed.
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const DEMO_EMAIL = process.env.DEMO_EMAIL ?? "demo@ontalk.app";
const DEMO_PASSWORD = process.env.DEMO_PASSWORD ?? "OnTalkDemo123";

function loadEnvLocal() {
  try {
    const path = fileURLToPath(new URL("../.env.local", import.meta.url));
    const text = readFileSync(path, "utf8");
    for (const line of text.split("\n")) {
      const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
      if (match && !process.env[match[1]]) process.env[match[1]] = match[2].trim();
    }
  } catch {
    // .env.local is optional here — the two vars we need can also come
    // from the shell environment directly.
  }
}

function fail(message) {
  console.error(`\n✖ ${message}\n`);
  process.exit(1);
}

async function main() {
  loadEnvLocal();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || url.includes("placeholder")) {
    fail(
      "NEXT_PUBLIC_SUPABASE_URL is missing or still a placeholder.\n" +
        "  Connect a real Supabase project first (see README.md) and put its\n" +
        "  URL in .env.local, then run this script again.",
    );
  }
  if (!serviceRoleKey) {
    fail(
      "SUPABASE_SERVICE_ROLE_KEY is not set.\n" +
        "  Find it in the Supabase dashboard: Project Settings -> API -> service_role.\n" +
        "  Run:  SUPABASE_SERVICE_ROLE_KEY=eyJ... npm run demo:create",
    );
  }

  const admin = createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  console.log(`Creating demo account: ${DEMO_EMAIL}`);

  // 1. Find or create the auth user, pre-confirmed (no email step needed).
  let userId;
  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email: DEMO_EMAIL,
    password: DEMO_PASSWORD,
    email_confirm: true,
    user_metadata: { display_name: "Demo Learner" },
  });

  if (createError) {
    if (!createError.message.toLowerCase().includes("already")) {
      fail(`Could not create the auth user: ${createError.message}`);
    }
    console.log("  User already exists — resetting its password and data.");

    let existing;
    for (let page = 1; !existing; page++) {
      const { data: list, error: listError } = await admin.auth.admin.listUsers({
        page,
        perPage: 200,
      });
      if (listError) fail(`Could not look up existing users: ${listError.message}`);
      existing = list.users.find((u) => u.email === DEMO_EMAIL);
      if (list.users.length < 200) break; // last page
    }
    if (!existing) fail("Supabase reported the user exists but it could not be found.");
    userId = existing.id;

    const { error: updateError } = await admin.auth.admin.updateUserById(userId, {
      password: DEMO_PASSWORD,
      email_confirm: true,
    });
    if (updateError) fail(`Could not reset the existing user: ${updateError.message}`);
  } else {
    userId = created.user.id;
  }

  // The handle_new_user() trigger inserts a profiles row on auth.users insert;
  // give it a moment, then finish setting it up as a fully onboarded learner.
  await new Promise((resolve) => setTimeout(resolve, 500));

  const { error: profileError } = await admin
    .from("profiles")
    .update({
      display_name: "Demo Learner",
      english_level: "A2",
      learning_goal: "travel",
      improvement_areas: ["speaking", "vocabulary"],
      interests: ["Travel", "Culture", "Movies"],
      daily_minutes_goal: 15,
      xp: 180,
      streak: 4,
      last_activity_date: new Date().toISOString().slice(0, 10),
      plan: "premium",
      onboarding_completed: true,
    })
    .eq("id", userId);
  if (profileError) fail(`Could not update the profile: ${profileError.message}`);

  // 2. Mark the first three lessons (in order_index) as completed.
  const { data: lessons, error: lessonsError } = await admin
    .from("lessons")
    .select("id, xp_reward, estimated_minutes")
    .eq("is_published", true)
    .order("order_index", { ascending: true })
    .limit(4);
  if (lessonsError) fail(`Could not load lessons: ${lessonsError.message}`);

  const completedLessons = (lessons ?? []).slice(0, 3);
  const inProgressLesson = (lessons ?? [])[3];

  for (const lesson of completedLessons) {
    await admin.from("lesson_progress").upsert(
      {
        user_id: userId,
        lesson_id: lesson.id,
        status: "completed",
        progress_percent: 100,
        score: 90,
        completed_at: new Date().toISOString(),
        last_opened_at: new Date().toISOString(),
      },
      { onConflict: "user_id,lesson_id" },
    );
  }
  if (inProgressLesson) {
    await admin.from("lesson_progress").upsert(
      {
        user_id: userId,
        lesson_id: inProgressLesson.id,
        status: "in_progress",
        progress_percent: 40,
        last_opened_at: new Date().toISOString(),
      },
      { onConflict: "user_id,lesson_id" },
    );
  }

  // 3. Enroll vocabulary and grade a handful of cards so Review has history.
  //
  // Not via the enroll_vocabulary_for_level()/record_activity() RPCs below:
  // both are `security definer` functions gated on auth.uid(), which is NULL
  // under the service-role client (it bypasses RLS rather than acting "as" a
  // user) — they would raise "Not authenticated". Service-role scripts write
  // directly to the tables instead, scoped explicitly to `userId`.
  const { data: vocabWords, error: vocabError } = await admin
    .from("vocabulary")
    .select("id")
    .in("level", ["A1", "A2"])
    .order("word", { ascending: true })
    .limit(20);
  if (vocabError) fail(`Could not load vocabulary: ${vocabError.message}`);

  if (vocabWords?.length) {
    const { error: enrollError } = await admin.from("user_vocabulary").upsert(
      vocabWords.map((word) => ({
        user_id: userId,
        vocabulary_id: word.id,
        next_review_at: new Date().toISOString(),
      })),
      { onConflict: "user_id,vocabulary_id", ignoreDuplicates: true },
    );
    if (enrollError) fail(`Could not enroll vocabulary: ${enrollError.message}`);
  }
  console.log(`  Enrolled ${vocabWords?.length ?? 0} vocabulary cards.`);

  const { data: userWords } = await admin
    .from("user_vocabulary")
    .select("id")
    .eq("user_id", userId)
    .limit(6);

  for (const [index, word] of (userWords ?? []).entries()) {
    const learned = index < 3;
    await admin
      .from("user_vocabulary")
      .update({
        status: learned ? "learned" : "reviewing",
        ease_score: 2.6,
        interval_days: learned ? 25 : 3,
        review_count: learned ? 5 : 2,
        correct_count: learned ? 5 : 2,
        last_reviewed_at: new Date().toISOString(),
        next_review_at: learned
          ? new Date(Date.now() + 25 * 86_400_000).toISOString()
          : new Date().toISOString(), // due now, so Review has something to show
      })
      .eq("id", word.id);
  }

  // 4. One quiz attempt, if a quiz exists for a completed lesson.
  if (completedLessons[0]) {
    const { data: quiz } = await admin
      .from("quizzes")
      .select("id")
      .eq("lesson_id", completedLessons[0].id)
      .maybeSingle();

    if (quiz) {
      await admin.from("quiz_attempts").insert({
        user_id: userId,
        quiz_id: quiz.id,
        score: 80,
        total_questions: 5,
        correct_answers: 4,
      });
    }
  }

  // 5. A week of activity so the dashboard chart isn't empty.
  const today = new Date();
  for (let daysAgo = 6; daysAgo >= 1; daysAgo--) {
    const date = new Date(today);
    date.setDate(date.getDate() - daysAgo);
    await admin.from("daily_activity").upsert(
      {
        user_id: userId,
        activity_date: date.toISOString().slice(0, 10),
        minutes_studied: [12, 0, 18, 9, 15, 0][daysAgo - 1] ?? 10,
        xp_earned: 20,
        lessons_completed: daysAgo === 5 ? 1 : 0,
        words_reviewed: 4,
        speaking_sessions: daysAgo === 3 ? 1 : 0,
      },
      { onConflict: "user_id,activity_date" },
    );
  }

  // Today's row too, so the dashboard's daily-goal progress isn't empty.
  await admin.from("daily_activity").upsert(
    {
      user_id: userId,
      activity_date: today.toISOString().slice(0, 10),
      minutes_studied: 8,
      xp_earned: 15,
      lessons_completed: 0,
      words_reviewed: 3,
      speaking_sessions: 0,
    },
    { onConflict: "user_id,activity_date" },
  );

  console.log("\n✓ Demo account ready:");
  console.log(`  Email:    ${DEMO_EMAIL}`);
  console.log(`  Password: ${DEMO_PASSWORD}`);
  console.log("  Plan:     premium");
  console.log(`  Progress: ${completedLessons.length} lessons completed, vocabulary deck seeded, 4-day streak\n`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
