"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/form";
import { InlineAlert } from "@/components/ui/states";
import { signInAction } from "@/features/auth/actions";
import { track } from "@/lib/analytics";
import { loginSchema, type LoginInput } from "@/lib/validation/auth";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formError, setFormError] = useState<string | null>(null);

  const linkError =
    searchParams.get("error") === "link_invalid"
      ? "That link has expired or was already used. Request a new one."
      : null;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    const result = await signInAction(values);

    if (result.error) {
      setFormError(result.error);
      return;
    }

    track("signed_in");
    const next = searchParams.get("next");
    router.replace(next?.startsWith("/") ? next : "/app/dashboard");
    router.refresh();
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      {(formError ?? linkError) && (
        <InlineAlert>{formError ?? linkError}</InlineAlert>
      )}

      <Field label="Email" error={errors.email?.message}>
        {(props) => (
          <Input
            {...props}
            {...register("email")}
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
          />
        )}
      </Field>

      <Field label="Password" error={errors.password?.message}>
        {(props) => (
          <Input
            {...props}
            {...register("password")}
            type="password"
            autoComplete="current-password"
            placeholder="Your password"
          />
        )}
      </Field>

      <div className="flex justify-end">
        <Link
          href="/forgot-password"
          className="rounded text-sm font-medium text-primary hover:underline"
        >
          Forgot password?
        </Link>
      </div>

      <Button type="submit" block size="lg" loading={isSubmitting} loadingText="Signing in…">
        Sign in
      </Button>
    </form>
  );
}
