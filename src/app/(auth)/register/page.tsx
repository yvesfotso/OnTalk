import type { Metadata } from "next";
import Link from "next/link";

import { Card, CardBody } from "@/components/ui/card";
import { RegisterForm } from "@/features/auth/register-form";

export const metadata: Metadata = {
  title: "Create your account",
  robots: { index: false },
};

export default function RegisterPage() {
  return (
    <Card>
      <CardBody className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Start learning free
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            One short lesson a day is enough to build real progress.
          </p>
        </div>

        <RegisterForm />

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </p>

        <p className="text-center text-xs text-faint-foreground">
          By creating an account you agree to our{" "}
          <Link href="/terms" className="underline hover:text-muted-foreground">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="underline hover:text-muted-foreground">
            Privacy Policy
          </Link>
          .
        </p>
      </CardBody>
    </Card>
  );
}
