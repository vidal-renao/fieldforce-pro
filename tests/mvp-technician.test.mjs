import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('MVP technician role uses private constrained status mutation',()=>{
 const sql=read('supabase/migrations/20261030100000_mvp_technicians.sql');
 assert.match(sql,/function fieldforce_private\.technician_change_status/);
 assert.match(sql,/a\.technician_id=\(select auth\.uid\(\)\)/);
 assert.match(sql,/p_status not in \('in_progress','completed'\)/);
 assert.match(sql,/security definer set search_path=''/);
 assert.match(sql,/function public\.fieldforce_technician_change_status/);
 assert.match(sql,/security invoker/);
});
test('Customers and work orders of technicians are scoped to assigned items',()=>{
 const sql=read('supabase/migrations/20261030120000_mvp_technician_read_scope.sql');
 assert.match(sql,/drop policy work_orders_member_select/);
 assert.match(sql,/drop policy customers_member_select/);
 assert.match(sql,/fieldforce_private\.is_assigned/);
 assert.match(sql,/authenticated/);
});
test('Status changes generate audit entries with server identity',()=>{
 const sql=read('supabase/migrations/20261030090000_mvp_status_audit.sql');
 assert.match(sql,/after insert or update of status/);
 assert.match(sql,/fieldforce\.work_order_events/);
 assert.match(sql,/\(select auth\.uid\(\)\)/);
});
