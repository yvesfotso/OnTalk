"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/form";
import { InlineAlert } from "@/components/ui/states";
import { deleteAccountAction } from "@/features/account/actions";
import {
  deleteAccountSchema,
  type DeleteAccountInput,
} from "@/lib/validation/profile";

export function DeleteAccountForm() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<DeleteAccountInput>({
    resolver: zodResolver(deleteAccountSchema),
    defaultValues: { confirmation: undefined },
  });

  const onSubmit = handleSubmit(async (values) => {
    const result = await deleteAccountAction(values);

    if (result.error) {
      setError("root", { message: result.error });
      return;
    }

    router.replace("/");
    router.refresh();
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <div className="flex items-start gap-3 rounded-xl border border-danger-border bg-danger-subtle px-4 py-3.5">
        <AlertTriangle className="mt-0.5 size-5 shrink-0 text-danger" aria-hidden />
        <div className="text-sm text-danger">
          <p className="font-semibold">This cannot be undone.</p>
          <p className="mt-0.5">
            Your profile, lesson progress, vocabulary, quiz history, AI tutor
            conversations, speaking attempts and activity log will be
            permanently deleted.
          </p>
        </div>
      </div>

      {errors.root?.message && <InlineAlert>{errors.root.message}</InlineAlert>}

      <Field
        label='Type "DELETE" to confirm'
        error={errors.confirmation?.message}
      >
        {(props) => (
          <Input
            {...props}
            {...register("confirmation")}
            autoComplete="off"
            placeholder="DELETE"
          />
        )}
      </Field>

      <Button
        type="submit"
        variant="danger"
        loading={isSubmitting}
        loadingText="Deleting account…"
      >
        Permanently delete my account
      </Button>
    </form>
  );
}
