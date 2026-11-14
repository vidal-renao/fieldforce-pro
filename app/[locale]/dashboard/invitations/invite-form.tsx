'use client';
import {useActionState} from 'react';
import {issueInvitation} from './actions';
export function InviteForm({orgId,labels}:{orgId:string;labels:Record<string,string>}) {
 const [state,action,pending]=useActionState(issueInvitation.bind(null,orgId),{token:null,error:false});
 return <form action={action} className="mt-4 space-y-3 rounded-xl border border-slate-200 bg-slate-50 text-[#14263c] p-5">
  <label className="block text-sm" htmlFor={'invite-email-'+orgId}>{labels.inviteEmail}</label>
  <input id={'invite-email-'+orgId} name="email" type="email" required maxLength={254} className="w-full rounded border border-slate-400 bg-white p-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3265df]" />
  <label className="block text-sm" htmlFor={'invite-role-'+orgId}>{labels.inviteRole}</label>
  <select id={'invite-role-'+orgId} name="role" className="w-full rounded border border-slate-400 bg-white p-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3265df]">
   <option value="technician">{labels.technician}</option><option value="admin">{labels.admin}</option>
  </select>
  <button disabled={pending} className="min-h-11 rounded-lg bg-[#3265df] px-4 py-2 font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3265df] disabled:opacity-50">{labels.issueInvite}</button>
  {state.error?<p role="alert" className="text-rose-800">{labels.inviteError}</p>:null}
  {state.token?<div role="status" className="rounded border border-amber-200 bg-amber-50 p-3">
    <p className="text-sm text-amber-900">{labels.inviteInstructions}</p>
    <output className="mt-2 block break-all font-mono text-sm select-all">{state.token}</output>
   </div>:null}
 </form>;
}
