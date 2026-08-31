insert into storage.buckets(id, name, public, file_size_limit)
values ('pet-documents', 'pet-documents', false, 8388608)
on conflict (id) do update set
  public = false,
  file_size_limit = excluded.file_size_limit;

create or replace function private.storage_path_household(object_name text)
returns uuid
language plpgsql
stable
security invoker
set search_path = ''
as $$
begin
  if split_part(object_name, '/', 1) <> 'households' then return null; end if;
  return split_part(object_name, '/', 2)::uuid;
exception when invalid_text_representation then
  return null;
end;
$$;

create or replace function private.storage_path_pet(object_name text)
returns uuid
language plpgsql
stable
security invoker
set search_path = ''
as $$
begin
  if split_part(object_name, '/', 3) <> 'pets' then return null; end if;
  return split_part(object_name, '/', 4)::uuid;
exception when invalid_text_representation then
  return null;
end;
$$;

create or replace function private.can_access_pet_document(
  object_name text,
  requested_action text default 'health'
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.pets p
    where p.id = private.storage_path_pet(object_name)
      and p.household_id = private.storage_path_household(object_name)
      and private.can_access_pet(p.id, requested_action)
  );
$$;

revoke all on function private.storage_path_household(text) from public, anon;
revoke all on function private.storage_path_pet(text) from public, anon;
revoke all on function private.can_access_pet_document(text, text) from public, anon;
grant execute on function private.storage_path_household(text) to authenticated;
grant execute on function private.storage_path_pet(text) to authenticated;
grant execute on function private.can_access_pet_document(text, text) to authenticated;

create policy pet_documents_select_health on storage.objects
  for select to authenticated
  using (
    bucket_id = 'pet-documents'
    and private.can_access_pet_document(name, 'health')
  );
create policy pet_documents_insert_health on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'pet-documents'
    and private.can_access_pet_document(name, 'health')
  );
create policy pet_documents_update_health on storage.objects
  for update to authenticated
  using (
    bucket_id = 'pet-documents'
    and private.can_access_pet_document(name, 'health')
  )
  with check (
    bucket_id = 'pet-documents'
    and private.can_access_pet_document(name, 'health')
  );
create policy pet_documents_delete_owner on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'pet-documents'
    and private.can_access_pet_document(name, 'delete')
  );
