create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles(id, display_name)
  values (
    new.id,
    coalesce(
      nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''),
      nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''),
      nullif(split_part(coalesce(new.email, ''), '@', 1), ''),
      ''
    )
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

revoke all on function private.handle_new_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

insert into public.profiles(id, display_name)
select
  auth_user.id,
  coalesce(
    nullif(trim(auth_user.raw_user_meta_data ->> 'display_name'), ''),
    nullif(trim(auth_user.raw_user_meta_data ->> 'full_name'), ''),
    nullif(split_part(coalesce(auth_user.email, ''), '@', 1), ''),
    ''
  )
from auth.users auth_user
where not exists (
  select 1
  from public.profiles profile
  where profile.id = auth_user.id
)
on conflict (id) do nothing;

create or replace function public.create_household_with_owner(household_name text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  new_household_id uuid;
  current_user_id uuid := auth.uid();
begin
  if current_user_id is null then
    raise exception 'Authentication required.' using errcode = '42501';
  end if;

  insert into public.profiles(id, display_name)
  select
    auth_user.id,
    coalesce(
      nullif(trim(auth_user.raw_user_meta_data ->> 'display_name'), ''),
      nullif(trim(auth_user.raw_user_meta_data ->> 'full_name'), ''),
      nullif(split_part(coalesce(auth_user.email, ''), '@', 1), ''),
      ''
    )
  from auth.users auth_user
  where auth_user.id = current_user_id
  on conflict (id) do nothing;

  if not exists (
    select 1 from public.profiles profile where profile.id = current_user_id
  ) then
    raise exception 'Account profile unavailable.' using errcode = '23503';
  end if;

  insert into public.households(name, created_by)
  values (trim(household_name), current_user_id)
  returning id into new_household_id;

  insert into public.household_members(
    household_id, user_id, role, status, joined_at
  ) values (
    new_household_id, current_user_id, 'owner', 'active', now()
  );

  return new_household_id;
end;
$$;

revoke all on function public.create_household_with_owner(text) from public, anon;
grant execute on function public.create_household_with_owner(text) to authenticated;
