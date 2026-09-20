import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { Logo } from "@/components/brand/logo";
import { OnboardingWizard } from "@/features/onboarding/wizard";
import { getSessionContext } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Set up your plan",
  robots: { index: false },
};

export default async function OnboardingPage() {
  const session = await getSessionContext();

  if (!session) redirect("/login?next=/onboarding");
  if (session.profile.onboarding_completed) redirect("/app/dashboard");

  return (
    <div className="flex min-h-dvh flex-col bg-subtle">
      <header className="px-4 py-5 sm:px-6">
        <Logo href="/app/dashboard" />
      </header>

      <main
        id="main"
        className="flex flex-1 items-start justify-center px-4 pb-10 sm:items-center sm:px-6"
      >
        <div className="w-full max-w-2xl">
          <OnboardingWizard displayName={session.profile.display_name} />
        </div>
      </main>
    </div>
  );
}
