import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const sql=readFileSync(new URL('../supabase/migrations/20261030150000_t02_operational_rules.sql',import.meta.url),'utf8');
test('single assignee and transactional change',()=>{assert.match(sql,/unique index[\s\S]*?on fieldforce\.work_order_assignments/i);assert.match(sql,/fieldforce_reassign_technician/);});
test('restricted state transitions including explicit reopen',()=>{assert.match(sql,/fieldforce_reopen_order/);assert.match(sql,/old_status/);assert.match(sql,/completed/);assert.match(sql,/cancelled/);});
test('no public security definer and restricted RPC grants',()=>{assert.doesNotMatch(sql,/public\.fieldforce_\w+[\s\S]{0,180}security definer/i);assert.match(sql,/revoke all on function/);});
