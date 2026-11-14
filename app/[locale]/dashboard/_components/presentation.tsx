import type {ComponentPropsWithoutRef, ReactNode} from 'react';

export function AppShell({children}: {children: ReactNode}) {
  return <div className="min-h-screen bg-[#f5f7fb] text-[#14263c] [color-scheme:light]">
    <div className="mx-auto min-h-screen max-w-[1560px] lg:grid lg:grid-cols-[248px_minmax(0,1fr)]">{children}</div>
  </div>;
}

export function DetailShell({children}: {children: ReactNode}) {
  return <main className="min-h-screen bg-[#f5f7fb] px-4 py-8 text-[#14263c] [color-scheme:light] sm:px-8 sm:py-10">
    <div className="mx-auto max-w-6xl space-y-6">{children}</div>
  </main>;
}

export const panelClassName = 'min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_6px_20px_rgba(20,38,60,.04)] sm:p-6';
export const fieldClassName = 'mt-1.5 w-full rounded-xl border border-slate-400 bg-white px-3.5 py-3 text-sm text-[#14263c] outline-none transition focus:border-[#3265df] focus:ring-2 focus:ring-[#3265df]/30';
export const actionClassName = 'inline-flex min-h-11 items-center justify-center rounded-xl bg-[#3265df] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#2454c4] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3265df]';

export function Panel({className = '', children, ...props}: ComponentPropsWithoutRef<'section'>) {
  return <section {...props} className={`${panelClassName} ${className}`}>{children}</section>;
}

export function PageHeader({title, eyebrow, description, children, className = ''}: {
  title: ReactNode;
  eyebrow?: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  return <header className={`min-w-0 rounded-2xl bg-[#142c4b] p-6 text-white shadow-sm ${className}`}>
    {eyebrow ? <p className="break-words text-xs font-bold uppercase tracking-wider text-blue-200">{eyebrow}</p> : null}
    <h1 className="mt-3 break-words text-2xl font-bold sm:text-3xl">{title}</h1>
    {description ? <p className="mt-2 break-words text-sm text-slate-200">{description}</p> : null}
    {children}
  </header>;
}

export function MetricCard({label, value}: {label: string; value: string | number}) {
  return <div className={panelClassName}><dl>
    <dt className="text-xs font-semibold uppercase tracking-wider text-[#52637b]">{label}</dt>
    <dd className="mt-4 text-3xl font-bold tabular-nums">{value}</dd>
  </dl></div>;
}

export function StatusBadge({status, children}: {status: string; children: ReactNode}) {
  const color = status === 'completed' ? 'bg-emerald-50 text-emerald-800 ring-emerald-200'
    : status === 'in_progress' ? 'bg-blue-50 text-blue-800 ring-blue-200'
    : status === 'cancelled' ? 'bg-rose-50 text-rose-800 ring-rose-200'
    : 'bg-amber-50 text-amber-900 ring-amber-200';
  return <span className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${color}`}>{children}</span>;
}
