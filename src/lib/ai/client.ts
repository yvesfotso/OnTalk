import "server-only";

/**
 * Thin wrapper over any OpenAI-compatible /chat/completions endpoint.
 *
 * This module is server-only. AI_API_KEY is never read in client code and is
 * not prefixed with NEXT_PUBLIC_, so it cannot reach the browser bundle.
 */

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export class AiNotConfiguredError extends Error {
  constructor() {
    super("AI provider is not configured");
    this.name = "AiNotConfiguredError";
  }
}

export class AiRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AiRequestError";
  }
}

const DEFAULT_BASE_URL = "https://api.openai.com/v1";
const DEFAULT_MODEL = "gpt-4o-mini";
const REQUEST_TIMEOUT_MS = 30_000;

export function isAiConfigured(): boolean {
  return Boolean(process.env.AI_API_KEY);
}

interface CompletionChoice {
  message?: { content?: string };
}

export async function chatCompletion(messages: ChatMessage[]): Promise<string> {
  const apiKey = process.env.AI_API_KEY;
  if (!apiKey) throw new AiNotConfiguredError();

  const baseUrl = (process.env.AI_BASE_URL ?? DEFAULT_BASE_URL).replace(
    /\/+$/,
    "",
  );
  const model = process.env.AI_MODEL ?? DEFAULT_MODEL;

  let response: Response;
  try {
    response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.7,
        max_tokens: 600,
      }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch {
    throw new AiRequestError("Could not reach the AI provider");
  }

  if (!response.ok) {
    // The provider's body can echo request details, so it is logged server-side
    // and never forwarded to the client.
    console.error(
      `[ai] provider responded ${response.status}`,
      await response.text().catch(() => ""),
    );
    throw new AiRequestError(`AI provider returned ${response.status}`);
  }

  const payload = (await response.json()) as { choices?: CompletionChoice[] };
  const content = payload.choices?.[0]?.message?.content?.trim();

  if (!content) throw new AiRequestError("AI provider returned an empty reply");

  return content;
}
