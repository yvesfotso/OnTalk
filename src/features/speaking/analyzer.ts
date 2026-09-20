import { compareSpeech, type SpeakingFeedback } from "@/features/speaking/compare";

/**
 * Seam for swapping in real speech analysis later.
 *
 * The MVP compares recognised text to the target text and nothing more. A cloud
 * provider that scores actual audio would implement this same interface and be
 * returned from `getSpeechAnalyzer`, leaving the UI untouched.
 */
export interface SpeechAnalyzer {
  readonly id: string;
  /** Label shown to the learner. Must not promise pronunciation scoring. */
  readonly label: string;
  analyze(target: string, transcript: string): SpeakingFeedback;
}

const textComparisonAnalyzer: SpeechAnalyzer = {
  id: "text-comparison",
  label: "Speaking feedback",
  analyze: compareSpeech,
};

export function getSpeechAnalyzer(): SpeechAnalyzer {
  return textComparisonAnalyzer;
}
