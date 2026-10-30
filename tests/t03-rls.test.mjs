import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const sql = readFileSync(new URL('../supabase/migrations/20261030020000_t03_tenant_read_rls.sql', import.meta.url),'utf8').toLowerCase();

test('T03: all six tenant tables require membership for select', () => {
  for (const table of ['organizations','memberships','customers','work_orders','work_order_assignments','work_order_events']) {
    const policy = new RegExp('create policy '+table+'_member_select on fieldforce\\.'+table+'\\s+for select to authenticated\\s+using \\(fieldforce_private\\.my_role\\(');
    assert.match(sql,policy);
  }
});
test('T03: trusted role check binds auth.uid, uses fixed search path and is non-public', () => {
  assert.match(sql,/m\.user_id\s*=\s*\(select auth\.uid\(\)\)/);
  assert.match(sql,/security definer\s+set search_path = ''/);
  assert.match(sql,/revoke all on function fieldforce_private\.my_role\(uuid\) from public, anon/);
});
test('T03: no anonymous access and no implicit writes', () => {
  assert.doesNotMatch(sql,/grant\s+(all|insert|update|delete)\s+on\s+all tables/i);
  assert.doesNotMatch(sql,/to anon\s*;/);
  assert.doesNotMatch(sql,/create policy .+ for (insert|update|delete)/i);
});
