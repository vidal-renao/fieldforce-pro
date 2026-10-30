# FieldForce Pro — Engineering memory

Baseline: VE-FFP-PLAN-001 v1.0 approved.
Active task: T01 foundation, pending final CI and PR review; T02 not authorized.
Repository: vidal-renao/fieldforce-pro.
Stack: Next.js 16.4.3, next-intl 4.14.9, React 19.3.0, TypeScript strict, Tailwind CSS 4.
Locales: de (default), en, es. Canonical routes: /de, /en, /es. Root redirects to /de using Next.js 16 proxy.
Quality: node:test, ESLint, TypeScript, production build, localized HTTP smoke checks in GitHub Actions.
Guardrail: no Supabase database/auth/schema or product features in T01. Secrets must not be committed.
Next gate: final CI green and user review of PR #2 before merge and before T02.

© VIDAL ECOSYSTEM
