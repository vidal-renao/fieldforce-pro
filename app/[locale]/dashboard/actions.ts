'use server';

import {redirect} from 'next/navigation';
import {createSupabaseServerClient} from '@/src/lib/supabase/server';
import {routing} from '@/src/i18n/routing';

export async function createOrganization(locale: string, form: FormData) {
  const lang = routing.locales.includes(locale as (typeof routing.locales)[number]) ? locale : routing.defaultLocale;
  const name = String(form.get('name') ?? '').trim();
  if (name.length < 2 || name.length > 160) redirect(`/${lang}/dashboard?error=name`);
  const supabase = await createSupabaseServerClient();
  const {data:{user},error:authError} = await supabase.auth.getUser();
  if (authError || !user) redirect(`/${lang}/login`);
  const {error} = await supabase.rpc('fieldforce_create_organization',{p_name:name});
  if (error) redirect(`/${lang}/dashboard?error=create`);
  redirect(`/${lang}/dashboard?created=1`);
}
