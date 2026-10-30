import {redirect} from 'next/navigation';
import {getTranslations,setRequestLocale} from 'next-intl/server';
import {createSupabaseServerClient} from '@/src/lib/supabase/server';
import {signOut} from '../login/actions';
import {createOrganization} from './actions';

export default async function DashboardPage({params,searchParams}:{
 params:Promise<{locale:string}>;
 searchParams:Promise<{error?:string;created?:string}>;
}) {
 const {locale} = await params;
 const {error,created} = await searchParams;
 setRequestLocale(locale);
 const supabase = await createSupabaseServerClient();
 const {data:{user},error:authError} = await supabase.auth.getUser();
 if (authError || !user) redirect(`/${locale}/login`);
 const t = await getTranslations('auth');
 const {data:memberships,error:listError} = await supabase.rpc('fieldforce_my_organizations');
 const companies = Array.isArray(memberships) ? memberships : [];
 const canCreate = companies.length === 0 && !listError;
 return (
  <main className="mx-auto w-full max-w-4xl px-6 py-16 text-slate-100">
   <p className="text-xs font-bold uppercase tracking-widest text-cyan-300">FieldForce Pro</p>
   <h1 className="mt-4 text-3xl font-bold">{t('dashboardTitle')}</h1>
   <p className="mt-4 text-slate-300">{t('signedInAs')} <span className="font-semibold text-white">{user.email}</span></p>
   {created ? <p role="status" className="mt-6 rounded-lg bg-emerald-500/15 p-4 text-emerald-200">{t('organizationCreated')}</p> : null}
   {error ? <p role="alert" className="mt-6 rounded-lg bg-rose-500/15 p-4 text-rose-200">{t('organizationError')}</p> : null}
   {listError ? <p role="alert" className="mt-6 rounded-lg bg-amber-500/15 p-4 text-amber-200">{t('connectionError')}</p> : null}
   {companies.length ? <section className="mt-8 space-y-3">
     <h2 className="text-xl font-bold">{t('organizationsTitle')}</h2>
     {companies.map((org:{organization_id:string;organization_name:string;member_role:string})=>(
       <article key={org.organization_id} className="rounded-xl border border-white/10 bg-white/5 p-5">
         <h3 className="font-bold">{org.organization_name}</h3>
         <p className="mt-1 text-sm text-cyan-300">{org.member_role}</p>
       </article>
     ))}
     <p className="text-sm text-slate-400">{t('operationsComingSoon')}</p>
   </section>: null}
   {canCreate ? <section className="mt-8 rounded-2xl border border-white/10 bg-slate-900 p-6">
      <h2 className="text-xl font-bold">{t('createOrganizationTitle')}</h2>
      <p className="mt-2 text-sm text-slate-300">{t('createOrganizationDescription')}</p>
      <form action={createOrganization.bind(null,locale)} className="mt-5 space-y-4">
       <label htmlFor="organization-name" className="block text-sm font-medium">{t('organizationName')}</label>
       <input id="organization-name" name="name" required minLength={2} maxLength={160} className="w-full rounded-lg border border-slate-600 bg-slate-950 p-3 text-white focus:border-cyan-300" />
       <button type="submit" className="rounded-lg bg-cyan-300 px-5 py-3 font-bold text-slate-950 hover:bg-cyan-200">{t('createOrganization')}</button>
      </form>
   </section> : null}
   <form action={signOut.bind(null,locale)} className="mt-8">
     <button type="submit" className="rounded-lg border border-slate-500 px-5 py-3 font-semibold hover:bg-white/10">{t('signOut')}</button>
   </form>
  </main>
 );
}
