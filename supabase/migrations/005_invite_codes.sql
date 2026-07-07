-- ============================================================
-- Migration 005: Invite Codes
--
-- Creates the invite_codes table for boss-to-employee linking.
-- Codes expire after 7 days, are 8 chars alphanumeric (uppercase),
-- and can only be used once.
--
-- Two SECURITY DEFINER functions handle the full workflow:
--   gerar_convite()          — called by chefe to create a code
--   usar_convite(p_code)     — called by autônomo to become funcionário
--
-- A third helper expires stale codes on demand (can be wired to
-- pg_cron in the Supabase dashboard: 0 * * * * select public.expirar_convites_vencidos()).
-- ============================================================

begin;

-- ----------------------------------------------------------
-- Table
-- ----------------------------------------------------------

create table if not exists public.invite_codes (
  id          uuid        primary key default gen_random_uuid(),
  chefe_id    uuid        not null references auth.users (id) on delete cascade,
  code        text        unique not null,
  status      text        not null default 'ativo'
                check (status in ('ativo', 'usado', 'expirado')),
  used_by     uuid        references auth.users (id) on delete set null,
  expires_at  timestamptz not null default (now() + interval '7 days'),
  created_at  timestamptz not null default now()
);

create index if not exists invite_codes_chefe_id_idx on public.invite_codes (chefe_id);
create index if not exists invite_codes_code_idx     on public.invite_codes (upper(code));
create index if not exists invite_codes_status_idx   on public.invite_codes (status)
  where status = 'ativo';

alter table public.invite_codes enable row level security;

-- Chefe can read and delete their own codes (create/update handled via function)
create policy "invite_codes_chefe_select"
  on public.invite_codes for select
  using (chefe_id = auth.uid());

create policy "invite_codes_chefe_delete"
  on public.invite_codes for delete
  using (chefe_id = auth.uid() and status = 'ativo');

-- ----------------------------------------------------------
-- Function: gerar_convite()
-- Called by a chefe to mint a new invite code.
-- Returns: { ok: true, code: "ABCD1234", expires_at: "..." }
--       or { ok: false, erro: "..." }
-- ----------------------------------------------------------

create or replace function public.gerar_convite()
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_papel   text;
  v_code    text;
  v_attempt integer := 0;
  v_expires timestamptz;
begin
  select papel into v_papel
    from public.profiles
   where id = auth.uid();

  if v_papel is null then
    return json_build_object('ok', false, 'erro', 'Usuário não encontrado');
  end if;

  if v_papel != 'chefe' then
    return json_build_object('ok', false, 'erro', 'Apenas chefes podem gerar códigos de convite');
  end if;

  -- Generate a unique 8-character uppercase alphanumeric code.
  -- We strip hyphens from a UUID and take the first 8 chars, retrying
  -- on the rare collision.
  loop
    v_code := upper(
      substring(replace(gen_random_uuid()::text, '-', '') from 1 for 8)
    );
    exit when not exists (
      select 1 from public.invite_codes where upper(code) = v_code
    );
    v_attempt := v_attempt + 1;
    if v_attempt > 20 then
      raise exception 'Não foi possível gerar um código único após % tentativas.', v_attempt;
    end if;
  end loop;

  v_expires := now() + interval '7 days';

  insert into public.invite_codes (chefe_id, code, expires_at)
  values (auth.uid(), v_code, v_expires);

  return json_build_object(
    'ok',         true,
    'code',       v_code,
    'expires_at', v_expires
  );
end;
$$;

-- ----------------------------------------------------------
-- Function: usar_convite(p_code text)
-- Called by an autônomo to link themselves to a chefe.
-- Only autônomos (not yet linked) can call this successfully.
-- Returns: { ok: true, chefe_id: "..." }
--       or { ok: false, erro: "..." }
-- ----------------------------------------------------------

create or replace function public.usar_convite(p_code text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_invite  public.invite_codes%rowtype;
  v_papel   text;
begin
  if p_code is null or trim(p_code) = '' then
    return json_build_object('ok', false, 'erro', 'Informe um código de convite');
  end if;

  -- Lookup by code (case-insensitive), must be active and not expired
  select * into v_invite
    from public.invite_codes
   where upper(code) = upper(trim(p_code))
     and status = 'ativo'
     and expires_at > now();

  if not found then
    return json_build_object('ok', false, 'erro', 'Código inválido ou expirado');
  end if;

  select papel into v_papel
    from public.profiles
   where id = auth.uid();

  if v_papel is null then
    return json_build_object('ok', false, 'erro', 'Usuário não encontrado');
  end if;

  if v_papel != 'autonomo' then
    return json_build_object(
      'ok',   false,
      'erro', 'Este usuário já está vinculado a uma empresa ou é um chefe'
    );
  end if;

  if v_invite.chefe_id = auth.uid() then
    return json_build_object(
      'ok',   false,
      'erro', 'Você não pode usar seu próprio código de convite'
    );
  end if;

  -- Link funcionário → chefe
  update public.profiles
     set papel      = 'funcionario',
         empresa_id = v_invite.chefe_id
   where id = auth.uid();

  -- Consume the code (one-time use)
  update public.invite_codes
     set status  = 'usado',
         used_by = auth.uid()
   where id = v_invite.id;

  return json_build_object('ok', true, 'chefe_id', v_invite.chefe_id);
end;
$$;

-- ----------------------------------------------------------
-- Function: expirar_convites_vencidos()
-- Marks overdue active codes as expired.
-- Wire to pg_cron in the Supabase dashboard if desired:
--   select cron.schedule('expire-invites', '0 * * * *',
--     'select public.expirar_convites_vencidos()');
-- ----------------------------------------------------------

create or replace function public.expirar_convites_vencidos()
returns void
language sql
security definer
set search_path = public
as $$
  update public.invite_codes
     set status = 'expirado'
   where status = 'ativo'
     and expires_at <= now();
$$;

commit;
