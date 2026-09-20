"use client";

import { Sparkles, X } from "lucide-react";
import { useState } from "react";

import { SubtleCard } from "@/components/ui/card";

interface PracticeTipProps {
  question: string;
  answer: string;
}

export function PracticeTip({ question, answer }: PracticeTipProps) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  return (
    <SubtleCard className="flex items-start gap-4 p-5 sm:p-6">
      <span
        className="grid size-10 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground"
        aria-hidden
      >
        <Sparkles className="size-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-foreground">{question}</p>
        <p className="mt-1 text-sm text-muted-foreground">{answer}</p>
      </div>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="Dismiss tip"
        className="-m-1 grid size-8 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
      >
        <X className="size-4" aria-hidden />
      </button>
    </SubtleCard>
  );
}
