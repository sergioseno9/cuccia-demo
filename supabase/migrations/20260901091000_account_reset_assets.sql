create or replace function public.my_cloud_reset_storage_paths()
returns text[]
language sql
stable
security invoker
set search_path = ''
as $$
  select coalesce(array_agg(asset.path order by asset.path), '{}'::text[])
  from (
    select pet.photo_path as path
    from public.pets pet
    join public.households household on household.id = pet.household_id
    where household.created_by = (select auth.uid())
      and private.is_household_owner(household.id)
      and pet.photo_path is not null
    union
    select document.storage_path as path
    from public.documents document
    join public.households household on household.id = document.household_id
    where household.created_by = (select auth.uid())
      and private.is_household_owner(household.id)
      and document.storage_path is not null
  ) asset;
$$;

revoke all on function public.my_cloud_reset_storage_paths() from public, anon;
grant execute on function public.my_cloud_reset_storage_paths() to authenticated;
