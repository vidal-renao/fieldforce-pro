import type {NextRequest} from 'next/server';
import createMiddleware from 'next-intl/middleware';
import {createServerClient} from '@supabase/ssr';
import {routing} from './src/i18n/routing';

const i18nMiddleware = createMiddleware(routing);

export default async function proxy(request: NextRequest) {
  const response = i18nMiddleware(request);
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return response;

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {return request.cookies.getAll();},
      setAll(cookies) {
        cookies.forEach(({name,value}) => request.cookies.set(name,value));
        cookies.forEach(({name,value,options}) => response.cookies.set(name,value,options));
      }
    }
  });
  // Validate and refresh a session without trusting an unverified cookie payload.
  await supabase.auth.getUser();
  return response;
}

export const config = {
  matcher: '/((?!api|trpc|_next|_vercel|.*\\..*).*)'
};
