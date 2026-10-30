import {getTranslations, setRequestLocale} from 'next-intl/server';
import {routing} from '@/src/i18n/routing';
import {Link} from '@/src/i18n/navigation';

export default async function LocalizedHome({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const features = [
    {number: '01', title: t('featureOneTitle'), description: t('featureOneDescription')},
    {number: '02', title: t('featureTwoTitle'), description: t('featureTwoDescription')},
    {number: '03', title: t('featureThreeTitle'), description: t('featureThreeDescription')}
  ];
  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-[#070e1b] text-slate-100">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_35%_at_60%_15%,rgba(14,165,233,0.14),transparent)]" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(148,163,184,.07)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,.07)_1px,transparent_1px)] [background-size:48px_48px]" />
      <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col px-5 sm:px-8 lg:px-12">
        <header className="flex flex-wrap items-center justify-between gap-5 border-b border-white/10 py-6">
          <div className="flex items-center gap-3">
            <span aria-hidden="true" className="flex size-10 items-center justify-center rounded-xl border border-cyan-400/30 bg-cyan-400/10 text-cyan-300">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="size-6"><path d="M3 7h18M3 12h13M3 17h18M7 4v16M17 4v16"/></svg>
            </span>
            <div><p className="text-sm font-extrabold tracking-wide">FieldForce <span className="text-cyan-300">Pro</span></p><p className="text-[10px] font-semibold uppercase tracking-[.22em] text-slate-400">VIDAL ECOSYSTEM</p></div>
          </div>
          <nav aria-label={t('languageLabel')} className="flex items-center gap-1 rounded-full border border-white/15 bg-white/5 p-1">
            {routing.locales.map((code) => (
              <Link key={code} href="/" locale={code} hrefLang={code} aria-current={locale === code ? 'page' : undefined}
                className={`rounded-full px-3 py-1.5 text-xs font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 ${locale === code ? 'bg-cyan-300 text-slate-950' : 'text-slate-300 hover:bg-white/10 hover:text-white'}`}>
                {code.toUpperCase()}
              </Link>
            ))}
          </nav>
        </header>
        <section className="grid flex-1 items-center gap-12 py-16 lg:grid-cols-[1.2fr_.8fr] lg:gap-16 lg:py-24" aria-labelledby="page-title">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-300/5 px-4 py-2 text-xs font-bold tracking-wide text-cyan-200">
              <span aria-hidden="true" className="size-2 rounded-full bg-cyan-300" />{t('eyebrow')}
            </span>
            <h1 id="page-title" className="mt-8 text-5xl font-black leading-[1.07] tracking-tight sm:text-6xl lg:text-7xl">{t('title')}</h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-300 sm:text-xl">{t('tagline')}</p>
            <div className="mt-10 rounded-2xl border border-white/10 bg-white/[.04] p-5 sm:p-6">
              <div className="flex items-start gap-4">
                <div aria-hidden="true" className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-cyan-300/10 font-bold text-cyan-300">i</div>
                <div><h2 className="font-bold text-white">{t('statusTitle')}</h2><p className="mt-2 text-sm leading-6 text-slate-300">{t('statusDescription')}</p></div>
              </div>
            </div>
          </div>
          <div className="relative rounded-3xl border border-white/15 bg-gradient-to-b from-slate-800/85 to-slate-900/85 p-5 shadow-2xl shadow-black/30 sm:p-7">
            <div className="mb-7 flex items-center justify-between gap-4 border-b border-white/10 pb-5">
              <span className="text-xs font-bold uppercase tracking-[.18em] text-cyan-300">{t('previewLabel')}</span>
              <span aria-hidden="true" className="flex gap-1.5"><span className="size-2 rounded-full bg-slate-500"/><span className="size-2 rounded-full bg-slate-500"/><span className="size-2 rounded-full bg-cyan-400"/></span>
            </div>
            <div className="space-y-4">
              {features.map((feature) => (
                <article key={feature.number} className="flex gap-4 rounded-2xl border border-white/10 bg-slate-950/40 p-5">
                  <span className="font-mono text-sm font-bold text-cyan-300">{feature.number}</span>
                  <div><h3 className="font-semibold text-white">{feature.title}</h3><p className="mt-2 text-sm leading-6 text-slate-400">{feature.description}</p></div>
                </article>
              ))}
            </div>
          </div>
        </section>
        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 py-6 text-xs text-slate-400">
          <p>© VIDAL ECOSYSTEM</p>
          <p>{t('footerNote')}</p>
        </footer>
      </div>
    </main>
  );
}
