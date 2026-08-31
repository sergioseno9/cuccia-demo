create policy travel_plans_select_family on public.travel_plans
  for select to authenticated
  using (private.can_manage_travel(household_id));
create policy travel_plans_insert_family on public.travel_plans
  for insert to authenticated
  with check (
    private.can_manage_travel(household_id)
    and created_by = (select auth.uid())
  );
create policy travel_plans_update_family on public.travel_plans
  for update to authenticated
  using (private.can_manage_travel(household_id))
  with check (private.can_manage_travel(household_id));
create policy travel_plans_delete_owner on public.travel_plans
  for delete to authenticated
  using (private.is_household_owner(household_id));

create policy travel_items_select_family on public.travel_items
  for select to authenticated
  using (private.can_manage_travel(household_id));
create policy travel_items_insert_family on public.travel_items
  for insert to authenticated
  with check (private.can_manage_travel(household_id));
create policy travel_items_update_family on public.travel_items
  for update to authenticated
  using (private.can_manage_travel(household_id))
  with check (private.can_manage_travel(household_id));
create policy travel_items_delete_owner on public.travel_items
  for delete to authenticated
  using (private.is_household_owner(household_id));

create policy pet_share_links_select_owner on public.pet_share_links
  for select to authenticated
  using (private.can_access_pet(pet_id, 'share'));
create policy pet_share_links_insert_owner on public.pet_share_links
  for insert to authenticated
  with check (
    private.can_access_pet(pet_id, 'share')
    and created_by = (select auth.uid())
  );
create policy pet_share_links_update_owner on public.pet_share_links
  for update to authenticated
  using (private.can_access_pet(pet_id, 'share'))
  with check (private.can_access_pet(pet_id, 'share'));
create policy pet_share_links_delete_owner on public.pet_share_links
  for delete to authenticated
  using (private.can_access_pet(pet_id, 'share'));

create policy push_tokens_select_self on public.push_tokens
  for select to authenticated
  using (user_id = (select auth.uid()));
create policy push_tokens_insert_self on public.push_tokens
  for insert to authenticated
  with check (user_id = (select auth.uid()));
create policy push_tokens_update_self on public.push_tokens
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
create policy push_tokens_delete_self on public.push_tokens
  for delete to authenticated
  using (user_id = (select auth.uid()));
