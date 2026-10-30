-- Technician assignment and limited status updates.
create or replace function public.fieldforce_list_team(p_org uuid)
returns table(user_id uuid,email text,member_role text)
language sql stable security invoker set search_path=''
as $$
 select m.user_id, u.email::text, m.role
 from fieldforce.memberships m join auth.users u on u.id=m.user_id
 where m.organization_id=p_org and fieldforce_private.my_role(p_org) in ('owner','admin')
 order by u.email;
$$;
-- Direct auth.users access is not granted to authenticated; use a protected private helper.
create or replace function fieldforce_private.list_team(p_org uuid)
returns table(user_id uuid,email text,member_role text)
language sql stable security definer set search_path=''
as $$
 select m.user_id,u.email::text,m.role from fieldforce.memberships m
 join auth.users u on u.id=m.user_id
 where m.organization_id=p_org and (select fieldforce_private.my_role(p_org)) in ('owner','admin')
 order by u.email;
$$;
revoke all on function fieldforce_private.list_team(uuid) from public,anon;
grant execute on function fieldforce_private.list_team(uuid) to authenticated;
create or replace function public.fieldforce_list_team(p_org uuid)
returns table(user_id uuid,email text,member_role text)
language sql stable security invoker set search_path=''
as $$select * from fieldforce_private.list_team(p_org)$$;

create or replace function public.fieldforce_assign_technician(p_org uuid,p_order uuid,p_technician uuid)
returns boolean language plpgsql security invoker set search_path=''
as $$
declare inserted int;
begin
 if fieldforce_private.my_role(p_org) not in ('owner','admin')
 or not exists(select 1 from fieldforce.memberships m
    where m.organization_id=p_org and m.user_id=p_technician and m.role='technician') then
 raise exception 'not authorized' using errcode='42501';end if;
 insert into fieldforce.work_order_assignments(organization_id,work_order_id,technician_id)
 values(p_org,p_order,p_technician) on conflict do nothing;
 get diagnostics inserted=row_count;
 return inserted=1;
end $$;

create or replace function public.fieldforce_my_work_orders(p_org uuid)
returns table(id uuid,title text,status text,priority text,customer_name text)
language sql stable security invoker set search_path=''
as $$
 select w.id,w.title,w.status,w.priority,c.name
 from fieldforce.work_order_assignments a
 join fieldforce.work_orders w on w.id=a.work_order_id and w.organization_id=a.organization_id
 join fieldforce.customers c on c.id=w.customer_id and c.organization_id=w.organization_id
 where a.organization_id=p_org and a.technician_id=(select auth.uid())
 order by w.created_at desc limit 200;
$$;

create or replace function fieldforce_private.technician_change_status(p_org uuid,p_order uuid,p_status text)
returns boolean language plpgsql security definer set search_path=''
as $$
declare changed int;
begin
 if (select auth.uid()) is null or fieldforce_private.my_role(p_org)<>'technician'
 or p_status is null or p_status not in ('in_progress','completed')
 or not exists(select 1 from fieldforce.work_order_assignments a
 where a.organization_id=p_org and a.work_order_id=p_order and a.technician_id=(select auth.uid())) then
 raise exception 'not authorized' using errcode='42501';end if;
 update fieldforce.work_orders set status=p_status,closed_at=case when p_status='completed' then now() else null end, updated_at=now()
 where organization_id=p_org and id=p_order and status not in ('completed','cancelled');
 get diagnostics changed=row_count;
 return changed=1;
end $$;
revoke all on function fieldforce_private.technician_change_status(uuid,uuid,text) from public,anon;
grant execute on function fieldforce_private.technician_change_status(uuid,uuid,text) to authenticated;
create or replace function public.fieldforce_technician_change_status(p_org uuid,p_order uuid,p_status text)
returns boolean language sql security invoker set search_path=''
as $$select fieldforce_private.technician_change_status(p_org,p_order,p_status)$$;
revoke all on function public.fieldforce_list_team(uuid),public.fieldforce_assign_technician(uuid,uuid,uuid),public.fieldforce_my_work_orders(uuid),public.fieldforce_technician_change_status(uuid,uuid,text) from public,anon;
grant execute on function public.fieldforce_list_team(uuid),public.fieldforce_assign_technician(uuid,uuid,uuid),public.fieldforce_my_work_orders(uuid),public.fieldforce_technician_change_status(uuid,uuid,text) to authenticated;
