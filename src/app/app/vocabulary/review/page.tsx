import { Sparkles } from "lucide-react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { ButtonLink } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/states";
import { getDueCards } from "@/features/vocabulary/queries";
import { ReviewSession } from "@/features/vocabulary/review-session";
import { getSessionContext } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Review vocabulary",
  robots: { index: false },
};

/** One sitting is capped so a long backlog does not become a wall. */
const SESSION_SIZE = 20;

export default async function VocabularyReviewPage() {
  const session = await getSessionContext();
  if (!session) redirect("/login");

  const cards = await getDueCards(session.userId, SESSION_SIZE);

  if (cards.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader title="Review" />
        <EmptyState
          icon={Sparkles}
          title="No words to review right now. Great job!"
          description="Your cards are scheduled for later. Finish another lesson to add new words to the deck."
          action={<ButtonLink href="/app/learn">Continue learning</ButtonLink>}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        title="Review"
        description="Recall the meaning first, then grade yourself honestly — the schedule depends on it."
      />
      <ReviewSession cards={cards} />
    </div>
  );
}
