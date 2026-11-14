const RECOVERY_DESTINATIONS = new Set([
  '/de/reset-password',
  '/en/reset-password',
  '/es/reset-password'
]);

type RecoveryEnvironment = Partial<Record<
  'NODE_ENV' | 'NEXT_PUBLIC_SITE_URL' | 'VERCEL_ENV' | 'VERCEL_URL' | 'VERCEL_PROJECT_PRODUCTION_URL',
  string
>>;

function normalizeOrigin(raw: string) {
  const value = raw.startsWith('http://') || raw.startsWith('https://') ? raw : `https://${raw}`;
  const url = new URL(value);
  const isLocal = url.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(url.hostname);
  if (url.protocol !== 'https:' && !isLocal) throw new Error('Application origin must use HTTPS');
  return url.origin;
}

export function getApplicationOrigin(env: RecoveryEnvironment = process.env) {
  const host = env.VERCEL_ENV === 'preview'
    ? env.VERCEL_URL
    : env.NEXT_PUBLIC_SITE_URL ?? env.VERCEL_PROJECT_PRODUCTION_URL ?? (env.VERCEL_ENV ? env.VERCEL_URL : undefined);

  if (host) return normalizeOrigin(host);
  if (env.NODE_ENV !== 'production') return 'http://localhost:3000';
  throw new Error('Application origin is not configured');
}

export function getRecoveryDestination(value: string | null) {
  return value && RECOVERY_DESTINATIONS.has(value) ? value : null;
}

export function getRecoveryLocale(destination: string | null) {
  const locale = destination?.split('/')[1];
  return locale === 'en' || locale === 'es' ? locale : 'de';
}

export const RECOVERY_COOKIE = 'fieldforce_recovery';
