import { Sparkles } from "lucide-react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/states";
import { TutorChat } from "@/features/tutor/chat";
import { isAiConfigured } from "@/lib/ai/client";
import { getUsageStatus } from "@/lib/ai/usage";
import { AI_TUTOR_ENABLED, TUTOR_MODES } from "@/lib/constants/app";
import { createClient, getSessionContext } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "AI Tutor",
  robots: { index: false },
};

export default async function TutorPage() {
  const session = await getSessionContext();
  if (!session) redirect("/login");

  if (!AI_TUTOR_ENABLED) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <PageHeader
          title="AI Tutor"
          eyebrow={<Badge tone="primary">Coming soon</Badge>}
        />

        <EmptyState
          icon={Sparkles}
          title="Your AI tutor is on the way"
          description="Chat practice, grammar coaching, and mock interviews that adapt to your level. We're finishing it up — in the meantime, speaking practice and vocabulary review are ready for you."
          action={<ButtonLink href="/app/speaking">Try speaking practice</ButtonLink>}
        />

        <div>
          <p className="mb-3 text-xs font-semibold tracking-wide text-faint-foreground uppercase">
            What&apos;s coming
          </p>
          <ul className="grid gap-2 sm:grid-cols-2">
            {TUTOR_MODES.map((mode) => (
              <li
                key={mode.value}
                className="rounded-2xl border border-border/60 bg-surface px-4 py-3"
              >
                <p className="text-sm font-medium text-foreground">{mode.label}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{mode.blurb}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  const supabase = await createClient();
  const usage = await getUsageStatus(
    supabase,
    session.userId,
    session.profile.plan,
  );

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title="AI Tutor"
        description="Chat in English, ask grammar questions, or run a mock interview. Your tutor adapts to your level."
      />

      <TutorChat
        displayName={session.profile.display_name}
        level={session.profile.english_level}
        initialRemaining={usage.remaining}
        dailyLimit={usage.limit}
        aiConfigured={isAiConfigured()}
      />
    </div>
  );
}
