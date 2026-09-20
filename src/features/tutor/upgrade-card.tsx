"use client";

import { Check, Sparkles } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { track } from "@/lib/analytics";
import { PAYMENTS_ENABLED } from "@/lib/billing";
import { PLANS } from "@/lib/constants/app";

/**
 * Shown when a free learner runs out of daily AI messages.
 *
 * Billing is not implemented, and this deliberately does not pretend otherwise:
 * the modal explains that checkout is not available yet rather than faking a
 * purchase flow.
 */
export function UpgradeCard({ limit }: { limit: number }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Card className="border-primary-border bg-primary-subtle">
        <CardBody className="space-y-4">
          <span
            className="grid size-10 place-items-center rounded-xl bg-primary text-primary-foreground"
            aria-hidden
          >
            <Sparkles className="size-5" />
          </span>

          <div>
            <h3 className="text-base font-semibold text-foreground">
              You&apos;ve used all {limit} AI messages for today
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Your allowance resets tomorrow. Premium raises it to{" "}
              {PLANS.premium.aiMessagesPerDay} messages a day.
            </p>
          </div>

          <Button
            onClick={() => {
              track("upgrade_viewed");
              setOpen(true);
            }}
          >
            See Premium
          </Button>
        </CardBody>
      </Card>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="OnTalk Premium"
        description="More tutor time, the full lesson library, and deeper feedback."
        footer={
          <Button variant="secondary" onClick={() => setOpen(false)}>
            Close
          </Button>
        }
      >
        <ul className="space-y-2.5">
          {PLANS.premium.features.map((feature) => (
            <li key={feature} className="flex items-start gap-2.5 text-sm">
              <Check className="mt-0.5 size-4 shrink-0 text-success" aria-hidden />
              {feature}
            </li>
          ))}
        </ul>

        {!PAYMENTS_ENABLED && (
          <p className="mt-5 rounded-xl border border-accent/30 bg-accent-subtle px-3.5 py-3 text-sm text-warning">
            Payments are not implemented in this MVP, so there is nothing to buy
            yet. To try Premium features during development, set{" "}
            <code className="font-mono text-xs">plan = &apos;premium&apos;</code> on
            your row in the <code className="font-mono text-xs">profiles</code>{" "}
            table.
          </p>
        )}
      </Modal>
    </>
  );
}
