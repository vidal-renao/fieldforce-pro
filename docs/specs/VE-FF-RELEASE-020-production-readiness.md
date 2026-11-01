# VE-FF-RELEASE-020 — FieldForce Pro Production Readiness
© VIDAL ECOSYSTEM

Status: WORK IN PROGRESS. Product is NOT yet production accepted.
Owner: VIDAL ECOSYSTEM. Roles: coordinator, planner, db-architect, frontend-designer, implementer, reviewer, docs-keeper.
Policy: one consolidated production release; no unauthorized changes to QA-001, other Supabase schemas or tenant accounts.

## P0 Stabilization — EARS
- WHEN an authorized user requests dashboard, order detail, or customer detail, the system SHALL render in request context, not static prerender.
- IF a visitor is unauthenticated, the system SHALL redirect to locale-aware login without leaking tenant data.
- WHEN a runtime error occurs, the system SHALL emit diagnosable telemetry without secrets.
Acceptance: CI green; owner and technician authenticated E2E; Vercel error counts assessed after production test, no regressions.

## P1 UAT
- Owner/admin SHALL list, search, paginate, view and edit only own-org customers; staff permissions enforced by SQL RLS.
- Owner/admin SHALL create, assign, complete/reopen orders according to T02 contract, retaining immutable audit history.
- Technician SHALL see only assigned orders and SHALL NOT edit customer/admin operations.
- Distinct QA fixture (QA-002) SHALL be used for mutating tests; QA-001 historical baseline remains unchanged.
Acceptance: real browser owner/technician E2E plus PostgreSQL evidence, test fixture teardown.

## T06 Technician UX
- Assigned technician SHALL have responsive mobile-first my-jobs view, detail, status actions, required confirmation and localized feedback DE/EN/ES.
- UI SHALL expose no controls unauthorized by SQL and maintain keyboard focus and accessible labels.
Acceptance: Playwright mobile widths and desktop, status transitions, denial tests.

## T07 Quality Gates
- Unit/integration: Vitest or existing Node tests; Playwright authenticated E2E.
- Security: RLS cross-tenant matrices, authenticated-only RPCs, Zod, secret scan, no service-role in client, nDSG data minimization.
- Accessibility: WCAG 2.2 AA core workflows; performance budgets agreed before final release.
- Reliability: prevent partial writes, concurrent assignment inconsistencies, errors/empty/loading states.
Acceptance: CI green, regression matrix and documented residual risks.

## T08 Release
- Final release candidate includes CHANGELOG, MEMORY.md, ADR, rollback plan and deployment inventory.
- Deploy only once with verified main SHA; inspect Vercel READY and alias; run authenticated production smoke tests.
- Document every RF as PASS/FAIL with links to evidence. No 'finished' claim without PASS for required RFs.

## Tasks (max 10)
T01 P0 session/prerender hardening
T02 Authenticated owner/technician E2E and runtime error check
T03 CRM and order acceptance with reversible QA fixtures
T04 Technician mobile view and status action UX
T05 Localization and responsive/accessibility review
T06 RLS and API authorization matrix
T07 Race conditions, logging and performance
T08 CI Playwright and regression automation
T09 Documentation, CHANGELOG, ADR, migration and rollback
T10 Consolidated release verification and sign-off

No feature-completeness claim until all mandatory acceptance gates pass.
