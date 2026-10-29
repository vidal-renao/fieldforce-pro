export const LOCALES = Object.freeze(["de", "en", "es"]);
export const DEFAULT_LOCALE = "de";

export function isSupportedLocale(value) {
  return typeof value === "string" && LOCALES.includes(value);
}

export function normalizeLocale(value) {
  return isSupportedLocale(value) ? value : DEFAULT_LOCALE;
}
