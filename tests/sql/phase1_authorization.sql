\set ON_ERROR_STOP on

begin;

insert into fieldforce.organizations (id, name)
values ('10000000-0000-0000-0000-000000000001', 'Phase 1 isolated test');

select set_config(
  'request.jwt.claim.sub',
  '20000000-0000-0000-0000-000000000001',
  true
);

do $test$
declare
  v_before_invitations bigint;
  v_before_assignments bigint;
  v_before_events bigint;
  v_state text;
begin
  select count(*) into v_before_invitations from fieldforce.invitations;
  select count(*) into v_before_assignments from fieldforce.work_order_assignments;
  select count(*) into v_before_events from fieldforce.work_order_events;

  begin
    perform fieldforce_private.issue_invitation(
      '10000000-0000-0000-0000-000000000001',
      'nonmember@example.test',
      'technician'
    );
    raise exception 'issue_invitation accepted a non-member';
  exception when others then
    get stacked diagnostics v_state = returned_sqlstate;
    if v_state <> '42501' then
      raise exception 'issue_invitation returned %, expected 42501', v_state;
    end if;
  end;

  begin
    perform fieldforce_private.reassign_technician(
      '10000000-0000-0000-0000-000000000001',
      '30000000-0000-0000-0000-000000000001',
      '40000000-0000-0000-0000-000000000001'
    );
    raise exception 'reassign_technician accepted a non-member';
  exception when others then
    get stacked diagnostics v_state = returned_sqlstate;
    if v_state <> '42501' then
      raise exception 'reassign_technician returned %, expected 42501', v_state;
    end if;
  end;

  begin
    perform fieldforce_private.reopen_order(
      '10000000-0000-0000-0000-000000000001',
      '30000000-0000-0000-0000-000000000001',
      'Valid isolated test reason'
    );
    raise exception 'reopen_order accepted a non-member';
  exception when others then
    get stacked diagnostics v_state = returned_sqlstate;
    if v_state <> '42501' then
      raise exception 'reopen_order returned %, expected 42501', v_state;
    end if;
  end;

  if (select count(*) from fieldforce.invitations) <> v_before_invitations
     or (select count(*) from fieldforce.work_order_assignments) <> v_before_assignments
     or (select count(*) from fieldforce.work_order_events) <> v_before_events then
    raise exception 'denied operations changed persisted domain data';
  end if;
end
$test$;

do $test$
begin
  if has_function_privilege(
    'anon',
    'public.fieldforce_issue_invitation(uuid,text,text)',
    'EXECUTE'
  ) then
    raise exception 'anonymous role can execute the invitation RPC';
  end if;
end
$test$;

insert into fieldforce.organizations (id, name)
values ('10000000-0000-0000-0000-000000000002', 'Other isolated tenant');

insert into auth.users (
  id,
  aud,
  role,
  email,
  email_confirmed_at,
  created_at,
  updated_at
) values
  ('20000000-0000-0000-0000-000000000001', 'authenticated', 'authenticated', 'nonmember@example.test', now(), now(), now()),
  ('20000000-0000-0000-0000-000000000002', 'authenticated', 'authenticated', 'owner@example.test', now(), now(), now()),
  ('20000000-0000-0000-0000-000000000003', 'authenticated', 'authenticated', 'admin@example.test', now(), now(), now()),
  ('20000000-0000-0000-0000-000000000004', 'authenticated', 'authenticated', 'technician-member@example.test', now(), now(), now()),
  ('20000000-0000-0000-0000-000000000005', 'authenticated', 'authenticated', 'other-owner@example.test', now(), now(), now());

insert into fieldforce.memberships (organization_id, user_id, role)
values
  ('10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002', 'owner'),
  ('10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000003', 'admin'),
  ('10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000004', 'technician'),
  ('10000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000005', 'owner');

select set_config(
  'request.jwt.claim.sub',
  '20000000-0000-0000-0000-000000000001',
  true
);

set local role authenticated;

do $test$
declare
  v_state text;
