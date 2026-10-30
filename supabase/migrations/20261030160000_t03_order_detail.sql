-- T03: targeted work order query; caller permissions enforced by existing tenant RLS.
create or replace function public.fieldforce_get_order(p_org uuid,p_order uuid)
returns table(id uuid,title text,status text,priority text,customer_name text,scheduled_for timestamptz,created_at timestamptz)
language sql stable security invoker set search_path=''
as $function$
 select w.id,w.title,w.status,w.priority,c.name,w.scheduled_for,w.created_at
 from fieldforce.work_orders w
 join fieldforce.customers c on c.id=w.customer_id and c.organization_id=w.organization_id
 where w.organization_id=p_org and w.id=p_order
 limit 1
$function$;
revoke all on function public.fieldforce_get_order(uuid,uuid) from public,anon;
grant execute on function public.fieldforce_get_order(uuid,uuid) to authenticated;
