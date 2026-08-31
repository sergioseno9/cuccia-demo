do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'profiles', 'households', 'household_members', 'household_invites',
    'migration_batches', 'pets', 'pet_members', 'activities', 'walks',
    'health_events', 'medications', 'medication_logs', 'reminders',
    'weight_logs', 'documents', 'travel_plans', 'travel_items',
    'milestones', 'pet_share_links', 'push_tokens', 'pet_content_progress'
  ] loop
    execute format('alter table public.%I enable row level security', table_name);
    execute format('alter table public.%I force row level security', table_name);
    execute format('revoke all on public.%I from anon', table_name);
    execute format('grant select, insert, update, delete on public.%I to authenticated', table_name);
  end loop;
end;
$$;

create policy profiles_select_self on public.profiles
  for select to authenticated
  using (id = (select auth.uid()));
create policy profiles_insert_self on public.profiles
  for insert to authenticated
  with check (id = (select auth.uid()));
create policy profiles_update_self on public.profiles
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

create policy households_select_member on public.households
  for select to authenticated
  using (private.is_household_member(id));
create policy households_update_owner on public.households
  for update to authenticated
  using (private.is_household_owner(id))
  with check (private.is_household_owner(id));
create policy households_delete_owner on public.households
  for delete to authenticated
  using (private.is_household_owner(id));

create policy household_members_select_member on public.household_members
  for select to authenticated
  using (private.is_household_member(household_id));
create policy household_members_update_owner on public.household_members
  for update to authenticated
  using (private.is_household_owner(household_id))
  with check (private.is_household_owner(household_id));
create policy household_members_delete_owner on public.household_members
  for delete to authenticated
  using (private.is_household_owner(household_id));

create policy household_invites_select_owner on public.household_invites
  for select to authenticated
  using (private.is_household_owner(household_id));
create policy household_invites_insert_owner on public.household_invites
  for insert to authenticated
  with check (
    private.is_household_owner(household_id)
    and invited_by = (select auth.uid())
  );
create policy household_invites_update_owner on public.household_invites
  for update to authenticated
  using (private.is_household_owner(household_id))
  with check (private.is_household_owner(household_id));
create policy household_invites_delete_owner on public.household_invites
  for delete to authenticated
  using (private.is_household_owner(household_id));

create policy migration_batches_select_owner on public.migration_batches
  for select to authenticated
  using (private.is_household_owner(household_id));
create policy migration_batches_insert_owner on public.migration_batches
  for insert to authenticated
  with check (
    private.is_household_owner(household_id)
    and user_id = (select auth.uid())
  );
create policy migration_batches_update_owner on public.migration_batches
  for update to authenticated
  using (private.is_household_owner(household_id))
  with check (
    private.is_household_owner(household_id)
    and user_id = (select auth.uid())
  );
create policy migration_batches_delete_owner on public.migration_batches
  for delete to authenticated
  using (private.is_household_owner(household_id));
