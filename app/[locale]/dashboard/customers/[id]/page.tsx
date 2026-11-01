export const instant=false;
import {notFound,redirect} from 'next/navigation';
import {connection} from 'next/server';
import {getTranslations,setRequestLocale} from 'next-intl/server';
import {createSupabaseServerClient} from '@/src/lib/supabase/server';
import {updateCustomer} from './actions';
type Customer={id:string;name:string;email:string|null;phone:string|null;notes:string|null;created_at:string;updated_at:string};
type Order={id:string;title:string;status:string;priority:string;created_at:string;scheduled_for:string|null};
const input='mt-2 w-full rounded-xl border border-slate-600 bg-[#080f20] px-4 py-3 text-sm text-white focus-visible:outline-2 focus-visible:outline-cyan-300';
export default async function CustomerDetail({params,searchParams}:{params:Promise<{locale:string;id:string}>;searchParams:Promise<{org?:string;notice?:string}>}){
 const {locale,id}=await params;const {org,notice}=await searchParams;setRequestLocale(locale);
 if(!/^[0-9a-f]{8}-[0-9a-f-]{27,}$/i.test(id))notFound();
 await connection();
 const db=await createSupabaseServerClient();
 const {data:{user},error:authError}=await db.auth.getUser();
 if(authError||!user)redirect(`/${locale}/login`);
 const {data:memberships,error:membershipError}=await db.rpc('fieldforce_my_organizations');
 if(membershipError||!Array.isArray(memberships))notFound();
 const membership=memberships.find((m:{organization_id:string;member_role:string})=>m.organization_id===org&&['owner','admin'].includes(m.member_role));
 if(!membership)notFound();
 const [{data:customers,error:customerError},{data:orders,error:ordersError}]=await Promise.all([
 db.rpc('fieldforce_get_customer',{p_org:membership.organization_id,p_customer:id}),
 db.rpc('fieldforce_customer_orders',{p_org:membership.organization_id,p_customer:id})
 ]);
 if(customerError||ordersError||!Array.isArray(customers)||!Array.isArray(orders)||!customers.length)notFound();
 const customer=customers[0] as Customer;
 const tm=await getTranslations('mvp');
 const fmt=(date:string)=>new Intl.DateTimeFormat(locale,{dateStyle:'medium',timeStyle:'short'}).format(new Date(date));
 return <main className="min-h-screen bg-[#080f1e] px-4 py-10 text-slate-100 sm:px-8"><div className="mx-auto max-w-6xl space-y-7">
 <a className="text-sm font-semibold text-cyan-300 hover:underline" href={`/${locale}/dashboard?view=customers&org=${membership.organization_id}`}>← {tm('customers')}</a>
 <header className="rounded-2xl border border-white/10 bg-[#101b30] p-6 sm:p-8"><p className="text-xs font-bold uppercase tracking-widest text-cyan-300">{membership.organization_name}</p><h1 className="mt-2 text-3xl font-bold">{customer.name}</h1><p className="mt-2 text-sm text-slate-400">{customer.email??'—'} · {customer.phone??'—'}</p></header>
 {notice?<p role={notice==='saved'?'status':'alert'} className={`rounded-xl border p-4 text-sm ${notice==='saved'?'border-emerald-500/30 text-emerald-300':'border-rose-500/30 text-rose-300'}`}>{notice==='saved'?tm('customerSaved'):tm('operationError')}</p>:null}
 <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
 <section className="rounded-2xl border border-white/10 bg-[#101b30] p-6"><h2 className="text-xl font-bold">{tm('editCustomer')}</h2>
 <form action={updateCustomer.bind(null,locale)} className="mt-6 space-y-4">
 <input type="hidden" name="org" value={membership.organization_id}/><input type="hidden" name="customer" value={id}/>
 <label className="block text-sm">{tm('customerName')}<input name="name" required maxLength={180} defaultValue={customer.name} className={input}/></label>
 <label className="block text-sm">{tm('emailOptional')}<input type="email" name="email" maxLength={254} defaultValue={customer.email??''} className={input}/></label>
 <label className="block text-sm">{tm('phoneOptional')}<input name="phone" maxLength={60} defaultValue={customer.phone??''} className={input}/></label>
 <label className="block text-sm">{tm('customerNotes')}<textarea name="notes" rows={5} maxLength={2000} defaultValue={customer.notes??''} className={input}/></label>
 <button type="submit" className="rounded-xl bg-cyan-300 px-5 py-3 text-sm font-bold text-[#071325] hover:bg-cyan-200">{tm('saveCustomer')}</button>
 </form>
 <p className="mt-5 text-xs text-slate-400">{tm('lastUpdated')}: {fmt(customer.updated_at)}</p>
 </section>
 <section className="rounded-2xl border border-white/10 bg-[#101b30] p-6"><h2 className="text-xl font-bold">{tm('customerOrders')} ({orders.length})</h2>
 <div className="mt-5 space-y-3">{orders.length?(orders as Order[]).map(o=><a key={o.id} href={`/${locale}/dashboard/orders/${o.id}?org=${membership.organization_id}`} className="block rounded-xl border border-white/10 bg-[#0b1425] p-4 transition hover:border-cyan-300/50"><p className="font-semibold">{o.title}</p><div className="mt-2 flex gap-3 text-xs text-slate-400"><span>{tm(o.status as 'open'|'assigned'|'in_progress'|'completed'|'cancelled')}</span><span>{tm(o.priority as 'low'|'normal'|'high'|'urgent')}</span><span>{fmt(o.created_at)}</span></div></a>):<p className="text-sm text-slate-400">{tm('noCustomerOrders')}</p>}</div>
 </section></div><footer className="border-t border-white/10 pt-6 text-xs text-slate-500">© VIDAL ECOSYSTEM</footer></div></main>;
}
