/**
 * Narrows raw JSONB section content into the typed shapes in
 * `src/types/lesson.ts`.
 *
 * Lesson content lives in the database and is edited outside the codebase, so a
 * malformed section must not take down the whole lesson. Anything that does not
 * match its declared shape is dropped and logged.
 */

import type { LessonSection } from "@/types/database";
import type { ParsedSection } from "@/types/lesson";

type Obj = Record<string, unknown>;

const isObject = (value: unknown): value is Obj =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const str = (value: unknown): string | null =>
  typeof value === "string" && value.trim().length > 0 ? value : null;

const strArray = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : [];

export function parseSection(raw: LessonSection): ParsedSection | null {
  const content = raw.content;
  if (!isObject(content)) return null;

  const base = {
    id: raw.id,
    title: raw.title,
    orderIndex: raw.order_index,
  };

  switch (raw.section_type) {
    case "introduction": {
      const heading = str(content.heading);
      const body = str(content.body);
      if (!heading || !body) break;
      return {
        ...base,
        type: "introduction",
        content: { heading, body, objectives: strArray(content.objectives) },
      };
    }

    case "text": {
      const paragraphs = strArray(content.paragraphs);
      if (paragraphs.length === 0) break;
      return { ...base, type: "text", content: { paragraphs } };
    }

    case "vocabulary": {
      const items = Array.isArray(content.items)
        ? content.items.flatMap((item) => {
            if (!isObject(item)) return [];
            const word = str(item.word);
            const definition = str(item.definition);
            if (!word || !definition) return [];
            return [
              {
                word,
                definition,
                example: str(item.example) ?? undefined,
                phonetic: str(item.phonetic) ?? undefined,
              },
            ];
          })
        : [];
      if (items.length === 0) break;
      return { ...base, type: "vocabulary", content: { items } };
    }

    case "grammar": {
      const rule = str(content.rule);
      const explanation = str(content.explanation);
      if (!rule || !explanation) break;
      return {
        ...base,
        type: "grammar",
        content: { rule, explanation, examples: strArray(content.examples) },
      };
    }

    case "example": {
      const items = Array.isArray(content.items)
        ? content.items.flatMap((item) => {
            if (!isObject(item)) return [];
            const text = str(item.text);
            if (!text) return [];
            return [{ text, note: str(item.note) ?? undefined }];
          })
        : [];
      if (items.length === 0) break;
      return {
        ...base,
        type: "example",
        content: { heading: str(content.heading) ?? undefined, items },
      };
    }

    case "reading": {
      const paragraphs = strArray(content.paragraphs);
      if (paragraphs.length === 0) break;
      return {
        ...base,
        type: "reading",
        content: {
          title: str(content.title) ?? undefined,
          paragraphs,
          questions: strArray(content.questions),
        },
      };
    }

    case "multiple_choice": {
      const question = str(content.question);
      const options = strArray(content.options);
      const correctIndex = content.correctIndex;

      if (
        !question ||
        options.length < 2 ||
        typeof correctIndex !== "number" ||
        correctIndex < 0 ||
        correctIndex >= options.length
      ) {
        break;
      }

      return {
        ...base,
        type: "multiple_choice",
        content: {
          question,
          options,
          correctIndex,
          explanation: str(content.explanation) ?? undefined,
        },
      };
    }

    case "fill_blank": {
      const sentence = str(content.sentence);
      const answer = str(content.answer);
      if (!sentence || !answer) break;

      const options = strArray(content.options);
      return {
        ...base,
        type: "fill_blank",
        content: {
          sentence,
          answer,
          options: options.length > 0 ? options : undefined,
          explanation: str(content.explanation) ?? undefined,
        },
      };
    }

    case "speaking_prompt": {
      const phrase = str(content.phrase);
      if (!phrase) break;
      return {
        ...base,
        type: "speaking_prompt",
        content: { phrase, tip: str(content.tip) ?? undefined },
      };
    }

    case "summary": {
      const points = strArray(content.points);
      if (points.length === 0) break;
      return {
        ...base,
        type: "summary",
        content: { points, nextStep: str(content.nextStep) ?? undefined },
      };
    }
  }

  console.warn(
    `[lessons] dropped malformed "${raw.section_type}" section ${raw.id}`,
  );
  return null;
}

export function parseSections(rows: LessonSection[]): ParsedSection[] {
  return rows
    .map(parseSection)
    .filter((section): section is ParsedSection => section !== null);
}
