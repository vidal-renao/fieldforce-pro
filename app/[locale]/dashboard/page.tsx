export const instant = false;

import {redirect} from 'next/navigation';
import {getTranslations,setRequestLocale} from 'next-intl/server';
import {createSupabaseServerClient} from '@/src/lib/supabase/server';
import {signOut} from '../login/actions';
import {createOrganization} from './actions';
import {InviteForm} from './invitations/invite-form';
import {addCustomer,addOrder,changeStatus,assignTechnician,technicianStatus} from './operations';

export default async function DashboardPage({params,searchParams}:{
 params:Promise<{locale:string}>;
 searchParams:Promise<{error?:string;created?:string;org?:string;notice?:string}>;
}) {
 const {locale} = await params;
 const {error,created,org,notice} = await searchParams;
 setRequestLocale(locale);
 const supabase = await createSupabaseServerClient();
 const {data:{user},error:authError} = await supabase.auth.getUser();
 if (authError || !user) redirect(`/${locale}/login`);
 const t = await getTranslations('auth');
 const tm = await getTranslations('mvp');
 const {data:memberships,error:listError} = await supabase.rpc('fieldforce_my_organizations');
 const companies = Array.isArray(memberships) ? memberships : [];
 const canCreate = companies.length === 0 && !listError;
 const active=companies.find((o:{organization_id:string})=>o.organization_id===org)??companies[0];
 const activeOrg=active?.organization_id as string|undefined;
 const canManage=active && ['owner','admin'].includes(active.member_role);
 const [{data:customers},{data:orders},{data:team},{data:myOrders}]=activeOrg?await Promise.all([
 supabase.rpc('fieldforce_list_customers',{p_org:activeOrg}),
 supabase.rpc('fieldforce_list_orders',{p_org:activeOrg}),
 canManage?supabase.rpc('fieldforce_list_team',{p_org:activeOrg}):Promise.resolve({data:[]}),
 supabase.rpc('fieldforce_my_work_orders',{p_org:activeOrg})]):[{data:[]},{data:[]},{data:[]},{data:[]}];
 const customerList=Array.isArray(customers)?customers:[];
 const orderList=Array.isArray(orders)?orders:[];
 const teamList=Array.isArray(team)?team.filter((u:{member_role:string})=>u.member_role==='technician'):[];
 const assignedOrders=Array.isArray(myOrders)?myOrders:[];
 return (
  <main className="mx-auto w-full max-w-4xl px-6 py-16 text-slate-100">
   <p className="text-xs font-bold uppercase tracking-widest text-cyan-300">FieldForce Pro</p>
   <h1 className="mt-4 text-3xl font-bold">{t('dashboardTitle')}</h1>
   <p className="mt-4 text-slate-300">{t('signedInAs')} <span className="font-semibold text-white">{user.email}</span></p>
   {created && companies.length > 0 ? <p role="status" className="mt-6 rounded-lg bg-emerald-500/15 p-4 text-emerald-200">{t('organizationCreated')}</p> : null}
   {error && companies.length === 0 ? <p role="alert" className="mt-6 rounded-lg bg-rose-500/15 p-4 text-rose-200">{t('organizationError')}</p> : null}
   {listError ? <p role="alert" className="mt-6 rounded-lg bg-amber-500/15 p-4 text-amber-200">{t('connectionError')}</p> : null}
   {companies.length ? <section className="mt-8 space-y-3">
     <h2 className="text-xl font-bold">{t('organizationsTitle')}</h2>
     {companies.map((org:{organization_id:string;organization_name:string;member_role:string})=>(
       <article key={org.organization_id} className="rounded-xl border border-white/10 bg-white/5 p-5">
         <h3 className="font-bold">{org.organization_name}</h3>
         <p className="mt-1 text-sm text-cyan-300">{org.member_role}</p>
         {["owner","admin"].includes(org.member_role)?<InviteForm orgId={org.organization_id} labels={{inviteEmail:t("inviteEmail"),inviteRole:t("inviteRole"),technician:t("technician"),admin:t("admin"),issueInvite:t("issueInvite"),inviteError:t("inviteError"),inviteInstructions:t("inviteInstructions")}}/>:null}
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
   <a href={`/${locale}/invitation`} className="mt-8 inline-block text-cyan-300 underline">{t("acceptInviteTitle")}</a>
   {activeOrg?<section className="mt-10 space-y-8">
    <div className="rounded-xl border border-cyan-500/30 bg-slate-900 p-6">
     <h2 className="text-xl font-bold">{tm("workspace")}: {active.organization_name}</h2>
     <p className="mt-2 text-sm text-slate-300">{tm("activeCompany")} · {active.member_role}</p>
     {companies.length>1?<nav aria-label={tm("chooseCompany")} className="mt-4 flex flex-wrap gap-3">{companies.map((o:{organization_id:string;organization_name:string})=><a className="rounded border border-slate-500 px-3 py-2 text-sm" key={o.organization_id} href={`/${locale}/dashboard?org=${o.organization_id}`}>{o.organization_name}</a>)}</nav>:null}
    </div>
    {notice?<p role="status" className="rounded border border-slate-600 p-3 text-sm">Resultado: {notice==='error'?'Operación rechazada o sin permisos.':notice==='invalid'?'Revisa los campos del formulario.':'Operación completada.'}</p>:null}
    {active?.member_role==='technician'?<section className="rounded-xl border border-slate-700 p-5">
     <h3 className="text-xl font-bold">{tm("myJobs")} ({assignedOrders.length})</h3>
     {assignedOrders.length===0?<p className="mt-3 text-sm text-slate-400">{tm("noJobs")}</p>:null}
     <ul className="mt-4 space-y-3">{assignedOrders.map((w:{id:string;title:string;status:string;priority:string;customer_name:string})=><li key={w.id} className="rounded bg-slate-900 p-4">
       <strong>{w.title}</strong><p className="text-sm text-slate-300">{w.customer_name} · {w.priority} · {w.status}</p>
       {w.status!=='completed'&&w.status!=='cancelled'?<form action={technicianStatus.bind(null,locale)} className="mt-3 flex gap-2">
        <input type="hidden" name="org" value={activeOrg}/><input type="hidden" name="order" value={w.id}/>
        <select aria-label="Cambiar mi estado" name="status" className="rounded border border-slate-500 bg-slate-950 p-2"><option value="in_progress">{tm("in_progress")}</option><option value="completed">{tm("completed")}</option></select>
        <button className="rounded border border-cyan-300 px-3 py-2">{tm("saveStatus")}</button>
       </form>:null}
     </li>)}</ul>
    </section>:null}
    <div className="grid gap-6 md:grid-cols-2">
     <section className="rounded-xl border border-slate-700 p-5">
      <h3 className="text-lg font-bold">{tm("customers")} ({customerList.length})</h3>
      <ul className="mt-4 space-y-2">{customerList.map((x:{id:string;name:string;email:string|null})=><li key={x.id} className="rounded bg-slate-900 p-3 text-sm">{x.name}{x.email?<span className="block text-slate-400">{x.email}</span>:null}</li>)}</ul>
      {canManage?<form action={addCustomer.bind(null,locale)} className="mt-5 space-y-3">
       <input type="hidden" name="org" value={activeOrg}/>
       <label className="block text-sm">{tm("customerName")}<input name="name" maxLength={180} required className="mt-1 w-full rounded border border-slate-500 bg-slate-950 p-3"/></label>
       <label className="block text-sm">{tm("emailOptional")}<input name="email" type="email" maxLength={254} className="mt-1 w-full rounded border border-slate-500 bg-slate-950 p-3"/></label>
       <label className="block text-sm">{tm("phoneOptional")}<input name="phone" maxLength={60} className="mt-1 w-full rounded border border-slate-500 bg-slate-950 p-3"/></label>
       <button type="submit" className="rounded bg-cyan-300 px-4 py-2 font-semibold text-slate-950">{tm("saveCustomer")}</button>
      </form>:null}
     </section>
     <section className="rounded-xl border border-slate-700 p-5">
      <h3 className="text-lg font-bold">{tm("orders")} ({orderList.length})</h3>
      <ul className="mt-4 space-y-3">{orderList.map((w:{id:string;title:string;status:string;priority:string;customer_name:string})=><li key={w.id} className="rounded bg-slate-900 p-3 text-sm">
       <strong>{w.title}</strong><span className="block text-slate-300">{w.customer_name} · {w.priority} · {w.status}</span>
       {canManage && teamList.length>0?<form action={assignTechnician.bind(null,locale)} className="mt-2 flex flex-wrap gap-2">
        <input type="hidden" name="org" value={activeOrg}/><input type="hidden" name="order" value={w.id}/>
        <select aria-label={tm("assignTech")} name="technician" required className="rounded border border-slate-500 bg-slate-950 p-2">{teamList.map((u:{user_id:string;email:string})=><option key={u.user_id} value={u.user_id}>{u.email}</option>)}</select>
        <button className="rounded border border-cyan-300 px-3 py-2">{tm("assign")}</button>
       </form>:null}
       {canManage?<form action={changeStatus.bind(null,locale)} className="mt-2 flex flex-wrap gap-2">
        <input type="hidden" name="org" value={activeOrg}/><input type="hidden" name="order" value={w.id}/>
        <select aria-label={tm("orderStatus")} name="status" defaultValue={w.status} className="rounded border border-slate-500 bg-slate-950 p-2">
         {['open','assigned','in_progress','completed','cancelled'].map(s=><option key={s} value={s}>{tm(s as "open"|"assigned"|"in_progress"|"completed"|"cancelled")}</option>)}
        </select><button className="rounded border border-cyan-300 px-3 py-2">{tm("update")}</button>
       </form>:null}
      </li>)}</ul>
      {canManage && customerList.length>0?<form action={addOrder.bind(null,locale)} className="mt-5 space-y-3">
       <input type="hidden" name="org" value={activeOrg}/>
       <label className="block text-sm">{tm("orderTitle")}<input required name="title" maxLength={200} className="mt-1 w-full rounded border border-slate-500 bg-slate-950 p-3"/></label>
       <label className="block text-sm">{tm("customer")}<select name="customer" required className="mt-1 w-full rounded border border-slate-500 bg-slate-950 p-3">{customerList.map((x:{id:string;name:string})=><option key={x.id} value={x.id}>{x.name}</option>)}</select></label>
       <label className="block text-sm">{tm("priority")}<select name="priority" className="mt-1 w-full rounded border border-slate-500 bg-slate-950 p-3"><option value="normal">{tm("normal")}</option><option value="low">{tm("low")}</option><option value="high">{tm("high")}</option><option value="urgent">{tm("urgent")}</option></select></label>
       <button className="rounded bg-cyan-300 px-4 py-2 font-semibold text-slate-950">{tm("createOrder")}</button>
      </form>:null}
     </section>
    </div>
   </section>:null}
   <form action={signOut.bind(null,locale)} className="mt-8">
     <button type="submit" className="rounded-lg border border-slate-500 px-5 py-3 font-semibold hover:bg-white/10">{t('signOut')}</button>
   </form>
  </main>
 );
}
