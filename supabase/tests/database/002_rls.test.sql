begin;

create extension if not exists pgtap with schema extensions;
select plan(21);

insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'owner@example.test', crypt('password', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"display_name":"Owner"}', now(), now()),
  ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'family@example.test', crypt('password', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"display_name":"Family"}', now(), now()),
  ('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'caregiver@example.test', crypt('password', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"display_name":"Caregiver"}', now(), now()),
  ('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'stranger@example.test', crypt('password', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"display_name":"Stranger"}', now(), now());

insert into public.households(id, name, created_by) values
  ('10000000-0000-0000-0000-000000000001', 'Casa A', '00000000-0000-0000-0000-000000000001'),
  ('10000000-0000-0000-0000-000000000002', 'Casa B', '00000000-0000-0000-0000-000000000004');

insert into public.household_members(household_id, user_id, role, status) values
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'owner', 'active'),
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'family', 'active'),
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003', 'caregiver', 'active'),
  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000004', 'owner', 'active');

insert into public.pets(id, household_id, created_by, name, species, life_phase) values
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Milo', 'cane', 'adulto'),
  ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000004', 'Luna', 'gatto', 'adulto');

insert into public.pet_members(pet_id, household_id, user_id, role, status) values
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'owner', 'active'),
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'family', 'active'),
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003', 'caregiver', 'active'),
  ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000004', 'owner', 'active');

insert into public.medications(
  id, pet_id, household_id, created_by, name, dose_text, times
) values (
  '30000000-0000-0000-0000-000000000001',
  '20000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  'Integratore', '1 compressa', array['08:00']
);

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000001', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
select is((select count(*) from public.pets), 1::bigint, 'Owner reads the owned pet only');
select lives_ok(
  $$insert into public.activities(pet_id, household_id, actor_user_id, author_snapshot, client_mutation_id, activity_type, happened_at) values ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', auth.uid(), 'Owner', 'owner-activity', 'meal', now())$$,
  'Owner writes an activity'
);
select lives_ok(
  $$insert into public.health_events(pet_id, household_id, created_by, event_type, title, occurred_on) values ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', auth.uid(), 'visit', 'Controllo', current_date)$$,
  'Owner writes health data'
);

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000002', true);
select is((select count(*) from public.pets), 1::bigint, 'Family reads the shared pet');
select lives_ok(
  $$insert into public.activities(pet_id, household_id, actor_user_id, author_snapshot, client_mutation_id, activity_type, happened_at) values ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', auth.uid(), 'Family', 'family-activity', 'walk', now())$$,
  'Family writes activities'
);
select lives_ok(
  $$insert into public.health_events(pet_id, household_id, created_by, event_type, title, occurred_on) values ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', auth.uid(), 'vaccination', 'Richiamo', current_date)$$,
  'Family writes health data'
);
select throws_ok(
  $$update public.activities set deleted_at = now() where client_mutation_id = 'family-activity'$$,
  '42501', null, 'Family cannot soft-delete activities'
);
select is_empty(
  $$update public.household_members set role = 'family' where user_id = '00000000-0000-0000-0000-000000000001' returning id$$,
  'Family cannot manage household members'
);
select ok(
  private.can_access_pet_document('households/10000000-0000-0000-0000-000000000001/pets/20000000-0000-0000-0000-000000000001/doc.pdf', 'health'),
  'Family can access private health documents'
);

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000003', true);
select is((select count(*) from public.pets), 1::bigint, 'Caregiver reads the shared pet');
select lives_ok(
  $$insert into public.activities(pet_id, household_id, actor_user_id, author_snapshot, client_mutation_id, activity_type, happened_at) values ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', auth.uid(), 'Caregiver', 'caregiver-activity', 'note', now())$$,
  'Caregiver writes daily activities'
);
select throws_ok(
  $$insert into public.health_events(pet_id, household_id, created_by, event_type, title, occurred_on) values ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', auth.uid(), 'visit', 'Non consentito', current_date)$$,
  '42501', null, 'Caregiver cannot write health records'
);
select lives_ok(
  $$insert into public.medication_logs(pet_id, household_id, medication_id, actor_user_id, author_snapshot, client_mutation_id, scheduled_for, administered_at, status) values ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', auth.uid(), 'Caregiver', 'dose-scheduled', now(), now(), 'administered')$$,
  'Caregiver confirms a scheduled dose'
);
select throws_ok(
  $$insert into public.medication_logs(pet_id, household_id, medication_id, actor_user_id, author_snapshot, client_mutation_id, administered_at, status) values ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', auth.uid(), 'Caregiver', 'dose-unscheduled', now(), 'administered')$$,
  '42501', null, 'Caregiver cannot create an unscheduled dose'
);
select ok(
  not private.can_access_pet_document('households/10000000-0000-0000-0000-000000000001/pets/20000000-0000-0000-0000-000000000001/doc.pdf', 'health'),
  'Caregiver cannot access health documents'
);

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000004', true);
select is((select count(*) from public.pets where id = '20000000-0000-0000-0000-000000000001'), 0::bigint, 'Stranger cannot read another household pet');
select throws_ok(
  $$insert into public.activities(pet_id, household_id, actor_user_id, author_snapshot, activity_type, happened_at) values ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', auth.uid(), 'Stranger', 'meal', now())$$,
  '42501', null, 'Stranger cannot write another pet activity'
);

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000001', true);
select lives_ok(
  $$select public.revoke_household_member('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003')$$,
  'Owner revokes a caregiver transactionally'
);

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000003', true);
select is((select count(*) from public.pets), 0::bigint, 'Revoked caregiver immediately loses query access');
select ok(
  not private.can_access_pet_document('households/10000000-0000-0000-0000-000000000001/pets/20000000-0000-0000-0000-000000000001/doc.pdf', 'health'),
  'Revoked caregiver immediately loses Storage access'
);

reset role;
select throws_ok(
  $$insert into public.pet_members(pet_id, household_id, user_id, role, status) values ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000004', 'caregiver', 'active')$$,
  '23503', null, 'Cross-household pet membership is rejected by foreign keys'
);

select * from finish();
rollback;
