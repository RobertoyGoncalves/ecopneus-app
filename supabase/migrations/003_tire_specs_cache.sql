-- Cache global de especificações de pneus por modelo (evita chamadas repetidas à API Gemini)

create table public.tire_specs_cache (
  id uuid primary key default gen_random_uuid(),
  model_key text not null unique,
  km_estimado integer,
  fonte text,
  created_at timestamptz not null default now()
);

create index tire_specs_cache_model_key_idx on public.tire_specs_cache (model_key);

alter table public.tire_specs_cache enable row level security;

create policy "tire_specs_cache_select_authenticated"
  on public.tire_specs_cache for select
  to authenticated
  using (true);

create policy "tire_specs_cache_insert_authenticated"
  on public.tire_specs_cache for insert
  to authenticated
  with check (true);

create policy "tire_specs_cache_update_authenticated"
  on public.tire_specs_cache for update
  to authenticated
  using (true);
