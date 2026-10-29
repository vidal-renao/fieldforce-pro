import test from "node:test";
import assert from "node:assert/strict";
import { DEFAULT_LOCALE, LOCALES, isSupportedLocale, normalizeLocale } from "../src/i18n/config.mjs";
import { readFileSync } from "node:fs";

test("locale configuration includes only DE/EN/ES and defaults to DE", () => {
  assert.deepEqual(LOCALES, ["de", "en", "es"]);
  assert.equal(DEFAULT_LOCALE, "de");
});

test("unsupported locale falls back safely", () => {
  assert.equal(isSupportedLocale("de"), true);
  assert.equal(isSupportedLocale("fr"), false);
  assert.equal(normalizeLocale("fr"), "de");
  assert.equal(normalizeLocale(undefined), "de");
  assert.equal(normalizeLocale("es"), "es");
});

test("translated messages have matching keys and non-empty text", () => {
  const locales = LOCALES;
  const messages = locales.map((locale) => JSON.parse(readFileSync(new URL(`../messages/${locale}.json`, import.meta.url), "utf8")));
  const keys = Object.keys(messages[0]).sort();
  assert.ok(keys.length > 0);
  for (const message of messages) {
    assert.deepEqual(Object.keys(message).sort(), keys);
    assert.ok(Object.values(message).every((v) => typeof v === "string" && v.trim().length > 0));
  }
});
