-- T03 hardening: remove SECURITY DEFINER from public Data API RPC.
-- The narrow privileged operation moves to a private, non-exposed schema.
create or replace function fieldforce_private.create_organization(p_name text)
returns uuid language plpgsql security definer set search_path = ''
as $$
declare
  v_user uuid := (select auth.uid());
  v_id uuid;
begin
  if v_user is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;
  if p_name is null or pg_catalog.char_length(pg_catalog.btrim(p_name)) not between 2 and 160 then
    raise exception 'invalid organization name' using errcode = '22023';
  end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(v_user::text, 1));
  if exists (select 1 from fieldforce.memberships where user_id = v_user and role = 'owner') then
    raise exception 'an owner organization already exists' using errcode = '23505';
  end if;
  insert into fieldforce.organizations(name) values (pg_catalog.btrim(p_name)) returning id into v_id;
  insert into fieldforce.memberships(organization_id,user_id,role) values (v_id,v_user,'owner');
  return v_id;
end
$$;
revoke all on function fieldforce_private.create_organization(text) from public, anon;
grant execute on function fieldforce_private.create_organization(text) to authenticated;

create or replace function public.fieldforce_create_organization(p_name text)
returns uuid language sql security invoker set search_path = ''
as $$
  select fieldforce_private.create_organization(p_name);
$$;
revoke all on function public.fieldforce_create_organization(text) from public, anon;
grant execute on function public.fieldforce_create_organization(text) to authenticated;
