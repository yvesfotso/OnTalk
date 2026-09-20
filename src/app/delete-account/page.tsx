import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Logo } from "@/components/brand/logo";
import { Card, CardBody } from "@/components/ui/card";
import { DeleteAccountForm } from "@/features/account/delete-account-form";
import { getSessionContext } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Delete account",
  robots: { index: false },
};

export default async function DeleteAccountPage() {
  const session = await getSessionContext();
  if (!session) redirect("/login?next=/delete-account");

  return (
    <div className="flex min-h-dvh flex-col bg-subtle">
      <header className="px-4 py-5 sm:px-6">
        <Logo href="/app/dashboard" />
      </header>

      <main
        id="main"
        className="flex flex-1 items-start justify-center px-4 pb-10 sm:items-center sm:px-6"
      >
        <div className="w-full max-w-md">
          <Card>
            <CardBody className="space-y-6">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight">
                  Delete your account
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Signed in as {session.email}
                </p>
              </div>

              <DeleteAccountForm />

              <Link
                href="/app/settings"
                className="block text-center text-sm text-muted-foreground hover:text-foreground"
              >
                Cancel and go back to settings
              </Link>
            </CardBody>
          </Card>
        </div>
      </main>
    </div>
  );
}
