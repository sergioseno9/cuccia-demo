create index household_members_user_status_idx
  on public.household_members(user_id, status);
create index household_members_household_status_idx
  on public.household_members(household_id, status);
create index household_invites_household_idx
  on public.household_invites(household_id, expires_at);
create index migration_batches_user_idx
  on public.migration_batches(user_id, status);

create index pets_household_idx on public.pets(household_id) where deleted_at is null;
create index pet_members_user_status_idx on public.pet_members(user_id, status);
create index pet_members_pet_status_idx on public.pet_members(pet_id, status);

create index activities_pet_time_idx on public.activities(pet_id, happened_at desc);
create unique index activities_pet_mutation_uidx
  on public.activities(pet_id, client_mutation_id) where client_mutation_id is not null;
create unique index activities_pet_legacy_uidx
  on public.activities(pet_id, legacy_source_id) where legacy_source_id is not null;

create index walks_pet_start_idx on public.walks(pet_id, started_at desc);
create unique index walks_pet_mutation_uidx
  on public.walks(pet_id, client_mutation_id) where client_mutation_id is not null;
create unique index one_walk_in_progress_per_pet_uidx
  on public.walks(pet_id) where status = 'in_progress' and deleted_at is null;

create index health_events_pet_due_idx
  on public.health_events(pet_id, event_type, due_on) where deleted_at is null;
create index medications_pet_active_idx
  on public.medications(pet_id, active) where deleted_at is null;
create index medication_logs_medication_time_idx
  on public.medication_logs(medication_id, scheduled_for desc);
create unique index medication_logs_pet_mutation_uidx
  on public.medication_logs(pet_id, client_mutation_id) where client_mutation_id is not null;
create unique index medication_logs_dose_slot_uidx
  on public.medication_logs(medication_id, scheduled_for)
  where scheduled_for is not null and status = 'administered' and deleted_at is null;
create index reminders_pet_due_idx on public.reminders(pet_id, status, due_at);
create index weight_logs_pet_date_idx on public.weight_logs(pet_id, weighed_on desc);
create index documents_pet_idx on public.documents(pet_id) where deleted_at is null;

create index travel_plans_household_date_idx
  on public.travel_plans(household_id, departure_date) where deleted_at is null;
create index travel_items_plan_order_idx
  on public.travel_items(travel_plan_id, sort_order) where deleted_at is null;
create index milestones_pet_date_idx
  on public.milestones(pet_id, occurred_on desc) where deleted_at is null;
create index share_links_pet_expiry_idx on public.pet_share_links(pet_id, expires_at);
create index push_tokens_user_active_idx on public.push_tokens(user_id, active);
