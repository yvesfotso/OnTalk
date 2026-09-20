"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/form";
import { InlineAlert } from "@/components/ui/states";
import {
  requestPasswordResetAction,
  updatePasswordAction,
} from "@/features/auth/actions";
import {
  forgotPasswordSchema,
  updatePasswordSchema,
  type ForgotPasswordInput,
  type UpdatePasswordInput,
} from "@/lib/validation/auth";

export function ForgotPasswordForm() {
  const [notice, setNotice] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    const result = await requestPasswordResetAction(values);

    if (result.error) setFormError(result.error);
    else setNotice(result.message ?? "Check your inbox.");
  });

  if (notice) return <InlineAlert tone="success">{notice}</InlineAlert>;

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      {formError && <InlineAlert>{formError}</InlineAlert>}

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

      <Button
        type="submit"
        block
        size="lg"
        loading={isSubmitting}
        loadingText="Sending…"
      >
        Send reset link
      </Button>
    </form>
  );
}

export function UpdatePasswordForm() {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UpdatePasswordInput>({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    const result = await updatePasswordAction(values);

    if (result.error) {
      setFormError(result.error);
      return;
    }

    router.replace("/app/dashboard");
    router.refresh();
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      {formError && <InlineAlert>{formError}</InlineAlert>}

      <Field label="New password" error={errors.password?.message}>
        {(props) => (
          <Input
            {...props}
            {...register("password")}
            type="password"
            autoComplete="new-password"
          />
        )}
      </Field>

      <Field label="Confirm new password" error={errors.confirmPassword?.message}>
        {(props) => (
          <Input
            {...props}
            {...register("confirmPassword")}
            type="password"
            autoComplete="new-password"
          />
        )}
      </Field>

      <Button
        type="submit"
        block
        size="lg"
        loading={isSubmitting}
        loadingText="Updating…"
      >
        Update password
      </Button>
    </form>
  );
}
