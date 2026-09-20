import { z } from "zod";

import { TUTOR_MODES } from "@/lib/constants/app";

export const MAX_MESSAGE_LENGTH = 1000;

export const chatRequestSchema = z.object({
  message: z
    .string()
    .trim()
    .min(1, "Write a message first.")
    .max(MAX_MESSAGE_LENGTH, `Keep it under ${MAX_MESSAGE_LENGTH} characters.`),
  mode: z.enum(TUTOR_MODES.map((m) => m.value) as [string, ...string[]]),
  /** Omitted on the first message of a new thread. */
  conversationId: z.uuid().optional(),
});

export type ChatRequest = z.infer<typeof chatRequestSchema>;

export interface ChatResponse {
  conversationId: string;
  reply: string;
  remaining: number;
}
