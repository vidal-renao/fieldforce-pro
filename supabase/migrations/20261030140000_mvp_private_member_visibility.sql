-- Finish least-privilege technician visibility of people, assignments and audit entries.
drop policy memberships_member_select on fieldforce.memberships;
create policy memberships_scoped_select on fieldforce.memberships
for select to authenticated
using (user_id=(select auth.uid()) or fieldforce_private.my_role(organization_id) in ('owner','admin'));

drop policy work_order_assignments_member_select on fieldforce.work_order_assignments;
create policy assignments_scoped_select on fieldforce.work_order_assignments
for select to authenticated
using (technician_id=(select auth.uid()) or fieldforce_private.my_role(organization_id) in ('owner','admin'));

drop policy work_order_events_member_select on fieldforce.work_order_events;
create policy events_scoped_select on fieldforce.work_order_events
for select to authenticated
using (fieldforce_private.my_role(organization_id) in ('owner','admin') or fieldforce_private.is_assigned(organization_id,work_order_id));
