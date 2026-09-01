alter table public.pets
  add column if not exists client_mutation_id text,
  add column if not exists deleted_by uuid references public.profiles(id);

alter table public.health_events
  add column if not exists client_mutation_id text;

alter table public.medications
  add column if not exists client_mutation_id text,
  add column if not exists deleted_by uuid references public.profiles(id);

alter table public.weight_logs
  add column if not exists client_mutation_id text,
  add column if not exists deleted_by uuid references public.profiles(id);

alter table public.documents
  add column if not exists client_mutation_id text;

alter table public.pet_content_progress
  add column if not exists client_mutation_id text;

create table public.household_caregivers (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  linked_user_id uuid references public.profiles(id) on delete set null,
  created_by uuid not null references public.profiles(id),
  legacy_source_id text not null,
  client_mutation_id text,
  display_name text not null check (char_length(display_name) between 1 and 120),
  role_label text not null default 'Famiglia',
  color text not null default '#D9694A',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  deleted_by uuid references public.profiles(id),
  unique (household_id, legacy_source_id),
  unique (household_id, linked_user_id),
  unique (household_id, client_mutation_id)
);

create unique index if not exists pets_household_mutation_uidx
  on public.pets(household_id, client_mutation_id)
  where client_mutation_id is not null;
create unique index if not exists health_events_pet_mutation_uidx
  on public.health_events(pet_id, client_mutation_id)
  where client_mutation_id is not null;
create unique index if not exists medications_pet_mutation_uidx
  on public.medications(pet_id, client_mutation_id)
  where client_mutation_id is not null;
create unique index if not exists weight_logs_pet_mutation_uidx
  on public.weight_logs(pet_id, client_mutation_id)
  where client_mutation_id is not null;
create unique index if not exists documents_pet_mutation_uidx
  on public.documents(pet_id, client_mutation_id)
  where client_mutation_id is not null;
create unique index if not exists content_progress_pet_mutation_uidx
  on public.pet_content_progress(pet_id, client_mutation_id)
  where client_mutation_id is not null;

alter table public.household_caregivers enable row level security;
alter table public.household_caregivers force row level security;
revoke all on public.household_caregivers from anon;
grant select, insert, update, delete on public.household_caregivers to authenticated;

create policy household_caregivers_select_member on public.household_caregivers
  for select to authenticated
  using (private.is_household_member(household_id));
create policy household_caregivers_insert_owner on public.household_caregivers
  for insert to authenticated
  with check (
    private.is_household_owner(household_id)
    and created_by = (select auth.uid())
  );
create policy household_caregivers_update_owner on public.household_caregivers
  for update to authenticated
  using (private.is_household_owner(household_id))
  with check (private.is_household_owner(household_id));
create policy household_caregivers_delete_owner on public.household_caregivers
  for delete to authenticated
  using (private.is_household_owner(household_id));

create trigger set_updated_at
  before update on public.household_caregivers
  for each row execute function private.set_updated_at();

