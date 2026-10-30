# T03 — Authentication and tenant security

Date: 2026-10-30. Status: implementation in Git branch; must pass final deployment verification.

## Verified database behavior
Shared Supabase project `upuhppsbolpdpaighzfq`, private schema `fieldforce`:
- Six tenant tables with RLS.
- Six member-scoped SELECT policies.
- Six write policies: owner/admin create/update customers and work orders; owner/admin create/remove technician assignments.
- Database trigger rejects changes to organization_id on customers and work_orders.
- Authenticated technician cannot insert; admin of organization A cannot insert into organization B (tested with temporary rollback-only SQL fixtures).
- Owner bootstrap creates organization and owner membership atomically, after auth.uid check.
- Public RPC is SECURITY INVOKER; privileged helper lives only in non-exposed schema `fieldforce_private`. Security Advisor no longer reports a FieldForce public SECURITY DEFINER function.
- Tests used BEGIN/ROLLBACK. No test organization or user membership was persisted.

## Web authentication
- Supabase SSR server-side cookie handling, password sign-in and sign-out.
- Login routes `/de/login`, `/en/login`, `/es/login`.
- Authenticated private dashboard `/<locale>/dashboard`, with identity checked via auth.getUser().
- Company creation via guarded `fieldforce_create_organization` RPC and own company listing via RLS-backed `fieldforce_my_organizations` RPC.
- Vercel environment uses only publishable/anon API values, NEVER service_role.
- Request proxy refreshes Supabase session cookies.

## Outstanding, cannot claim T03 fully accepted
- Email registration/verification and secure multiuser invitations must be designed for *shared* Supabase Auth without changing existing apps' global redirect or email settings.
- No actual signed-in browser E2E test with a dedicated non-production test account has yet been performed.
- No privileged admin role invitation flow exposed to users. Policy groundwork is present.
- Other projects in the shared Supabase instance were not modified.

## Regression
Keep T01 locale smoke test, T02 schema integrity test, and T03 SQL/RLS tests green on latest commit.
The fieldforce schema is not added to the Supabase Data API exposed schemas; public RPCs are explicitly permission-scoped.
