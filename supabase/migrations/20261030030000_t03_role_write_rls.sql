-- FieldForce Pro T03 continuation. Restrict writes to owners and admins.
-- Do NOT expose fieldforce in PostgREST until client authentication is wired.
grant insert, update on fieldforce.customers, fieldforce.work_orders to authenticated;
grant insert on fieldforce.work_order_assignments to authenticated;
grant delete on fieldforce.work_order_assignments to authenticated;

create policy customers_admin_insert on fieldforce.customers
 for insert to authenticated with check (fieldforce_private.my_role(organization_id) in ('owner','admin'));
create policy customers_admin_update on fieldforce.customers
 for update to authenticated using (fieldforce_private.my_role(organization_id) in ('owner','admin'))
 with check (fieldforce_private.my_role(organization_id) in ('owner','admin'));
create policy work_orders_admin_insert on fieldforce.work_orders
 for insert to authenticated with check (fieldforce_private.my_role(organization_id) in ('owner','admin'));
create policy work_orders_admin_update on fieldforce.work_orders
 for update to authenticated using (fieldforce_private.my_role(organization_id) in ('owner','admin'))
 with check (fieldforce_private.my_role(organization_id) in ('owner','admin'));
create policy assignments_admin_insert on fieldforce.work_order_assignments
 for insert to authenticated with check (fieldforce_private.my_role(organization_id) in ('owner','admin'));
create policy assignments_admin_delete on fieldforce.work_order_assignments
 for delete to authenticated using (fieldforce_private.my_role(organization_id) in ('owner','admin'));

-- Prevent tenant reassignment for updatable records even when another tenant admin.
create or replace function fieldforce_private.reject_tenant_reassignment()
returns trigger language plpgsql set search_path = '' as $$
begin
 if old.organization_id is distinct from new.organization_id then
  raise exception 'tenant reassignment is forbidden' using errcode = '42501';
 end if;
 return new;
end;
$$;
revoke all on function fieldforce_private.reject_tenant_reassignment() from public, anon, authenticated;
create trigger customers_reject_tenant_reassignment
 before update on fieldforce.customers for each row execute function fieldforce_private.reject_tenant_reassignment();
create trigger work_orders_reject_tenant_reassignment
 before update on fieldforce.work_orders for each row execute function fieldforce_private.reject_tenant_reassignment();
