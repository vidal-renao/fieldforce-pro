'use server';
import {createSupabaseServerClient} from '@/src/lib/supabase/server';
type InviteState={token:string|null;error:boolean};
export async function issueInvitation(orgId:string,_previous:InviteState,form:FormData):Promise<InviteState> {
 const email=String(form.get('email')??'').trim().toLowerCase();
 const role=String(form.get('role')??'');
 if(!/^[0-9a-f-]{36}$/.test(orgId)||email.length>254||email.length<3||!email.includes('@')||!['admin','technician'].includes(role))return {token:null,error:true};
 const supabase=await createSupabaseServerClient();
 const {data:{user}}=await supabase.auth.getUser();
 if(!user)return {token:null,error:true};
 const {data,error}=await supabase.rpc('fieldforce_issue_invitation',{p_org:orgId,p_email:email,p_role:role});
 if(error||typeof data!=='string')return {token:null,error:true};
 return {token:data,error:false};
}
