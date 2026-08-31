create policy pets_select_member on public.pets
  for select to authenticated
  using (private.can_access_pet(id, 'read'));
create policy pets_update_owner on public.pets
  for update to authenticated
  using (private.can_access_pet(id, 'profile'))
  with check (private.can_access_pet(id, 'profile'));
create policy pets_delete_owner on public.pets
  for delete to authenticated
  using (private.can_access_pet(id, 'delete'));

create policy pet_members_select_member on public.pet_members
  for select to authenticated
  using (private.can_access_pet(pet_id, 'read'));
create policy pet_members_update_owner on public.pet_members
  for update to authenticated
  using (private.can_access_pet(pet_id, 'members'))
  with check (private.can_access_pet(pet_id, 'members'));
create policy pet_members_delete_owner on public.pet_members
  for delete to authenticated
  using (private.can_access_pet(pet_id, 'members'));

create policy activities_select_member on public.activities
  for select to authenticated
  using (private.can_access_pet(pet_id, 'read'));
create policy activities_insert_writer on public.activities
  for insert to authenticated
  with check (
    private.can_access_pet(pet_id, 'activity')
    and (
      actor_user_id = (select auth.uid())
      or (
        migration_batch_id is not null
        and actor_user_id is null
        and private.is_pet_owner(pet_id)
      )
    )
  );
create policy activities_update_writer on public.activities
  for update to authenticated
  using (private.can_access_pet(pet_id, 'activity'))
  with check (private.can_access_pet(pet_id, 'activity'));
create policy activities_delete_owner on public.activities
  for delete to authenticated
  using (private.can_access_pet(pet_id, 'delete'));

create policy walks_select_member on public.walks
  for select to authenticated
  using (private.can_access_pet(pet_id, 'read'));
create policy walks_insert_writer on public.walks
  for insert to authenticated
  with check (
    private.can_access_pet(pet_id, 'activity')
    and started_by = (select auth.uid())
  );
create policy walks_update_writer on public.walks
  for update to authenticated
  using (private.can_access_pet(pet_id, 'activity'))
  with check (private.can_access_pet(pet_id, 'activity'));
create policy walks_delete_owner on public.walks
  for delete to authenticated
  using (private.can_access_pet(pet_id, 'delete'));

create policy health_events_select_member on public.health_events
  for select to authenticated
  using (private.can_access_pet(pet_id, 'read'));
create policy health_events_insert_health on public.health_events
  for insert to authenticated
  with check (
    private.can_access_pet(pet_id, 'health')
    and created_by = (select auth.uid())
  );
create policy health_events_update_health on public.health_events
  for update to authenticated
  using (private.can_access_pet(pet_id, 'health'))
  with check (private.can_access_pet(pet_id, 'health'));
create policy health_events_delete_owner on public.health_events
  for delete to authenticated
  using (private.can_access_pet(pet_id, 'delete'));

create policy medications_select_member on public.medications
  for select to authenticated
  using (private.can_access_pet(pet_id, 'read'));
create policy medications_insert_health on public.medications
  for insert to authenticated
  with check (
    private.can_access_pet(pet_id, 'health')
    and created_by = (select auth.uid())
  );
create policy medications_update_health on public.medications
  for update to authenticated
  using (private.can_access_pet(pet_id, 'health'))
  with check (private.can_access_pet(pet_id, 'health'));
create policy medications_delete_owner on public.medications
  for delete to authenticated
  using (private.can_access_pet(pet_id, 'delete'));

create policy weight_logs_select_member on public.weight_logs
  for select to authenticated
  using (private.can_access_pet(pet_id, 'read'));
create policy weight_logs_insert_health on public.weight_logs
  for insert to authenticated
  with check (
    private.can_access_pet(pet_id, 'health')
    and recorded_by = (select auth.uid())
  );
create policy weight_logs_update_health on public.weight_logs
  for update to authenticated
  using (private.can_access_pet(pet_id, 'health'))
  with check (private.can_access_pet(pet_id, 'health'));
create policy weight_logs_delete_owner on public.weight_logs
  for delete to authenticated
  using (private.can_access_pet(pet_id, 'delete'));
