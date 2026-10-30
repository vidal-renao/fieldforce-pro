export const instant = false;

import {redirect} from 'next/navigation';
import {getTranslations,setRequestLocale} from 'next-intl/server';
import {createSupabaseServerClient} from '@/src/lib/supabase/server';
import {routing} from '@/src/i18n/routing';
import {signOut} from '../login/actions';
import {createOrganization} from './actions';
import {InviteForm} from './invitations/invite-form';
import {addCustomer,addOrder,changeStatus,assignTechnician,technicianStatus} from './operations';

type Company={organization_id:string;organization_name:string;member_role:string};
type Customer={id:string;name:string;email:string|null;phone:string|null};
type Order={id:string;title:string;status:string;priority:string;customer_name:string};
type Tech={user_id:string;email:string;member_role:string};
const statuses=['open','assigned','in_progress','completed','cancelled'] as const;
const panel='rounded-2xl border border-white/10 bg-[#101b30] p-5 shadow-[0_12px_30px_rgba(0,0,0,.12)] sm:p-6';
const field='mt-1.5 w-full rounded-xl border border-slate-600/70 bg-[#080f20] px-3.5 py-3 text-sm text-white outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/20';
const action='inline-flex items-center justify-center rounded-xl bg-cyan-300 px-4 py-2.5 text-sm font-bold text-[#071325] transition hover:bg-cyan-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300';
const subtle='inline-flex items-center justify-center rounded-xl border border-slate-600 px-3 py-2 text-sm font-semibold text-slate-200 transition hover:border-cyan-300/70 hover:bg-white/5';
function statusClass(value:string){return value==='completed'?'bg-emerald-400/10 text-emerald-300 ring-emerald-400/20':value==='in_progress'?'bg-sky-400/10 text-sky-300 ring-sky-400/20':value==='cancelled'?'bg-rose-400/10 text-rose-300 ring-rose-400/20':'bg-amber-300/10 text-amber-200 ring-amber-300/20';}

