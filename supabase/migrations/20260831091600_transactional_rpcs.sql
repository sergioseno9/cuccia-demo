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

create or replace function public.create_pet_with_owner(
  target_household_id uuid,
  pet_payload jsonb,
  source_id text default null,
  batch_id uuid default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  new_pet_id uuid;
  current_user_id uuid := auth.uid();
begin
  if not private.is_household_owner(target_household_id) then
    raise exception 'Only a household owner can create a pet.' using errcode = '42501';
  end if;

  if batch_id is not null and not exists (
    select 1 from public.migration_batches mb
    where mb.id = batch_id
      and mb.household_id = target_household_id
      and mb.user_id = current_user_id
      and mb.status = 'pending'
  ) then
    raise exception 'Invalid migration batch.' using errcode = '23503';
  end if;

  insert into public.pets(
    household_id, created_by, migration_batch_id, legacy_source_id,
    name, species, life_phase, birth_date, sex, breed, size,
    tracked_modules, conditions, feeding, profile_data
  ) values (
    target_household_id,
    current_user_id,
    batch_id,
    source_id,
    nullif(trim(pet_payload ->> 'name'), ''),
    (pet_payload ->> 'species')::public.pet_species,
    coalesce((pet_payload ->> 'lifePhase')::public.pet_life_phase, 'adulto'),
    nullif(pet_payload ->> 'birthDate', '')::date,
    coalesce(nullif(pet_payload ->> 'sex', ''), 'unknown'),
    coalesce(pet_payload ->> 'breed', ''),
    coalesce(nullif(pet_payload ->> 'size', ''), 'medium'),
    coalesce(array(select jsonb_array_elements_text(pet_payload -> 'trackedModules')), '{}'),
    coalesce(array(select jsonb_array_elements_text(pet_payload -> 'conditions')), '{}'),
    coalesce(pet_payload -> 'feeding', '{}'::jsonb),
    pet_payload
  )
  on conflict (household_id, legacy_source_id) do update set
    name = excluded.name,
    species = excluded.species,
    life_phase = excluded.life_phase,
    birth_date = excluded.birth_date,
    sex = excluded.sex,
    breed = excluded.breed,
    size = excluded.size,
    tracked_modules = excluded.tracked_modules,
    conditions = excluded.conditions,
    feeding = excluded.feeding,
    profile_data = excluded.profile_data
  returning id into new_pet_id;

  insert into public.pet_members(
    pet_id, household_id, user_id, role, status
  ) values (
    new_pet_id, target_household_id, current_user_id, 'owner', 'active'
  )
  on conflict (pet_id, user_id) do update set
    role = 'owner', status = 'active', revoked_at = null;

  return new_pet_id;
end;
$$;

create or replace function public.accept_household_invite(invite_token text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  matched_invite public.household_invites%rowtype;
  current_user_id uuid := auth.uid();
  current_email text := lower(auth.jwt() ->> 'email');
begin
  select * into matched_invite
  from public.household_invites hi
  where hi.token_hash = encode(extensions.digest(invite_token, 'sha256'), 'hex')
    and hi.accepted_at is null
    and hi.revoked_at is null
    and hi.expires_at > now()
  for update;

  if matched_invite.id is null or lower(matched_invite.email) <> current_email then
    raise exception 'Invite not valid for this account.' using errcode = '42501';
  end if;

  insert into public.household_members(
    household_id, user_id, role, status, invited_at, joined_at
  ) values (
    matched_invite.household_id, current_user_id, matched_invite.role,
    'active', matched_invite.created_at, now()
  )
  on conflict (household_id, user_id) do update set
    role = excluded.role, status = 'active', joined_at = now(), revoked_at = null;

  insert into public.pet_members(pet_id, household_id, user_id, role, status)
  select p.id, p.household_id, current_user_id, matched_invite.role, 'active'
  from public.pets p
  where p.household_id = matched_invite.household_id and p.deleted_at is null
  on conflict (pet_id, user_id) do update set
    role = excluded.role, status = 'active', revoked_at = null;

  update public.household_invites set accepted_at = now()
  where id = matched_invite.id;

  return matched_invite.household_id;
end;
$$;

revoke all on function public.create_household_with_owner(text) from public, anon;
revoke all on function public.create_pet_with_owner(uuid, jsonb, text, uuid) from public, anon;
revoke all on function public.accept_household_invite(text) from public, anon;
grant execute on function public.create_household_with_owner(text) to authenticated;
grant execute on function public.create_pet_with_owner(uuid, jsonb, text, uuid) to authenticated;
grant execute on function public.accept_household_invite(text) to authenticated;
