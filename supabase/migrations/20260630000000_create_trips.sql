-- Viagens com origem/destino e coordenadas (persistência na nuvem)

create table public.trips (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  vehicle_id uuid references public.vehicles (id) on delete set null,
  vehicle_label text,
  vehicle_type text,
  origem text,
  destino text,
  lat_origem double precision,
  lon_origem double precision,
  lat_destino double precision,
  lon_destino double precision,
  distancia_km double precision,
  velocidade_media double precision,
  condicao_estrada text,
  periodo_dia text,
  peso_carga double precision,
  valor_carga double precision,
  tipo_carga text,
  vida_consumida_percent double precision,
  pneus_afetados int,
  created_at timestamptz default now()
);

create index trips_user_id_idx on public.trips (user_id);
create index trips_vehicle_id_idx on public.trips (vehicle_id);
create index trips_created_at_idx on public.trips (created_at desc);

alter table public.trips enable row level security;

create policy "users see own trips"
  on public.trips
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
