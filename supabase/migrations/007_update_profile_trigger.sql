-- ============================================================
-- Migration 007: Update auth profile trigger
--
-- Updates handle_new_user() to also set avatar_url and papel
-- on new signups. Existing rows are already backfilled by 004.
--
-- Mapping: user_type 'company' → papel 'chefe'
--          user_type 'individual' → papel 'autonomo'
--          (anything else)        → papel 'autonomo'
--
-- The trigger itself (on_auth_user_created) is kept; only the
-- function body is replaced via CREATE OR REPLACE.
-- ============================================================

begin;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, user_type, company_name, papel, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    case
      when new.raw_user_meta_data->>'user_type' = 'company' then 'company'
      else 'individual'
    end,
    nullif(trim(coalesce(new.raw_user_meta_data->>'company_name', '')), ''),
    case
      when new.raw_user_meta_data->>'user_type' = 'company' then 'chefe'
      else 'autonomo'
    end,
    null
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

-- The trigger already exists from migration 002; no need to recreate it.
-- Keeping it here commented for reference:
--
-- drop trigger if exists on_auth_user_created on auth.users;
-- create trigger on_auth_user_created
--   after insert on auth.users
--   for each row
--   execute function public.handle_new_user();

commit;
