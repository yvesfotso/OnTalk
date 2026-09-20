/**
 * Hand-maintained mirror of `supabase/migrations`. Regenerate with
 * `npx supabase gen types typescript --linked > src/types/database.ts`
 * once you have the Supabase CLI linked to your project.
 */

import type { CefrLevel, PlanId, TutorMode } from "@/lib/constants/app";

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type LessonStatus = "started" | "in_progress" | "completed";
export type VocabularyStatus = "learning" | "reviewing" | "learned";
export type QuestionType = "multiple_choice" | "fill_blank" | "true_false";
export type MessageRole = "user" | "assistant" | "system";

export type SectionType =
  | "introduction"
  | "text"
  | "vocabulary"
  | "grammar"
  | "example"
  | "reading"
  | "multiple_choice"
  | "fill_blank"
  | "speaking_prompt"
  | "summary";

export type Profile = {
  id: string;
  display_name: string;
  avatar_url: string | null;
  native_language: string | null;
  english_level: CefrLevel;
  learning_goal: string | null;
  improvement_areas: string[];
  interests: string[];
  daily_minutes_goal: number;
  xp: number;
  streak: number;
  last_activity_date: string | null;
  plan: PlanId;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export type Lesson = {
  id: string;
  slug: string;
  title: string;
  description: string;
  level: CefrLevel;
  topic: string;
  estimated_minutes: number;
  xp_reward: number;
  order_index: number;
  is_premium: boolean;
  is_published: boolean;
  created_at: string;
}

export type LessonSection = {
  id: string;
  lesson_id: string;
  section_type: SectionType;
  title: string | null;
  content: Json;
  order_index: number;
}

export type LessonProgress = {
  id: string;
  user_id: string;
  lesson_id: string;
  status: LessonStatus;
  progress_percent: number;
  score: number | null;
  started_at: string;
  completed_at: string | null;
  last_opened_at: string;
}

export type Vocabulary = {
  id: string;
  word: string;
  definition: string;
  example_sentence: string;
  part_of_speech: string | null;
  phonetic: string | null;
  level: CefrLevel;
  topic: string;
  created_at: string;
}

export type UserVocabulary = {
  id: string;
  user_id: string;
  vocabulary_id: string;
  status: VocabularyStatus;
  ease_score: number;
  interval_days: number;
  review_count: number;
  correct_count: number;
  incorrect_count: number;
  last_reviewed_at: string | null;
  next_review_at: string;
  created_at: string;
}

export type Quiz = {
  id: string;
  lesson_id: string | null;
  slug: string;
  title: string;
  passing_score: number;
  xp_reward: number;
  created_at: string;
}

export type QuizQuestion = {
  id: string;
  quiz_id: string;
  question_type: QuestionType;
  question_text: string;
  answer_data: Json;
  correct_answer: Json;
  explanation: string | null;
  order_index: number;
}

export type QuizAttempt = {
  id: string;
  user_id: string;
  quiz_id: string;
  score: number;
  total_questions: number;
  correct_answers: number;
  completed_at: string;
}

export type AiConversation = {
  id: string;
  user_id: string;
  mode: TutorMode;
  title: string;
  created_at: string;
  updated_at: string;
}

export type AiMessage = {
  id: string;
  conversation_id: string;
  user_id: string;
  role: MessageRole;
  content: string;
  created_at: string;
}

export type SpeakingAttempt = {
  id: string;
  user_id: string;
  prompt_text: string;
  transcript: string;
  accuracy_percent: number;
  created_at: string;
}

export type DailyActivity = {
  id: string;
  user_id: string;
  activity_date: string;
  minutes_studied: number;
  xp_earned: number;
  lessons_completed: number;
  words_reviewed: number;
  speaking_sessions: number;
}

type Table<Row, Insert = Partial<Row>, Update = Partial<Row>> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      profiles: Table<Profile>;
      lessons: Table<Lesson>;
      lesson_sections: Table<LessonSection>;
      lesson_progress: Table<
        LessonProgress,
        Omit<LessonProgress, "id" | "started_at" | "last_opened_at"> &
          Partial<Pick<LessonProgress, "id" | "started_at" | "last_opened_at">>
      >;
      vocabulary: Table<Vocabulary>;
      user_vocabulary: Table<
        UserVocabulary,
        Omit<UserVocabulary, "id" | "created_at"> &
          Partial<Pick<UserVocabulary, "id" | "created_at">>
      >;
      quizzes: Table<Quiz>;
      quiz_questions: Table<QuizQuestion>;
      quiz_attempts: Table<
        QuizAttempt,
        Omit<QuizAttempt, "id" | "completed_at"> &
          Partial<Pick<QuizAttempt, "id" | "completed_at">>
      >;
      ai_conversations: Table<
        AiConversation,
        Omit<AiConversation, "id" | "created_at" | "updated_at" | "title"> &
          Partial<Pick<AiConversation, "id" | "created_at" | "updated_at" | "title">>
      >;
      ai_messages: Table<
        AiMessage,
        Omit<AiMessage, "id" | "created_at"> &
          Partial<Pick<AiMessage, "id" | "created_at">>
      >;
      speaking_attempts: Table<
        SpeakingAttempt,
        Omit<SpeakingAttempt, "id" | "created_at"> &
          Partial<Pick<SpeakingAttempt, "id" | "created_at">>
      >;
      daily_activity: Table<DailyActivity>;
    };
    Views: { [_ in never]: never };
    Functions: {
      record_activity: {
        Args: {
          p_minutes?: number;
          p_xp?: number;
          p_lessons?: number;
          p_words?: number;
          p_speaking?: number;
        };
        Returns: Profile;
      };
      enroll_vocabulary_for_level: {
        Args: { p_level?: string; p_limit?: number };
        Returns: number;
      };
      delete_own_account: {
        Args: Record<string, never>;
        Returns: undefined;
      };
    };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
}
