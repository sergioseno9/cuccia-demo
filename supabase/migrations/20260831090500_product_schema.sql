create table public.travel_plans (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  created_by uuid not null references public.profiles(id),
  destination text not null,
  departure_date date not null,
  return_date date,
  status text not null default 'planned' check (status in ('planned', 'active', 'completed', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (id, household_id),
  check (return_date is null or return_date >= departure_date)
);

create table public.travel_items (
  id uuid primary key default gen_random_uuid(),
  travel_plan_id uuid not null,
  household_id uuid not null,
  pet_id uuid,
  category text not null,
  label text not null,
  sort_order integer not null default 0,
  source_type text,
  source_id uuid,
  completed_by uuid references public.profiles(id),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  foreign key (travel_plan_id, household_id)
    references public.travel_plans(id, household_id) on delete cascade,
  foreign key (pet_id, household_id)
    references public.pets(id, household_id) on delete cascade
);

create table public.milestones (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid not null,
  household_id uuid not null,
  created_by uuid references public.profiles(id),
  milestone_type text not null,
  title text not null,
  occurred_on date not null,
  description text not null default '',
  document_id uuid references public.documents(id),
  source_type text,
  source_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  foreign key (pet_id, household_id)
    references public.pets(id, household_id) on delete cascade
);

create table public.pet_share_links (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid not null,
  household_id uuid not null,
  created_by uuid not null references public.profiles(id),
  token_hash text not null unique,
  allowed_fields jsonb not null default '[]'::jsonb,
  expires_at timestamptz not null,
  revoked_at timestamptz,
  last_accessed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (pet_id, household_id)
    references public.pets(id, household_id) on delete cascade
);

create table public.push_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  device_id text not null,
  platform text not null check (platform in ('ios', 'android', 'web')),
  provider_token text not null unique,
  active boolean not null default true,
  app_version text,
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, device_id)
);

create table public.pet_content_progress (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid not null,
  household_id uuid not null,
  migration_batch_id uuid references public.migration_batches(id) on delete cascade,
  content_type public.content_progress_type not null,
  content_id text not null,
  progress jsonb not null default '{}'::jsonb,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (pet_id, content_type, content_id),
  foreign key (pet_id, household_id)
    references public.pets(id, household_id) on delete cascade
);
