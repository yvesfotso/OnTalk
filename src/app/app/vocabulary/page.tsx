import { BookOpen, Sparkles } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/states";
import { getVocabularyCards, type VocabularyCard } from "@/features/vocabulary/queries";
import { getSessionContext } from "@/lib/supabase/server";
import { cn } from "@/lib/utils/cn";
import { isPastOrNow } from "@/lib/utils/time";

export const metadata: Metadata = {
  title: "Vocabulary",
  robots: { index: false },
};

const TABS = [
  { value: "all", label: "My Words" },
  { value: "review", label: "Review" },
  { value: "learned", label: "Learned" },
] as const;

type Tab = (typeof TABS)[number]["value"];

interface VocabularyPageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function VocabularyPage({
  searchParams,
}: VocabularyPageProps) {
  const session = await getSessionContext();
  if (!session) redirect("/login");

  const { tab: tabParam } = await searchParams;
  const tab: Tab =
    TABS.find((t) => t.value === tabParam)?.value ?? "all";

  const cards = await getVocabularyCards(session.userId);

  const due = cards.filter((card) => isPastOrNow(card.nextReviewAt));
  const learned = cards.filter((card) => card.status === "learned");

  const visible =
    tab === "review" ? due : tab === "learned" ? learned : cards;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Vocabulary"
        description="Words you have collected, scheduled so they come back just before you would forget them."
        actions={
          due.length > 0 ? (
            <ButtonLink href="/app/vocabulary/review">
              Review {due.length} {due.length === 1 ? "word" : "words"}
            </ButtonLink>
          ) : undefined
        }
      />

      <nav aria-label="Vocabulary views" className="flex gap-2 overflow-x-auto">
        {TABS.map((item) => {
          const count =
            item.value === "review"
              ? due.length
              : item.value === "learned"
                ? learned.length
                : cards.length;

          return (
            <Link
              key={item.value}
              href={
                item.value === "all"
                  ? "/app/vocabulary"
                  : `/app/vocabulary?tab=${item.value}`
              }
              aria-current={tab === item.value ? "page" : undefined}
              className={cn(
                "shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                tab === item.value
                  ? "border-primary bg-primary-subtle text-primary"
                  : "border-border bg-surface text-muted-foreground hover:border-border-strong hover:text-foreground",
              )}
            >
              {item.label}
              <span className="ml-1.5 tabular-nums opacity-70">{count}</span>
            </Link>
          );
        })}
      </nav>

      {visible.length === 0 ? (
        <EmptyState
          icon={tab === "review" ? Sparkles : BookOpen}
          title={
            tab === "review"
              ? "No words to review right now. Great job!"
              : tab === "learned"
                ? "No words marked as learned yet"
                : "Your word list is empty"
          }
          description={
            tab === "review"
              ? "Come back later — your cards are scheduled for the future."
              : tab === "learned"
                ? "Keep reviewing and words will graduate here once they stick."
                : "Finish a lesson and words will start collecting here."
          }
          action={
            tab === "all" ? (
              <ButtonLink href="/app/learn">Browse lessons</ButtonLink>
            ) : undefined
          }
        />
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((card) => (
            <li key={card.id}>
              <WordCard card={card} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function WordCard({ card }: { card: VocabularyCard }) {
  const dueDate = new Date(card.nextReviewAt);
  const isDue = isPastOrNow(card.nextReviewAt);

  return (
    <Card className="h-full">
      <CardBody className="flex h-full flex-col p-5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-base font-semibold text-foreground">
            {card.word.word}
          </h3>
          <Badge
            tone={
              card.status === "learned"
                ? "success"
                : isDue
                  ? "accent"
                  : "neutral"
            }
          >
            {card.status === "learned" ? "Learned" : isDue ? "Due" : "Scheduled"}
          </Badge>
        </div>

        {card.word.phonetic && (
          <p className="mt-0.5 font-mono text-xs text-muted-foreground">
            {card.word.phonetic}
          </p>
        )}

        <p className="mt-2 text-sm text-muted-foreground">
          {card.word.definition}
        </p>

        {card.word.example_sentence && (
          <p className="mt-2 border-l-2 border-border pl-3 text-sm text-foreground italic">
            {card.word.example_sentence}
          </p>
        )}

        <p className="mt-auto pt-4 text-xs text-faint-foreground">
          {isDue
            ? "Ready to review"
            : `Next review ${dueDate.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}`}
          {card.reviewCount > 0 && ` · reviewed ${card.reviewCount}×`}
        </p>
      </CardBody>
    </Card>
  );
}
