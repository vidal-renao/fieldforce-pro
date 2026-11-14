import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('recovery URL policy accepts only known localized destinations and trusted origins', async () => {
  const {getApplicationOrigin, getRecoveryDestination} = await import('../src/lib/auth/recovery.ts');

  assert.equal(getRecoveryDestination('/de/reset-password'), '/de/reset-password');
  assert.equal(getRecoveryDestination('/en/reset-password'), '/en/reset-password');
  assert.equal(getRecoveryDestination('/es/reset-password'), '/es/reset-password');
  for (const value of [null, '', 'https://evil.example/reset-password', '//evil.example', '/fr/reset-password', '/es/../dashboard']) {
    assert.equal(getRecoveryDestination(value), null);
  }

  assert.equal(getApplicationOrigin({VERCEL_ENV: 'preview', VERCEL_URL: 'fieldforce-branch-team.vercel.app'}), 'https://fieldforce-branch-team.vercel.app');
  assert.equal(getApplicationOrigin({VERCEL_ENV: 'production', NEXT_PUBLIC_SITE_URL: 'https://fieldforce.example/ignored'}), 'https://fieldforce.example');
  assert.equal(getApplicationOrigin({NODE_ENV: 'development'}), 'http://localhost:3000');
  assert.throws(() => getApplicationOrigin({NODE_ENV: 'production'}), /origin/i);
  assert.throws(() => getApplicationOrigin({VERCEL_ENV: 'preview', VERCEL_URL: 'http://evil.example'}), /https/i);
});

test('forgot-password validates email and keeps the public response neutral', () => {
  const source = read('app/[locale]/forgot-password/actions.ts');
  assert.match(source, /z\.string\(\)\.trim\(\)\.email\(\)\.max\(254\)/);
  assert.match(source, /resetPasswordForEmail/);
  assert.match(source, /getApplicationOrigin/);
  assert.match(source, /\/auth\/confirm\?next=/);
  assert.match(source, /sent=1/);
  assert.doesNotMatch(source, /service_role|SUPABASE_SERVICE_ROLE_KEY|console\.(?:log|error)/);

  const page = read('app/[locale]/forgot-password/page.tsx');
  assert.match(page, /role="status"/);
  assert.match(page, /autoComplete="email"/);
});

test('SSR confirmation callback verifies recovery token and blocks open redirects', () => {
  const source = read('app/auth/confirm/route.ts');
  const proxy = read('proxy.ts');
  assert.match(source, /type !== 'recovery'/);
  assert.match(source, /verifyOtp\(\{token_hash: tokenHash, type: 'recovery'\}\)/);
  assert.match(source, /store\.set\(RECOVERY_COOKIE, data\.user\.id/);
  assert.match(source, /getRecoveryDestination/);
  assert.doesNotMatch(source, /searchParams\.get\('next'\).*\|\|/);
  assert.doesNotMatch(source, /headers\(\)|get\(['"]host['"]\)/i);
  assert.match(proxy, /\(\?!api\|auth\|trpc/);
});

test('password update requires a verified user, strong matching values and local sign-out', () => {
  const source = read('app/[locale]/reset-password/actions.ts');
  assert.match(source, /z\.string\(\)\.min\(12\)\.max\(1024\)/);
  assert.match(source, /password.*confirmPassword|confirmPassword.*password/s);
  assert.match(source, /supabase\.auth\.getUser\(\)/);
  assert.match(source, /RECOVERY_COOKIE\)\?\.value !== user\.id/);
  assert.match(source, /supabase\.auth\.updateUser\(\{password/);
  assert.match(source, /supabase\.auth\.signOut\(\{scope: 'local'\}\)/);
  assert.ok(source.indexOf('getUser()') < source.indexOf('updateUser'));

  const page = read('app/[locale]/reset-password/page.tsx');
  assert.match(page, /await connection\(\)/);
  assert.match(page, /supabase\.auth\.getUser\(\)/);
  assert.match(page, /autoComplete="new-password"/);
});

test('login exposes recovery and all recovery messages exist in DE, EN and ES', () => {
  const login = read('app/[locale]/login/page.tsx');
  assert.match(login, /forgot-password/);
  assert.match(login, /passwordResetSuccess/);
  assert.match(login, /recoveryLinkError/);

  const required = [
    'forgotPassword', 'forgotTitle', 'forgotDescription', 'sendRecovery',
    'recoverySent', 'recoverySentDescription', 'recoveryInvalidEmail',
    'recoveryLinkError', 'resetTitle', 'resetDescription', 'newPassword',
    'confirmPassword', 'passwordRequirements', 'updatePassword',
    'passwordMismatch', 'passwordResetSuccess'
  ];
  for (const locale of ['de', 'en', 'es']) {
    const messages = JSON.parse(read(`messages/${locale}.json`));
    for (const key of required) assert.equal(typeof messages.auth[key], 'string', `${locale}.auth.${key}`);
  }
});
