'use server';

import {redirect} from 'next/navigation';
import {createSupabaseServerClient} from '@/src/lib/supabase/server';
import {routing} from '@/src/i18n/routing';

function safeLocale(locale: string) {
  return routing.locales.includes(locale as (typeof routing.locales)[number]) ? locale : routing.defaultLocale;
}

export async function signIn(locale: string, form: FormData) {
  const lang = safeLocale(locale);
  const email = String(form.get('email') ?? '').trim();
  const password = String(form.get('password') ?? '');
  if (!email || !password || email.length > 254 || password.length > 1024) {
    redirect(`/${lang}/login?error=invalid`);
  }
  const supabase = await createSupabaseServerClient();
  const {error} = await supabase.auth.signInWithPassword({email,password});
  if (error) redirect(`/${lang}/login?error=credentials`);
  redirect(`/${lang}/dashboard`);
}

export async function signOut(locale: string) {
  const lang = safeLocale(locale);
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect(`/${lang}/login`);
}
