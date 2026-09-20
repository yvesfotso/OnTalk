/**
 * Only the two public Supabase values are read here. The app never uses a
 * service-role key — privileged work happens in `security definer` SQL
 * functions instead (see `supabase/migrations/*_functions.sql`).
 */

const MISSING = (name: string) =>
  `Missing ${name}. Copy .env.example to .env.local and fill in your Supabase project values (Project Settings → API).`;

export function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url) throw new Error(MISSING("NEXT_PUBLIC_SUPABASE_URL"));
  if (!anonKey) throw new Error(MISSING("NEXT_PUBLIC_SUPABASE_ANON_KEY"));

  return { url, anonKey };
}