create or replace function public.create_household_with_owner(household_name text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  new_household_id uuid;
  current_user_id uuid := auth.uid();
  current_name text;
begin
  if current_user_id is null then
    raise exception 'Authentication required.' using errcode = '42501';
  end if;

  insert into public.profiles(id, display_name)
  values (
    current_user_id,
    coalesce(auth.jwt() -> 'user_metadata' ->> 'display_name', split_part(auth.jwt() ->> 'email', '@', 1), '')
  ) on conflict (id) do nothing;

  insert into public.households(name, created_by)
  values (trim(household_name), current_user_id)
  returning id into new_household_id;

  insert into public.household_members(household_id, user_id, role, status, joined_at)
  values (new_household_id, current_user_id, 'owner', 'active', now());

  select nullif(display_name, '') into current_name
  from public.profiles where id = current_user_id;

  insert into public.household_caregivers(
    household_id, linked_user_id, created_by, legacy_source_id,
    display_name, role_label, color
  ) values (
    new_household_id, current_user_id, current_user_id,
    'member:' || current_user_id::text,
    coalesce(current_name, 'Account'), 'Owner', '#D9694A'
  ) on conflict (household_id, linked_user_id) do nothing;

  return new_household_id;
end;
$$;

drop function public.create_pet_with_owner(uuid, jsonb, text, uuid);

create or replace function public.create_pet_with_owner(
  target_household_id uuid,
  pet_payload jsonb,
  source_id text default null,
  batch_id uuid default null,
  mutation_id text default null
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
    client_mutation_id, name, species, life_phase, birth_date, sex,
    breed, size, tracked_modules, conditions, feeding, profile_data
  ) values (
    target_household_id, current_user_id, batch_id, source_id,
    mutation_id, nullif(trim(pet_payload ->> 'name'), ''),
    (pet_payload ->> 'species')::public.pet_species,
    coalesce((pet_payload ->> 'lifePhase')::public.pet_life_phase, 'adulto'),
    nullif(pet_payload ->> 'birthDate', '')::date,
    coalesce(nullif(pet_payload ->> 'sex', ''), 'unknown'),
    coalesce(pet_payload ->> 'breed', ''),
    coalesce(nullif(pet_payload ->> 'size', ''), 'medium'),
    coalesce(array(select jsonb_array_elements_text(pet_payload -> 'trackedModules')), '{}'),
    coalesce(array(select jsonb_array_elements_text(pet_payload -> 'conditions')), '{}'),
    coalesce(pet_payload -> 'feeding', '{}'::jsonb), pet_payload
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
    profile_data = excluded.profile_data,
    client_mutation_id = coalesce(excluded.client_mutation_id, public.pets.client_mutation_id),
    deleted_at = null,
    deleted_by = null
  returning id into new_pet_id;

  insert into public.pet_members(pet_id, household_id, user_id, role, status)
  select new_pet_id, hm.household_id, hm.user_id, hm.role, 'active'
  from public.household_members hm
  where hm.household_id = target_household_id and hm.status = 'active'
  on conflict (pet_id, user_id) do update set
    role = excluded.role, status = 'active', revoked_at = null;

  return new_pet_id;
end;
$$;

create or replace function public.create_household_invite(
  target_household_id uuid,
  invite_email text,
  invite_role public.member_role default 'family',
  ttl_hours integer default 168
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  raw_token text := encode(extensions.gen_random_bytes(24), 'hex');
  result public.household_invites%rowtype;
begin
  if not private.is_household_owner(target_household_id) then
    raise exception 'Only a household owner can invite members.' using errcode = '42501';
  end if;
  if invite_role = 'owner' then
    raise exception 'Owner invitations are not supported.' using errcode = '22023';
  end if;
  if nullif(trim(invite_email), '') is null then
    raise exception 'Invite email is required.' using errcode = '22023';
  end if;

  update public.household_invites set revoked_at = now()
  where household_id = target_household_id
    and lower(email) = lower(trim(invite_email))
    and accepted_at is null and revoked_at is null;

  insert into public.household_invites(
    household_id, email, role, token_hash, invited_by, expires_at
  ) values (
    target_household_id, lower(trim(invite_email)), invite_role,
    encode(extensions.digest(raw_token, 'sha256'), 'hex'), auth.uid(),
    now() + make_interval(hours => greatest(1, least(ttl_hours, 720)))
  ) returning * into result;

  return jsonb_build_object(
    'id', result.id,
    'token', raw_token,
    'email', result.email,
    'role', result.role,
    'expiresAt', result.expires_at
  );
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
  current_name text;
begin
  select * into matched_invite
  from public.household_invites hi
  where hi.token_hash = encode(extensions.digest(invite_token, 'sha256'), 'hex')
    and hi.accepted_at is null and hi.revoked_at is null and hi.expires_at > now()
  for update;

  if matched_invite.id is null or lower(matched_invite.email) <> current_email then
    raise exception 'Invite not valid for this account.' using errcode = '42501';
  end if;

  insert into public.household_members(
    household_id, user_id, role, status, invited_at, joined_at
  ) values (
    matched_invite.household_id, current_user_id, matched_invite.role,
    'active', matched_invite.created_at, now()
  ) on conflict (household_id, user_id) do update set
    role = excluded.role, status = 'active', joined_at = now(), revoked_at = null;

  insert into public.pet_members(pet_id, household_id, user_id, role, status)
  select p.id, p.household_id, current_user_id, matched_invite.role, 'active'
  from public.pets p
  where p.household_id = matched_invite.household_id and p.deleted_at is null
  on conflict (pet_id, user_id) do update set
    role = excluded.role, status = 'active', revoked_at = null;

  select nullif(display_name, '') into current_name
  from public.profiles where id = current_user_id;
  insert into public.household_caregivers(
    household_id, linked_user_id, created_by, legacy_source_id,
    display_name, role_label, color
  ) values (
    matched_invite.household_id, current_user_id, matched_invite.invited_by,
    'member:' || current_user_id::text,
    coalesce(current_name, split_part(current_email, '@', 1)),
    case matched_invite.role when 'family' then 'Famiglia' else 'Caregiver' end,
    case matched_invite.role when 'family' then '#F2B24C' else '#8FA083' end
  ) on conflict (household_id, linked_user_id) do update set
    display_name = excluded.display_name,
    role_label = excluded.role_label,
    deleted_at = null,
    deleted_by = null;

  update public.household_invites set accepted_at = now()
  where id = matched_invite.id;
  return matched_invite.household_id;
end;
$$;

create or replace function public.revoke_household_member(
  target_household_id uuid,
  target_user_id uuid
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  member_revoked boolean := false;
begin
  if not private.is_household_owner(target_household_id) then
    raise exception 'Only a household owner can revoke members.' using errcode = '42501';
  end if;
  if target_user_id = auth.uid() then
    raise exception 'The household owner cannot revoke themselves.' using errcode = '22023';
  end if;
  if exists (
    select 1 from public.household_members
    where household_id = target_household_id
      and user_id = target_user_id and role = 'owner'
  ) then
    raise exception 'An owner cannot be revoked.' using errcode = '22023';
  end if;

  update public.household_members set
    status = 'revoked', revoked_at = now()
  where household_id = target_household_id and user_id = target_user_id;
  member_revoked := found;
  update public.pet_members set
    status = 'revoked', revoked_at = now()
  where household_id = target_household_id and user_id = target_user_id;
  update public.household_caregivers set
    deleted_at = now(), deleted_by = auth.uid()
  where household_id = target_household_id
    and linked_user_id = target_user_id and deleted_at is null;
  return member_revoked;
end;
$$;

create or replace function public.list_my_household_members(target_household_id uuid)
returns table (
  user_id uuid,
  display_name text,
  role public.member_role,
  status public.membership_status,
  joined_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  select hm.user_id, p.display_name, hm.role, hm.status, hm.joined_at
  from public.household_members hm
  join public.profiles p on p.id = hm.user_id
  where hm.household_id = target_household_id
    and private.is_household_member(target_household_id)
  order by hm.role = 'owner' desc, p.display_name;
$$;

create or replace function public.soft_delete_pet(
  target_pet_id uuid,
  mutation_id text default null
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not private.is_pet_owner(target_pet_id) then
    raise exception 'Only the pet owner can remove a pet.' using errcode = '42501';
  end if;
  update public.pets set
    deleted_at = coalesce(deleted_at, now()),
    deleted_by = coalesce(deleted_by, auth.uid()),
    client_mutation_id = coalesce(mutation_id, client_mutation_id)
  where id = target_pet_id;
  return found;
end;
$$;

create or replace function public.record_medication_dose(
  target_pet_id uuid,
  target_medication_id uuid,
  mutation_id text,
  source_id text,
  dose_slot timestamptz,
  happened_at timestamptz,
  author_name text,
  note_text text default ''
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_household_id uuid;
  activity_id uuid;
  log_id uuid;
begin
  if not private.can_access_pet(target_pet_id, 'dose') then
    raise exception 'Dose access denied.' using errcode = '42501';
  end if;
  select household_id into target_household_id
  from public.pets where id = target_pet_id and deleted_at is null;
  if target_household_id is null or not exists (
    select 1 from public.medications
    where id = target_medication_id and pet_id = target_pet_id and deleted_at is null
  ) then
    raise exception 'Medication not available.' using errcode = '23503';
  end if;

  insert into public.medication_logs(
    pet_id, household_id, medication_id, actor_user_id, author_snapshot,
    client_mutation_id, legacy_source_id, scheduled_for, administered_at, status, note
  ) values (
    target_pet_id, target_household_id, target_medication_id, auth.uid(),
    author_name, mutation_id, source_id, dose_slot, happened_at, 'administered', coalesce(note_text, '')
  ) on conflict (medication_id, scheduled_for)
    where scheduled_for is not null and status = 'administered' and deleted_at is null
    do nothing
  returning id into log_id;

  if log_id is null then
    select id into log_id from public.medication_logs
    where medication_id = target_medication_id
      and scheduled_for = dose_slot
      and status = 'administered' and deleted_at is null;
    return jsonb_build_object('status', 'already_recorded', 'logId', log_id);
  end if;

  insert into public.activities(
    pet_id, household_id, actor_user_id, author_snapshot,
    client_mutation_id, legacy_source_id, activity_type, happened_at,
    note, medication_id
  ) values (
    target_pet_id, target_household_id, auth.uid(), author_name,
    mutation_id, source_id, 'medication', happened_at,
    coalesce(note_text, ''), target_medication_id
  ) on conflict (pet_id, client_mutation_id) do update set
    happened_at = excluded.happened_at,
    note = excluded.note
  returning id into activity_id;

  return jsonb_build_object(
    'status', 'recorded', 'logId', log_id, 'activityId', activity_id
  );
end;
$$;

revoke all on function public.create_pet_with_owner(uuid, jsonb, text, uuid, text) from public, anon;
revoke all on function public.create_household_invite(uuid, text, public.member_role, integer) from public, anon;
revoke all on function public.revoke_household_member(uuid, uuid) from public, anon;
revoke all on function public.list_my_household_members(uuid) from public, anon;
revoke all on function public.soft_delete_pet(uuid, text) from public, anon;
revoke all on function public.record_medication_dose(uuid, uuid, text, text, timestamptz, timestamptz, text, text) from public, anon;
grant execute on function public.create_pet_with_owner(uuid, jsonb, text, uuid, text) to authenticated;
grant execute on function public.create_household_invite(uuid, text, public.member_role, integer) to authenticated;
grant execute on function public.revoke_household_member(uuid, uuid) to authenticated;
grant execute on function public.list_my_household_members(uuid) to authenticated;
grant execute on function public.soft_delete_pet(uuid, text) to authenticated;
grant execute on function public.record_medication_dose(uuid, uuid, text, text, timestamptz, timestamptz, text, text) to authenticated;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'household_members', 'household_invites', 'household_caregivers',
    'pets', 'pet_members', 'activities', 'health_events', 'medications',
    'medication_logs', 'weight_logs', 'documents', 'pet_content_progress'
  ] loop
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = table_name
    ) then
      execute format('alter publication supabase_realtime add table public.%I', table_name);
    end if;
  end loop;
end;
$$;

alter table public.household_members replica identity full;
alter table public.pet_members replica identity full;
alter table public.household_caregivers replica identity full;
alter table public.pets replica identity full;
alter table public.activities replica identity full;
alter table public.health_events replica identity full;
alter table public.medications replica identity full;
alter table public.medication_logs replica identity full;
alter table public.weight_logs replica identity full;
alter table public.documents replica identity full;
alter table public.pet_content_progress replica identity full;
