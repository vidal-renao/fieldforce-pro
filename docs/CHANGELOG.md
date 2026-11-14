# Changelog

## Unreleased — Evolución Premium, 2026-11-14

- Documentada la aprobación de arquitectura B selectiva y fase 1 de seguridad y shell frontend.
- Añadidos EARS, QA, tareas, exclusiones y decisiones pendientes en VE-FF-PREMIUM-001 y ADR-0004.
- Actualizado MEMORY para sustituir el estado T01 obsoleto por el alcance activo.
- Registrada ampliación aprobada para preparar Supabase, GitHub y Vercel: reutilizar proyecto Supabase de menor actividad observada y esquema `fieldforce` existentes, repositorio y proyecto Vercel actuales, sin duplicados.
- Corregida autorización de pertenencia ausente en `issue_invitation`, `reassign_technician` y `reopen_order` mediante migración aditiva local `20261113233811`, aplicada en Supabase como `20261114001433 fieldforce_phase1_authorization_null_guards`.
- Supabase local aplicó 18 migraciones; pruebas SQL locales/remotas con ROLLBACK satisfactorias, con cero fixtures remotos residuales y las tres funciones verificadas.
- Implementado shell claro basado en la demo y componentes de presentación; incorporados localmente cuatro commits de código/tests de PR #19 sin fusionar la PR.
- Validación local: 62/62 tests, lint/typecheck sin errores y build Next.js 16.4.3 satisfactorio. Audit: siete moderadas transitivas de desarrollo vía minimatch/@typescript-eslint, cero altas/críticas; sin fix automático.
- Matriz SQL ampliada local/remota PASS: permisos anon, RPC públicas authenticated, denegación de no miembro/técnico/owner de otra empresa y emisión autorizada por owner/admin, según alcance documentado.
- Añadida [matriz de aceptación parcial](acceptance/VE-FF-PREMIUM-001-phase-1.md). UAT visual, push/PR y preview pendientes; producción no autorizada.

## Histórico — T01 foundation
- Add next-intl 4.14.9 and reproducible lockfile.
- Locale-aware routes /de, /en, /es with German default, locale language switcher and per-locale HTML language.
- Add locale message consistency tests and CI smoke tests.
- Add environment template, ADR and engineering memory.
- No Supabase schema, authentication or work-order implementation.

© VIDAL ECOSYSTEM
