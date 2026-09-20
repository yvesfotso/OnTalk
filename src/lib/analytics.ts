/**
 * Analytics seam. No provider is wired up, and none is required to run the app.
 *
 * To add one, implement `send` — e.g. call Vercel Analytics, PostHog or Plausible.
 * Never pass personally identifying data: user ids are fine, email is not.
 */

export type AnalyticsEvent =
  | "signed_up"
  | "signed_in"
  | "onboarding_completed"
  | "lesson_started"
  | "lesson_completed"
  | "quiz_completed"
  | "vocabulary_reviewed"
  | "speaking_attempted"
  | "tutor_message_sent"
  | "upgrade_viewed";

type Props = Record<string, string | number | boolean | null | undefined>;

export function track(event: AnalyticsEvent, props?: Props): void {
  if (process.env.NODE_ENV === "development") {
    console.debug("[analytics]", event, props ?? {});
  }
}
