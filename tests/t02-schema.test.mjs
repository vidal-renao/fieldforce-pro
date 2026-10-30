import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const sql = readFileSync(new URL('../supabase/migrations/20261030010000_t02_foundation_schema.sql', import.meta.url), 'utf8').toLowerCase();

test('domain tables exist with RLS explicitly enabled', () => {
  for (const table of ['organizations','memberships','customers','work_orders','work_order_assignments','work_order_events']) {
    assert.match(sql, new RegExp('create table public\\.' + table + '\\b'));
    assert.ok(sql.includes('alter table public.' + table + ' enable row level security'));
  }
});
test('deny-by-default before T03 policies, no blanket grants or unsafe definer functions', () => {
  assert.doesNotMatch(sql, /create policy|security definer|grant all|disable row level security/i);
});
test('multi-tenant integrity uses composite foreign keys', () => {
  assert.match(sql, /foreign key \(organization_id, customer_id\)/);
  assert.match(sql, /foreign key \(organization_id, work_order_id\)/);
  assert.match(sql, /foreign key \(organization_id, technician_id\)/);
});
test('stable state constraints and audits exist', () => {
  assert.match(sql, /check \(status in/);
  assert.match(sql, /created_at timestamptz/);
  assert.match(sql, /occurred_at timestamptz/);
});
