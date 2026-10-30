-- Least privilege: technicians see only orders assigned to them,
-- and customers referenced by those assignments. Owners/admins see the tenant.
create or replace function fieldforce_private.is_assigned(p_org uuid,p_order uuid)
returns boolean language sql stable security definer set search_path=''
as $$
select exists(select 1 from fieldforce.work_order_assignments a
 where a.organization_id=p_org and a.work_order_id=p_order
 and a.technician_id=(select auth.uid()));
$$;
revoke all on function fieldforce_private.is_assigned(uuid,uuid) from public,anon;
grant execute on function fieldforce_private.is_assigned(uuid,uuid) to authenticated;

drop policy work_orders_member_select on fieldforce.work_orders;
create policy work_orders_scoped_select on fieldforce.work_orders
 for select to authenticated
 using (fieldforce_private.my_role(organization_id) in ('owner','admin')
        or fieldforce_private.is_assigned(organization_id,id));

drop policy customers_member_select on fieldforce.customers;
create policy customers_scoped_select on fieldforce.customers
 for select to authenticated
 using (
 fieldforce_private.my_role(organization_id) in ('owner','admin')
 or exists (
 select 1 from fieldforce.work_orders w
 where w.organization_id=customers.organization_id and w.customer_id=customers.id
 and fieldforce_private.is_assigned(w.organization_id,w.id)
 ));
