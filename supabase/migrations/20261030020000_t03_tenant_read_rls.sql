-- T03. Private tenant authorization: deny anonymous and prevent cross-organization reads.
-- This is a permission migration; users and organizations are provisioned only by trusted server flow.
create schema if not exists fieldforce_private;
revoke all on schema fieldforce_private from public, anon, authenticated;
grant usage on schema fieldforce_private to authenticated;

create or replace function fieldforce_private.my_role(p_organization_id uuid)
returns text language sql stable security definer
set search_path = ''
as $$
  select m.role from fieldforce.memberships m
  where m.organization_id = p_organization_id
    and m.user_id = (select auth.uid())
  limit 1
$$;
revoke all on function fieldforce_private.my_role(uuid) from public, anon;
grant execute on function fieldforce_private.my_role(uuid) to authenticated;

-- Do not expose fieldforce via PostgREST by default; grants allow future server-side
-- clients to use standard authenticated RLS without bypassing authorization.
grant usage on schema fieldforce to authenticated;
grant select on all tables in schema fieldforce to authenticated;

create policy organizations_member_select on fieldforce.organizations
  for select to authenticated
  using (fieldforce_private.my_role(id) is not null);
create policy memberships_member_select on fieldforce.memberships
  for select to authenticated
  using (fieldforce_private.my_role(organization_id) is not null);
create policy customers_member_select on fieldforce.customers
  for select to authenticated
  using (fieldforce_private.my_role(organization_id) is not null);
create policy work_orders_member_select on fieldforce.work_orders
  for select to authenticated
  using (fieldforce_private.my_role(organization_id) is not null);
create policy work_order_assignments_member_select on fieldforce.work_order_assignments
  for select to authenticated
  using (fieldforce_private.my_role(organization_id) is not null);
create policy work_order_events_member_select on fieldforce.work_order_events
  for select to authenticated
  using (fieldforce_private.my_role(organization_id) is not null);

-- Write permissions intentionally withheld until role-scoped mutation and
-- safe organization onboarding have transaction-level integration tests.
