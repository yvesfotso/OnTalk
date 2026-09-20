import { PLANS, type PlanId } from "@/lib/constants/app";

/**
 * PAYMENTS ARE NOT IMPLEMENTED.
 *
 * Entitlements are read from `profiles.plan`, which is only ever set by hand in
 * the Supabase dashboard during development. Nothing in this codebase charges
 * money, and the upgrade button deliberately does not pretend to.
 *
 * When real billing is added, this file is the seam: verify the subscription
 * with the payment provider and keep `profiles.plan` in sync from a webhook.
 */
export const PAYMENTS_ENABLED = false;

export function getPlan(plan: PlanId) {
  return PLANS[plan];
}

export function aiMessageLimit(plan: PlanId): number {
  return PLANS[plan].aiMessagesPerDay;
}

/** Premium-only lessons are visible but locked for free learners. */
export function canOpenLesson(plan: PlanId, isPremiumLesson: boolean): boolean {
  return !isPremiumLesson || plan === "premium";
}
