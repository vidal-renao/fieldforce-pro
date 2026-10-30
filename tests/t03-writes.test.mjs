import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const sql = readFileSync(new URL('../supabase/migrations/20261030030000_t03_role_write_rls.sql', import.meta.url), 'utf8');
test('Only authenticated roles have explicit write grants',()=>{
  assert.doesNotMatch(sql,/grant\s+(?:insert|update|delete|all)\s+.*\bto\s+anon\b/i);
  assert.match(sql,/grant insert, update on fieldforce\.customers, fieldforce\.work_orders to authenticated/i);
});
test('Every write policy demands owner/admin membership',()=>{
  const policies = sql.match(/create policy [\s\S]*?;/gi) || [];
  assert.equal(policies.length,6);
  for(const p of policies){
    assert.match(p,/for (insert|update|delete) to authenticated/i);
    assert.match(p,/my_role\(organization_id\) in \('owner','admin'\)/i);
    if(/for update/i.test(p))assert.match(p,/with check/i);
  }
});
test('Tenant reassignment blocked at database trigger layer',()=>{
  for(const table of ['customers','work_orders']) assert.ok(sql.includes('before update on fieldforce.'+table));
  assert.match(sql,/raise exception 'tenant reassignment is forbidden'/i);
});