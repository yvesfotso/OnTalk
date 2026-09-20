import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { aiMessageLimit } from "@/lib/billing";
import type { PlanId } from "@/lib/constants/app";
import type { Database } from "@/types/database";

export interface UsageStatus {
  used: number;
  limit: number;
  remaining: number;
  exhausted: boolean;
}

/** Start of the current UTC day, so the allowance resets at a fixed moment. */
function startOfUtcDay(): string {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  ).toISOString();
}

/**
 * Counts the learner's own messages sent today.
 *
 * Counting `ai_messages` directly means there is no separate counter to drift
 * out of sync, and the query is a single indexed count with no rows returned.
 */
export async function getUsageStatus(
  supabase: SupabaseClient<Database>,
  userId: string,
  plan: PlanId,
): Promise<UsageStatus> {
  const limit = aiMessageLimit(plan);

  const { count } = await supabase
    .from("ai_messages")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("role", "user")
    .gte("created_at", startOfUtcDay());

  const used = count ?? 0;
  const remaining = Math.max(limit - used, 0);

  return { used, limit, remaining, exhausted: remaining <= 0 };
}
