import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const sql=read('supabase/migrations/20261030080000_mvp_core_rpcs.sql');
test('five MVP invoker RPCs have explicit authenticated grants',()=>{
 for(const fn of ['list_customers','list_orders','create_customer','create_order','change_order_status']){
  assert.match(sql,new RegExp('function public.fieldforce_'+fn+'\\('));
 }
 assert.match(sql,/security invoker/);
 assert.match(sql,/from public,anon/);
 assert.match(sql,/to authenticated/);
 assert.doesNotMatch(sql,/security definer/i);
});
test('RPC customer and order tenant checks delegated to RLS and compositional FK',()=>{
 assert.match(sql,/where c.organization_id=p_org/);
 assert.match(sql,/where w.organization_id=p_org/);
 assert.match(sql,/values\(p_org,p_customer/);
 assert.match(sql,/where id=p_order and organization_id=p_org/);
});
test('MVP forms use validated server actions',()=>{
 const actions=read('app/[locale]/dashboard/operations.ts');
 assert.match(actions,/import \{z\} from 'zod'/);
 assert.match(actions,/auth.getUser\(\)/);
 assert.match(actions,/\.safeParse\(/);
 assert.doesNotMatch(actions,/service_role|SUPABASE_SERVICE_ROLE_KEY/i);
});
