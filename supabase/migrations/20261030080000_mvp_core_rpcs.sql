-- MVP CRUD via narrow PostgREST RPCs; no direct exposure of private schema.
-- AUTHORIZATION: every call runs as the authenticated user, with underlying RLS.
create or replace function public.fieldforce_list_customers(p_org uuid)
returns table(id uuid,name text,email text,phone text)
language sql stable security invoker set search_path=''
as $$
 select c.id,c.name,c.email,c.phone from fieldforce.customers c
 where c.organization_id=p_org order by c.name limit 200;
$$;
create or replace function public.fieldforce_list_orders(p_org uuid)
returns table(id uuid,title text,status text,priority text,customer_name text,scheduled_for timestamptz,created_at timestamptz)
language sql stable security invoker set search_path=''
as $$
 select w.id,w.title,w.status,w.priority,c.name,w.scheduled_for,w.created_at
 from fieldforce.work_orders w join fieldforce.customers c
 on c.id=w.customer_id and c.organization_id=w.organization_id
 where w.organization_id=p_org order by w.created_at desc limit 200;
$$;
create or replace function public.fieldforce_create_customer(p_org uuid,p_name text,p_email text default null,p_phone text default null)
returns uuid language plpgsql security invoker set search_path=''
as $$
declare v_id uuid;
begin
 if p_name is null or pg_catalog.char_length(pg_catalog.btrim(p_name)) not between 1 and 180 then
 raise exception 'invalid customer name' using errcode='22023';end if;
 if p_email is not null and pg_catalog.char_length(p_email)>254 then
 raise exception 'invalid email length' using errcode='22023';end if;
 if p_phone is not null and pg_catalog.char_length(p_phone)>60 then
 raise exception 'invalid phone length' using errcode='22023';end if;
 insert into fieldforce.customers(organization_id,name,email,phone)
 values(p_org,pg_catalog.btrim(p_name),nullif(pg_catalog.btrim(p_email),''),nullif(pg_catalog.btrim(p_phone),''))
 returning id into v_id;return v_id;
end $$;
create or replace function public.fieldforce_create_order(p_org uuid,p_customer uuid,p_title text,p_priority text default 'normal')
returns uuid language plpgsql security invoker set search_path=''
as $$
declare v_id uuid;
begin
 if p_title is null or pg_catalog.char_length(pg_catalog.btrim(p_title)) not between 1 and 200
 or p_priority is null or p_priority not in ('low','normal','high','urgent') then
 raise exception 'invalid work order' using errcode='22023';end if;
 insert into fieldforce.work_orders(organization_id,customer_id,title,priority)
 values(p_org,p_customer,pg_catalog.btrim(p_title),p_priority)
 returning id into v_id;return v_id;
end $$;
create or replace function public.fieldforce_change_order_status(p_org uuid,p_order uuid,p_status text)
returns boolean language plpgsql security invoker set search_path=''
as $$
declare v_count int;
begin
 if p_status is null or p_status not in ('open','assigned','in_progress','completed','cancelled') then
 raise exception 'invalid status' using errcode='22023';end if;
 update fieldforce.work_orders
 set status=p_status,
 closed_at=case when p_status in ('completed','cancelled') then now() else null end,
 updated_at=now()
 where id=p_order and organization_id=p_org;
 get diagnostics v_count=row_count;
 return v_count=1;
end $$;
revoke all on function public.fieldforce_list_customers(uuid),public.fieldforce_list_orders(uuid),public.fieldforce_create_customer(uuid,text,text,text),public.fieldforce_create_order(uuid,uuid,text,text),public.fieldforce_change_order_status(uuid,uuid,text) from public,anon;
grant execute on function public.fieldforce_list_customers(uuid),public.fieldforce_list_orders(uuid),public.fieldforce_create_customer(uuid,text,text,text),public.fieldforce_create_order(uuid,uuid,text,text),public.fieldforce_change_order_status(uuid,uuid,text) to authenticated;
