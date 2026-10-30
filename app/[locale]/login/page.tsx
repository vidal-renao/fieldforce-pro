export const instant = false;

import {getTranslations, setRequestLocale} from 'next-intl/server';
import {signIn} from './actions';

export default async function LoginPage({params,searchParams}:{
  params:Promise<{locale:string}>;
  searchParams:Promise<{error?:string}>;
}) {
  const {locale} = await params;
  setRequestLocale(locale);
  const {error} = await searchParams;
  const t = await getTranslations('auth');
  const action = signIn.bind(null, locale);
  return (
    <main className="mx-auto flex min-h-[80vh] w-full max-w-md items-center px-5 py-12">
      <section className="w-full rounded-2xl border border-slate-700 bg-slate-900 p-8 shadow-xl">
        <p className="mb-2 text-xs font-bold uppercase tracking-widest text-cyan-300">VIDAL ECOSYSTEM</p>
        <h1 className="text-3xl font-bold text-white">{t('loginTitle')}</h1>
        <p className="mt-3 text-sm text-slate-300">{t('loginDescription')}</p>
        {error ? <p role="alert" className="mt-5 rounded-md border border-rose-500/40 bg-rose-500/10 p-3 text-sm text-rose-200">{t('loginError')}</p> : null}
        <form action={action} className="mt-7 space-y-5">
          <div><label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-200">{t('email')}</label>
            <input id="email" type="email" name="email" autoComplete="username" required maxLength={254} className="w-full rounded-lg border border-slate-600 bg-slate-950 p-3 text-white outline-none focus:border-cyan-300"/></div>
          <div><label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-200">{t('password')}</label>
            <input id="password" type="password" name="password" autoComplete="current-password" required className="w-full rounded-lg border border-slate-600 bg-slate-950 p-3 text-white outline-none focus:border-cyan-300"/></div>
          <button type="submit" className="w-full rounded-lg bg-cyan-300 p-3 font-bold text-slate-950 hover:bg-cyan-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300">{t('signIn')}</button>
        </form>
        <a href={`/${locale}`} className="mt-6 inline-block text-sm text-cyan-300 underline underline-offset-4">{t('back')}</a>
      </section>
    </main>
  );
}
