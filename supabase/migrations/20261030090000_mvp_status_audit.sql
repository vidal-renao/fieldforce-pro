-- Append-only work-order status audit, authored by a fixed-search-path trigger.
create or replace function fieldforce_private.log_work_order_event()
returns trigger language plpgsql security definer set search_path=''
as $$
begin
 if tg_op='INSERT' then
  insert into fieldforce.work_order_events(organization_id,work_order_id,actor_id,event_type,new_status)
  values(new.organization_id,new.id,(select auth.uid()),'created',new.status);
 elsif old.status is distinct from new.status then
  insert into fieldforce.work_order_events(organization_id,work_order_id,actor_id,event_type,old_status,new_status)
  values(new.organization_id,new.id,(select auth.uid()),
    case when new.status in ('completed','cancelled') then 'closed' else 'status_changed' end,
    old.status,new.status);
 end if;
 return new;
end $$;
revoke all on function fieldforce_private.log_work_order_event() from public,anon,authenticated;
create trigger fieldforce_work_order_audit
after insert or update of status on fieldforce.work_orders
for each row execute function fieldforce_private.log_work_order_event();
create or replace function public.fieldforce_list_events(p_org uuid,p_order uuid)
returns table(event_type text,old_status text,new_status text,occurred_at timestamptz)
language sql stable security invoker set search_path=''
as $$
 select e.event_type,e.old_status,e.new_status,e.occurred_at
 from fieldforce.work_order_events e where e.organization_id=p_org and e.work_order_id=p_order
 order by e.occurred_at desc limit 100;
$$;
revoke all on function public.fieldforce_list_events(uuid,uuid) from public,anon;
grant execute on function public.fieldforce_list_events(uuid,uuid) to authenticated;
