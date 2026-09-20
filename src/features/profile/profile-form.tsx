"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/form";
import { InlineAlert } from "@/components/ui/states";
import { updateProfileAction } from "@/features/profile/actions";
import {
  CEFR_LEVELS,
  DAILY_MINUTE_OPTIONS,
  LEARNING_GOALS,
  LEVEL_LABELS,
} from "@/lib/constants/app";
import {
  profileUpdateSchema,
  type ProfileUpdateInput,
} from "@/lib/validation/profile";

interface ProfileFormProps {
  defaultValues: ProfileUpdateInput;
}

export function ProfileForm({ defaultValues }: ProfileFormProps) {
  const [notice, setNotice] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProfileUpdateInput>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues,
  });

  const onSubmit = handleSubmit(async (values) => {
    setNotice(null);
    setFormError(null);

    const result = await updateProfileAction(values);

    if (result.error) setFormError(result.error);
    else setNotice(result.message ?? "Saved.");
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      {formError && <InlineAlert>{formError}</InlineAlert>}
      {notice && <InlineAlert tone="success">{notice}</InlineAlert>}

      <Field label="Display name" error={errors.displayName?.message}>
        {(props) => <Input {...props} {...register("displayName")} />}
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="English level" error={errors.englishLevel?.message}>
          {(props) => (
            <Select {...props} {...register("englishLevel")}>
              {CEFR_LEVELS.map((level) => (
                <option key={level} value={level}>
                  {level} — {LEVEL_LABELS[level]}
                </option>
              ))}
            </Select>
          )}
        </Field>

        <Field label="Daily goal" error={errors.dailyMinutesGoal?.message}>
          {(props) => (
            <Select
              {...props}
              {...register("dailyMinutesGoal", { valueAsNumber: true })}
            >
              {DAILY_MINUTE_OPTIONS.map((minutes) => (
                <option key={minutes} value={minutes}>
                  {minutes} minutes
                </option>
              ))}
            </Select>
          )}
        </Field>
      </div>

      <Field label="Learning goal" error={errors.learningGoal?.message}>
        {(props) => (
          <Select {...props} {...register("learningGoal")}>
            {LEARNING_GOALS.map((goal) => (
              <option key={goal.value} value={goal.value}>
                {goal.label}
              </option>
            ))}
          </Select>
        )}
      </Field>

      <Button
        type="submit"
        disabled={!isDirty}
        loading={isSubmitting}
        loadingText="Saving…"
      >
        Save changes
      </Button>
    </form>
  );
}
