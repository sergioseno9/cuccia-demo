create table public.medication_logs (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid not null,
  household_id uuid not null,
  medication_id uuid not null,
  actor_user_id uuid references public.profiles(id),
  author_snapshot text not null,
  migration_batch_id uuid references public.migration_batches(id) on delete cascade,
  legacy_source_id text,
  client_mutation_id text,
  scheduled_for timestamptz,
  administered_at timestamptz,
  status public.medication_log_status not null,
  note text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  deleted_by uuid references public.profiles(id),
  unique (id, pet_id, household_id),
  foreign key (pet_id, household_id)
    references public.pets(id, household_id) on delete cascade,
  foreign key (medication_id, pet_id, household_id)
    references public.medications(id, pet_id, household_id) on delete cascade
);

create table public.reminders (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid not null,
  household_id uuid not null,
  migration_batch_id uuid references public.migration_batches(id) on delete cascade,
  source_type text not null,
  source_id uuid,
  due_at timestamptz not null,
  timezone text not null default 'Europe/Rome',
  status text not null default 'pending' check (status in ('pending', 'completed', 'dismissed')),
  assigned_to uuid references public.profiles(id),
  completed_by uuid references public.profiles(id),
  completed_at timestamptz,
  dedupe_key text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (pet_id, dedupe_key),
  foreign key (pet_id, household_id)
    references public.pets(id, household_id) on delete cascade
);

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid not null,
  household_id uuid not null,
  uploaded_by uuid references public.profiles(id),
  migration_batch_id uuid references public.migration_batches(id) on delete cascade,
  legacy_source_id text,
  kind text not null check (kind in ('libretto', 'pedigree', 'esame', 'ricevuta', 'altro')),
  file_name text not null,
  mime_type text not null,
  byte_size bigint not null check (byte_size >= 0),
  storage_path text not null unique,
  health_event_id uuid,
  medication_id uuid,
  weight_log_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  deleted_by uuid references public.profiles(id),
  unique (pet_id, legacy_source_id),
  foreign key (pet_id, household_id)
    references public.pets(id, household_id) on delete cascade,
  foreign key (health_event_id, pet_id, household_id)
    references public.health_events(id, pet_id, household_id),
  foreign key (medication_id, pet_id, household_id)
    references public.medications(id, pet_id, household_id),
  foreign key (weight_log_id, pet_id, household_id)
    references public.weight_logs(id, pet_id, household_id),
  check (num_nonnulls(health_event_id, medication_id, weight_log_id) <= 1)
);
