export const instant=false;
import {notFound,redirect} from 'next/navigation';
import {connection} from 'next/server';
import {getTranslations,setRequestLocale} from 'next-intl/server';
import {createSupabaseServerClient} from '@/src/lib/supabase/server';
import {reopenOrder} from './actions';
type Order={id:string;title:string;status:string;priority:string;customer_name:string;created_at:string;scheduled_for:string|null};
type Event={event_type:string;old_status:string|null;new_status:string|null;occurred_at:string};
export default async function OrderDetail({params,searchParams}:{params:Promise<{locale:string;id:string}>;searchParams:Promise<{org?:string;result?:string}>}){
 const {locale,id}=await params;const {org,result}=await searchParams;
 setRequestLocale(locale);
 if(!/^[0-9a-f]{8}-[0-9a-f-]{27,}$/i.test(id))notFound();
 await connection();
 const db=await createSupabaseServerClient();
 const {data:{user},error:authError}=await db.auth.getUser();
 if(authError||!user)redirect(`/${locale}/login`);
 const {data:memberships,error:orgError}=await db.rpc('fieldforce_my_organizations');
 if(orgError||!Array.isArray(memberships))notFound();
 const membership=memberships.find((m:{organization_id:string})=>m.organization_id===org);
 if(!membership)notFound();
 const [{data:orders,error:orderError},{data:events,error:eventError}]=await Promise.all([
   db.rpc('fieldforce_get_order',{p_org:membership.organization_id,p_order:id}),
   db.rpc('fieldforce_list_events',{p_org:membership.organization_id,p_order:id})
 ]);
 if(orderError||eventError||!Array.isArray(orders)||!Array.isArray(events))notFound();
 const order=(orders as Order[])[0];
 if(!order)notFound();
 const canManage=['owner','admin'].includes(membership.member_role);
 const tm=await getTranslations('mvp');
 const fmt=(v:string)=>new Intl.DateTimeFormat(locale,{dateStyle:'medium',timeStyle:'short'}).format(new Date(v));
 return <main className="mx-auto min-h-screen max-w-5xl space-y-6 px-5 py-10 text-slate-100">
  <a href={`/${locale}/dashboard?org=${encodeURIComponent(membership.organization_id)}&view=${canManage?'orders':'my-jobs'}`} className="text-sm text-cyan-300 hover:underline">← {tm('orders')}</a>
  <header className="rounded-2xl border border-white/10 bg-[#101b30] p-6">
   <p className="text-xs font-bold uppercase tracking-wider text-cyan-300">{membership.organization_name}</p>
   <h1 className="mt-3 text-3xl font-bold">{order.title}</h1>
   <div className="mt-5 flex flex-wrap gap-2 text-sm">
    <span className="rounded-full bg-cyan-300/10 px-3 py-1 text-cyan-200">{tm(order.status as 'open'|'assigned'|'in_progress'|'completed'|'cancelled')}</span>
    <span className="rounded-full border border-white/20 px-3 py-1">{tm(order.priority as 'low'|'normal'|'high'|'urgent')}</span>
   </div>
  </header>
  {result?<p role={result==='reopened'?'status':'alert'} className="rounded-xl border border-white/15 p-4 text-sm">{result==='reopened'?tm('reopenSuccess'):tm('orderActionError')}</p>:null}
  <section className="grid gap-5 md:grid-cols-2">
   <div className="rounded-2xl border border-white/10 bg-[#101b30] p-6">
    <h2 className="text-lg font-bold">{tm('customer')}</h2>
    <p className="mt-3">{order.customer_name}</p>
    <h3 className="mt-5 text-sm font-bold">{tm('priority')}</h3>
    <p className="mt-2">{tm(order.priority as 'low'|'normal'|'high'|'urgent')}</p>
    <h3 className="mt-5 text-sm font-bold">{tm('orderCreated')}</h3><p className="mt-2 text-slate-300">{fmt(order.created_at)}</p>
    <h3 className="mt-5 text-sm font-bold">{tm('orderScheduled')}</h3><p className="mt-2 text-slate-300">{order.scheduled_for?fmt(order.scheduled_for):tm('unscheduled')}</p>
   </div>
   <div className="rounded-2xl border border-white/10 bg-[#101b30] p-6">
    <h2 className="text-lg font-bold">{tm('eventHistory')}</h2>
    {events.length===0?<p className="mt-4 text-sm text-slate-400">{tm('noEvents')}</p>:<ol className="mt-5 space-y-4">{(events as Event[]).map((event,i)=><li key={i} className="border-l-2 border-cyan-400/40 pl-4">
      <p className="font-semibold">{event.event_type}</p>
      <p className="mt-1 text-xs text-slate-400">{fmt(event.occurred_at)}</p>
      {event.new_status?<p className="mt-1 text-sm text-slate-300">{event.old_status??'—'} → {event.new_status}</p>:null}
    </li>)}</ol>}
   </div>
  </section>
  {canManage&&order.status==='completed'?<section className="rounded-2xl border border-amber-400/20 bg-[#101b30] p-6">
   <h2 className="text-lg font-bold">{tm('reopenTitle')}</h2>
   <p className="mt-2 text-sm text-slate-400">{tm('reopenHelp')}</p>
   <form action={reopenOrder.bind(null,locale)} className="mt-5 space-y-4">
    <input type="hidden" name="org" value={membership.organization_id}/><input type="hidden" name="order" value={order.id}/>
    <label className="block text-sm">{tm('reopenReason')}<textarea name="reason" required minLength={5} maxLength={500} rows={3} className="mt-2 w-full rounded-xl border border-slate-500 bg-[#080f20] p-3"/></label>
    <button className="rounded-xl bg-amber-300 px-5 py-3 text-sm font-bold text-slate-950">{tm('reopenAction')}</button>
   </form>
  </section>:null}
  <footer className="border-t border-white/10 pt-5 text-xs text-slate-500">© VIDAL ECOSYSTEM</footer>
 </main>;
}
