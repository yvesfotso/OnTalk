"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/form";
import { InlineAlert } from "@/components/ui/states";
import { signUpAction } from "@/features/auth/actions";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils/cn";
import {
  passwordChecklist,
  registerSchema,
  type RegisterInput,
} from "@/lib/validation/auth";

export function RegisterForm() {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      displayName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const password = watch("password") ?? "";
  const checklist = passwordChecklist(password);

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    setNotice(null);

    const result = await signUpAction(values);

    if (result.error) {
      setFormError(result.error);
      return;
    }

    track("signed_up");

    // Email confirmation is on: there is no session yet, so stay put and tell
    // the learner to check their inbox.
    if (result.message) {
      setNotice(result.message);
      return;
    }

    router.replace("/onboarding");
    router.refresh();
  });

  if (notice) {
    return (
      <div className="space-y-4">
        <InlineAlert tone="success">{notice}</InlineAlert>
        <Button block size="lg" onClick={() => router.push("/login")}>
          Go to sign in
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      {formError && <InlineAlert>{formError}</InlineAlert>}

      <Field label="Name" error={errors.displayName?.message}>
        {(props) => (
          <Input
            {...props}
            {...register("displayName")}
            autoComplete="name"
            placeholder="Ana Silva"
          />
        )}
      </Field>

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

      <Field
        label="Password"
        error={errors.password?.message}
        hint={
          <ul className="flex flex-wrap gap-x-3 gap-y-1">
            {checklist.map((rule) => (
              <li
                key={rule.label}
                className={cn(
                  "inline-flex items-center gap-1",
                  rule.met ? "text-success" : "text-muted-foreground",
                )}
              >
                <Check
                  className={cn("size-3", rule.met ? "opacity-100" : "opacity-30")}
                  aria-hidden
                />
                {rule.label}
              </li>
            ))}
          </ul>
        }
      >
        {(props) => (
          <Input
            {...props}
            {...register("password")}
            type="password"
            autoComplete="new-password"
            placeholder="Create a password"
          />
        )}
      </Field>

      <Field label="Confirm password" error={errors.confirmPassword?.message}>
        {(props) => (
          <Input
            {...props}
            {...register("confirmPassword")}
            type="password"
            autoComplete="new-password"
            placeholder="Repeat your password"
          />
        )}
      </Field>

      <Button
        type="submit"
        block
        size="lg"
        loading={isSubmitting}
        loadingText="Creating account…"
      >
        Create account
      </Button>
    </form>
  );
}
