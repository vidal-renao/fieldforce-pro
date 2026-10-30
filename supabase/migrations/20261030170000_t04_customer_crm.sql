-- VE-FF-MVP-002 T04: scoped customer CRM RPCs, no global Auth changes.
create or replace function public.fieldforce_get_customer(p_org uuid,p_customer uuid)
returns table(id uuid,name text,email text,phone text,notes text,created_at timestamptz,updated_at timestamptz)
language sql stable security invoker set search_path=''
as $fn$
 select c.id,c.name,c.email,c.phone,c.notes,c.created_at,c.updated_at
 from fieldforce.customers c where c.organization_id=p_org and c.id=p_customer
 limit 1
$fn$;

create or replace function public.fieldforce_customer_orders(p_org uuid,p_customer uuid)
returns table(id uuid,title text,status text,priority text,created_at timestamptz,scheduled_for timestamptz)
language sql stable security invoker set search_path=''
as $fn$
 select w.id,w.title,w.status,w.priority,w.created_at,w.scheduled_for
 from fieldforce.work_orders w
 where w.organization_id=p_org and w.customer_id=p_customer
 order by w.created_at desc limit 100
$fn$;

create or replace function public.fieldforce_update_customer(
 p_org uuid,p_customer uuid,p_name text,p_email text,p_phone text,p_notes text)
returns boolean language plpgsql security invoker set search_path=''
as $fn$
declare changed integer;
begin
 if p_name is null or char_length(btrim(p_name)) not between 1 and 180
 or p_email is not null and (char_length(p_email)>254 or (p_email<>'' and position('@' in p_email)=0))
 or p_phone is not null and char_length(p_phone)>60
 or p_notes is not null and char_length(p_notes)>2000 then
 raise exception 'invalid customer data' using errcode='22023';
 end if;
 update fieldforce.customers
 set name=btrim(p_name),email=nullif(btrim(p_email),''),phone=nullif(btrim(p_phone),''),
 notes=nullif(btrim(p_notes),''),updated_at=now()
 where id=p_customer and organization_id=p_org;
 get diagnostics changed=row_count;
 return changed=1;
end $fn$;
revoke all on function public.fieldforce_get_customer(uuid,uuid),
 public.fieldforce_customer_orders(uuid,uuid),
 public.fieldforce_update_customer(uuid,uuid,text,text,text,text) from public,anon;
grant execute on function public.fieldforce_get_customer(uuid,uuid),
 public.fieldforce_customer_orders(uuid,uuid),
 public.fieldforce_update_customer(uuid,uuid,text,text,text,text) to authenticated;
