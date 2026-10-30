-- T03: token-based invitations. Tokens are random and stored only as SHA-256 hashes.
-- No email-directory lookup: an invite can be issued without knowing auth.users.
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
  constraint invitation_acceptance_consistency check ((accepted_at is null) = (accepted_by is null))
);
create index invitations_org_pending_idx on fieldforce.invitations(organization_id,expires_at) where accepted_at is null;
alter table fieldforce.invitations enable row level security;
revoke all on fieldforce.invitations from public, anon, authenticated;

create or replace function public.fieldforce_issue_invitation(p_org uuid, p_email text, p_role text)
returns text language plpgsql security definer set search_path = ''
as $$
declare
  v_user uuid := (select auth.uid());
  v_token text;
  v_email text := pg_catalog.lower(pg_catalog.btrim(p_email));
begin
  if v_user is null or fieldforce_private.my_role(p_org) not in ('owner','admin') then
    raise exception 'not authorized to invite' using errcode = '42501';
  end if;
  if v_email is null or pg_catalog.char_length(v_email) not between 3 and 254
    or pg_catalog.position('@' in v_email) <= 1
    or p_role not in ('admin','technician') then
    raise exception 'invalid invitation' using errcode = '22023';
  end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_org::text, 3));
  if (select count(*) from fieldforce.invitations
       where organization_id = p_org and accepted_at is null and expires_at > now()) >= 25 then
    raise exception 'too many pending invitations' using errcode = '22023';
  end if;
  v_token := pg_catalog.replace(pg_catalog.gen_random_uuid()::text, '-', '');
  insert into fieldforce.invitations(organization_id,email,role,token_hash,issued_by)
  values (p_org,v_email,p_role,pg_catalog.sha256(pg_catalog.convert_to(v_token,'UTF8')),v_user);
  return v_token;
end
$$;
revoke all on function public.fieldforce_issue_invitation(uuid,text,text) from public, anon;
grant execute on function public.fieldforce_issue_invitation(uuid,text,text) to authenticated;

create or replace function public.fieldforce_accept_invitation(p_token text)
returns uuid language plpgsql security definer set search_path = ''
as $$
declare
  v_user uuid := (select auth.uid());
  v_inv fieldforce.invitations%rowtype;
  v_email text;
begin
  if v_user is null or p_token is null or pg_catalog.char_length(p_token) <> 32 then
    raise exception 'invalid invitation' using errcode = '42501';
  end if;
  select pg_catalog.lower(email) into v_email from auth.users
   where id = v_user and email_confirmed_at is not null;
  if v_email is null then
    raise exception 'verified email required' using errcode = '42501';
  end if;
  select * into v_inv from fieldforce.invitations
   where token_hash = pg_catalog.sha256(pg_catalog.convert_to(p_token,'UTF8'))
     and accepted_at is null and expires_at > now() for update;
  if not found or v_inv.email <> v_email then
    raise exception 'invalid invitation' using errcode = '42501';
  end if;
  insert into fieldforce.memberships(organization_id,user_id,role)
   values (v_inv.organization_id,v_user,v_inv.role);
  update fieldforce.invitations set accepted_at=now(),accepted_by=v_user where id=v_inv.id;
  return v_inv.organization_id;
end
$$;
revoke all on function public.fieldforce_accept_invitation(text) from public, anon;
grant execute on function public.fieldforce_accept_invitation(text) to authenticated;
