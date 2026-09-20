import { NextResponse } from "next/server";

import {
  AiNotConfiguredError,
  AiRequestError,
  chatCompletion,
  type ChatMessage,
} from "@/lib/ai/client";
import { buildSystemPrompt, MAX_HISTORY_MESSAGES } from "@/lib/ai/prompt";
import { getUsageStatus } from "@/lib/ai/usage";
import type { TutorMode } from "@/lib/constants/app";
import { createClient } from "@/lib/supabase/server";
import { chatRequestSchema } from "@/lib/validation/ai";

/** Burst guard, per process. The daily allowance is the real quota. */
const BURST_WINDOW_MS = 10_000;
const BURST_MAX = 3;
const recentCalls = new Map<string, number[]>();

function isBursting(userId: string): boolean {
  const now = Date.now();
  const calls = (recentCalls.get(userId) ?? []).filter(
    (time) => now - time < BURST_WINDOW_MS,
  );

  if (calls.length >= BURST_MAX) {
    recentCalls.set(userId, calls);
    return true;
  }

  calls.push(now);
  recentCalls.set(userId, calls);

  // Keep the map from growing without bound on a long-lived server.
  if (recentCalls.size > 5_000) recentCalls.clear();

  return false;
}

function fail(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: Request) {
  // 1. Authenticated user — the id comes from the session, never the body.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return fail("You need to be signed in.", 401);

  // 2. Validate input.
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail("Invalid request.", 400);
  }

  const parsed = chatRequestSchema.safeParse(body);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Invalid request.", 400);
  }

  if (isBursting(user.id)) {
    return fail("You're sending messages very quickly. Wait a moment.", 429);
  }

  const { message, mode, conversationId } = parsed.data;

  // 3. Load the learner's profile, then check the daily allowance.
  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, english_level, learning_goal, plan")
    .eq("id", user.id)
    .single();

  if (!profile) return fail("Your profile could not be loaded.", 401);

  const usage = await getUsageStatus(supabase, user.id, profile.plan);
  if (usage.exhausted) {
    return NextResponse.json(
      {
        error: `You've used all ${usage.limit} AI messages for today.`,
        limitReached: true,
        remaining: 0,
      },
      { status: 429 },
    );
  }

  // 4. Resolve the conversation, verifying ownership when one was supplied.
  let threadId = conversationId ?? null;

  if (threadId) {
    const { data: existing } = await supabase
      .from("ai_conversations")
      .select("id")
      .eq("id", threadId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (!existing) return fail("That conversation could not be found.", 404);
  } else {
    const { data: created, error } = await supabase
      .from("ai_conversations")
      .insert({
        user_id: user.id,
        mode: mode as TutorMode,
        title: message.slice(0, 60),
      })
      .select("id")
      .single();

    if (error || !created) {
      console.error("[ai] create conversation", error?.message);
      return fail("Your AI tutor is temporarily unavailable.", 500);
    }

    threadId = created.id;
  }

  // 5. Replay recent history for context.
  const { data: history } = await supabase
    .from("ai_messages")
    .select("role, content")
    .eq("conversation_id", threadId)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(MAX_HISTORY_MESSAGES);

  const priorMessages: ChatMessage[] = (history ?? [])
    .reverse()
    .filter((row) => row.role !== "system")
    .map((row) => ({
      role: row.role as "user" | "assistant",
      content: row.content,
    }));

  const messages: ChatMessage[] = [
    {
      role: "system",
      content: buildSystemPrompt({
        level: profile.english_level,
        goal: profile.learning_goal,
        mode: mode as TutorMode,
        displayName: profile.display_name,
      }),
    },
    ...priorMessages,
    { role: "user", content: message },
  ];

  // 6. Call the provider.
  let reply: string;
  try {
    reply = await chatCompletion(messages);
  } catch (error) {
    if (error instanceof AiNotConfiguredError) {
      return fail(
        "The AI tutor isn't configured yet. Add AI_API_KEY to your environment.",
        503,
      );
    }
    if (error instanceof AiRequestError) {
      console.error("[ai]", error.message);
      return fail("Your AI tutor is temporarily unavailable.", 502);
    }
    console.error("[ai] unexpected", error);
    return fail("Your AI tutor is temporarily unavailable.", 500);
  }

  // 7. Persist both turns. The user message is written only after a successful
  // reply, so a provider failure never burns part of the daily allowance.
  const { error: insertError } = await supabase.from("ai_messages").insert([
    { conversation_id: threadId, user_id: user.id, role: "user", content: message },
    {
      conversation_id: threadId,
      user_id: user.id,
      role: "assistant",
      content: reply,
    },
  ]);

  if (insertError) console.error("[ai] persist", insertError.message);

  await supabase
    .from("ai_conversations")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", threadId)
    .eq("user_id", user.id);

  return NextResponse.json({
    conversationId: threadId,
    reply,
    remaining: Math.max(usage.remaining - 1, 0),
  });
}
