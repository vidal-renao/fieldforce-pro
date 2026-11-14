'use server';

import {redirect} from 'next/navigation';
import {z} from 'zod';
import {routing} from '@/src/i18n/routing';
import {getApplicationOrigin} from '@/src/lib/auth/recovery';
import {createSupabaseServerClient} from '@/src/lib/supabase/server';

const emailSchema = z.string().trim().email().max(254);

function safeLocale(locale: string) {
  return routing.locales.includes(locale as (typeof routing.locales)[number]) ? locale : routing.defaultLocale;
}

export async function requestPasswordRecovery(locale: string, form: FormData) {
  const lang = safeLocale(locale);
  const parsed = emailSchema.safeParse(form.get('email'));
  if (!parsed.success) redirect(`/${lang}/forgot-password?error=invalid`);

  const origin = getApplicationOrigin();
  const next = encodeURIComponent(`/${lang}/reset-password`);
  const supabase = await createSupabaseServerClient();
  try {
    await supabase.auth.resetPasswordForEmail(parsed.data, {
      redirectTo: `${origin}/auth/confirm?next=${next}`
    });
  } catch {
    // The public result remains neutral for remote failures and unknown accounts.
  }
  redirect(`/${lang}/forgot-password?sent=1`);
}
