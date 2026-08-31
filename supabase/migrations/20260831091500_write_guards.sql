create or replace function private.guard_pet_soft_delete()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if old.deleted_at is distinct from new.deleted_at
    and not private.is_pet_owner(old.pet_id) then
    raise exception 'Only the pet owner can change deletion state.'
      using errcode = '42501';
  end if;
  return new;
end;
$$;

create or replace function private.guard_household_soft_delete()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if old.deleted_at is distinct from new.deleted_at
    and not private.is_household_owner(old.household_id) then
    raise exception 'Only the household owner can change deletion state.'
      using errcode = '42501';
  end if;
  return new;
end;
$$;

revoke all on function private.guard_pet_soft_delete() from public, anon, authenticated;
revoke all on function private.guard_household_soft_delete() from public, anon, authenticated;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'activities', 'walks', 'health_events', 'medications',
    'medication_logs', 'weight_logs', 'documents', 'milestones'
  ] loop
    execute format(
      'create trigger guard_soft_delete before update on public.%I '
      'for each row execute function private.guard_pet_soft_delete()',
      table_name
    );
  end loop;
end;
$$;

create trigger guard_travel_plan_soft_delete
  before update on public.travel_plans
  for each row execute function private.guard_household_soft_delete();

create trigger guard_travel_item_soft_delete
  before update on public.travel_items
  for each row execute function private.guard_household_soft_delete();
