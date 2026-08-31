create table public.pets (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  created_by uuid not null references public.profiles(id),
  migration_batch_id uuid references public.migration_batches(id) on delete cascade,
  legacy_source_id text,
  name text not null check (char_length(name) between 1 and 120),
  species public.pet_species not null,
  life_phase public.pet_life_phase not null default 'adulto',
  birth_date date,
  sex text not null default 'unknown' check (sex in ('male', 'female', 'unknown')),
  breed text not null default '',
  size text not null default 'medium' check (size in ('small', 'medium', 'large')),
  photo_path text,
  tracked_modules text[] not null default '{}',
  conditions text[] not null default '{}',
  feeding jsonb not null default '{}'::jsonb,
  profile_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (id, household_id),
  unique (household_id, legacy_source_id)
);

create table public.pet_members (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid not null,
  household_id uuid not null,
  user_id uuid not null,
  role public.member_role not null,
  status public.membership_status not null default 'active',
  permissions jsonb not null default '{}'::jsonb,
  joined_at timestamptz not null default now(),
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (pet_id, user_id),
  unique (id, pet_id),
  foreign key (pet_id, household_id)
    references public.pets(id, household_id) on delete cascade,
  foreign key (household_id, user_id)
    references public.household_members(household_id, user_id) on delete cascade
);
