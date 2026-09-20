import type { Metadata } from "next";

import { Card, CardBody } from "@/components/ui/card";
import { APP } from "@/lib/constants/app";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: `The terms governing use of ${APP.name}.`,
};

const LAST_UPDATED = "20 September 2026";

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight">Terms of Service</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Last updated: {LAST_UPDATED}
      </p>

      <Card className="mt-6 border-accent/30 bg-accent-subtle">
        <CardBody className="p-4 text-sm text-warning sm:p-5">
          <strong>This is a development placeholder.</strong> Have these terms
          reviewed by qualified legal counsel before any commercial launch.
        </CardBody>
      </Card>

      <div className="mt-8 space-y-8 text-sm leading-relaxed text-foreground">
        <section>
          <h2 className="text-lg font-semibold">1. Acceptance</h2>
          <p className="mt-2 text-muted-foreground">
            By creating an account or using {APP.name}, you agree to these
            terms. If you do not agree, do not use the service.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">2. The service</h2>
          <p className="mt-2 text-muted-foreground">
            {APP.name} is an English-learning MVP: structured lessons,
            vocabulary review, quizzes, browser-based speaking practice, and an
            AI tutor. It is provided as-is, and features may change as the
            product develops.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">3. Accounts</h2>
          <p className="mt-2 text-muted-foreground">
            You are responsible for keeping your login credentials secure and
            for all activity under your account. You must provide accurate
            information when registering.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">4. Acceptable use</h2>
          <p className="mt-2 text-muted-foreground">
            You agree not to misuse the service — including attempting to
            bypass usage limits, extract other users&apos; data, or use the AI
            tutor for anything unlawful or abusive.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">5. AI tutor</h2>
          <p className="mt-2 text-muted-foreground">
            The AI tutor uses a third-party language model and may
            occasionally produce inaccurate or incomplete information. It is a
            learning aid, not professional advice of any kind.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">6. Speaking practice</h2>
          <p className="mt-2 text-muted-foreground">
            Speaking feedback compares recognised words to a target phrase. It
            is not a certified or scientifically validated measure of
            pronunciation accuracy.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">7. Plans and payment</h2>
          <p className="mt-2 text-muted-foreground">
            {APP.name} currently offers a Free plan. A Premium plan is shown
            for illustration, but payment processing is not yet implemented —
            no charges can currently be made through the service.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">8. Termination</h2>
          <p className="mt-2 text-muted-foreground">
            You may delete your account at any time from Settings. We may
            suspend accounts that violate these terms.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">9. Changes</h2>
          <p className="mt-2 text-muted-foreground">
            We may update these terms as the product develops. Continued use
            after a change means you accept the updated terms.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">10. Contact</h2>
          <p className="mt-2 text-muted-foreground">
            Questions about these terms can be sent to{" "}
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
