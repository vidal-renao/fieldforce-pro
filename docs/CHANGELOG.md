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
- Publicada rama `codex/hardening-phase-1`, commit `31b9c393fb5ff0809addc7dc3ef8ca83e1dc8501`, y [PR #20 draft](https://github.com/vidal-renao/fieldforce-pro/pull/20); checks quality (1 min 11 s), Vercel y Preview Comments satisfactorios.
- [Preview READY](https://fieldforce-1r2o7k4ia-vidal-renaos-projects.vercel.app), deployment `dpl_HitdF5RQV2TwGZzCgRWR69ZMj24D`. Smoke: DE/EN/ES 200 y dashboard sin sesión redirige 307 a login.
- Actualizada [matriz de aceptación parcial](acceptance/VE-FF-PREMIUM-001-phase-1.md): P1-INF-02, T08 automatizado/consolidado y T09 PASS. UAT autenticada móvil/escritorio, teclado e idiomas y aceptación final pendientes; producción no autorizada.
- Implementada recuperación segura de contraseña en DE/EN/ES con solicitud neutral, validación Zod, callback SSR `recovery`, destinos cerrados, cookie HTTP-only vinculada al usuario, cambio de contraseña y cierre de sesión local.
- Añadidos 5 contratos de recuperación. Validación actual: 67/67 tests, lint, typecheck, build y CI PASS. La primera preview descubrió un 404 del callback causado por i18n; corregido con prueba de regresión en `b8103a0`.
- [Preview de recuperación READY](https://fieldforce-r9phiugmc-vidal-renaos-projects.vercel.app), deployment `dpl_8uxPJVfR42GX5CXtAh3kLkajgWLF`. Configuración final de URLs/plantilla Supabase y recorrido real siguen pendientes; producción no autorizada.

## Histórico — T01 foundation
- Add next-intl 4.14.9 and reproducible lockfile.
- Locale-aware routes /de, /en, /es with German default, locale language switcher and per-locale HTML language.
- Add locale message consistency tests and CI smoke tests.
- Add environment template, ADR and engineering memory.
- No Supabase schema, authentication or work-order implementation.

© VIDAL ECOSYSTEM
