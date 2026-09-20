/**
 * Single source of truth for the product name and everything derived from it.
 * Rebranding means editing this file only.
 */

export const APP = {
  name: "OnTalk",
  tagline: "Speak English with confidence.",
  description:
    "Improve your English with structured lessons, vocabulary review, speaking practice, quizzes, and an AI tutor.",
  promise:
    "Learn English every day with structured lessons, vocabulary review, quizzes, speaking practice, progress tracking, and an AI English tutor.",
  supportEmail: "hello@ontalk.app",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
} as const;

export const CEFR_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;
export type CefrLevel = (typeof CEFR_LEVELS)[number];

export const LEVEL_LABELS: Record<CefrLevel, string> = {
  A1: "Beginner",
  A2: "Elementary",
  B1: "Intermediate",
  B2: "Upper Intermediate",
  C1: "Advanced",
  C2: "Proficient",
};

export const LEARNING_GOALS = [
  { value: "conversation", label: "Conversation" },
  { value: "work", label: "Work" },
  { value: "school", label: "School / University" },
  { value: "travel", label: "Travel" },
  { value: "exams", label: "Exams" },
  { value: "moving_abroad", label: "Moving abroad" },
  { value: "personal", label: "Personal improvement" },
] as const;

export const IMPROVEMENT_AREAS = [
  { value: "speaking", label: "Speaking" },
  { value: "vocabulary", label: "Vocabulary" },
  { value: "grammar", label: "Grammar" },
  { value: "listening", label: "Listening" },
  { value: "reading", label: "Reading" },
  { value: "writing", label: "Writing" },
] as const;

export const DAILY_MINUTE_OPTIONS = [5, 10, 15, 20, 30] as const;

export const INTERESTS = [
  "Technology",
  "Business",
  "Travel",
  "Movies",
  "Music",
  "Sports",
  "Science",
  "Gaming",
  "Culture",
  "University",
] as const;

export const TUTOR_MODES = [
  {
    value: "general",
    label: "General Tutor",
    blurb: "Ask anything about English.",
  },
  {
    value: "conversation",
    label: "Conversation",
    blurb: "Free chat, gently corrected.",
  },
  {
    value: "grammar",
    label: "Grammar Coach",
    blurb: "Rules, examples, practice.",
  },
  {
    value: "vocabulary",
    label: "Vocabulary Coach",
    blurb: "Meanings and natural usage.",
  },
  {
    value: "interview",
    label: "Interview Practice",
    blurb: "Mock job interviews.",
  },
  {
    value: "travel",
    label: "Travel English",
    blurb: "Airports, hotels, directions.",
  },
] as const;

export type TutorMode = (typeof TUTOR_MODES)[number]["value"];

/**
 * The AI tutor is fully built (see src/features/tutor, /api/ai/chat) but not
 * switched on for learners yet — flip this once an AI_API_KEY and usage
 * budget are ready. Everywhere the tutor is mentioned reads this flag instead
 * of hard-coding "coming soon" copy in multiple places.
 */
export const AI_TUTOR_ENABLED = false;

/**
 * Outside study material linked from the Learn page. Not hosted by OnTalk —
 * opens in a new tab.
 */
export const EXTERNAL_STUDY_RESOURCES = [
  {
    title: "Complete IELTS 4.0–5.0",
    description:
      "Student's Book, Teacher's Book, Workbook, and an audio workbook for listening practice.",
    href: "https://drive.google.com/drive/u/0/folders/15pnRGwjCt7kjOcMUAmvRhDh0jUoZnNUU",
  },
] as const;

/**
 * Plan entitlements. Payment is NOT implemented — `plan` is set manually in the
 * database during development. See `src/lib/billing.ts`.
 */
export const PLANS = {
  free: {
    id: "free",
    name: "Free",
    price: "$0",
    period: "forever",
    aiMessagesPerDay: 5,
    features: [
      "Core lesson path",
      "Vocabulary review",
      "Basic speaking practice",
      "5 AI tutor messages per day (coming soon)",
      "Progress tracking",
    ],
  },
  premium: {
    id: "premium",
    name: "Premium",
    price: "$9",
    period: "per month",
    aiMessagesPerDay: 100,
    features: [
      "Full lesson library",
      "Generous AI tutor allowance (coming soon)",
      "Advanced speaking feedback (coming soon)",
      "Detailed progress analytics (coming soon)",
      "Priority support",
    ],
  },
} as const;

export type PlanId = keyof typeof PLANS;

export const XP_PER_QUIZ_QUESTION = 2;
export const XP_PER_SPEAKING_ATTEMPT = 3;
export const XP_PER_VOCABULARY_REVIEW = 1;
