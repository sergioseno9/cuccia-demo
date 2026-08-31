drop policy medication_logs_insert_dose on public.medication_logs;
create policy medication_logs_insert_dose on public.medication_logs
  for insert to authenticated
  with check (
    private.can_access_pet(pet_id, 'dose')
    and (
      actor_user_id = (select auth.uid())
      or (
        migration_batch_id is not null
        and actor_user_id is null
        and private.is_pet_owner(pet_id)
      )
    )
    and (private.pet_role(pet_id) <> 'caregiver' or scheduled_for is not null)
  );
