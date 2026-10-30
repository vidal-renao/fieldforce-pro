'use server';
import {redirect} from 'next/navigation';
import {createSupabaseServerClient} from '@/src/lib/supabase/server';
import {routing} from '@/src/i18n/routing';
export async function acceptInvitation(locale:string,form:FormData){
 const lang=routing.locales.includes(locale as (typeof routing.locales)[number])?locale:routing.defaultLocale;
 const token=String(form.get('token')??'').trim().toLowerCase();
 if(!/^[a-f0-9]{32}$/.test(token))redirect('/'+lang+'/invitation?error=invalid');
 const client=await createSupabaseServerClient();
 const {data:{user},error:authError}=await client.auth.getUser();
 if(authError||!user)redirect('/'+lang+'/login');
 const {error}=await client.rpc('fieldforce_accept_invitation',{p_token:token});
 if(error)redirect('/'+lang+'/invitation?error=invalid');
 redirect('/'+lang+'/dashboard?joined=1');
}
