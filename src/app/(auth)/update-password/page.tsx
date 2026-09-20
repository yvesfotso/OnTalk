import type { Metadata } from "next";

import { Card, CardBody } from "@/components/ui/card";
import { UpdatePasswordForm } from "@/features/auth/password-forms";

export const metadata: Metadata = {
  title: "Choose a new password",
  robots: { index: false },
};

export default function UpdatePasswordPage() {
  return (
    <Card>
      <CardBody className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Choose a new password
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Pick something you haven&apos;t used before.
          </p>
        </div>

        <UpdatePasswordForm />
      </CardBody>
    </Card>
  );
}
