# ADR-0001 — Modular monolith as MVP foundation

Status: Accepted in PLAN VE-FFP-PLAN-001 v1.0 (implementation limited to T01).
Date: 2026-10-30

## Context
FieldForce Pro is an early-stage Next.js application. Multi-tenancy, Auth and domain entities belong to later tasks.

## Decision
Maintain a single Next.js application using TypeScript strict. Group code by responsibility as domains are introduced, with server-side validation and authorization. Adopt Supabase PostgreSQL and RLS only in the approved T02/T03 phases. Avoid service splitting or speculative modules.

## Security
Use least privilege, no secrets in Git, validate untrusted inputs and test cross-tenant isolation before releasing functional features.

## Consequences
Minimal operational overhead; boundaries must be preserved through module discipline and tests. Internationalization text scaffolding exists, but full next-intl routing is not yet installed in T01 pending reproducible dependency-lock update.

© VIDAL ECOSYSTEM
