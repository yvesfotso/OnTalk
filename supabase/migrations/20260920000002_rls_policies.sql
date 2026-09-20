-- OnTalk — Row Level Security
-- Every table is locked down. User-owned tables are scoped to auth.uid();
-- content tables are readable by any authenticated user.
--
-- auth.uid() is wrapped in a scalar subselect so Postgres evaluates it once
-- per statement instead of once per row.

alter table public.profiles            enable row level security;
alter table public.lessons             enable row level security;
alter table public.lesson_sections     enable row level security;
alter table public.lesson_progress     enable row level security;
alter table public.vocabulary          enable row level security;
alter table public.user_vocabulary     enable row level security;
alter table public.quizzes             enable row level security;
alter table public.quiz_questions      enable row level security;
alter table public.quiz_attempts       enable row level security;
alter table public.ai_conversations    enable row level security;
alter table public.ai_messages         enable row level security;
alter table public.speaking_attempts   enable row level security;
alter table public.daily_activity      enable row level security;

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select to authenticated
  using (id = (select auth.uid()));

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert to authenticated
  with check (id = (select auth.uid()));

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

drop policy if exists "profiles_delete_own" on public.profiles;
create policy "profiles_delete_own" on public.profiles
  for delete to authenticated
  using (id = (select auth.uid()));

-- ---------------------------------------------------------------------------
-- content tables: read-only for signed-in learners
-- ---------------------------------------------------------------------------
drop policy if exists "lessons_read_published" on public.lessons;
create policy "lessons_read_published" on public.lessons
  for select to authenticated
  using (is_published);

drop policy if exists "lesson_sections_read_published" on public.lesson_sections;
create policy "lesson_sections_read_published" on public.lesson_sections
  for select to authenticated
  using (
    exists (
      select 1 from public.lessons l
      where l.id = lesson_sections.lesson_id and l.is_published
    )
  );

drop policy if exists "vocabulary_read" on public.vocabulary;
create policy "vocabulary_read" on public.vocabulary
  for select to authenticated
  using (true);

drop policy if exists "quizzes_read" on public.quizzes;
create policy "quizzes_read" on public.quizzes
  for select to authenticated
  using (true);

drop policy if exists "quiz_questions_read" on public.quiz_questions;
create policy "quiz_questions_read" on public.quiz_questions
  for select to authenticated
  using (true);

-- ---------------------------------------------------------------------------
-- lesson_progress
-- ---------------------------------------------------------------------------
drop policy if exists "lesson_progress_all_own" on public.lesson_progress;
create policy "lesson_progress_all_own" on public.lesson_progress
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- ---------------------------------------------------------------------------
-- user_vocabulary
-- ---------------------------------------------------------------------------
drop policy if exists "user_vocabulary_all_own" on public.user_vocabulary;
create policy "user_vocabulary_all_own" on public.user_vocabulary
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- ---------------------------------------------------------------------------
-- quiz_attempts
-- ---------------------------------------------------------------------------
drop policy if exists "quiz_attempts_all_own" on public.quiz_attempts;
create policy "quiz_attempts_all_own" on public.quiz_attempts
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- ---------------------------------------------------------------------------
-- ai_conversations / ai_messages
-- ---------------------------------------------------------------------------
drop policy if exists "ai_conversations_all_own" on public.ai_conversations;
create policy "ai_conversations_all_own" on public.ai_conversations
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- Ownership is checked on the row itself *and* on the parent conversation, so a
-- message can never be attached to someone else's thread.
drop policy if exists "ai_messages_all_own" on public.ai_messages;
create policy "ai_messages_all_own" on public.ai_messages
  for all to authenticated
  using (
    user_id = (select auth.uid())
    and exists (
      select 1 from public.ai_conversations c
      where c.id = ai_messages.conversation_id
        and c.user_id = (select auth.uid())
    )
  )
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1 from public.ai_conversations c
      where c.id = ai_messages.conversation_id
        and c.user_id = (select auth.uid())
    )
  );

-- ---------------------------------------------------------------------------
-- speaking_attempts
-- ---------------------------------------------------------------------------
drop policy if exists "speaking_attempts_all_own" on public.speaking_attempts;
create policy "speaking_attempts_all_own" on public.speaking_attempts
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- ---------------------------------------------------------------------------
-- daily_activity
-- ---------------------------------------------------------------------------
drop policy if exists "daily_activity_all_own" on public.daily_activity;
create policy "daily_activity_all_own" on public.daily_activity
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
