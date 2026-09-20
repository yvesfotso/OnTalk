import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { AppSidebar } from "@/components/layout/app-sidebar";
import { MobileHeader } from "@/components/layout/mobile-header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { getSessionContext } from "@/lib/supabase/server";

export default async function AppLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getSessionContext();

  // The proxy already blocks anonymous requests; this is the server-side
  // guarantee for the data on the page itself.
  if (!session) redirect("/login?next=/app/dashboard");
  if (!session.profile.onboarding_completed) redirect("/onboarding");

  const { display_name: displayName, xp, streak } = session.profile;

  return (
    <div className="min-h-dvh bg-subtle">
      <AppSidebar displayName={displayName} xp={xp} streak={streak} />
      <MobileHeader displayName={displayName} xp={xp} streak={streak} />

      <div className="lg:pl-64">
        <main
          id="main"
          className="mx-auto w-full max-w-6xl px-4 pt-6 pb-24 sm:px-6 lg:pb-12"
        >
          {children}
        </main>
      </div>

      <MobileNav />
    </div>
  );
}
