-- Perfil criado automaticamente no registo (corre no servidor, logo não depende de JWT).
-- Resolve: "new row violates row-level security policy for table profiles" quando não há sessão
-- (ex.: confirmação de e-mail obrigatória).
--
-- Rode no SQL Editor do Supabase depois de 001_initial.sql.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, user_type, company_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    case
      when new.raw_user_meta_data->>'user_type' = 'company' then 'company'
      else 'individual'
    end,
    nullif(trim(coalesce(new.raw_user_meta_data->>'company_name', '')), '')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
