drop index if exists public.activities_pet_mutation_uidx;
alter table public.activities
  add constraint activities_pet_mutation_key unique (pet_id, client_mutation_id);

drop index if exists public.walks_pet_mutation_uidx;
alter table public.walks
  add constraint walks_pet_mutation_key unique (pet_id, client_mutation_id);

drop index if exists public.medication_logs_pet_mutation_uidx;
alter table public.medication_logs
  add constraint medication_logs_pet_mutation_key unique (pet_id, client_mutation_id);
