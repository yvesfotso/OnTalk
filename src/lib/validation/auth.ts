import { z } from "zod";

export const PASSWORD_MIN_LENGTH = 8;

const password = z
  .string()
  .min(PASSWORD_MIN_LENGTH, `Use at least ${PASSWORD_MIN_LENGTH} characters.`)
  .max(72, "Passwords can be at most 72 characters.")
  .regex(/[a-z]/, "Include at least one lowercase letter.")
  .regex(/[A-Z]/, "Include at least one uppercase letter.")
  .regex(/[0-9]/, "Include at least one number.");

const email = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, "Email is required.")
  .pipe(z.email("Enter a valid email address."));

export const registerSchema = z
  .object({
    displayName: z
      .string()
      .trim()
      .min(2, "Your name needs at least 2 characters.")
      .max(60, "That name is a little too long."),
    email,
    password,
    confirmPassword: z.string(),
  })
  .superRefine(({ password: pw, confirmPassword }, ctx) => {
    if (pw !== confirmPassword) {
      ctx.addIssue({
        code: "custom",
        message: "Passwords do not match.",
        path: ["confirmPassword"],
      });
    }
  });

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Enter your password."),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({ email });
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const updatePasswordSchema = z
  .object({ password, confirmPassword: z.string() })
  .superRefine(({ password: pw, confirmPassword }, ctx) => {
    if (pw !== confirmPassword) {
      ctx.addIssue({
        code: "custom",
        message: "Passwords do not match.",
        path: ["confirmPassword"],
      });
    }
  });

export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>;

/** Checklist rendered under the password field while the user types. */
export function passwordChecklist(value: string) {
  return [
    { label: `${PASSWORD_MIN_LENGTH}+ characters`, met: value.length >= PASSWORD_MIN_LENGTH },
    { label: "One lowercase letter", met: /[a-z]/.test(value) },
    { label: "One uppercase letter", met: /[A-Z]/.test(value) },
    { label: "One number", met: /[0-9]/.test(value) },
  ];
}
