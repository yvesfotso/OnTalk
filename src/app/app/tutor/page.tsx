import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { PageHeader } from "@/components/ui/page-header";
import { TutorChat } from "@/features/tutor/chat";
import { isAiConfigured } from "@/lib/ai/client";
import { getUsageStatus } from "@/lib/ai/usage";
import { createClient, getSessionContext } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "AI Tutor",
  robots: { index: false },
};

export default async function TutorPage() {
  const session = await getSessionContext();
  if (!session) redirect("/login");

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
