export const instant = false;

import {cookies} from 'next/headers';
import {redirect} from 'next/navigation';
import {connection} from 'next/server';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import {RECOVERY_COOKIE} from '@/src/lib/auth/recovery';
import {createSupabaseServerClient} from '@/src/lib/supabase/server';
import {updateRecoveredPassword} from './actions';

export default async function ResetPasswordPage({params, searchParams}: {
  params: Promise<{locale: string}>;
  searchParams: Promise<{error?: string}>;
}) {
  await connection();
  const {locale} = await params;
  const {error} = await searchParams;
  setRequestLocale(locale);
  const store = await cookies();
  const supabase = await createSupabaseServerClient();
  const {data: {user}} = await supabase.auth.getUser();
  if (!user || store.get(RECOVERY_COOKIE)?.value !== user.id) redirect(`/${locale}/login?error=recovery`);

  const t = await getTranslations('auth');
  const action = updateRecoveredPassword.bind(null, locale);
  return (
    <main className="mx-auto flex min-h-[80vh] w-full max-w-md items-center px-5 py-12">
      <section className="w-full rounded-2xl border border-slate-700 bg-slate-900 p-8 shadow-xl">
        <p className="mb-2 text-xs font-bold uppercase tracking-widest text-cyan-300">VIDAL ECOSYSTEM</p>
        <h1 className="text-3xl font-bold text-white">{t('resetTitle')}</h1>
        <p className="mt-3 text-sm text-slate-300">{t('resetDescription')}</p>
        {error ? (
          <p role="alert" className="mt-5 rounded-md border border-rose-500/40 bg-rose-500/10 p-3 text-sm text-rose-200">
            {error === 'mismatch' ? t('passwordMismatch') : t('passwordRequirements')}
          </p>
        ) : null}
        <form action={action} className="mt-7 space-y-5">
          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-200">{t('newPassword')}</label>
            <input id="password" type="password" name="password" autoComplete="new-password" required minLength={12} maxLength={1024} className="w-full rounded-lg border border-slate-600 bg-slate-950 p-3 text-white outline-none focus:border-cyan-300" />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium text-slate-200">{t('confirmPassword')}</label>
            <input id="confirmPassword" type="password" name="confirmPassword" autoComplete="new-password" required minLength={12} maxLength={1024} className="w-full rounded-lg border border-slate-600 bg-slate-950 p-3 text-white outline-none focus:border-cyan-300" />
          </div>
          <p className="text-xs text-slate-400">{t('passwordRequirements')}</p>
          <button type="submit" className="w-full rounded-lg bg-cyan-300 p-3 font-bold text-slate-950 hover:bg-cyan-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300">{t('updatePassword')}</button>
        </form>
      </section>
    </main>
  );
}
