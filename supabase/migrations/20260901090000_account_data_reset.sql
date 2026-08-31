create or replace function public.reset_my_cloud_data()
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  current_user_id uuid := (select auth.uid());
  owned_household_ids uuid[] := '{}'::uuid[];
  deleted_households integer := 0;
  deleted_pets integer := 0;
begin
  if current_user_id is null then
    raise exception 'Authentication required.' using errcode = '42501';
  end if;

  select coalesce(array_agg(household.id), '{}'::uuid[])
  into owned_household_ids
  from public.households household
  where household.created_by = current_user_id
    and private.is_household_owner(household.id);

  select count(*)::integer
  into deleted_pets
  from public.pets pet
  where pet.household_id = any (owned_household_ids);

  delete from public.households household
  where household.id = any (owned_household_ids)
    and household.created_by = current_user_id
    and private.is_household_owner(household.id);
  get diagnostics deleted_households = row_count;

  delete from public.push_tokens token
  where token.user_id = current_user_id;

  return jsonb_build_object(
    'householdsDeleted', deleted_households,
    'petsDeleted', deleted_pets
  );
end;
$$;

revoke all on function public.reset_my_cloud_data() from public, anon;
grant execute on function public.reset_my_cloud_data() to authenticated;
