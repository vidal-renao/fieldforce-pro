import {redirect} from 'next/navigation';
import {getTranslations,setRequestLocale} from 'next-intl/server';
import {createSupabaseServerClient} from '@/src/lib/supabase/server';
import {signOut} from '../login/actions';

export default async function DashboardPage({params}:{params:Promise<{locale:string}>}) {
 const {locale} = await params;
 setRequestLocale(locale);
 const supabase = await createSupabaseServerClient();
 const {data:{user},error} = await supabase.auth.getUser();
 if (error || !user) redirect(`/${locale}/login`);
 const t = await getTranslations('auth');
 return (
  <main className="mx-auto w-full max-w-4xl px-6 py-16 text-slate-100">
   <p className="text-xs font-bold uppercase tracking-widest text-cyan-300">FieldForce Pro</p>
   <h1 className="mt-4 text-3xl font-bold">{t('dashboardTitle')}</h1>
   <p className="mt-4 text-slate-300">{t('signedInAs')} <span className="font-semibold text-white">{user.email}</span></p>
   <p className="mt-6 rounded-xl border border-amber-500/30 bg-amber-500/10 p-5 text-sm text-amber-100">{t('noWorkspace')}</p>
   <form action={signOut.bind(null,locale)} className="mt-7">
     <button type="submit" className="rounded-lg border border-slate-500 px-5 py-3 font-semibold hover:bg-white/10">{t('signOut')}</button>
   </form>
  </main>
 );
}
