export const instant = false;

import {getTranslations, setRequestLocale} from 'next-intl/server';
import {requestPasswordRecovery} from './actions';

export default async function ForgotPasswordPage({params, searchParams}: {
  params: Promise<{locale: string}>;
  searchParams: Promise<{error?: string; sent?: string}>;
}) {
  const {locale} = await params;
  const {error, sent} = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations('auth');
  const action = requestPasswordRecovery.bind(null, locale);

  return (
    <main className="mx-auto flex min-h-[80vh] w-full max-w-md items-center px-5 py-12">
      <section className="w-full rounded-2xl border border-slate-700 bg-slate-900 p-8 shadow-xl">
        <p className="mb-2 text-xs font-bold uppercase tracking-widest text-cyan-300">VIDAL ECOSYSTEM</p>
        <h1 className="text-3xl font-bold text-white">{t('forgotTitle')}</h1>
        <p className="mt-3 text-sm text-slate-300">{t('forgotDescription')}</p>
        {sent ? (
          <div role="status" className="mt-5 rounded-md border border-emerald-500/40 bg-emerald-500/10 p-3 text-sm text-emerald-100">
            <p className="font-semibold">{t('recoverySent')}</p>
            <p className="mt-1">{t('recoverySentDescription')}</p>
          </div>
        ) : null}
        {error ? <p role="alert" className="mt-5 rounded-md border border-rose-500/40 bg-rose-500/10 p-3 text-sm text-rose-200">{t('recoveryInvalidEmail')}</p> : null}
        <form action={action} className="mt-7 space-y-5">
          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-200">{t('email')}</label>
            <input id="email" type="email" name="email" autoComplete="email" required maxLength={254} className="w-full rounded-lg border border-slate-600 bg-slate-950 p-3 text-white outline-none focus:border-cyan-300" />
          </div>
          <button type="submit" className="w-full rounded-lg bg-cyan-300 p-3 font-bold text-slate-950 hover:bg-cyan-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300">{t('sendRecovery')}</button>
        </form>
        <a href={`/${locale}/login`} className="mt-6 inline-block text-sm text-cyan-300 underline underline-offset-4">{t('backToLogin')}</a>
      </section>
    </main>
  );
}
