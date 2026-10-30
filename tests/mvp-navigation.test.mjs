import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const page=readFileSync(new URL('../app/[locale]/dashboard/page.tsx',import.meta.url),'utf8');
test('role-based workspace navigation has real destination views',()=>{
 for(const view of ['overview','customers','orders','team','my-jobs','account']) assert.ok(page.includes("'"+view+"'"),view);
 assert.match(page,/const views=canManage\?/);
 assert.match(page,/const current=views\.find/);
 assert.match(page,/aria-current=\{current===v\?'page'/);
 assert.match(page,/aria-label=\{tm\('navigation'\)\}/);
});
test('team and orders views require role authorization',()=>{
 assert.match(page,/current==='team'&&canManage/);
 assert.match(page,/current==='orders'&&canManage/);
 assert.match(page,/current==='my-jobs'&&technician/);
});
