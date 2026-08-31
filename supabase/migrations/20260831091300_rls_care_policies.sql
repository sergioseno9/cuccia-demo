create policy medication_logs_select_member on public.medication_logs
  for select to authenticated
  using (private.can_access_pet(pet_id, 'read'));
create policy medication_logs_insert_dose on public.medication_logs
  for insert to authenticated
  with check (
    private.can_access_pet(pet_id, 'dose')
    and actor_user_id = (select auth.uid())
    and (private.pet_role(pet_id) <> 'caregiver' or scheduled_for is not null)
  );
create policy medication_logs_update_own on public.medication_logs
  for update to authenticated
  using (
    private.can_access_pet(pet_id, 'dose')
    and (private.is_pet_owner(pet_id) or actor_user_id = (select auth.uid()))
  )
  with check (
    private.can_access_pet(pet_id, 'dose')
    and (private.is_pet_owner(pet_id) or actor_user_id = (select auth.uid()))
  );
create policy medication_logs_delete_owner on public.medication_logs
  for delete to authenticated
  using (private.can_access_pet(pet_id, 'delete'));

create policy reminders_select_member on public.reminders
  for select to authenticated
  using (private.can_access_pet(pet_id, 'read'));
create policy reminders_insert_health on public.reminders
  for insert to authenticated
  with check (private.can_access_pet(pet_id, 'health'));
create policy reminders_update_health on public.reminders
  for update to authenticated
  using (private.can_access_pet(pet_id, 'health'))
  with check (private.can_access_pet(pet_id, 'health'));
create policy reminders_delete_owner on public.reminders
  for delete to authenticated
  using (private.can_access_pet(pet_id, 'delete'));

create policy documents_select_health on public.documents
  for select to authenticated
  using (private.can_access_pet(pet_id, 'health'));
create policy documents_insert_health on public.documents
  for insert to authenticated
  with check (
    private.can_access_pet(pet_id, 'health')
    and uploaded_by = (select auth.uid())
  );
create policy documents_update_health on public.documents
  for update to authenticated
  using (private.can_access_pet(pet_id, 'health'))
  with check (private.can_access_pet(pet_id, 'health'));
create policy documents_delete_owner on public.documents
  for delete to authenticated
  using (private.can_access_pet(pet_id, 'delete'));

create policy milestones_select_member on public.milestones
  for select to authenticated
  using (private.can_access_pet(pet_id, 'read'));
create policy milestones_insert_health on public.milestones
  for insert to authenticated
  with check (
    private.can_access_pet(pet_id, 'health')
    and created_by = (select auth.uid())
  );
create policy milestones_update_health on public.milestones
  for update to authenticated
  using (private.can_access_pet(pet_id, 'health'))
  with check (private.can_access_pet(pet_id, 'health'));
create policy milestones_delete_owner on public.milestones
  for delete to authenticated
  using (private.can_access_pet(pet_id, 'delete'));

create policy pet_content_progress_select_member on public.pet_content_progress
  for select to authenticated
  using (private.can_access_pet(pet_id, 'read'));
create policy pet_content_progress_insert_family on public.pet_content_progress
  for insert to authenticated
  with check (private.can_access_pet(pet_id, 'content'));
create policy pet_content_progress_update_family on public.pet_content_progress
  for update to authenticated
  using (private.can_access_pet(pet_id, 'content'))
  with check (private.can_access_pet(pet_id, 'content'));
create policy pet_content_progress_delete_owner on public.pet_content_progress
  for delete to authenticated
  using (private.can_access_pet(pet_id, 'delete'));
