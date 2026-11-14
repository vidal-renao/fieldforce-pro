import {cookies} from 'next/headers';
import {NextRequest, NextResponse} from 'next/server';
import {
  getApplicationOrigin,
  getRecoveryDestination,
  getRecoveryLocale,
  RECOVERY_COOKIE
} from '@/src/lib/auth/recovery';
import {createSupabaseServerClient} from '@/src/lib/supabase/server';

export async function GET(request: NextRequest) {
  const tokenHash = request.nextUrl.searchParams.get('token_hash');
  const type = request.nextUrl.searchParams.get('type');
  const destination = getRecoveryDestination(request.nextUrl.searchParams.get('next'));
  const locale = getRecoveryLocale(destination);
  const origin = getApplicationOrigin();
  const failure = new URL(`/${locale}/login?error=recovery`, origin);

  if (!tokenHash || type !== 'recovery' || !destination) return NextResponse.redirect(failure);

  const supabase = await createSupabaseServerClient();
  const {data, error} = await supabase.auth.verifyOtp({token_hash: tokenHash, type: 'recovery'});
  if (error || !data.user) return NextResponse.redirect(failure);

  const store = await cookies();
  store.set(RECOVERY_COOKIE, data.user.id, {
    httpOnly: true,
    maxAge: 15 * 60,
    path: '/',
    sameSite: 'lax',
    secure: origin.startsWith('https://')
  });
  return NextResponse.redirect(new URL(destination, origin));
}
