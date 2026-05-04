-- EcoPneu: perfil + frota na nuvem (Supabase Postgres + RLS)
-- Rode este script no SQL Editor do projeto Supabase (ou via CLI).

create extension if not exists "pgcrypto";

-- Perfis (1:1 com auth.users)
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  user_type text not null default 'individual' check (user_type in ('individual', 'company')),
  company_name text,
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

-- Veículos
create table public.vehicles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  type text not null,
  brand text not null,
  model text not null,
  year text not null,
  plate text not null,
  tire_count int not null default 4,
  tire_manufacturer text not null default '—',
  tire_model text not null default '—',
  tire_quality_tier text not null default 'intermediario'
    check (tire_quality_tier in ('economico', 'intermediario', 'premium')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index vehicles_user_id_idx on public.vehicles (user_id);

alter table public.vehicles enable row level security;

create policy "vehicles_select_own"
  on public.vehicles for select
  using (auth.uid() = user_id);

create policy "vehicles_insert_own"
  on public.vehicles for insert
  with check (auth.uid() = user_id);

create policy "vehicles_update_own"
  on public.vehicles for update
  using (auth.uid() = user_id);

create policy "vehicles_delete_own"
  on public.vehicles for delete
  using (auth.uid() = user_id);

-- Pneus
create table public.tires (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  vehicle_id uuid not null references public.vehicles (id) on delete cascade,
  model text not null,
  brand text not null,
  axis text not null,
  health numeric not null default 100 check (health >= 0 and health <= 100),
  vehicle_type text not null,
  vehicle_label text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index tires_user_id_idx on public.tires (user_id);
create index tires_vehicle_id_idx on public.tires (vehicle_id);

alter table public.tires enable row level security;

create policy "tires_select_own"
  on public.tires for select
  using (auth.uid() = user_id);

create policy "tires_insert_own"
  on public.tires for insert
  with check (auth.uid() = user_id);

create policy "tires_update_own"
  on public.tires for update
  using (auth.uid() = user_id);

create policy "tires_delete_own"
  on public.tires for delete
  using (auth.uid() = user_id);
