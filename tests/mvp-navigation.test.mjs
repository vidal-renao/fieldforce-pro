import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
const page=readFileSync(new URL('../app/[locale]/dashboard/page.tsx',import.meta.url),'utf8');
test('navigation anchors target existing sections',()=>{for(const id of ['workspace','customers','orders','my-jobs','team','account']){assert.ok(page.includes('href="#'+id+'"'));assert.ok(page.includes('id="'+id+'"'));}});
test('navigation restricts controls by organization role',()=>{assert.match(page,/canManage \? <a href="#orders"/);assert.match(page,/active.member_role === 'technician' \? <a href="#my-jobs"/);assert.match(page,/aria-label=\{tm\("navigation"\)\}/);});
