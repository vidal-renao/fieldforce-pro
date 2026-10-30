import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=(p)=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('login uses authenticated Supabase server action and never service role',()=>{
 const actions=read('app/[locale]/login/actions.ts');
 assert.match(actions,/signInWithPassword/);
 assert.match(actions,/supabase\.auth\.signOut\(\)/);
 assert.doesNotMatch(actions,/service_role|SUPABASE_SERVICE_ROLE_KEY/);
});
test('dashboard verifies the user identity on server before access',()=>{
 const source=read('app/[locale]/dashboard/page.tsx');
 assert.match(source,/supabase\.auth\.getUser\(\)/);
 assert.match(source,/redirect\(.*login/);
 assert.match(source,/fieldforce_my_organizations/);
});
test('onboarding binds auth identity and never accepts external role or user ID',()=>{
 const sql=read('supabase/migrations/20261030040000_t03_secure_onboarding.sql').toLowerCase();
 assert.match(sql,/auth\.uid\(\)/);
 assert.match(sql,/values \(v_id,v_user,'owner'\)/);
 assert.match(sql,/security definer/);
 assert.match(sql,/security invoker/);
 assert.match(sql,/set search_path = ''/);
 assert.doesNotMatch(sql,/raw_user_meta_data|p_user_id|p_role/);
});
