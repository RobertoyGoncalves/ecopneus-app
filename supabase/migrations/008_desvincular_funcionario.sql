-- ============================================================
-- Migration 008: Desvincular funcionário
--
-- The existing profiles_update RLS policy only allows a user to
-- update their OWN row (id = auth.uid()), so a chefe cannot
-- directly UPDATE an employee's profile from the client.
--
-- This SECURITY DEFINER function runs as the DB owner and
-- performs the update only after validating the relationship:
--   • the target profile must have papel = 'funcionario'
--   • the target profile's empresa_id must equal the caller's id
-- ============================================================

begin;

create or replace function public.desvincular_funcionario(p_funcionario_id uuid)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_empresa_id uuid;
  v_papel      text;
begin
  if p_funcionario_id is null then
    return json_build_object('ok', false, 'erro', 'ID do funcionário não informado');
  end if;

  -- Confirm the target is an active funcionário of the caller
  select papel, empresa_id
    into v_papel, v_empresa_id
    from public.profiles
   where id = p_funcionario_id;

  if not found then
    return json_build_object('ok', false, 'erro', 'Funcionário não encontrado');
  end if;

  if v_papel != 'funcionario' then
    return json_build_object('ok', false, 'erro', 'Este usuário não é um funcionário');
  end if;

  if v_empresa_id is distinct from auth.uid() then
    return json_build_object('ok', false, 'erro', 'Você não tem permissão para desvincular este usuário');
  end if;

  -- Revert to standalone autonomous user
  update public.profiles
     set papel      = 'autonomo',
         empresa_id = null
   where id = p_funcionario_id;

  return json_build_object('ok', true);
end;
$$;

commit;
