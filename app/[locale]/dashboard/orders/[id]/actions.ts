'use server';
import {redirect} from 'next/navigation';
import {z} from 'zod';
import {createSupabaseServerClient} from '@/src/lib/supabase/server';
import {routing} from '@/src/i18n/routing';
const schema=z.object({org:z.string().uuid(),order:z.string().uuid(),reason:z.string().trim().min(5).max(500)});
export async function reopenOrder(locale:string,form:FormData){
 const lang=routing.locales.includes(locale as (typeof routing.locales)[number])?locale:routing.defaultLocale;
 const parsed=schema.safeParse({org:form.get('org'),order:form.get('order'),reason:form.get('reason')});
 const back=(result:string)=>`/${lang}/dashboard/orders/${encodeURIComponent(String(form.get('order')??''))}?org=${encodeURIComponent(String(form.get('org')??''))}&result=${result}`;
 if(!parsed.success)redirect(back('invalid'));
 const db=await createSupabaseServerClient();
 const {data:{user},error:authError}=await db.auth.getUser();
 if(authError||!user)redirect(`/${lang}/login`);
 const {error,data}=await db.rpc('fieldforce_reopen_order',{p_org:parsed.data.org,p_order:parsed.data.order,p_reason:parsed.data.reason});
 redirect(back(error||data!==true?'error':'reopened'));
}
