-- T03: controlled first-owner provisioning through a narrow public RPC.
-- Public API function must never trust user metadata or tenant IDs provided by clients.
create or replace function public.fieldforce_create_organization(p_name text)
returns uuid
language plpgsql
security definer
set search_path = ''
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
  -- Concurrent requests for the same user must not create duplicate owner organizations.
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(v_user::text, 1));
  if exists (select 1 from fieldforce.memberships where user_id = v_user and role = 'owner') then
    raise exception 'an owner organization already exists' using errcode = '23505';
  end if;
  insert into fieldforce.organizations(name)
  values (pg_catalog.btrim(p_name))
  returning id into v_id;
  insert into fieldforce.memberships(organization_id,user_id,role)
  values (v_id,v_user,'owner');
  return v_id;
end
$$;
revoke all on function public.fieldforce_create_organization(text) from public, anon;
grant execute on function public.fieldforce_create_organization(text) to authenticated;

-- Reads are SECURITY INVOKER: caller's RLS stays enforced.
create or replace function public.fieldforce_my_organizations()
returns table(organization_id uuid, organization_name text, member_role text)
language sql stable security invoker
set search_path = ''
as $$
 select o.id, o.name, m.role
 from fieldforce.memberships m join fieldforce.organizations o on o.id = m.organization_id
 where m.user_id = (select auth.uid())
 order by o.created_at;
$$;
revoke all on function public.fieldforce_my_organizations() from public, anon;
grant execute on function public.fieldforce_my_organizations() to authenticated;
