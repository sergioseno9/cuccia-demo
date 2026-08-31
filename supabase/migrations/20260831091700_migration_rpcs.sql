create or replace function public.begin_migration_batch(
  target_household_id uuid,
  fingerprint text,
  expected jsonb
)
returns public.migration_batches
language plpgsql
security definer
set search_path = ''
as $$
declare
  result public.migration_batches%rowtype;
begin
  if not private.is_household_owner(target_household_id) then
    raise exception 'Only a household owner can import local data.' using errcode = '42501';
  end if;

  insert into public.migration_batches(
    household_id, user_id, snapshot_fingerprint,
    source_schema_version, expected_counts
  ) values (
    target_household_id, auth.uid(), fingerprint, 2, expected
  )
  on conflict (household_id, snapshot_fingerprint) do update set
    expected_counts = case
      when public.migration_batches.status = 'pending' then excluded.expected_counts
      else public.migration_batches.expected_counts
    end
  returning * into result;

  return result;
end;
$$;

create or replace function public.complete_migration_batch(
  batch_id uuid,
  imported jsonb
)
returns public.migration_batches
language plpgsql
security definer
set search_path = ''
as $$
declare
  result public.migration_batches%rowtype;
begin
  select * into result
  from public.migration_batches mb
  where mb.id = batch_id and mb.user_id = auth.uid()
  for update;

  if result.id is null or not private.is_household_owner(result.household_id) then
    raise exception 'Migration batch not accessible.' using errcode = '42501';
  end if;
  if result.status = 'completed' then return result; end if;
  if result.expected_counts <> imported then
    raise exception 'Imported counts do not match the verified backup.' using errcode = '22000';
  end if;

  update public.migration_batches set
    imported_counts = imported,
    status = 'completed',
    completed_at = now(),
    error_message = null
  where id = batch_id
  returning * into result;

  return result;
end;
$$;

create or replace function public.rollback_migration_batch(batch_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_household_id uuid;
  target_status public.migration_status;
begin
  select household_id, status into target_household_id, target_status
  from public.migration_batches
  where id = batch_id and user_id = auth.uid()
  for update;

  if target_household_id is null or not private.is_household_owner(target_household_id) then
    raise exception 'Migration batch not accessible.' using errcode = '42501';
  end if;
  if target_status = 'completed' then
    raise exception 'A completed migration cannot be rolled back automatically.'
      using errcode = '55000';
  end if;

  delete from public.migration_batches where id = batch_id;
  return true;
end;
$$;

revoke all on function public.begin_migration_batch(uuid, text, jsonb) from public, anon;
revoke all on function public.complete_migration_batch(uuid, jsonb) from public, anon;
revoke all on function public.rollback_migration_batch(uuid) from public, anon;
grant execute on function public.begin_migration_batch(uuid, text, jsonb) to authenticated;
grant execute on function public.complete_migration_batch(uuid, jsonb) to authenticated;
grant execute on function public.rollback_migration_batch(uuid) to authenticated;
