"use server";

import { createClient } from "@/lib/supabase/server";
import { deleteAccountSchema } from "@/lib/validation/profile";

export interface DeleteAccountResult {
  error?: string;
}

/**
 * Deletes the signed-in user's account.
 *
 * The real work happens in the `delete_own_account()` SQL function (see
 * `supabase/migrations/*_functions.sql`): it is `security definer` and scoped
 * to `auth.uid()`, so this route never needs — and never uses — the
 * service-role key. Every user-owned table cascades from `auth.users`.
 */
export async function deleteAccountAction(
  input: unknown,
): Promise<DeleteAccountResult> {
  const parsed = deleteAccountSchema.safeParse(input);
  if (!parsed.success) return { error: 'Type "DELETE" exactly to confirm.' };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Your session expired. Please sign in again." };

  const { error } = await supabase.rpc("delete_own_account");

  if (error) {
    console.error("[account] delete", error.message);
    return { error: "We couldn't delete your account. Please try again." };
  }

  await supabase.auth.signOut();
  return {};
}
