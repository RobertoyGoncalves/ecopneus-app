-- ============================================================
-- Migration 006: RLS Hierarchy Policies
--
-- Replaces all original per-user (user_id = auth.uid()) policies
-- with hierarchy-aware policies based on dono_id / empresa_id.
--
-- Access matrix:
--   autônomo   → sees/edits only their own data (dono_id = auth.uid())
--   funcionário → sees/edits data owned by their chefe (dono_id = empresa_id)
--   chefe      → sees/edits all data they own (dono_id = auth.uid()),
--                including records created by their funcionários
--
-- Two helper functions (SECURITY DEFINER) avoid repeated sub-queries
-- inside each RLS expression, which would otherwise cause a per-row
-- profile lookup.
-- ============================================================

begin;

-- ----------------------------------------------------------
-- Helper functions
-- ----------------------------------------------------------

-- Returns the empresa_id of the caller (null if not a funcionário)
create or replace function public.meu_chefe_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select empresa_id from public.profiles where id = auth.uid()
$$;

-- Returns the papel of the caller
create or replace function public.meu_papel()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select papel from public.profiles where id = auth.uid()
$$;

-- ----------------------------------------------------------
-- profiles
-- ----------------------------------------------------------

-- Drop original policies (exact names from 001_initial.sql)
drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_insert_own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;

-- SELECT:
--   • own row
--   • chefe sees all profiles where empresa_id = their id (their funcionários)
--   • funcionário sees the chefe's profile (needed for dashboard display)
create policy "profiles_select"
  on public.profiles for select
  using (
    id = auth.uid()
    or empresa_id = auth.uid()
    or id = public.meu_chefe_id()
  );

create policy "profiles_insert"
  on public.profiles for insert
  with check (id = auth.uid());

create policy "profiles_update"
  on public.profiles for update
  using     (id = auth.uid())
  with check (id = auth.uid());

-- ----------------------------------------------------------
-- vehicles
-- ----------------------------------------------------------

drop policy if exists "vehicles_select_own" on public.vehicles;
drop policy if exists "vehicles_insert_own" on public.vehicles;
drop policy if exists "vehicles_update_own" on public.vehicles;
drop policy if exists "vehicles_delete_own" on public.vehicles;

-- SELECT / UPDATE / DELETE: dono or funcionário of that dono
create policy "vehicles_select"
  on public.vehicles for select
  using (
    dono_id = auth.uid()
    or dono_id = public.meu_chefe_id()
  );

-- INSERT: dono_id must equal either the caller's own id (autônomo/chefe)
-- or their chefe's id (funcionário registering a vehicle on behalf of chefe)
create policy "vehicles_insert"
  on public.vehicles for insert
  with check (
    dono_id = auth.uid()
    or dono_id = public.meu_chefe_id()
  );

create policy "vehicles_update"
  on public.vehicles for update
  using (
    dono_id = auth.uid()
    or dono_id = public.meu_chefe_id()
  )
  with check (
    dono_id = auth.uid()
    or dono_id = public.meu_chefe_id()
  );

create policy "vehicles_delete"
  on public.vehicles for delete
  using (
    dono_id = auth.uid()
    or dono_id = public.meu_chefe_id()
  );

-- ----------------------------------------------------------
-- tires
-- ----------------------------------------------------------

drop policy if exists "tires_select_own" on public.tires;
drop policy if exists "tires_insert_own" on public.tires;
drop policy if exists "tires_update_own" on public.tires;
drop policy if exists "tires_delete_own" on public.tires;

create policy "tires_select"
  on public.tires for select
  using (
    dono_id = auth.uid()
    or dono_id = public.meu_chefe_id()
  );

create policy "tires_insert"
  on public.tires for insert
  with check (
    dono_id = auth.uid()
    or dono_id = public.meu_chefe_id()
  );

create policy "tires_update"
  on public.tires for update
  using (
    dono_id = auth.uid()
    or dono_id = public.meu_chefe_id()
  )
  with check (
    dono_id = auth.uid()
    or dono_id = public.meu_chefe_id()
  );

create policy "tires_delete"
  on public.tires for delete
  using (
    dono_id = auth.uid()
    or dono_id = public.meu_chefe_id()
  );

-- ----------------------------------------------------------
-- trips
-- ----------------------------------------------------------

-- The original migration used a FOR ALL policy with a quoted name
drop policy if exists "users see own trips" on public.trips;

create policy "trips_select"
  on public.trips for select
  using (
    dono_id = auth.uid()
    or dono_id = public.meu_chefe_id()
  );

-- INSERT enforces two rules:
--   1. dono_id must be the caller's own id or their chefe's id
--   2. operador_id must be the caller (who is performing the trip right now)
create policy "trips_insert"
  on public.trips for insert
  with check (
    (dono_id = auth.uid() or dono_id = public.meu_chefe_id())
    and operador_id = auth.uid()
  );

create policy "trips_update"
  on public.trips for update
  using (
    dono_id = auth.uid()
    or dono_id = public.meu_chefe_id()
  )
  with check (
    dono_id = auth.uid()
    or dono_id = public.meu_chefe_id()
  );

create policy "trips_delete"
  on public.trips for delete
  using (
    dono_id = auth.uid()
    or dono_id = public.meu_chefe_id()
  );

commit;
