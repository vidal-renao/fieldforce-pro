'use server';

import {cookies} from 'next/headers';
import {redirect} from 'next/navigation';
import {z} from 'zod';
import {routing} from '@/src/i18n/routing';
import {RECOVERY_COOKIE} from '@/src/lib/auth/recovery';
import {createSupabaseServerClient} from '@/src/lib/supabase/server';

const passwordSchema = z.string().min(12).max(1024);
const resetSchema = z.object({
  password: passwordSchema,
  confirmPassword: passwordSchema
});

function safeLocale(locale: string) {
  return routing.locales.includes(locale as (typeof routing.locales)[number]) ? locale : routing.defaultLocale;
}

export async function updateRecoveredPassword(locale: string, form: FormData) {
  const lang = safeLocale(locale);
  const store = await cookies();

  const parsed = resetSchema.safeParse({
    password: form.get('password'),
    confirmPassword: form.get('confirmPassword')
  });
  if (!parsed.success) redirect(`/${lang}/reset-password?error=invalid`);
  if (parsed.data.password !== parsed.data.confirmPassword) redirect(`/${lang}/reset-password?error=mismatch`);

  const supabase = await createSupabaseServerClient();
  const {data: {user}} = await supabase.auth.getUser();
  if (!user || store.get(RECOVERY_COOKIE)?.value !== user.id) redirect(`/${lang}/login?error=recovery`);

  const {error} = await supabase.auth.updateUser({password: parsed.data.password});
  if (error) redirect(`/${lang}/reset-password?error=update`);

  await supabase.auth.signOut({scope: 'local'});
  store.delete(RECOVERY_COOKIE);
  redirect(`/${lang}/login?reset=success`);
}
