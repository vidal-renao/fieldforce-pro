import {getTranslations, setRequestLocale} from 'next-intl/server';
import {routing} from '@/src/i18n/routing';
import {Link} from '@/src/i18n/navigation';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({locale}));
}

export default async function LocalizedHome({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 py-16 text-white">
      <section className="w-full max-w-2xl space-y-6" aria-labelledby="page-title">
        <p className="text-sm font-semibold uppercase tracking-widest text-sky-400">VIDAL ECOSYSTEM</p>
        <h1 id="page-title" className="text-4xl font-bold tracking-tight sm:text-5xl">{t('title')}</h1>
        <p className="text-lg leading-relaxed text-slate-300">{t('tagline')}</p>
        <div className="rounded-xl border border-slate-700 bg-slate-900 p-6">
          <h2 className="text-lg font-semibold">{t('statusTitle')}</h2>
          <p className="mt-2 text-slate-300">{t('statusDescription')}</p>
        </div>
        <nav aria-label="Language" className="flex gap-4 text-sm">
          {routing.locales.map((code) => <Link key={code} href="/" locale={code} className="text-sky-300 underline underline-offset-4">{code.toUpperCase()}</Link>)}
        </nav>
        <footer className="text-sm text-slate-400">© VIDAL ECOSYSTEM</footer>
      </section>
    </main>
  );
}
