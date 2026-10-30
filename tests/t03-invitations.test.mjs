import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=(p)=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const sql=read('supabase/migrations/20261030070000_t03_private_invitations.sql').toLowerCase();
test('invitation table is private and RLS protected',()=>{
 assert.match(sql,/alter table fieldforce\.invitations enable row level security/);
 assert.match(sql,/revoke all on fieldforce\.invitations from public, anon, authenticated/);
 assert.match(sql,/token_hash bytea not null unique/);
});
test('hashed tokens, verified recipient, expiry and one-time consumption',()=>{
 for(const fragment of ["pg_catalog.sha256", "email_confirmed_at is not null", "accepted_at is null", "expires_at > now()", "for update", "accepted_at=now()"])assert.ok(sql.includes(fragment),fragment);
});
test('public RPCs are invokers only, privileged helpers reside in private schema',()=>{
 assert.match(sql,/function public\.fieldforce_issue_invitation[\s\S]*?security invoker/);
 assert.match(sql,/function public\.fieldforce_accept_invitation[\s\S]*?security invoker/);
 assert.match(sql,/revoke all on function public\.fieldforce_accept_invitation\(text\) from public, anon/);
});
test('invite acceptance uses server-side session and never puts token in URL',()=>{
 const action=read('app/[locale]/invitation/actions.ts');
 assert.match(action,/auth\.getUser\(\)/);
 assert.match(action,/fieldforce_accept_invitation/);
 assert.doesNotMatch(action,/searchParams|\?token=/);
});
