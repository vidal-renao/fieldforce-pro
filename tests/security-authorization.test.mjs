import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, readdirSync} from 'node:fs';

// Static migration regression checks, not a substitute for PostgreSQL/RLS tests.
// Read the last definition so fixes can be additive instead of editing history.
const migrations = new URL('../supabase/migrations/', import.meta.url);
const sources = readdirSync(migrations)
  .filter(name => name.endsWith('.sql'))
  .sort()
  .map(name => ({name, sql: readFileSync(new URL(name, migrations), 'utf8')}));

function latestBody(name) {
  let latest;
  const declaration = new RegExp(
    `create\\s+or\\s+replace\\s+function\\s+fieldforce_private\\.${name}\\s*\\([^]*?\\bas\\s+(\\$[a-z_0-9]*\\$)([^]*?)\\1`,
    'gi'
  );
  for (const {name: migration, sql} of sources) {
    for (const match of sql.matchAll(declaration)) {
      latest = {migration, body: match[2].replace(/--[^\n]*/g, '').toLowerCase()};
    }
  }
  assert.ok(latest, `Missing definition of fieldforce_private.${name}`);
  return latest;
}

function assertRejectsMissingMembership(name) {
  const {migration, body} = latestBody(name);
  const firstGuard = body.match(/\bbegin\s+if\s+([^]*?)\s+then\s+raise\s+exception\s+[^]*?\bend\s+if\s*;/)?.[0];
  assert.ok(firstGuard, `${name}: reject unauthorized callers before domain access (${migration})`);
  assert.match(firstGuard, /(?:\bu\s+is\s+null|auth\.uid\(\)\)\s+is\s+null)/,
    `${name}: unauthenticated callers must be rejected`);
  assert.match(firstGuard, /errcode\s*=\s*'42501'/,
    `${name}: rejection must be an authorization error, not an incidental foreign-key failure`);

  // Accept explicit SQL fail-closed forms. Plain nullable-role NOT IN is unsafe:
  // NULL NOT IN (...) is NULL, so PL/pgSQL IF does not enter the rejection branch.
  const positiveRole = /\bin\s*\(\s*'owner'\s*,\s*'admin'\s*\)/;
  const rejectsNonTrue = positiveRole.test(firstGuard) && /\bis\s+not\s+true\b/.test(firstGuard);
  const defaultsToDenial = /\bcoalesce\s*\(/.test(firstGuard)
    && /(?:\bnot\s+in\s*\(\s*'owner'\s*,\s*'admin'\s*\)|\bis\s+not\s+true\b)/.test(firstGuard);
  const requiresMembership = /\bnot\s+exists\s*\(/.test(firstGuard)
    && /fieldforce\.memberships/.test(firstGuard)
    && /m\.organization_id\s*=\s*p_org/.test(firstGuard)
    && /m\.user_id\s*=\s*(?:u\b|\(?\s*select\s+auth\.uid\(\))/.test(firstGuard)
    && positiveRole.test(firstGuard);
  assert.ok(rejectsNonTrue || defaultsToDenial || requiresMembership,
    `${name}: a caller with no membership (NULL role) must be rejected explicitly before reads, idempotent returns, or writes (${migration})`);
}

for (const name of ['issue_invitation', 'reassign_technician', 'reopen_order']) {
  test(`${name}: missing tenant membership is rejected before domain access`, () => {
    assertRejectsMissingMembership(name);
  });
}
