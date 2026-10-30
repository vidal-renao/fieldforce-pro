'use server';
import {redirect} from 'next/navigation';
import {createSupabaseServerClient} from '@/src/lib/supabase/server';
import {routing} from '@/src/i18n/routing';
import {z} from 'zod';

const uuid=z.string().uuid();
const customer=z.object({org:uuid,name:z.string().trim().min(1).max(180),email:z.union([z.email().max(254),z.literal('')]),phone:z.string().trim().max(60)});
const order=z.object({org:uuid,customer:uuid,title:z.string().trim().min(1).max(200),priority:z.enum(['low','normal','high','urgent'])});
const status=z.object({org:uuid,order:uuid,status:z.enum(['open','assigned','in_progress','completed','cancelled'])});
const locale=(l:string)=>routing.locales.includes(l as (typeof routing.locales)[number])?l:routing.defaultLocale;
const dest=(l:string,org:string,code:string)=>`/${locale(l)}/dashboard?org=${encodeURIComponent(org)}&notice=${code}`;
async function userClient(l:string){
 const supabase=await createSupabaseServerClient();
 const {data:{user},error}=await supabase.auth.getUser();
 if(error||!user)redirect(`/${locale(l)}/login`);
 return supabase;
}
export async function addCustomer(l:string,form:FormData){
 const parsed=customer.safeParse({org:form.get('org'),name:form.get('name'),email:form.get('email')??'',phone:form.get('phone')??''});
 if(!parsed.success)redirect(dest(l,String(form.get('org')??''),'invalid'));
 const supabase=await userClient(l);
 const {error}=await supabase.rpc('fieldforce_create_customer',{p_org:parsed.data.org,p_name:parsed.data.name,p_email:parsed.data.email||null,p_phone:parsed.data.phone||null});
 redirect(dest(l,parsed.data.org,error?'error':'customer'));
}
export async function addOrder(l:string,form:FormData){
 const parsed=order.safeParse({org:form.get('org'),customer:form.get('customer'),title:form.get('title'),priority:form.get('priority')});
 if(!parsed.success)redirect(dest(l,String(form.get('org')??''),'invalid'));
 const supabase=await userClient(l);
 const {error}=await supabase.rpc('fieldforce_create_order',{p_org:parsed.data.org,p_customer:parsed.data.customer,p_title:parsed.data.title,p_priority:parsed.data.priority});
 redirect(dest(l,parsed.data.org,error?'error':'order'));
}
export async function changeStatus(l:string,form:FormData){
 const parsed=status.safeParse({org:form.get('org'),order:form.get('order'),status:form.get('status')});
 if(!parsed.success)redirect(dest(l,String(form.get('org')??''),'invalid'));
 const supabase=await userClient(l);
 const {data,error}=await supabase.rpc('fieldforce_change_order_status',{p_org:parsed.data.org,p_order:parsed.data.order,p_status:parsed.data.status});
 redirect(dest(l,parsed.data.org,error||data!==true?'error':'status'));
}

const assignment=z.object({org:uuid,order:uuid,technician:uuid});
export async function assignTechnician(l:string,form:FormData){
 const parsed=assignment.safeParse({org:form.get('org'),order:form.get('order'),technician:form.get('technician')});
 if(!parsed.success)redirect(dest(l,String(form.get('org')??''),'invalid'));
 const client=await userClient(l);
 const {error,data}=await client.rpc('fieldforce_assign_technician',{p_org:parsed.data.org,p_order:parsed.data.order,p_technician:parsed.data.technician});
 redirect(dest(l,parsed.data.org,error||data!==true?'error':'assigned'));
}
export async function technicianStatus(l:string,form:FormData){
 const parsed=z.object({org:uuid,order:uuid,status:z.enum(['in_progress','completed'])}).safeParse({org:form.get('org'),order:form.get('order'),status:form.get('status')});
 if(!parsed.success)redirect(dest(l,String(form.get('org')??''),'invalid'));
 const client=await userClient(l);
 const {error,data}=await client.rpc('fieldforce_technician_change_status',{p_org:parsed.data.org,p_order:parsed.data.order,p_status:parsed.data.status});
 redirect(dest(l,parsed.data.org,error||data!==true?'error':'status'));
}
