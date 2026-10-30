import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../app/[locale]/dashboard/page.tsx',import.meta.url),'utf8');
test('localized private dashboard offers all configured languages and preserves tenant',()=>{
 assert.match(source,/routing\.locales\.map/);
 assert.match(source,/\/dashboard/);
 assert.match(source,/encodeURIComponent\(activeOrg\)/);
 assert.match(source,/aria-current=\{locale===code\?'page'/);
 assert.match(source,/aria-label=\{tm\('languageNavigation'\)\}/);
});
