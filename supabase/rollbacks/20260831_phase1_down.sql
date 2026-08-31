drop policy if exists pet_documents_select_health on storage.objects;
drop policy if exists pet_documents_insert_health on storage.objects;
drop policy if exists pet_documents_update_health on storage.objects;
drop policy if exists pet_documents_delete_owner on storage.objects;
delete from storage.buckets where id = 'pet-documents';

drop trigger if exists on_auth_user_created on auth.users;

drop table if exists public.pet_content_progress cascade;
drop table if exists public.push_tokens cascade;
drop table if exists public.pet_share_links cascade;
drop table if exists public.milestones cascade;
drop table if exists public.travel_items cascade;
drop table if exists public.travel_plans cascade;
drop table if exists public.documents cascade;
drop table if exists public.reminders cascade;
drop table if exists public.medication_logs cascade;
drop table if exists public.walks cascade;
drop table if exists public.activities cascade;
drop table if exists public.weight_logs cascade;
drop table if exists public.health_events cascade;
drop table if exists public.medications cascade;
drop table if exists public.pet_members cascade;
drop table if exists public.pets cascade;
drop table if exists public.migration_batches cascade;
drop table if exists public.household_invites cascade;
drop table if exists public.household_members cascade;
drop table if exists public.households cascade;
drop table if exists public.profiles cascade;

drop function if exists public.rollback_migration_batch(uuid);
drop function if exists public.complete_migration_batch(uuid, jsonb);
drop function if exists public.begin_migration_batch(uuid, text, jsonb);
drop function if exists public.accept_household_invite(text);
drop function if exists public.create_pet_with_owner(uuid, jsonb, text, uuid);
drop function if exists public.create_household_with_owner(text);
drop schema if exists private cascade;

drop type if exists public.content_progress_type;
drop type if exists public.migration_status;
drop type if exists public.medication_log_status;
drop type if exists public.walk_status;
drop type if exists public.pet_life_phase;
drop type if exists public.pet_species;
drop type if exists public.membership_status;
drop type if exists public.member_role;
