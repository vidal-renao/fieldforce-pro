export const instant=false;
import {getTranslations,setRequestLocale} from 'next-intl/server';
import {acceptInvitation} from './actions';
export default async function InvitationPage({params,searchParams}:{params:Promise<{locale:string}>;searchParams:Promise<{error?:string}>}){
 const {locale}=await params;const {error}=await searchParams;setRequestLocale(locale);
 const t=await getTranslations('auth');
 return <main className="mx-auto w-full max-w-lg px-6 py-16 text-slate-100">
 <h1 className="text-3xl font-bold">{t('acceptInviteTitle')}</h1>
 <p className="mt-4 text-slate-300">{t('acceptInviteDescription')}</p>
 {error?<p role="alert" className="mt-4 text-rose-300">{t('inviteError')}</p>:null}
 <form action={acceptInvitation.bind(null,locale)} className="mt-6 space-y-4">
  <label htmlFor="token" className="block text-sm">{t('inviteToken')}</label>
  <input name="token" id="token" required minLength={32} maxLength={32} autoComplete="off" className="w-full rounded border border-slate-500 bg-slate-900 p-3 font-mono"/>
  <button className="rounded bg-cyan-300 px-5 py-3 font-bold text-slate-950">{t('acceptInvite')}</button>
 </form></main>;
}
