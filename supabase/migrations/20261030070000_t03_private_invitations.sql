-- T03 private invitation workflow, shared Supabase Auth. No global Auth config changes.
create table fieldforce.invitations (
 id uuid primary key default gen_random_uuid(),
 organization_id uuid not null references fieldforce.organizations(id) on delete cascade,
 email text not null check (char_length(email) between 3 and 254),
 role text not null check (role in ('admin','technician')),
 token_hash bytea not null unique,
 issued_by uuid not null references auth.users(id),
 created_at timestamptz not null default now(),
 expires_at timestamptz not null default (now() + interval '7 days'),
 accepted_at timestamptz,
 accepted_by uuid references auth.users(id),
 constraint acceptance_pair check ((accepted_at is null) = (accepted_by is null))
);
alter table fieldforce.invitations enable row level security;
revoke all on fieldforce.invitations from public, anon, authenticated;
create index fieldforce_invites_pending_idx on fieldforce.invitations(organization_id,expires_at) where accepted_at is null;

create or replace function fieldforce_private.issue_invitation(p_org uuid,p_email text,p_role text)
returns text language plpgsql security definer set search_path = ''
as $$
declare
 u uuid := (select auth.uid());
 mail text := pg_catalog.lower(pg_catalog.btrim(p_email));
 token text;
begin
 if u is null or (select m.role from fieldforce.memberships m where m.organization_id=p_org and m.user_id=u) not in ('owner','admin') then
   raise exception 'not authorized' using errcode='42501';
 end if;
 if mail is null or pg_catalog.char_length(mail) not between 3 and 254 or pg_catalog.strpos(mail,'@') <= 1
    or p_role is null or p_role not in ('admin','technician') then
   raise exception 'invalid invitation' using errcode='22023';
 end if;
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_org::text,3));
 if (select count(*) from fieldforce.invitations where organization_id=p_org and accepted_at is null and expires_at>now()) >= 25 then
   raise exception 'invitation quota reached' using errcode='22023';
 end if;
 token := pg_catalog.replace(gen_random_uuid()::text,'-','');
 insert into fieldforce.invitations(organization_id,email,role,token_hash,issued_by)
 values(p_org,mail,p_role,pg_catalog.sha256(pg_catalog.convert_to(token,'UTF8')),u);
 return token;
end $$;
revoke all on function fieldforce_private.issue_invitation(uuid,text,text) from public, anon;
grant execute on function fieldforce_private.issue_invitation(uuid,text,text) to authenticated;

create or replace function public.fieldforce_issue_invitation(p_org uuid,p_email text,p_role text)
returns text language sql security invoker set search_path=''
as $$select fieldforce_private.issue_invitation(p_org,p_email,p_role)$$;
revoke all on function public.fieldforce_issue_invitation(uuid,text,text) from public, anon;
grant execute on function public.fieldforce_issue_invitation(uuid,text,text) to authenticated;

create or replace function fieldforce_private.accept_invitation(p_token text)
returns uuid language plpgsql security definer set search_path=''
as $$
declare
 u uuid := (select auth.uid());
 verified_email text;
 invitation fieldforce.invitations%rowtype;
begin
 if u is null or p_token is null or pg_catalog.char_length(p_token) <> 32
    or p_token !~ '^[0-9a-f]{32}$' then
   raise exception 'invalid invitation' using errcode='42501';
 end if;
 select pg_catalog.lower(email) into verified_email from auth.users
 where id=u and email_confirmed_at is not null;
 if verified_email is null then
   raise exception 'verified email required' using errcode='42501';
 end if;
 select * into invitation from fieldforce.invitations
 where token_hash=pg_catalog.sha256(pg_catalog.convert_to(p_token,'UTF8'))
   and accepted_at is null and expires_at > now() for update;
 if not found or invitation.email<>verified_email then
   raise exception 'invalid invitation' using errcode='42501';
 end if;
 insert into fieldforce.memberships(organization_id,user_id,role)
 values(invitation.organization_id,u,invitation.role);
 update fieldforce.invitations set accepted_at=now(),accepted_by=u where id=invitation.id;
 return invitation.organization_id;
end $$;
revoke all on function fieldforce_private.accept_invitation(text) from public, anon;
grant execute on function fieldforce_private.accept_invitation(text) to authenticated;

create or replace function public.fieldforce_accept_invitation(p_token text)
returns uuid language sql security invoker set search_path=''
as $$select fieldforce_private.accept_invitation(p_token)$$;
revoke all on function public.fieldforce_accept_invitation(text) from public, anon;
grant execute on function public.fieldforce_accept_invitation(text) to authenticated;
