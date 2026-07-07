-- ============================================================
-- Migration 004: User Hierarchy
--
-- Adds hierarchy fields to profiles (papel, empresa_id, avatar_url)
-- Adds dono_id to vehicles, tires, trips
-- Adds operador_id to trips
-- Protects chefe accounts from deletion while they have dependents
--
-- Safe to run against existing data: backfills dono_id = user_id
-- and operador_id = user_id for all current records.
-- user_id columns are KEPT (deprecated) and will be dropped in a
-- future migration after the frontend is updated.
-- ============================================================

begin;

-- ----------------------------------------------------------
-- 1. profiles — hierarchy fields
-- ----------------------------------------------------------

alter table public.profiles
  add column if not exists avatar_url  text,
  add column if not exists papel       text not null default 'autonomo'
    check (papel in ('autonomo', 'funcionario', 'chefe')),
  add column if not exists empresa_id  uuid references public.profiles (id) on delete set null;

create index if not exists profiles_empresa_id_idx on public.profiles (empresa_id);

-- Seed papel from the existing user_type at migration time.
-- New signups will be handled by the updated trigger (migration 007).
update public.profiles
   set papel = case
     when user_type = 'company'    then 'chefe'
     when user_type = 'individual' then 'autonomo'
     else 'autonomo'
   end;

-- ----------------------------------------------------------
-- 2. vehicles — dono_id (true owner; always chefe or autônomo)
-- ----------------------------------------------------------

alter table public.vehicles
  add column if not exists dono_id uuid references auth.users (id) on delete cascade;

-- Backfill: existing vehicles belong to whoever created them
update public.vehicles set dono_id = user_id where dono_id is null;

alter table public.vehicles alter column dono_id set not null;

create index if not exists vehicles_dono_id_idx on public.vehicles (dono_id);

-- ----------------------------------------------------------
-- 3. tires — dono_id
-- ----------------------------------------------------------

alter table public.tires
  add column if not exists dono_id uuid references auth.users (id) on delete cascade;

update public.tires set dono_id = user_id where dono_id is null;

alter table public.tires alter column dono_id set not null;

create index if not exists tires_dono_id_idx on public.tires (dono_id);

-- ----------------------------------------------------------
-- 4. trips — dono_id + operador_id
-- ----------------------------------------------------------

alter table public.trips
  add column if not exists dono_id     uuid references auth.users (id) on delete cascade,
  add column if not exists operador_id uuid references auth.users (id) on delete set null;

-- Backfill: dono and operator were the same person in the old model
update public.trips
   set dono_id     = user_id,
       operador_id = user_id
 where dono_id is null;

alter table public.trips alter column dono_id set not null;
-- operador_id stays nullable: historical trips where operator is unknown remain valid

create index if not exists trips_dono_id_idx     on public.trips (dono_id);
create index if not exists trips_operador_id_idx on public.trips (operador_id);

-- ----------------------------------------------------------
-- 5. Protect chefe accounts from deletion while dependents exist
--
-- A BEFORE DELETE trigger on profiles fires when either the user
-- deletes their own account (auth cascade) or an admin removes the
-- profile directly. Raising an exception rolls back the transaction.
-- ----------------------------------------------------------

create or replace function public.proteger_chefe_com_dependentes()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_vehicle_count  integer;
  v_employee_count integer;
begin
  -- Only enforce the restriction for chefe accounts
  if OLD.papel != 'chefe' then
    return OLD;
  end if;

  select count(*) into v_vehicle_count
    from public.vehicles
   where dono_id = OLD.id;

  if v_vehicle_count > 0 then
    raise exception
      'Não é possível excluir esta conta: há % veículo(s) vinculado(s). '
      'Remova todos os veículos antes de excluir a conta.',
      v_vehicle_count
      using errcode = 'restrict_violation';
  end if;

  select count(*) into v_employee_count
    from public.profiles
   where empresa_id = OLD.id;

  if v_employee_count > 0 then
    raise exception
      'Não é possível excluir esta conta: há % funcionário(s) vinculado(s). '
      'Desvincule todos os funcionários antes de excluir a conta.',
      v_employee_count
      using errcode = 'restrict_violation';
  end if;

  return OLD;
end;
$$;

drop trigger if exists tg_proteger_chefe on public.profiles;

create trigger tg_proteger_chefe
  before delete on public.profiles
  for each row
  execute function public.proteger_chefe_com_dependentes();

commit;
