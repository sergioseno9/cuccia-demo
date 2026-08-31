begin;

create extension if not exists pgtap with schema extensions;
select plan(5);

select is(
  (
    select count(*)::integer
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relname = any (array[
        'profiles', 'households', 'household_members', 'pets', 'pet_members',
        'activities', 'walks', 'health_events', 'medications', 'medication_logs',
        'reminders', 'weight_logs', 'documents', 'travel_plans', 'travel_items',
        'milestones', 'pet_share_links', 'push_tokens', 'household_invites',
        'migration_batches', 'pet_content_progress'
      ])
      and c.relrowsecurity
  ),
  21,
  'RLS is enabled on every Phase 1 public table'
);

select is(
  (
    select count(*)::integer
    from pg_policies
    where schemaname in ('public', 'storage')
      and (qual = 'true' or with_check = 'true')
  ),
  0,
  'No policy contains an unconditional true expression'
);

select is(
  (
    select count(*)::integer
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'private'
      and p.proname in ('is_household_member', 'can_access_pet', 'is_pet_owner')
      and p.prosecdef
      and 'search_path=""' = any (p.proconfig)
  ),
  3,
  'Required membership helpers are security definer with an empty search path'
);

select has_index(
  'public', 'activities', 'activities_pet_mutation_key',
  'Activities have a per-pet client mutation deduplication index'
);

select has_index(
  'public', 'walks', 'one_walk_in_progress_per_pet_uidx',
  'Walks allow only one in-progress row per pet'
);

select * from finish();
rollback;
