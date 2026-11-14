-- VE-FF-PREMIUM-001 Phase 1: fail closed when tenant membership is absent.
-- Local migration only. Do not apply to the shared hosted project without a
-- separate deployment approval and isolated PostgreSQL verification.

create or replace function fieldforce_private.issue_invitation(
  p_org uuid,
  p_email text,
  p_role text
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  u uuid := (select auth.uid());
  mail text := pg_catalog.lower(pg_catalog.btrim(p_email));
  token text;
begin
  if u is null
     or ((select fieldforce_private.my_role(p_org)) in ('owner','admin')) is not true then
    raise exception 'not authorized' using errcode = '42501';
  end if;
  if mail is null or pg_catalog.char_length(mail) not between 3 and 254
     or pg_catalog.strpos(mail,'@') <= 1
     or p_role is null or p_role not in ('admin','technician') then
    raise exception 'invalid invitation' using errcode = '22023';
  end if;
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(p_org::text,3)
  );
  if (select count(*)
      from fieldforce.invitations
      where organization_id = p_org
        and accepted_at is null
        and expires_at > now()) >= 25 then
    raise exception 'invitation quota reached' using errcode = '22023';
  end if;
  token := pg_catalog.replace(gen_random_uuid()::text,'-','');
  insert into fieldforce.invitations(
    organization_id,
    email,
    role,
    token_hash,
    issued_by
  ) values (
    p_org,
    mail,
    p_role,
    pg_catalog.sha256(pg_catalog.convert_to(token,'UTF8')),
    u
  );
  return token;
end
$$;

create or replace function fieldforce_private.reassign_technician(
  p_org uuid,
  p_order uuid,
  p_technician uuid
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_status text;
begin
  if (select auth.uid()) is null
     or ((select fieldforce_private.my_role(p_org)) in ('owner','admin')) is not true
     or not exists (
       select 1
       from fieldforce.memberships m
       where m.organization_id = p_org
         and m.user_id = p_technician
         and m.role = 'technician'
     ) then
    raise exception 'not authorized' using errcode = '42501';
  end if;
  select status
    into v_status
    from fieldforce.work_orders
   where id = p_order
     and organization_id = p_org
   for update;
  if not found or v_status in ('completed','cancelled') then
    raise exception 'order unavailable' using errcode = '42501';
  end if;
  if exists (
    select 1
    from fieldforce.work_order_assignments
    where organization_id = p_org
      and work_order_id = p_order
      and technician_id = p_technician
  ) then
    return true;
  end if;
  delete from fieldforce.work_order_assignments
   where organization_id = p_org
     and work_order_id = p_order;
  insert into fieldforce.work_order_assignments(
    organization_id,
    work_order_id,
    technician_id
  ) values (p_org,p_order,p_technician);
  insert into fieldforce.work_order_events(
    organization_id,
    work_order_id,
    actor_id,
    event_type
  ) values (p_org,p_order,(select auth.uid()),'assigned');
  return true;
end
$$;

create or replace function fieldforce_private.reopen_order(
  p_org uuid,
  p_order uuid,
  p_reason text
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_status text;
begin
  if (select auth.uid()) is null
     or ((select fieldforce_private.my_role(p_org)) in ('owner','admin')) is not true
     or p_reason is null
     or pg_catalog.char_length(pg_catalog.btrim(p_reason)) not between 5 and 500 then
    raise exception 'not authorized or invalid reason' using errcode = '42501';
  end if;
  select status
    into current_status
    from fieldforce.work_orders
   where id = p_order
     and organization_id = p_org
   for update;
  if not found or current_status <> 'completed' then
    raise exception 'only completed orders may reopen' using errcode = '22023';
  end if;
  update fieldforce.work_orders
     set status = 'open',
         closed_at = null,
         updated_at = now()
   where id = p_order
     and organization_id = p_org;
  insert into fieldforce.work_order_events(
    organization_id,
    work_order_id,
    actor_id,
    event_type,
    reason,
    old_status,
    new_status
  ) values (
    p_org,
    p_order,
    (select auth.uid()),
    'updated',
    pg_catalog.btrim(p_reason),
    'completed',
    'open'
  );
  return true;
end
$$;
