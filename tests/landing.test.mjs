import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const source = readFileSync(new URL("../app/[locale]/page.tsx", import.meta.url), "utf8");
const layout = readFileSync(new URL("../app/[locale]/layout.tsx", import.meta.url), "utf8");
const locales = ["de","en","es"];

test("landing exposes accessible semantic landmarks and locale-aware links", () => {
  for (const fragment of ["<main", "<header", "<nav", "<footer", "aria-current", "aria-label", "locale={code}"]) {
    assert.ok(source.includes(fragment), `Missing landing semantic marker: ${fragment}`);
  }
});
test("locale HTML document and non-indexing are maintained", () => {
  assert.match(layout, /<html lang=\{locale\}/);
  assert.match(layout, /index: false/);
});
test("public landing messages are translated across locales", () => {
  for (const locale of locales) {
    const msg = JSON.parse(readFileSync(new URL(`../messages/${locale}.json`, import.meta.url), "utf8"));
    for (const key of ["eyebrow","title","tagline","statusTitle","statusDescription","featureOneTitle","featureOneDescription","featureTwoTitle","featureTwoDescription","featureThreeTitle","featureThreeDescription","previewLabel","footerNote","languageLabel"]) {
      assert.equal(typeof msg[key], "string", `${locale} missing ${key}`);
      assert.ok(msg[key].trim().length > 0);
    }
  }
});
