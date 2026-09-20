-- OnTalk — server-side functions
-- XP, streaks and account deletion run here so the client can never mint
-- progress or reach another learner's rows.

-- ---------------------------------------------------------------------------
-- Every new auth user gets a profile row.
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(
      nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''),
      split_part(coalesce(new.email, 'learner@example.com'), '@', 1)
    )
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- record_activity: the single authoritative way XP and streaks change.
-- Inputs are clamped, and the row always belongs to auth.uid().
-- ---------------------------------------------------------------------------
create or replace function public.record_activity(
  p_minutes integer default 0,
  p_xp integer default 0,
  p_lessons integer default 0,
  p_words integer default 0,
  p_speaking integer default 0
)
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_today date := current_date;
  v_last date;
  v_profile public.profiles;
begin
  if v_user is null then
    raise exception 'Not authenticated';
  end if;

  p_minutes  := least(greatest(coalesce(p_minutes, 0), 0), 240);
  p_xp       := least(greatest(coalesce(p_xp, 0), 0), 500);
  p_lessons  := least(greatest(coalesce(p_lessons, 0), 0), 20);
  p_words    := least(greatest(coalesce(p_words, 0), 0), 500);
  p_speaking := least(greatest(coalesce(p_speaking, 0), 0), 50);

  insert into public.daily_activity as da (
    user_id, activity_date, minutes_studied, xp_earned,
    lessons_completed, words_reviewed, speaking_sessions
  )
  values (v_user, v_today, p_minutes, p_xp, p_lessons, p_words, p_speaking)
  on conflict (user_id, activity_date) do update
    set minutes_studied   = da.minutes_studied + excluded.minutes_studied,
        xp_earned         = da.xp_earned + excluded.xp_earned,
        lessons_completed = da.lessons_completed + excluded.lessons_completed,
        words_reviewed    = da.words_reviewed + excluded.words_reviewed,
        speaking_sessions = da.speaking_sessions + excluded.speaking_sessions;

  select last_activity_date into v_last
  from public.profiles where id = v_user;

  update public.profiles
     set xp = xp + p_xp,
         streak = case
                    when v_last = v_today then greatest(streak, 1)
                    when v_last = v_today - 1 then streak + 1
                    else 1
                  end,
         last_activity_date = v_today
   where id = v_user
   returning * into v_profile;

  return v_profile;
end;
$$;

revoke all on function public.record_activity(integer, integer, integer, integer, integer) from public;
grant execute on function public.record_activity(integer, integer, integer, integer, integer) to authenticated;

-- ---------------------------------------------------------------------------
-- enroll_vocabulary_for_level: seeds a learner's review deck at onboarding.
-- ---------------------------------------------------------------------------
create or replace function public.enroll_vocabulary_for_level(
  p_level text default 'A1',
  p_limit integer default 30
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_levels text[] := array['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  v_cutoff integer;
  v_inserted integer;
begin
  if v_user is null then
    raise exception 'Not authenticated';
  end if;

  v_cutoff := coalesce(array_position(v_levels, p_level), 1);
  p_limit := least(greatest(coalesce(p_limit, 30), 1), 200);

  with candidates as (
    select id from public.vocabulary
    where array_position(v_levels, level) <= v_cutoff
    order by array_position(v_levels, level), word
    limit p_limit
  )
  insert into public.user_vocabulary (user_id, vocabulary_id, next_review_at)
  select v_user, c.id, now()
  from candidates c
  on conflict (user_id, vocabulary_id) do nothing;

  get diagnostics v_inserted = row_count;
  return v_inserted;
end;
$$;

revoke all on function public.enroll_vocabulary_for_level(text, integer) from public;
grant execute on function public.enroll_vocabulary_for_level(text, integer) to authenticated;

-- ---------------------------------------------------------------------------
-- delete_own_account: hard-deletes the caller. Every user-owned table cascades
-- from auth.users, so no service-role key is needed anywhere in the app.
-- ---------------------------------------------------------------------------
create or replace function public.delete_own_account()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
begin
  if v_user is null then
    raise exception 'Not authenticated';
  end if;

  delete from auth.users where id = v_user;
end;
$$;

revoke all on function public.delete_own_account() from public;
grant execute on function public.delete_own_account() to authenticated;
