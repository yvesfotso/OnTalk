"use client";

import { Send, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { Textarea } from "@/components/ui/form";
import { InlineAlert } from "@/components/ui/states";
import { UpgradeCard } from "@/features/tutor/upgrade-card";
import { track } from "@/lib/analytics";
import { TUTOR_MODES, type TutorMode } from "@/lib/constants/app";
import { cn } from "@/lib/utils/cn";
import { tempId } from "@/lib/utils/id";
import { MAX_MESSAGE_LENGTH } from "@/lib/validation/ai";

interface Turn {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface TutorChatProps {
  displayName: string;
  level: string;
  initialRemaining: number;
  dailyLimit: number;
  aiConfigured: boolean;
}

const STARTERS = [
  "Can we practise small talk?",
  "Explain the present perfect simply.",
  "What's the difference between 'make' and 'do'?",
  "Ask me an interview question.",
];

export function TutorChat({
  displayName,
  level,
  initialRemaining,
  dailyLimit,
  aiConfigured,
}: TutorChatProps) {
  const [mode, setMode] = useState<TutorMode>("general");
  const [turns, setTurns] = useState<Turn[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [remaining, setRemaining] = useState(initialRemaining);
  const [limitReached, setLimitReached] = useState(initialRemaining <= 0);

  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [turns, sending]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || sending || limitReached) return;

    setError(null);
    setSending(true);
    setInput("");

    const userTurn: Turn = {
      id: tempId("local"),
      role: "user",
      content: trimmed,
    };
    setTurns((current) => [...current, userTurn]);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          mode,
          ...(conversationId ? { conversationId } : {}),
        }),
      });

      const payload = (await response.json()) as {
        reply?: string;
        conversationId?: string;
        remaining?: number;
        error?: string;
        limitReached?: boolean;
      };

      if (!response.ok) {
        // Roll the message back so the learner can edit and retry it.
        setTurns((current) => current.filter((t) => t.id !== userTurn.id));
        setInput(trimmed);
        setError(payload.error ?? "Your AI tutor is temporarily unavailable.");
        if (payload.limitReached) {
          setLimitReached(true);
          setRemaining(0);
        }
        return;
      }

      setConversationId(payload.conversationId ?? null);
      setRemaining(payload.remaining ?? 0);
      setLimitReached((payload.remaining ?? 0) <= 0);
      setTurns((current) => [
        ...current,
        {
          id: tempId("assistant"),
          role: "assistant",
          content: payload.reply ?? "",
        },
      ]);
      track("tutor_message_sent", { mode });
    } catch {
      setTurns((current) => current.filter((t) => t.id !== userTurn.id));
      setInput(trimmed);
      setError("We couldn't reach your tutor. Check your connection and retry.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold tracking-wide text-faint-foreground uppercase">
          Mode
        </span>
        {TUTOR_MODES.map((item) => (
          <button
            key={item.value}
            type="button"
            title={item.blurb}
            aria-pressed={mode === item.value}
            onClick={() => {
              setMode(item.value);
              // A new mode starts a fresh thread so the system prompt applies.
              setConversationId(null);
              setTurns([]);
            }}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
              mode === item.value
                ? "border-primary bg-primary-subtle text-primary"
                : "border-border bg-surface text-muted-foreground hover:border-border-strong hover:text-foreground",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {!aiConfigured && (
        <InlineAlert tone="info">
          The AI tutor isn&apos;t configured yet. Add{" "}
          <code className="font-mono text-xs">AI_API_KEY</code> to{" "}
          <code className="font-mono text-xs">.env.local</code> and restart the dev
          server.
        </InlineAlert>
      )}

      <Card className="flex min-h-96 flex-col">
        <div className="flex-1 space-y-4 overflow-y-auto p-5 sm:p-6">
          {turns.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 py-8 text-center">
              <span
                className="grid size-12 place-items-center rounded-2xl bg-primary-subtle text-primary"
                aria-hidden
              >
                <Sparkles className="size-6" />
              </span>
              <div>
                <h2 className="text-base font-semibold">
                  Start a conversation
                </h2>
                <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
                  Your tutor knows you&apos;re {displayName} at level {level} and
                  will adjust its English to match.
                </p>
              </div>

              <div className="flex flex-wrap justify-center gap-2">
                {STARTERS.map((starter) => (
                  <button
                    key={starter}
                    type="button"
                    disabled={limitReached || !aiConfigured}
                    onClick={() => void send(starter)}
                    className="rounded-full border border-border bg-surface px-3.5 py-1.5 text-sm text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground disabled:opacity-50"
                  >
                    {starter}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <ul className="space-y-4" aria-live="polite">
              {turns.map((turn) => (
                <li
                  key={turn.id}
                  className={cn(
                    "flex",
                    turn.role === "user" ? "justify-end" : "justify-start",
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap",
                      turn.role === "user"
                        ? "rounded-br-sm bg-primary text-primary-foreground"
                        : "rounded-bl-sm bg-subtle text-foreground",
                    )}
                  >
                    <span className="sr-only">
                      {turn.role === "user" ? "You said: " : "Tutor said: "}
                    </span>
                    {turn.content}
                  </div>
                </li>
              ))}

              {sending && (
                <li className="flex justify-start">
                  <div className="flex gap-1 rounded-2xl rounded-bl-sm bg-subtle px-4 py-3">
                    <span className="sr-only">Tutor is typing</span>
                    {[0, 150, 300].map((delay) => (
                      <span
                        key={delay}
                        className="size-1.5 animate-bounce rounded-full bg-faint-foreground"
                        style={{ animationDelay: `${delay}ms` }}
                        aria-hidden
                      />
                    ))}
                  </div>
                </li>
              )}
            </ul>
          )}
          <div ref={endRef} />
        </div>

        <CardBody className="border-t border-border p-4 sm:p-4">
          {error && <InlineAlert className="mb-3">{error}</InlineAlert>}

          <form
            onSubmit={(event) => {
              event.preventDefault();
              void send(input);
            }}
            className="flex items-end gap-2"
          >
            <Textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  void send(input);
                }
              }}
              disabled={limitReached || !aiConfigured}
              rows={2}
              maxLength={MAX_MESSAGE_LENGTH}
              placeholder={
                limitReached
                  ? "Daily limit reached"
                  : "Write in English… (Enter to send)"
              }
              aria-label="Message your tutor"
              className="resize-none"
            />
            <Button
              type="submit"
              size="icon"
              className="h-11 w-11 shrink-0"
              aria-label="Send message"
              disabled={!input.trim() || limitReached || !aiConfigured}
              loading={sending}
            >
              {!sending && <Send className="size-4" aria-hidden />}
            </Button>
          </form>

          <p className="mt-2 text-xs text-muted-foreground">
            <Badge size="sm">
              {remaining} of {dailyLimit} messages left today
            </Badge>
          </p>
        </CardBody>
      </Card>

      {limitReached && <UpgradeCard limit={dailyLimit} />}
    </div>
  );
}
