import { Check } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardBody, CardDescription, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { SignOutButton } from "@/components/layout/sign-out-button";
import { PLANS } from "@/lib/constants/app";
import { getSessionContext } from "@/lib/supabase/server";
import { cn } from "@/lib/utils/cn";

export const metadata: Metadata = {
  title: "Settings",
  robots: { index: false },
};

export default async function SettingsPage() {
  const session = await getSessionContext();
  if (!session) redirect("/login");

  const { profile, email } = session;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader title="Settings" />

      <Section title="Account" description="Your login details.">
        <Row label="Email" value={email ?? "—"} />
        <Row
          label="Password"
          value={
            <Link
              href="/forgot-password"
              className="text-sm font-medium text-primary hover:underline"
            >
              Send reset link
            </Link>
          }
        />
      </Section>

      <Section title="Learning" description="Your level and daily target.">
        <Row label="English level" value={profile.english_level} />
        <Row label="Daily goal" value={`${profile.daily_minutes_goal} minutes`} />
        <div className="pt-1">
          <ButtonLink href="/app/profile" variant="secondary" size="sm">
            Edit in Profile
          </ButtonLink>
        </div>
      </Section>

      <Section
        title="Preferences"
        description="More controls are on the way."
      >
        <Row label="Theme" value={<Badge>System (coming soon)</Badge>} />
        <Row label="Notifications" value={<Badge>Coming soon</Badge>} />
      </Section>

      <Section title="Plan" description="What's included at each tier.">
        <div className="grid gap-3 sm:grid-cols-2">
          {(Object.keys(PLANS) as Array<keyof typeof PLANS>).map((planId) => {
            const plan = PLANS[planId];
            const isCurrent = profile.plan === planId;

            return (
              <div
                key={planId}
                className={cn(
                  "rounded-xl border p-4",
                  isCurrent
                    ? "border-primary bg-primary-subtle"
                    : "border-border bg-surface",
                )}
              >
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-foreground">{plan.name}</p>
                  {isCurrent && <Badge tone="primary">Current</Badge>}
                </div>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {plan.price} · {plan.period}
                </p>
                <ul className="mt-3 space-y-1.5">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-1.5 text-xs text-muted-foreground"
                    >
                      <Check className="mt-0.5 size-3 shrink-0 text-success" aria-hidden />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
        <p className="pt-1 text-xs text-faint-foreground">
          Payments are not implemented in this MVP. Premium is enabled manually
          in the database during development.
        </p>
      </Section>

      <Section title="Privacy" description="Policies covering your data.">
        <div className="flex gap-4">
          <Link href="/privacy" className="text-sm font-medium text-primary hover:underline">
            Privacy Policy
          </Link>
          <Link href="/terms" className="text-sm font-medium text-primary hover:underline">
            Terms of Service
          </Link>
        </div>
      </Section>

      <Card className="border-danger-border">
        <CardBody className="space-y-3">
          <div>
            <CardTitle className="text-danger">Danger zone</CardTitle>
            <CardDescription>
              Permanently delete your account and all associated data.
            </CardDescription>
          </div>
          <ButtonLink href="/delete-account" variant="danger" size="sm">
            Delete account
          </ButtonLink>
        </CardBody>
      </Card>

      <SignOutButton className="justify-center border border-border bg-surface" />
    </div>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardBody className="space-y-3">
        <div>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
        {children}
      </CardBody>
    </Card>
  );
}

function Row({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-t border-border py-2.5 first:border-t-0 first:pt-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  );
}
