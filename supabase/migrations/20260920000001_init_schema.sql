-- OnTalk — initial schema
-- Creates every table used by the MVP. RLS policies live in the next migration.

create extension if not exists "pgcrypto";

-- Shared trigger that keeps updated_at honest.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default 'Learner',
  avatar_url text,
  native_language text,
  english_level text not null default 'A1'
    check (english_level in ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')),
  learning_goal text,
  improvement_areas text[] not null default '{}',
  interests text[] not null default '{}',
  daily_minutes_goal integer not null default 15
    check (daily_minutes_goal between 5 and 120),
  xp integer not null default 0 check (xp >= 0),
  streak integer not null default 0 check (streak >= 0),
  last_activity_date date,
  plan text not null default 'free' check (plan in ('free', 'premium')),
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- lessons
-- ---------------------------------------------------------------------------
create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text not null default '',
  level text not null check (level in ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')),
  topic text not null default 'general',
  estimated_minutes integer not null default 10,
  xp_reward integer not null default 20,
  order_index integer not null default 0,
  is_premium boolean not null default false,
  is_published boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists lessons_level_order_idx
  on public.lessons (level, order_index);

-- ---------------------------------------------------------------------------
-- lesson_sections
-- ---------------------------------------------------------------------------
create table if not exists public.lesson_sections (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lessons (id) on delete cascade,
  section_type text not null check (
    section_type in (
      'introduction', 'text', 'vocabulary', 'grammar', 'example',
      'reading', 'multiple_choice', 'fill_blank', 'speaking_prompt', 'summary'
    )
  ),
  title text,
  content jsonb not null default '{}'::jsonb,
  order_index integer not null default 0
);

create index if not exists lesson_sections_lesson_order_idx
  on public.lesson_sections (lesson_id, order_index);

-- ---------------------------------------------------------------------------
-- lesson_progress
-- ---------------------------------------------------------------------------
create table if not exists public.lesson_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  lesson_id uuid not null references public.lessons (id) on delete cascade,
  status text not null default 'in_progress'
    check (status in ('started', 'in_progress', 'completed')),
  progress_percent integer not null default 0
    check (progress_percent between 0 and 100),
  score integer,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  last_opened_at timestamptz not null default now(),
  unique (user_id, lesson_id)
);

create index if not exists lesson_progress_user_idx
  on public.lesson_progress (user_id, last_opened_at desc);

-- ---------------------------------------------------------------------------
-- vocabulary
-- ---------------------------------------------------------------------------
create table if not exists public.vocabulary (
  id uuid primary key default gen_random_uuid(),
  word text not null unique,
  definition text not null,
  example_sentence text not null default '',
  part_of_speech text,
  phonetic text,
  level text not null check (level in ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')),
  topic text not null default 'general',
  created_at timestamptz not null default now()
);

create index if not exists vocabulary_level_idx on public.vocabulary (level);

-- ---------------------------------------------------------------------------
-- user_vocabulary (spaced repetition state)
-- ---------------------------------------------------------------------------
create table if not exists public.user_vocabulary (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  vocabulary_id uuid not null references public.vocabulary (id) on delete cascade,
  status text not null default 'learning'
    check (status in ('learning', 'reviewing', 'learned')),
  ease_score numeric(4, 2) not null default 2.50,
  interval_days integer not null default 0,
  review_count integer not null default 0,
  correct_count integer not null default 0,
  incorrect_count integer not null default 0,
  last_reviewed_at timestamptz,
  next_review_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (user_id, vocabulary_id)
);

create index if not exists user_vocabulary_due_idx
  on public.user_vocabulary (user_id, next_review_at);

-- ---------------------------------------------------------------------------
-- quizzes
-- ---------------------------------------------------------------------------
create table if not exists public.quizzes (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid references public.lessons (id) on delete cascade,
  slug text not null unique,
  title text not null,
  passing_score integer not null default 60,
  xp_reward integer not null default 15,
  created_at timestamptz not null default now()
);

create table if not exists public.quiz_questions (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes (id) on delete cascade,
  question_type text not null
    check (question_type in ('multiple_choice', 'fill_blank', 'true_false')),
  question_text text not null,
  answer_data jsonb not null default '{}'::jsonb,
  correct_answer jsonb not null,
  explanation text,
  order_index integer not null default 0
);

create index if not exists quiz_questions_quiz_order_idx
  on public.quiz_questions (quiz_id, order_index);

create table if not exists public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  quiz_id uuid not null references public.quizzes (id) on delete cascade,
  score integer not null default 0,
  total_questions integer not null default 0,
  correct_answers integer not null default 0,
  completed_at timestamptz not null default now()
);

create index if not exists quiz_attempts_user_idx
  on public.quiz_attempts (user_id, completed_at desc);

-- ---------------------------------------------------------------------------
-- AI tutor
-- ---------------------------------------------------------------------------
create table if not exists public.ai_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  mode text not null default 'general'
    check (mode in ('general', 'conversation', 'grammar', 'vocabulary', 'interview', 'travel')),
  title text not null default 'New conversation',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists ai_conversations_set_updated_at on public.ai_conversations;
create trigger ai_conversations_set_updated_at
  before update on public.ai_conversations
  for each row execute function public.set_updated_at();

create index if not exists ai_conversations_user_idx
  on public.ai_conversations (user_id, updated_at desc);

-- user_id is denormalised here so the daily usage counter is a single indexed
-- scan instead of a join, and so RLS can be enforced without a subquery.
create table if not exists public.ai_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.ai_conversations (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  created_at timestamptz not null default now()
);

create index if not exists ai_messages_conversation_idx
  on public.ai_messages (conversation_id, created_at);

create index if not exists ai_messages_usage_idx
  on public.ai_messages (user_id, role, created_at);

-- ---------------------------------------------------------------------------
-- speaking practice
-- ---------------------------------------------------------------------------
create table if not exists public.speaking_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  prompt_text text not null,
  transcript text not null default '',
  accuracy_percent integer not null default 0
    check (accuracy_percent between 0 and 100),
  created_at timestamptz not null default now()
);

create index if not exists speaking_attempts_user_idx
  on public.speaking_attempts (user_id, created_at desc);

-- ---------------------------------------------------------------------------
-- daily_activity
-- ---------------------------------------------------------------------------
create table if not exists public.daily_activity (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  activity_date date not null default current_date,
  minutes_studied integer not null default 0,
  xp_earned integer not null default 0,
  lessons_completed integer not null default 0,
  words_reviewed integer not null default 0,
  speaking_sessions integer not null default 0,
  unique (user_id, activity_date)
);

create index if not exists daily_activity_user_date_idx
  on public.daily_activity (user_id, activity_date desc);
