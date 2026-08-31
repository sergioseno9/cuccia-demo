create or replace function private.is_household_member(target_household_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.household_members hm
    where hm.household_id = target_household_id
      and hm.user_id = (select auth.uid())
      and hm.status = 'active'
  );
$$;

grant usage on schema private to authenticated;

create or replace function private.is_household_owner(target_household_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.household_members hm
    where hm.household_id = target_household_id
      and hm.user_id = (select auth.uid())
      and hm.role = 'owner'
      and hm.status = 'active'
  );
$$;

create or replace function private.pet_role(target_pet_id uuid)
returns public.member_role
language sql
stable
security definer
set search_path = ''
as $$
  select pm.role
  from public.pet_members pm
  where pm.pet_id = target_pet_id
    and pm.user_id = (select auth.uid())
    and pm.status = 'active'
  limit 1;
$$;

create or replace function private.is_pet_owner(target_pet_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select private.pet_role(target_pet_id) = 'owner';
$$;

create or replace function private.can_access_pet(
  target_pet_id uuid,
  requested_action text default 'read'
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select case private.pet_role(target_pet_id)
    when 'owner' then requested_action = any (array[
      'read', 'profile', 'activity', 'health', 'dose', 'travel',
      'content', 'share', 'members', 'delete'
    ])
    when 'family' then requested_action = any (array[
      'read', 'activity', 'health', 'dose', 'travel', 'content'
    ])
    when 'caregiver' then requested_action = any (array[
      'read', 'activity', 'dose'
    ])
    else false
  end;
$$;

create or replace function private.can_manage_travel(target_household_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.household_members hm
    where hm.household_id = target_household_id
      and hm.user_id = (select auth.uid())
      and hm.role in ('owner', 'family')
      and hm.status = 'active'
  );
$$;

revoke all on function private.is_household_member(uuid) from public, anon;
revoke all on function private.is_household_owner(uuid) from public, anon;
revoke all on function private.pet_role(uuid) from public, anon;
revoke all on function private.is_pet_owner(uuid) from public, anon;
revoke all on function private.can_access_pet(uuid, text) from public, anon;
revoke all on function private.can_manage_travel(uuid) from public, anon;

grant execute on function private.is_household_member(uuid) to authenticated;
grant execute on function private.is_household_owner(uuid) to authenticated;
grant execute on function private.pet_role(uuid) to authenticated;
grant execute on function private.is_pet_owner(uuid) to authenticated;
grant execute on function private.can_access_pet(uuid, text) to authenticated;
grant execute on function private.can_manage_travel(uuid) to authenticated;
