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
  function flatten(value, prefix = "") {
    return Object.fromEntries(Object.entries(value).flatMap(([key, child]) =>
      typeof child === "string" ? [[prefix + key, child]] : Object.entries(flatten(child, prefix + key + "."))
    ));
  }
  const flat = messages.map((message) => flatten(message));
  const keys = Object.keys(flat[0]).sort();
  assert.ok(keys.length > 0);
  for (const message of messages) {
    assert.deepEqual(Object.keys(message).sort(), keys);
    assert.ok(Object.values(message).every((v) => typeof v === "string" && v.trim().length > 0));
  }
});
