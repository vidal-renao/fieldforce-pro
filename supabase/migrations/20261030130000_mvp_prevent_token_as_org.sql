-- Prevent pasting 32-character invitation tokens into company name field.
-- Invitations are consumed only at /[locale]/invitation.
create or replace function fieldforce_private.create_organization(p_name text)
returns uuid language plpgsql security definer set search_path=''
as $$
declare v_user uuid := (select auth.uid()); v_id uuid; v_name text := pg_catalog.btrim(p_name);
begin
 if v_user is null then raise exception 'authentication required' using errcode='42501'; end if;
 if v_name is null or pg_catalog.char_length(v_name) not between 2 and 160
   or v_name ~ '^[0-9a-fA-F]{32}$' then
   raise exception 'invalid organization name' using errcode='22023';
 end if;
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(v_user::text,1));
 if exists(select 1 from fieldforce.memberships where user_id=v_user and role='owner') then
   raise exception 'an owner organization already exists' using errcode='23505';
 end if;
 insert into fieldforce.organizations(name) values(v_name) returning id into v_id;
 insert into fieldforce.memberships(organization_id,user_id,role) values(v_id,v_user,'owner');
 return v_id;
end $$;
revoke all on function fieldforce_private.create_organization(text) from public, anon;
grant execute on function fieldforce_private.create_organization(text) to authenticated;
