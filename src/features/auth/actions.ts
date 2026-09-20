"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { APP } from "@/lib/constants/app";
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  updatePasswordSchema,
} from "@/lib/validation/auth";

export interface ActionResult {
  error?: string;
  message?: string;
}

const GENERIC_ERROR = "Something went wrong. Please try again.";

/**
 * Supabase's auth errors are safe to show for a few known cases; anything else
 * is replaced with a generic message so provider internals never leak.
 */
function authErrorMessage(message: string): string {
  const normalized = message.toLowerCase();

  if (normalized.includes("invalid login credentials")) {
    return "Your email or password is incorrect.";
  }
  if (normalized.includes("email not confirmed")) {
    return "Please confirm your email address first — check your inbox.";
  }
  if (normalized.includes("already registered") || normalized.includes("already exists")) {
    return "An account with this email already exists. Try signing in instead.";
  }
  if (normalized.includes("rate limit") || normalized.includes("too many")) {
    return "Too many attempts. Please wait a minute and try again.";
  }
  if (normalized.includes("weak password")) {
    return "That password is too weak. Try a longer one.";
  }
  if (normalized.includes("same password")) {
    return "Your new password must be different from the old one.";
  }

  console.error("[auth]", message);
  return GENERIC_ERROR;
}

export async function signInAction(input: unknown): Promise<ActionResult> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) return { error: "Check your email and password." };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) return { error: authErrorMessage(error.message) };
  return {};
}

export async function signUpAction(input: unknown): Promise<ActionResult> {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the form and try again." };
  }

  const { email, password, displayName } = parsed.data;
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // Read by the handle_new_user() trigger to seed profiles.display_name.
      data: { display_name: displayName },
      emailRedirectTo: `${APP.url}/auth/confirm`,
    },
  });

  if (error) return { error: authErrorMessage(error.message) };

  // With email confirmation on, Supabase returns a user but no session.
  if (data.user && !data.session) {
    return {
      message:
        "Check your inbox to confirm your email address, then sign in.",
    };
  }

  return {};
}

export async function requestPasswordResetAction(
  input: unknown,
): Promise<ActionResult> {
  const parsed = forgotPasswordSchema.safeParse(input);
  if (!parsed.success) return { error: "Enter a valid email address." };

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(
    parsed.data.email,
    { redirectTo: `${APP.url}/auth/confirm?next=/update-password` },
  );

  // Always report success: a different response for unknown addresses would
  // let anyone test which emails have accounts.
  if (error) console.error("[auth] reset", error.message);

  return {
    message:
      "If an account exists for that address, we've sent a reset link. Check your inbox.",
  };
}

export async function updatePasswordAction(
  input: unknown,
): Promise<ActionResult> {
  const parsed = updatePasswordSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the form and try again." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Your reset link has expired. Request a new one." };
  }

  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (error) return { error: authErrorMessage(error.message) };
  return { message: "Password updated." };
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
