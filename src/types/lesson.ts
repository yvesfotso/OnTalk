/**
 * Shapes stored in `lesson_sections.content` (JSONB).
 *
 * Content comes from the database rather than the codebase, so it is parsed
 * defensively — a malformed section renders as nothing instead of crashing the
 * lesson. `parseSection` in `src/features/lessons/parse-section.ts` is the only
 * place that does the narrowing.
 */

import type { LessonSection, SectionType } from "@/types/database";

export interface IntroductionContent {
  heading: string;
  body: string;
  objectives?: string[];
}

export interface TextContent {
  paragraphs: string[];
}

export interface VocabularyItem {
  word: string;
  definition: string;
  example?: string;
  phonetic?: string;
}

export interface VocabularyContent {
  items: VocabularyItem[];
}

export interface GrammarContent {
  rule: string;
  explanation: string;
  examples: string[];
}

export interface ExampleContent {
  heading?: string;
  items: { text: string; note?: string }[];
}

export interface ReadingContent {
  title?: string;
  paragraphs: string[];
  questions?: string[];
}

export interface MultipleChoiceContent {
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
}

export interface FillBlankContent {
  sentence: string;
  options?: string[];
  answer: string;
  explanation?: string;
}

export interface SpeakingPromptContent {
  phrase: string;
  tip?: string;
}

export interface SummaryContent {
  points: string[];
  nextStep?: string;
}

export type SectionContentMap = {
  introduction: IntroductionContent;
  text: TextContent;
  vocabulary: VocabularyContent;
  grammar: GrammarContent;
  example: ExampleContent;
  reading: ReadingContent;
  multiple_choice: MultipleChoiceContent;
  fill_blank: FillBlankContent;
  speaking_prompt: SpeakingPromptContent;
  summary: SummaryContent;
};

export type ParsedSection = {
  [K in SectionType]: {
    id: string;
    type: K;
    title: string | null;
    orderIndex: number;
    content: SectionContentMap[K];
  };
}[SectionType];

/** Section types the learner has to answer before the lesson counts as done. */
export const INTERACTIVE_SECTION_TYPES: SectionType[] = [
  "multiple_choice",
  "fill_blank",
];

export type RawSection = LessonSection;
