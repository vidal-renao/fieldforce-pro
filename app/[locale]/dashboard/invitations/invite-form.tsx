'use client';
import {useActionState} from 'react';
import {issueInvitation} from './actions';
export function InviteForm({orgId,labels}:{orgId:string;labels:Record<string,string>}) {
 const [state,action,pending]=useActionState(issueInvitation.bind(null,orgId),{token:null,error:false});
 return <form action={action} className="mt-4 space-y-3 rounded-xl border border-slate-700 bg-slate-900 p-5">
  <label className="block text-sm" htmlFor={'invite-email-'+orgId}>{labels.inviteEmail}</label>
  <input id={'invite-email-'+orgId} name="email" type="email" required maxLength={254} className="w-full rounded border border-slate-600 bg-slate-950 p-3" />
  <label className="block text-sm" htmlFor={'invite-role-'+orgId}>{labels.inviteRole}</label>
  <select id={'invite-role-'+orgId} name="role" className="w-full rounded border border-slate-600 bg-slate-950 p-3">
   <option value="technician">{labels.technician}</option><option value="admin">{labels.admin}</option>
  </select>
  <button disabled={pending} className="rounded bg-cyan-300 px-4 py-2 font-semibold text-slate-950 disabled:opacity-50">{labels.issueInvite}</button>
  {state.error?<p role="alert" className="text-rose-300">{labels.inviteError}</p>:null}
  {state.token?<div role="status" className="rounded border border-amber-500/40 p-3">
    <p className="text-sm text-amber-200">{labels.inviteInstructions}</p>
    <output className="mt-2 block break-all font-mono text-sm select-all">{state.token}</output>
   </div>:null}
 </form>;
}
