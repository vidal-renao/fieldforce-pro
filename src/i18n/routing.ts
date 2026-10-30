import {defineRouting} from 'next-intl/routing';
export const routing = defineRouting({
  locales: ['de', 'en', 'es'],
  defaultLocale: 'de',
  localePrefix: 'always',
  localeDetection: false
});
