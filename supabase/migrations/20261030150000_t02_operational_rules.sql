-- T02 operations: approved single assignee and explicit completion reopening.
-- Apply only after transactional integration QA on a non-production database.
do $$ begin
 if exists(select 1 from fieldforce.work_order_assignments
 group by organization_id,work_order_id having count(*)>1) then
 raise exception 'existing multiple assignees require reconciliation';
 end if;
end $$;
create unique index fieldforce_single_assignee_unique_index
 on fieldforce.work_order_assignments(organization_id,work_order_id);

-- A privileged helper is used only to enforce the business operation atomically.
create or replace function fieldforce_private.reassign_technician(p_org uuid,p_order uuid,p_technician uuid)
returns boolean language plpgsql security definer set search_path=''
as $$
declare v_status text;
begin
 if (select auth.uid()) is null or (select fieldforce_private.my_role(p_org)) not in ('owner','admin')
 or not exists(select 1 from fieldforce.memberships m where m.organization_id=p_org
 and m.user_id=p_technician and m.role='technician') then
 raise exception 'not authorized' using errcode='42501'; end if;
 select status into v_status from fieldforce.work_orders where id=p_order
 and organization_id=p_org for update;
 if not found or v_status in ('completed','cancelled') then
 raise exception 'order unavailable' using errcode='42501'; end if;
 if exists(select 1 from fieldforce.work_order_assignments
 where organization_id=p_org and work_order_id=p_order and technician_id=p_technician) then
 return true;
 end if;
 delete from fieldforce.work_order_assignments where organization_id=p_org and work_order_id=p_order;
 insert into fieldforce.work_order_assignments(organization_id,work_order_id,technician_id)
 values(p_org,p_order,p_technician);
 insert into fieldforce.work_order_events(organization_id,work_order_id,actor_id,event_type)
 values(p_org,p_order,(select auth.uid()),'assigned');
 return true;
end $$;
revoke all on function fieldforce_private.reassign_technician(uuid,uuid,uuid) from public,anon;
grant execute on function fieldforce_private.reassign_technician(uuid,uuid,uuid) to authenticated;

create or replace function public.fieldforce_reassign_technician(p_org uuid,p_order uuid,p_technician uuid)
returns boolean language sql security invoker set search_path=''
as $$select fieldforce_private.reassign_technician(p_org,p_order,p_technician)$$;
revoke all on function public.fieldforce_reassign_technician(uuid,uuid,uuid) from public,anon;
grant execute on function public.fieldforce_reassign_technician(uuid,uuid,uuid) to authenticated;

-- Existing UI calls the legacy assignment RPC. Preserve its signature but route
-- all assignment operations through the same atomic one-responsible implementation.
create or replace function public.fieldforce_assign_technician(p_org uuid,p_order uuid,p_technician uuid)
returns boolean language sql security invoker set search_path=''
as $fn$select public.fieldforce_reassign_technician(p_org,p_order,p_technician)$fn$;

-- Disallow invalid transitions even when an admin uses the original public RPC.
create or replace function public.fieldforce_change_order_status(p_org uuid,p_order uuid,p_status text)
returns boolean language plpgsql security invoker set search_path=''
as $$
declare old_status text; allowed boolean;
begin
 if p_status is null or p_status not in ('open','assigned','in_progress','completed','cancelled') then
 raise exception 'invalid status' using errcode='22023';end if;
 select status into old_status from fieldforce.work_orders where id=p_order and organization_id=p_org for update;
 if not found then return false;end if;
 if old_status=p_status then return true;end if;
 allowed:=case old_status
 when 'open' then p_status in ('assigned','in_progress','cancelled')
 when 'assigned' then p_status in ('in_progress','cancelled')
 when 'in_progress' then p_status in ('completed','cancelled')
 else false end;
 if not allowed then raise exception 'invalid transition' using errcode='22023';end if;
 update fieldforce.work_orders set status=p_status,
 closed_at=case when p_status in ('completed','cancelled') then now() else null end,
 updated_at=now() where id=p_order and organization_id=p_org;
 return true;
end $$;

-- Technician can start a job, then complete it, never skip the in-progress state.
create or replace function fieldforce_private.technician_change_status(p_org uuid,p_order uuid,p_status text)
returns boolean language plpgsql security definer set search_path=''
as $$
declare old_status text;
begin
 if (select auth.uid()) is null or (select fieldforce_private.my_role(p_org))<>'technician'
 or p_status not in ('in_progress','completed')
 or not exists(select 1 from fieldforce.work_order_assignments a where a.organization_id=p_org
 and a.work_order_id=p_order and a.technician_id=(select auth.uid())) then
 raise exception 'not authorized' using errcode='42501';end if;
 select status into old_status from fieldforce.work_orders where id=p_order and organization_id=p_org for update;
 if not found or old_status in ('completed','cancelled') then return false; end if;
 if old_status=p_status then return true; end if;
 if not ((old_status in ('open','assigned') and p_status='in_progress')
 or (old_status='in_progress' and p_status='completed')) then
 raise exception 'invalid technician transition' using errcode='22023';end if;
 update fieldforce.work_orders set status=p_status,
 closed_at=case when p_status='completed' then now() else null end,
 updated_at=now() where organization_id=p_org and id=p_order;
 return true;
end $$;

alter table fieldforce.work_order_events add column if not exists reason text;

-- Reopen is never implicit in the generic status function.
create or replace function fieldforce_private.reopen_order(p_org uuid,p_order uuid,p_reason text)
returns boolean language plpgsql security definer set search_path=''
as $$
declare current_status text;
begin
 if (select auth.uid()) is null or (select fieldforce_private.my_role(p_org)) not in ('owner','admin')
 or p_reason is null or pg_catalog.char_length(pg_catalog.btrim(p_reason)) not between 5 and 500 then
 raise exception 'not authorized or invalid reason' using errcode='42501';end if;
 select status into current_status from fieldforce.work_orders where id=p_order
 and organization_id=p_org for update;
 if not found or current_status<>'completed' then
 raise exception 'only completed orders may reopen' using errcode='22023';end if;
 update fieldforce.work_orders set status='open',closed_at=null,updated_at=now()
 where id=p_order and organization_id=p_org;
 -- The existing status-change trigger logs the transition with actor.
 insert into fieldforce.work_order_events(organization_id,work_order_id,actor_id,event_type,reason,old_status,new_status)
 values(p_org,p_order,(select auth.uid()),'updated',pg_catalog.btrim(p_reason),'completed','open');
 return true;
end $$;
revoke all on function fieldforce_private.reopen_order(uuid,uuid,text) from public,anon;
grant execute on function fieldforce_private.reopen_order(uuid,uuid,text) to authenticated;
create or replace function public.fieldforce_reopen_order(p_org uuid,p_order uuid,p_reason text)
returns boolean language sql security invoker set search_path=''
as $$select fieldforce_private.reopen_order(p_org,p_order,p_reason)$$;
revoke all on function public.fieldforce_reopen_order(uuid,uuid,text) from public,anon;
grant execute on function public.fieldforce_reopen_order(uuid,uuid,text) to authenticated;
