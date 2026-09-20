import type { Metadata } from "next";

import { Card, CardBody } from "@/components/ui/card";
import { APP } from "@/lib/constants/app";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${APP.name} handles your data.`,
};

const LAST_UPDATED = "20 September 2026";

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight">Privacy Policy</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Last updated: {LAST_UPDATED}
      </p>

      <Card className="mt-6 border-accent/30 bg-accent-subtle">
        <CardBody className="p-4 text-sm text-warning sm:p-5">
          <strong>This is a development placeholder.</strong> Replace and review
          this policy with qualified legal counsel before any production
          launch. It is written to be transparent about the MVP&apos;s actual data
          handling, not to satisfy any specific regulation.
        </CardBody>
      </Card>

      <div className="prose-content mt-8 space-y-8 text-sm leading-relaxed text-foreground">
        <section>
          <h2 className="text-lg font-semibold">What we collect</h2>
          <p className="mt-2 text-muted-foreground">
            {APP.name} collects the minimum needed to run the product:
          </p>
          <ul className="mt-3 space-y-2 text-muted-foreground">
            <li>
              <strong className="text-foreground">Account information</strong> —
              your name, email address, and authentication data, managed by
              Supabase Auth.
            </li>
            <li>
              <strong className="text-foreground">Learning progress</strong> —
              lessons completed, quiz attempts, vocabulary review history, XP
              and streaks, so your progress persists across devices.
            </li>
            <li>
              <strong className="text-foreground">AI conversations</strong> —
              messages you send to the AI tutor and its replies, stored so you
              can continue a conversation and so we can enforce daily usage
              limits.
            </li>
            <li>
              <strong className="text-foreground">Speech transcripts</strong> —
              if you use speaking practice, the text your browser&apos;s speech
              recognition produces is stored alongside your accuracy score. No
              audio recording is uploaded; transcription happens in your
              browser.
            </li>
            <li>
              <strong className="text-foreground">
                Cookies and session information
              </strong>{" "}
              — used only to keep you signed in. We do not use advertising or
              cross-site tracking cookies.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold">How we use it</h2>
          <p className="mt-2 text-muted-foreground">
            Your data is used to operate {APP.name}: authenticating you,
            saving your progress, personalising lesson recommendations and the
            AI tutor&apos;s responses to your level, and enforcing fair-use limits.
            We do not sell your data.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">Third parties</h2>
          <p className="mt-2 text-muted-foreground">
            We use Supabase for authentication, database and storage, and a
            configurable AI provider (such as OpenAI) to power the AI tutor.
            Messages you send to the tutor are transmitted to that provider to
            generate a reply.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">Your controls</h2>
          <p className="mt-2 text-muted-foreground">
            You can edit your profile at any time from Settings. You can
            permanently delete your account and all associated data from{" "}
            <code className="rounded bg-subtle px-1.5 py-0.5 font-mono text-xs">
              /delete-account
            </code>
            . Deletion is immediate and cannot be undone.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">Data security</h2>
          <p className="mt-2 text-muted-foreground">
            Your data is protected by Row Level Security in the database: every
            table is scoped so you can only read and write your own rows. We
            never expose database credentials to the browser.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">Contact</h2>
          <p className="mt-2 text-muted-foreground">
            Questions about this policy can be sent to{" "}
            <a
              href={`mailto:${APP.supportEmail}`}
              className="text-primary hover:underline"
            >
              {APP.supportEmail}
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
