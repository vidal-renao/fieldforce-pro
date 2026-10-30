import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('priority is translated and restricted KPI is explained',()=>{
 const ui=read('app/[locale]/dashboard/page.tsx');
 assert.doesNotMatch(ui,/\{o\.priority\}/);
 assert.match(ui,/tm\('restricted'\)/);
});
test('technician completion confirmation and post-action context',()=>{
 const ui=read('app/[locale]/dashboard/page.tsx');
 const guard=read('app/[locale]/dashboard/guarded-status-form.tsx');
 const actions=read('app/[locale]/dashboard/operations.ts');
 assert.match(ui,/GuardedStatusForm/);
 assert.match(guard,/window\.confirm/);
 assert.match(guard,/event\.preventDefault\(\)/);
 assert.match(actions,/view=\$\{encodeURIComponent\(view\)\}/);
 assert.match(actions,/,'my-jobs'\)/);
});
