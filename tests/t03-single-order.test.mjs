import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('single-order lookup is scoped to tenant and RLS invoker',()=>{
 const s=read('supabase/migrations/20261030160000_t03_order_detail.sql');
 assert.match(s,/fieldforce_get_order/);assert.match(s,/security invoker/);
 assert.match(s,/organization_id=p_org/);assert.match(s,/w\.id=p_order/);
 assert.match(s,/grant execute.*authenticated/is);
});
test('detail no longer uses limited order list',()=>{
 const s=read('app/[locale]/dashboard/orders/[id]/page.tsx');
 assert.match(s,/fieldforce_get_order/);
 assert.doesNotMatch(s,/fieldforce_list_orders/);
});