export default async function DashboardPage({params,searchParams}:{
  params:Promise<{locale:string}>;
  searchParams:Promise<{error?:string;created?:string;org?:string;notice?:string;view?:string}>;
}){
 const {locale}=await params;
 const {error,created,org,notice,view}=await searchParams;
 setRequestLocale(locale);
 const supabase=await createSupabaseServerClient();
 const {data:{user},error:authError}=await supabase.auth.getUser();
 if(authError||!user)redirect(`/${locale}/login`);
 const t=await getTranslations('auth');
 const tm=await getTranslations('mvp');
 const {data:memberships,error:listError}=await supabase.rpc('fieldforce_my_organizations');
 const companies=(Array.isArray(memberships)?memberships:[]) as Company[];
 const active=companies.find(c=>c.organization_id===org)??companies[0];
 const activeOrg=active?.organization_id;
 const canManage=active?['owner','admin'].includes(active.member_role):false;
 const technician=active?.member_role==='technician';
 const [{data:rawCustomers},{data:rawOrders},{data:rawTeam},{data:rawAssigned}]=activeOrg?await Promise.all([
  supabase.rpc('fieldforce_list_customers',{p_org:activeOrg}),
  supabase.rpc('fieldforce_list_orders',{p_org:activeOrg}),
  canManage?supabase.rpc('fieldforce_list_team',{p_org:activeOrg}):Promise.resolve({data:[]}),
  technician?supabase.rpc('fieldforce_my_work_orders',{p_org:activeOrg}):Promise.resolve({data:[]})
 ]):[{data:[]},{data:[]},{data:[]},{data:[]}];
 const customers=(Array.isArray(rawCustomers)?rawCustomers:[]) as Customer[];
 const orders=(Array.isArray(rawOrders)?rawOrders:[]) as Order[];
 const team=(Array.isArray(rawTeam)?rawTeam:[]) as Tech[];
 const assigned=(Array.isArray(rawAssigned)?rawAssigned:[]) as Order[];
 const views=canManage?(['overview','orders','customers','team'] as const):(['overview','my-jobs','account'] as const);
 const current=views.find(v=>v===view)??'overview';
 const url=(target:string)=>`/${locale}/dashboard?${new URLSearchParams({...activeOrg?{org:activeOrg}:{},view:target}).toString()}`;
 const labels:Record<string,string>={overview:tm('workspace'),orders:tm('orders'),customers:tm('customers'),team:tm('team'),'my-jobs':tm('myJobs'),account:tm('account')};
 const openOrders=orders.filter(o=>!['completed','cancelled'].includes(o.status)).length;
 const doneOrders=orders.filter(o=>o.status==='completed').length;
 const mainOrders=canManage?orders:assigned;
 return (
 <div className="min-h-screen bg-[#080f1e] text-slate-100">
  <div className="mx-auto min-h-screen max-w-[1560px] lg:grid lg:grid-cols-[248px_minmax(0,1fr)]">
   <aside className="border-b border-white/10 bg-[#0b1629] px-5 py-5 lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:border-b-0 lg:border-r lg:px-5 lg:py-8">
    <a href={`/${locale}/dashboard`} className="flex items-center gap-3" aria-label="FieldForce Pro">
      <span className="flex size-11 items-center justify-center rounded-xl bg-cyan-300 font-black text-[#071325]">F</span>
      <span className="text-lg font-bold tracking-tight">FieldForce <span className="text-cyan-300">Pro</span><span className="block text-[10px] font-semibold tracking-[.19em] text-slate-400">VIDAL ECOSYSTEM</span></span>
    </a>
    <nav aria-label={tm('navigation')} className="mt-6 flex flex-wrap gap-2 lg:mt-12 lg:flex-col">
     {views.map(v=><a key={v} href={url(v)} aria-current={current===v?'page':undefined}
       className={`rounded-xl px-4 py-3 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-cyan-300 ${current===v?'bg-cyan-300/15 text-cyan-200 ring-1 ring-cyan-300/20':'text-slate-300 hover:bg-white/5 hover:text-white'}`}>{labels[v]}</a>)}
    </nav>
    <div className="mt-6 hidden rounded-xl border border-white/10 bg-white/[.03] p-4 lg:mt-auto lg:block">
      <p className="truncate text-sm font-semibold">{active?.organization_name??'FieldForce Pro'}</p>
      <p className="mt-1 text-xs text-cyan-300">{active?.member_role??'—'}</p>
    </div>
   </aside>
   <main className="min-w-0 px-4 pb-16 pt-6 sm:px-7 lg:px-10 lg:pt-8">
    <header className="flex flex-wrap items-start justify-between gap-5 border-b border-white/10 pb-7">
      <div><p className="text-xs font-bold uppercase tracking-[.2em] text-cyan-300">FieldForce Pro / {active?.organization_name??t('dashboardTitle')}</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">{labels[current]??t('dashboardTitle')}</h1>
      <p className="mt-2 text-sm text-slate-400">{t('signedInAs')} <span className="text-slate-200">{user.email}</span></p></div>
      <nav aria-label={tm('languageNavigation')} className="flex items-center gap-1 rounded-xl border border-white/10 bg-[#121e31] p-1.5">
      {routing.locales.map(code=><a key={code} href={`/${code}/dashboard?${new URLSearchParams({...activeOrg?{org:activeOrg}:{},view:current}).toString()}`}
      hrefLang={code} lang={code} aria-current={locale===code?'page':undefined}
      className={`rounded-lg px-3 py-2 text-xs font-bold transition ${locale===code?'bg-cyan-300 text-[#071325]':'text-slate-300 hover:bg-white/10'}`}>{code.toUpperCase()}</a>)}
      </nav>
    </header>
    {notice?<p role="status" className={`mt-5 rounded-xl border p-4 text-sm ${notice==='error'||notice==='invalid'?'border-rose-500/30 bg-rose-500/10 text-rose-200':'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'}`}>{notice==='error'?tm('operationError'):notice==='invalid'?tm('invalidFields'):tm('operationDone')}</p>:null}
    {error&&companies.length===0?<p role="alert" className="mt-5 text-rose-300">{t('organizationError')}</p>:null}
    {listError?<p role="alert" className="mt-5 text-rose-300">{t('connectionError')}</p>:null}
    {created&&companies.length>0?<p role="status" className="mt-5 text-emerald-300">{t('organizationCreated')}</p>:null}
    {activeOrg&&current==='overview'?<div className="mt-8 space-y-7">
     <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">
       {([{label:tm('customers'),value:canManage?customers.length:'—'},{label:tm('orders'),value:mainOrders.length},{label:tm('open'),value:canManage?openOrders:assigned.filter(o=>o.status!=='completed').length},{label:tm('completed'),value:canManage?doneOrders:assigned.filter(o=>o.status==='completed').length}]).map(k=><div key={k.label} className={panel}><p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{k.label}</p><p className="mt-4 text-3xl font-bold tabular-nums">{k.value}</p></div>)}
     </section>
     <section className={panel}><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-xl font-bold">{tm('workspace')}</h2><p className="mt-1 text-sm text-slate-400">{active.organization_name} · {active.member_role}</p></div><a href={url(technician?'my-jobs':'orders')} className={action}>{technician?tm('myJobs'):tm('orders')}</a></div>
      {companies.length>1?<div className="mt-4 flex flex-wrap gap-2">{companies.map(c=><a key={c.organization_id} href={`/${locale}/dashboard?org=${encodeURIComponent(c.organization_id)}&view=overview`} className={subtle}>{c.organization_name}</a>)}</div>:null}
     </section>
     <section className={panel}><div className="mb-5 flex items-center justify-between"><h2 className="text-xl font-bold">{technician?tm('myJobs'):tm('orders')}</h2><a className="text-sm font-semibold text-cyan-300 hover:underline" href={url(technician?'my-jobs':'orders')}>{tm('update')} →</a></div>
      {mainOrders.length===0?<p className="text-sm text-slate-400">{technician?tm('noJobs'):'—'}</p>:<div className="space-y-2">{mainOrders.slice(0,6).map(o=><div key={o.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/5 bg-[#0b1425] p-4"><div><p className="font-semibold">{o.title}</p><p className="mt-1 text-xs text-slate-400">{o.customer_name}</p></div><span className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${statusClass(o.status)}`}>{tm(o.status as 'open'|'assigned'|'in_progress'|'completed'|'cancelled')}</span></div>)}</div>}
     </section>
    </div>:null}
    {activeOrg&&current==='customers'&&canManage?<section className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_350px]">
      <div className={panel}><h2 className="text-xl font-bold">{tm('customers')} <span className="text-slate-400">({customers.length})</span></h2><div className="mt-5 space-y-2">{customers.length===0?<p className="text-sm text-slate-400">—</p>:customers.map(c=><div key={c.id} className="rounded-xl border border-white/5 bg-[#0b1425] p-4"><p className="font-semibold">{c.name}</p><p className="mt-1 text-sm text-slate-400">{c.email??''} {c.phone??''}</p></div>)}</div></div>
      <section className={panel}><h2 className="mb-5 text-lg font-bold">{tm('saveCustomer')}</h2><form action={addCustomer.bind(null,locale)} className="space-y-4"><input type="hidden" name="org" value={activeOrg}/><label className="block text-sm">{tm('customerName')}<input name="name" required maxLength={180} className={field}/></label><label className="block text-sm">{tm('emailOptional')}<input type="email" name="email" maxLength={254} className={field}/></label><label className="block text-sm">{tm('phoneOptional')}<input name="phone" maxLength={60} className={field}/></label><button className={action}>{tm('saveCustomer')}</button></form></section>
    </section>:null}
    {activeOrg&&current==='orders'&&canManage?<section className="mt-8 space-y-6">
     <div className="flex flex-wrap justify-between gap-3"><p className="text-sm text-slate-400">{orders.length} {tm('orders').toLowerCase()}</p><a href="#create-order" className={action}>+ {tm('createOrder')}</a></div>
     <section className={panel}><div className="space-y-4">{orders.length===0?<p className="text-sm text-slate-400">—</p>:orders.map(o=><article key={o.id} className="rounded-xl border border-white/10 bg-[#0b1425] p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="font-bold">{o.title}</h3><p className="mt-1 text-sm text-slate-400">{o.customer_name} · {o.priority}</p></div><span className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${statusClass(o.status)}`}>{tm(o.status as 'open'|'assigned'|'in_progress'|'completed'|'cancelled')}</span></div>
      <div className="mt-5 grid gap-4 border-t border-white/10 pt-4 md:grid-cols-2">
      {team.some(u=>u.member_role==='technician')?<form action={assignTechnician.bind(null,locale)} className="flex flex-wrap items-end gap-2"><input type="hidden" name="org" value={activeOrg}/><input type="hidden" name="order" value={o.id}/><label className="min-w-0 flex-1 text-xs text-slate-400">{tm('assignTech')}<select name="technician" required className={field}>{team.filter(u=>u.member_role==='technician').map(u=><option key={u.user_id} value={u.user_id}>{u.email}</option>)}</select></label><button className={subtle}>{tm('assign')}</button></form>:null}
      <form action={changeStatus.bind(null,locale)} className="flex flex-wrap items-end gap-2"><input type="hidden" name="org" value={activeOrg}/><input type="hidden" name="order" value={o.id}/><label className="min-w-0 flex-1 text-xs text-slate-400">{tm('orderStatus')}<select name="status" defaultValue={o.status} className={field}>{statuses.map(s=><option key={s} value={s}>{tm(s)}</option>)}</select></label><button className={subtle}>{tm('update')}</button></form>
      </div></article>)}</div></section>
     <section id="create-order" className={panel}><h2 className="mb-5 text-xl font-bold">{tm('createOrder')}</h2>{customers.length===0?<p className="text-sm text-slate-400">{tm('customers')}: 0</p>:<form action={addOrder.bind(null,locale)} className="grid gap-4 md:grid-cols-3"><input type="hidden" name="org" value={activeOrg}/><label className="block text-sm md:col-span-3">{tm('orderTitle')}<input name="title" required maxLength={200} className={field}/></label><label className="block text-sm">{tm('customer')}<select name="customer" required className={field}>{customers.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label><label className="block text-sm">{tm('priority')}<select name="priority" className={field}>{(['normal','low','high','urgent'] as const).map(p=><option key={p} value={p}>{tm(p)}</option>)}</select></label><div className="flex items-end"><button className={action}>{tm('createOrder')}</button></div></form>}</section>
    </section>:null}
    {activeOrg&&current==='my-jobs'&&technician?<section className={`mt-8 ${panel}`}><h2 className="mb-5 text-xl font-bold">{tm('myJobs')} ({assigned.length})</h2>{assigned.length===0?<p className="text-sm text-slate-400">{tm('noJobs')}</p>:<div className="space-y-4">{assigned.map(o=><article key={o.id} className="rounded-xl border border-white/10 bg-[#0b1425] p-5"><h3 className="font-bold">{o.title}</h3><p className="mt-1 text-sm text-slate-400">{o.customer_name} · {o.priority}</p><p className="mt-3 text-sm text-cyan-300">{tm(o.status as 'open'|'assigned'|'in_progress'|'completed'|'cancelled')}</p>{!['completed','cancelled'].includes(o.status)?<form action={technicianStatus.bind(null,locale)} className="mt-4 flex flex-wrap gap-3"><input type="hidden" name="org" value={activeOrg}/><input type="hidden" name="order" value={o.id}/><select aria-label={tm('orderStatus')} name="status" className={field}><option value="in_progress">{tm('in_progress')}</option><option value="completed">{tm('completed')}</option></select><button className={action}>{tm('saveStatus')}</button></form>:null}</article>)}</div>}</section>:null}
    {activeOrg&&current==='team'&&canManage?<section className="mt-8 grid gap-6 xl:grid-cols-2"><div className={panel}><h2 className="mb-5 text-xl font-bold">{tm('team')}</h2>{team.map(u=><div key={u.user_id} className="mb-2 flex items-center justify-between gap-3 rounded-xl bg-[#0b1425] p-4"><p className="truncate text-sm">{u.email}</p><span className="text-xs font-semibold text-cyan-300">{u.member_role}</span></div>)}</div><section className={panel}><h2 className="mb-4 text-xl font-bold">{t('issueInvite')}</h2><InviteForm orgId={activeOrg} labels={{inviteEmail:t('inviteEmail'),inviteRole:t('inviteRole'),technician:t('technician'),admin:t('admin'),issueInvite:t('issueInvite'),inviteError:t('inviteError'),inviteInstructions:t('inviteInstructions')}}/><a className="mt-5 inline-block text-sm text-cyan-300 underline" href={`/${locale}/invitation`}>{t('acceptInviteTitle')}</a></section></section>:null}
    {(!activeOrg||current==='account')?<section className={`mt-8 ${panel}`}><h2 className="mb-5 text-xl font-bold">{t('dashboardTitle')}</h2>{!activeOrg&&!listError?<form action={createOrganization.bind(null,locale)} className="space-y-4"><label className="block text-sm">{t('organizationName')}<input className={field} name="name" minLength={2} maxLength={160} required/></label><button className={action}>{t('createOrganization')}</button></form>:null}<p className="mt-3 text-sm text-slate-300">{user.email}</p><form action={signOut.bind(null,locale)} className="mt-6"><button className={subtle}>{t('signOut')}</button></form></section>:null}
    {current!=='account'?<form action={signOut.bind(null,locale)} className="mt-10"><button className={subtle}>{t('signOut')}</button></form>:null}
    <footer className="mt-12 border-t border-white/10 pt-5 text-xs text-slate-500">© VIDAL ECOSYSTEM</footer>
   </main>
  </div>
 </div>
 );
}
