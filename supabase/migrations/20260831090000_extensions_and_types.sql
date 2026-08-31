create extension if not exists pgcrypto with schema extensions;

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create type public.member_role as enum ('owner', 'family', 'caregiver');
create type public.membership_status as enum ('invited', 'active', 'revoked');
create type public.pet_species as enum ('cane', 'gatto');
create type public.pet_life_phase as enum ('cucciolo', 'adulto', 'senior');
create type public.walk_status as enum ('in_progress', 'completed', 'discarded');
create type public.medication_log_status as enum ('scheduled', 'administered', 'skipped');
create type public.migration_status as enum ('pending', 'completed', 'failed', 'rolled_back');
create type public.content_progress_type as enum ('quiz', 'trick', 'badge');
