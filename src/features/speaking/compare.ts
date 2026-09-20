/**
 * Word-level comparison between a target phrase and what the browser's speech
 * recogniser transcribed.
 *
 * This is a *text* comparison, not acoustic analysis. It cannot judge
 * pronunciation, and the UI must never present it as a pronunciation score.
 * See `SpeechAnalyzer` in `./analyzer.ts` for the seam where a real cloud
 * speech service would slot in.
 */

export type WordStatus = "match" | "missing" | "extra";

export interface WordDiff {
  word: string;
  status: WordStatus;
}

export interface SpeakingFeedback {
  /** Share of the target words that were recognised, 0-100. */
  accuracy: number;
  diff: WordDiff[];
  message: string;
}

const tokenize = (value: string): string[] =>
  value
    .toLowerCase()
    .replace(/[.,!?;:"“”]/g, "")
    .split(/\s+/)
    .filter(Boolean);

/**
 * Longest common subsequence over words, so a missing word shifts the
 * alignment by one instead of marking the whole rest of the sentence wrong.
 */
function diffWords(target: string[], spoken: string[]): WordDiff[] {
  const rows = target.length;
  const cols = spoken.length;

  const table: number[][] = Array.from({ length: rows + 1 }, () =>
    new Array<number>(cols + 1).fill(0),
  );

  for (let i = rows - 1; i >= 0; i--) {
    for (let j = cols - 1; j >= 0; j--) {
      table[i][j] =
        target[i] === spoken[j]
          ? table[i + 1][j + 1] + 1
          : Math.max(table[i + 1][j], table[i][j + 1]);
    }
  }

  const diff: WordDiff[] = [];
  let i = 0;
  let j = 0;

  while (i < rows && j < cols) {
    if (target[i] === spoken[j]) {
      diff.push({ word: target[i], status: "match" });
      i++;
      j++;
    } else if (table[i + 1][j] >= table[i][j + 1]) {
      diff.push({ word: target[i], status: "missing" });
      i++;
    } else {
      diff.push({ word: spoken[j], status: "extra" });
      j++;
    }
  }

  while (i < rows) diff.push({ word: target[i++], status: "missing" });
  while (j < cols) diff.push({ word: spoken[j++], status: "extra" });

  return diff;
}

function buildMessage(
  accuracy: number,
  diff: WordDiff[],
  spokenCount: number,
): string {
  if (spokenCount === 0) {
    return "We didn't catch anything. Check your microphone and try again.";
  }

  const missing = diff.filter((d) => d.status === "missing");

  if (accuracy >= 90) {
    return "Excellent. That matched the phrase closely.";
  }

  if (missing.length === 1) {
    const index = diff.findIndex((d) => d.status === "missing");
    const following = diff
      .slice(index + 1)
      .find((d) => d.status !== "extra")?.word;

    const hint = following
      ? `Try adding "${missing[0].word}" before "${following}".`
      : `Try adding "${missing[0].word}" at the end.`;

    return accuracy >= 70 ? `Good attempt. ${hint}` : `Close. ${hint}`;
  }

  if (accuracy >= 70) {
    return "Good attempt. Say it once more, a little slower.";
  }

  return "Keep practising. Listen to the model phrase again, then repeat it.";
}

export function compareSpeech(
  target: string,
  transcript: string,
): SpeakingFeedback {
  const targetWords = tokenize(target);
  const spokenWords = tokenize(transcript);

  const diff = diffWords(targetWords, spokenWords);
  const matched = diff.filter((d) => d.status === "match").length;

  const accuracy =
    targetWords.length === 0
      ? 0
      : Math.round((matched / targetWords.length) * 100);

  return {
    accuracy,
    diff,
    message: buildMessage(accuracy, diff, spokenWords.length),
  };
}
