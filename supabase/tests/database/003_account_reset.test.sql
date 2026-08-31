begin;

create extension if not exists pgtap with schema extensions;
select plan(9);

insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values
  ('00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'reset-owner@example.test', crypt('password', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"display_name":"Reset owner"}', now(), now()),
  ('00000000-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'reset-family@example.test', crypt('password', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"display_name":"Reset family"}', now(), now()),
  ('00000000-0000-0000-0000-000000000013', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'reset-stranger@example.test', crypt('password', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"display_name":"Reset stranger"}', now(), now());

insert into public.households(id, name, created_by) values
  ('10000000-0000-0000-0000-000000000011', 'Casa reset owner', '00000000-0000-0000-0000-000000000011'),
  ('10000000-0000-0000-0000-000000000013', 'Casa reset stranger', '00000000-0000-0000-0000-000000000013');

insert into public.household_members(household_id, user_id, role, status) values
  ('10000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000011', 'owner', 'active'),
  ('10000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000012', 'family', 'active'),
  ('10000000-0000-0000-0000-000000000013', '00000000-0000-0000-0000-000000000013', 'owner', 'active');

insert into public.pets(id, household_id, created_by, name, species, life_phase, photo_path) values
  ('20000000-0000-0000-0000-000000000011', '10000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000011', 'Milo reset', 'cane', 'adulto', 'households/10000000-0000-0000-0000-000000000011/pets/20000000-0000-0000-0000-000000000011/profile/photo.jpg'),
  ('20000000-0000-0000-0000-000000000013', '10000000-0000-0000-0000-000000000013', '00000000-0000-0000-0000-000000000013', 'Luna sicura', 'gatto', 'adulto', 'households/10000000-0000-0000-0000-000000000013/pets/20000000-0000-0000-0000-000000000013/profile/photo.jpg');

insert into public.pet_members(pet_id, household_id, user_id, role, status) values
  ('20000000-0000-0000-0000-000000000011', '10000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000011', 'owner', 'active'),
  ('20000000-0000-0000-0000-000000000011', '10000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000012', 'family', 'active'),
  ('20000000-0000-0000-0000-000000000013', '10000000-0000-0000-0000-000000000013', '00000000-0000-0000-0000-000000000013', 'owner', 'active');

insert into public.activities(pet_id, household_id, actor_user_id, author_snapshot, activity_type, happened_at)
values ('20000000-0000-0000-0000-000000000011', '10000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000011', 'Owner', 'walk', now());

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000012', true);
select is(
  cardinality(public.my_cloud_reset_storage_paths()),
  0,
  'Family cannot list owner storage assets for reset'
);
select is(
  (public.reset_my_cloud_data() ->> 'householdsDeleted')::integer,
  0,
  'Family cannot reset the owner household'
);

reset role;
select is((select count(*) from public.households where id = '10000000-0000-0000-0000-000000000011'), 1::bigint, 'Family reset leaves owner household intact');

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000011', true);
select is(
  array_to_string(public.my_cloud_reset_storage_paths(), ','),
  'households/10000000-0000-0000-0000-000000000011/pets/20000000-0000-0000-0000-000000000011/profile/photo.jpg',
  'Owner lists only storage assets in the owned household'
);
select is(
  (public.reset_my_cloud_data() ->> 'householdsDeleted')::integer,
  1,
  'Owner resets the owned household'
);

reset role;
select is((select count(*) from public.pets where id = '20000000-0000-0000-0000-000000000011'), 0::bigint, 'Owned pet is deleted by cascade');
select is((select count(*) from public.activities where pet_id = '20000000-0000-0000-0000-000000000011'), 0::bigint, 'Owned activities are deleted by cascade');
select is((select count(*) from public.profiles where id = '00000000-0000-0000-0000-000000000011'), 1::bigint, 'Auth profile remains active after data reset');
select is((select count(*) from public.pets where id = '20000000-0000-0000-0000-000000000013'), 1::bigint, 'Another account pet remains untouched');

select * from finish();
rollback;
