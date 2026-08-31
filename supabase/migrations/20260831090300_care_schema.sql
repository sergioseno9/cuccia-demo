create table public.medications (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid not null,
  household_id uuid not null,
  created_by uuid references public.profiles(id),
  migration_batch_id uuid references public.migration_batches(id) on delete cascade,
  legacy_source_id text,
  name text not null,
  dose_text text not null default '',
  instructions text not null default '',
  times text[] not null default '{}',
  timezone text not null default 'Europe/Rome',
  start_date date,
  end_date date,
  active boolean not null default true,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (id, pet_id, household_id),
  unique (pet_id, legacy_source_id),
  foreign key (pet_id, household_id)
    references public.pets(id, household_id) on delete cascade
);

create table public.health_events (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid not null,
  household_id uuid not null,
  created_by uuid references public.profiles(id),
  migration_batch_id uuid references public.migration_batches(id) on delete cascade,
  legacy_source_id text,
  event_type text not null check (event_type in (
    'vaccination', 'prevention', 'deworming', 'visit', 'grooming',
    'condition', 'annual_check', 'insurance', 'microchip_check'
  )),
  title text not null,
  occurred_on date,
  due_on date,
  confirmed_manually boolean not null default true,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  deleted_by uuid references public.profiles(id),
  unique (id, pet_id, household_id),
  unique (pet_id, legacy_source_id),
  foreign key (pet_id, household_id)
    references public.pets(id, household_id) on delete cascade
);

create table public.weight_logs (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid not null,
  household_id uuid not null,
  recorded_by uuid references public.profiles(id),
  migration_batch_id uuid references public.migration_batches(id) on delete cascade,
  legacy_source_id text,
  weighed_on date not null,
  value_kg numeric(7,3) not null check (value_kg > 0),
  note text not null default '',
  source text not null default 'manual' check (source = 'manual'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (id, pet_id, household_id),
  unique (pet_id, legacy_source_id),
  foreign key (pet_id, household_id)
    references public.pets(id, household_id) on delete cascade
);

create table public.activities (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid not null,
  household_id uuid not null,
  actor_user_id uuid references public.profiles(id),
  author_snapshot text not null,
  migration_batch_id uuid references public.migration_batches(id) on delete cascade,
  legacy_source_id text,
  client_mutation_id text,
  activity_type text not null check (activity_type in (
    'meal', 'water', 'pee', 'poop', 'walk', 'sleep',
    'grooming', 'litterbox', 'medication', 'note'
  )),
  happened_at timestamptz not null,
  duration_minutes integer check (duration_minutes is null or duration_minutes > 0),
  note text not null default '',
  medication_id uuid,
  edited_by uuid references public.profiles(id),
  edited_at timestamptz,
  deleted_by uuid references public.profiles(id),
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, pet_id, household_id),
  foreign key (pet_id, household_id)
    references public.pets(id, household_id) on delete cascade,
  foreign key (medication_id, pet_id, household_id)
    references public.medications(id, pet_id, household_id)
);

create table public.walks (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid not null,
  household_id uuid not null,
  started_by uuid references public.profiles(id),
  ended_by uuid references public.profiles(id),
  migration_batch_id uuid references public.migration_batches(id) on delete cascade,
  legacy_source_id text,
  client_mutation_id text,
  status public.walk_status not null default 'in_progress',
  started_at timestamptz not null,
  ended_at timestamptz,
  duration_seconds integer check (duration_seconds is null or duration_seconds >= 0),
  distance_meters numeric(12,2) check (distance_meters is null or distance_meters >= 0),
  encoded_route text,
  average_accuracy_meters numeric(8,2),
  confirmed_manually boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (id, pet_id, household_id),
  foreign key (pet_id, household_id)
    references public.pets(id, household_id) on delete cascade
);
