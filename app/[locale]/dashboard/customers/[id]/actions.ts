'use server';
import {redirect} from 'next/navigation';
import {z} from 'zod';
import {routing} from '@/src/i18n/routing';
import {createSupabaseServerClient} from '@/src/lib/supabase/server';
const schema=z.object({org:z.string().uuid(),customer:z.string().uuid(),name:z.string().trim().min(1).max(180),email:z.union([z.email().max(254),z.literal('')]),phone:z.string().trim().max(60),notes:z.string().trim().max(2000)});
export async function updateCustomer(locale:string,form:FormData){
 const lang=routing.locales.includes(locale as (typeof routing.locales)[number])?locale:routing.defaultLocale;
 const raw={org:form.get('org'),customer:form.get('customer'),name:form.get('name'),email:form.get('email')??'',phone:form.get('phone')??'',notes:form.get('notes')??''};
 const parsed=schema.safeParse(raw);
 const back=(code:string)=>`/${lang}/dashboard/customers/${encodeURIComponent(String(raw.customer??''))}?org=${encodeURIComponent(String(raw.org??''))}&notice=${code}`;
 if(!parsed.success)redirect(back('invalid'));
 const db=await createSupabaseServerClient();
 const {data:{user},error}=await db.auth.getUser();
 if(error||!user)redirect(`/${lang}/login`);
 const {data,error:rpcError}=await db.rpc('fieldforce_update_customer',{p_org:parsed.data.org,p_customer:parsed.data.customer,p_name:parsed.data.name,p_email:parsed.data.email,p_phone:parsed.data.phone,p_notes:parsed.data.notes});
 redirect(back(rpcError||data!==true?'error':'saved'));
}