begin
  begin
    perform public.fieldforce_issue_invitation(
      '10000000-0000-0000-0000-000000000001',
      'denied-nonmember@example.test',
      'technician'
    );
    raise exception 'public invitation RPC accepted a non-member';
  exception when others then
    get stacked diagnostics v_state = returned_sqlstate;
    if v_state <> '42501' then
      raise exception 'public invitation RPC returned %, expected 42501', v_state;
    end if;
  end;

  begin
    perform public.fieldforce_reassign_technician(
      '10000000-0000-0000-0000-000000000001',
      '30000000-0000-0000-0000-000000000001',
      '20000000-0000-0000-0000-000000000004'
    );
    raise exception 'public reassignment RPC accepted a non-member';
  exception when others then
    get stacked diagnostics v_state = returned_sqlstate;
    if v_state <> '42501' then
      raise exception 'public reassignment RPC returned %, expected 42501', v_state;
    end if;
  end;

  begin
    perform public.fieldforce_reopen_order(
      '10000000-0000-0000-0000-000000000001',
      '30000000-0000-0000-0000-000000000001',
      'Valid isolated test reason'
    );
    raise exception 'public reopen RPC accepted a non-member';
  exception when others then
    get stacked diagnostics v_state = returned_sqlstate;
    if v_state <> '42501' then
      raise exception 'public reopen RPC returned %, expected 42501', v_state;
    end if;
  end;
end
$test$;

reset role;

select set_config(
  'request.jwt.claim.sub',
  '20000000-0000-0000-0000-000000000004',
  true
);

set local role authenticated;

do $test$
declare
  v_state text;
begin
  begin
    perform public.fieldforce_issue_invitation(
      '10000000-0000-0000-0000-000000000001',
      'denied-technician@example.test',
      'technician'
    );
    raise exception 'invitation RPC accepted a technician';
  exception when others then
    get stacked diagnostics v_state = returned_sqlstate;
    if v_state <> '42501' then
      raise exception 'technician invitation returned %, expected 42501', v_state;
    end if;
  end;
end
$test$;

reset role;

select set_config(
  'request.jwt.claim.sub',
  '20000000-0000-0000-0000-000000000005',
  true
);

set local role authenticated;

do $test$
declare
  v_state text;
begin
  begin
    perform public.fieldforce_issue_invitation(
      '10000000-0000-0000-0000-000000000001',
      'denied-other-tenant@example.test',
      'technician'
    );
    raise exception 'invitation RPC accepted an owner from another tenant';
  exception when others then
    get stacked diagnostics v_state = returned_sqlstate;
    if v_state <> '42501' then
      raise exception 'cross-tenant invitation returned %, expected 42501', v_state;
    end if;
  end;
end
$test$;

reset role;

select set_config(
  'request.jwt.claim.sub',
  '20000000-0000-0000-0000-000000000002',
  true
);

set local role authenticated;

do $test$
declare
  v_token text;
begin
  v_token := public.fieldforce_issue_invitation(
    '10000000-0000-0000-0000-000000000001',
    'owner-issued@example.test',
    'technician'
  );

  if v_token is null or char_length(v_token) <> 32 then
    raise exception 'authorized owner did not receive a valid invitation token';
  end if;

end
$test$;

reset role;

select set_config(
  'request.jwt.claim.sub',
  '20000000-0000-0000-0000-000000000003',
  true
);

set local role authenticated;

do $test$
declare
  v_token text;
begin
  v_token := public.fieldforce_issue_invitation(
    '10000000-0000-0000-0000-000000000001',
    'admin-issued@example.test',
    'technician'
  );

  if v_token is null or char_length(v_token) <> 32 then
    raise exception 'authorized admin did not receive a valid invitation token';
  end if;
end
$test$;

reset role;

do $test$
begin
  if (select count(*) from fieldforce.invitations
      where organization_id = '10000000-0000-0000-0000-000000000001') <> 2 then
    raise exception 'authorized invitations or denied-operation isolation failed';
  end if;
end
$test$;

rollback;
