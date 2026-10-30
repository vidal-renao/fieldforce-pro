import {cookies} from 'next/headers';
import {createServerClient} from '@supabase/ssr';

export async function createSupabaseServerClient() {
  const store = await cookies();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('Supabase public configuration missing');
  return createServerClient(url, key, {
    cookies: {
      getAll() {return store.getAll();},
      setAll(values) {
        try {
          for (const {name, value, options} of values) store.set(name, value, options);
        } catch {
          // Server Components cannot set cookies. Server Actions perform writes.
        }
      }
    }
  });
}
