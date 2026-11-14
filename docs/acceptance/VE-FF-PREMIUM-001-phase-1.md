# VE-FF-PREMIUM-001 — Aceptación de fase 1

Fecha: 2026-11-14. Estado: aceptación parcial. Corrección SQL aplicada y matriz SQL ampliada satisfactoria; frontend publicado en rama y preview READY con comprobaciones locales/CI satisfactorias. Validación visual autenticada y aceptación final pendientes. Producción no autorizada.

Referencias: [especificación y tareas](../specs/VE-FF-PREMIUM-001-phase-1.md), [ADR-0004](../adr/ADR-0004-selective-premium-evolution.md). Los resultados de ejecución de este registro fueron confirmados por el coordinador; la documentación no representa una segunda ejecución independiente.

## Evidencia de implementación y pruebas

| Evidencia | Resultado | Alcance y límite |
|---|---|---|
| Supabase local | PASS | Arranque y aplicación de 18 migraciones, incluida `20261113233811`. |
| [Migración versionada](../../supabase/migrations/20261113233811_phase1_authorization_null_guards.sql) | PASS de implementación | Corrige `issue_invitation`, `reassign_technician` y `reopen_order` con rechazo cuando la pertenencia permitida no sea verdadera. |
| [Prueba PostgreSQL](../../tests/sql/phase1_authorization.sql) local ampliada | PASS | Anon sin EXECUTE; RPC públicas bajo authenticated deniegan no miembro en invitación/reasignación/reapertura. Invitaciones: técnico y owner de otra empresa denegados, owner/admin de empresa autorizados. Conteo exacto y ROLLBACK. |
| Migración remota | PASS | Aplicada en `upuhppsbolpdpaighzfq` como `20261114001433 fieldforce_phase1_authorization_null_guards`. No equivale a despliegue frontend. |
| Prueba PostgreSQL remota ampliada y comprobación posterior | PASS | Misma matriz ampliada, conteo exacto y ROLLBACK; cero organizaciones, invitaciones y usuarios de fixtures residuales; las tres definiciones remotas contienen denegación explícita del rol ausente. |
| [Regresión estática de autorización](../../tests/security-authorization.test.mjs) | PASS dentro de la suite | Verifica la última definición versionada; no sustituye ejecución PostgreSQL ni RLS por API. |
| [Componentes de presentación](../../app/[locale]/dashboard/_components/presentation.tsx) y [tests](../../tests/frontend-components.test.mjs) | PASS local | Shell claro, paneles blancos, cabecera azul, texto escapado, semántica de métricas/estados y contraste de pares concretos. No constituye auditoría visual o WCAG completa. |
| Código/tests de PR #19 | PASS de incorporación local | Cuatro commits cherry-pickeados; PR no fusionada. Comprobación estática de contexto de petición anterior a acceso a sesión. |
| `npm test` | PASS, 62/62 | Suite local; no implica 62 E2E de navegador ni matriz SQL completa. |
| `npm run lint` | PASS | Cero errores. |
| `npm run typecheck` | PASS | Cero errores. |
| `npm run build` | PASS | Next.js 16.4.3; no demuestra funcionamiento productivo. |
| `npm audit` | Pendiente de remediación moderada | Siete moderadas transitivas de desarrollo vía minimatch/@typescript-eslint; cero altas y críticas. Sin fix automático ni actualización de versiones. |
| GitHub | PASS | Rama `codex/hardening-phase-1` publicada; commit `31b9c393fb5ff0809addc7dc3ef8ca83e1dc8501`; [PR #20 draft](https://github.com/vidal-renao/fieldforce-pro/pull/20). No fusionada. |
| Checks de la PR #20 | PASS | `quality` satisfactorio en 1 min 11 s; `Vercel` y `Preview Comments` satisfactorios. Resultado del commit indicado, no de cambios posteriores. |
| Vercel preview | READY | [Preview de fase 1](https://fieldforce-1r2o7k4ia-vidal-renaos-projects.vercel.app), deployment `dpl_HitdF5RQV2TwGZzCgRWR69ZMj24D`, correspondiente al commit indicado. No es promoción productiva. |
| Smoke de preview | PASS | `/es`, `/de` y `/en` responden HTTP 200; `/es/dashboard` sin sesión ejecuta `NEXT_REDIRECT` 307 a `/es/login`. No prueba una sesión autenticada ni el diseño en navegador. |

## Matriz por requisito

PENDIENTE significa que aún falta parte de la aceptación, aunque exista implementación y evidencia parcial. No se rebajan los criterios para convertir comprobaciones parciales en aceptación completa.

| Requisito | Estado | Evidencia y pendiente |
|---|---|---|
| P1-SEC-01 | PASS | Matriz SQL local/remota: anon sin EXECUTE; authenticated no miembro, técnico y owner de otra empresa denegados para invitaciones; owner/admin destino autorizados por RPC pública. |
| P1-SEC-02 | PASS en la corrección de pertenencia ausente | Definiciones fail-closed y denegación de no miembro en las tres RPC públicas bajo authenticated; roles permitidos/prohibidos cubiertos para invitaciones. No se atribuye a esta prueba validación positiva completa de reasignación o reapertura. |
| P1-SEC-03 | PASS en las operaciones ensayadas | Conteo exacto tras operaciones permitidas/denegadas, ROLLBACK y ausencia de fixtures remotos comprobada. No extiende el resultado a operaciones no probadas. |
| P1-UI-01 | PENDIENTE | Implementación y render estático PASS; contraste visual del dashboard autenticado con la demo pendiente. |
| P1-UI-02 | PENDIENTE | Tests locales de idioma y estructura PASS; navegación autenticada DE/EN/ES con empresa y roles pendiente. |
| P1-UI-03 | PENDIENTE | Shell limitado a recorridos existentes; falta la verificación navegada de enlaces y ausencia de acciones ficticias. |
| P1-UI-04 | PENDIENTE | Tests semánticos y contraste limitado PASS; navegador a 390/1440 px, teclado, foco y desbordamiento pendientes. |
| P1-VAL-01 | PASS para este corte | Estados locales, SQL remoto, rama/PR y preview separados por commit y evidencia; conservar la trazabilidad para cambios posteriores. |
| P1-INF-01 | PASS en selección y remediación SQL | Recursos existentes reutilizados; migración limitada a tres funciones FieldForce. No se creó proyecto/esquema/repositorio/proyecto Vercel duplicado. |
| P1-INF-02 | PASS | Rama y commit publicados, PR #20 draft, preview READY identificada y smoke HTTP documentado. Producción permanece separada y no autorizada. |

## Matriz por tarea

| Tarea | Estado | Evidencia y límite |
|---|---|---|
| T01 | PASS | Base `66966aa3a040365d534ff8f1c6bb7a6cdeab7435`; recursos y alcance documentados. |
| T02 | PASS | Tests estáticos y matriz SQL ampliada local/remota escritos y ejecutados. |
| T03 | PASS | Migración aditiva para las tres funciones, sin reescribir migraciones históricas. |
| T04 | PASS en casos documentados | PostgreSQL local/remoto y comprobación posterior satisfactorios; mantener límites de SEC-01/02. |
| T05 | PASS | Componentes de presentación y pruebas locales definidos. |
| T06 | PASS de implementación | Shell, dashboard, fichas y controles afectados adaptados; no equivale a UAT. |
| T07 | PENDIENTE | Navegador autenticado, móvil, teclado y tres idiomas. |
| T08 | PASS automatizado/consolidado | 62 tests, lint, typecheck, build y checks de PR PASS. La validación UI autenticada permanece en T07. |
| T09 | PASS | Rama publicada, PR #20 draft y preview READY del commit `31b9c393fb5ff0809addc7dc3ef8ca83e1dc8501`; smoke sin sesión satisfactorio. |
| T10 | PENDIENTE | Evidencia documentada; entrega y aceptación finales dependen de los pendientes anteriores. |

## Publicación y riesgos residuales

- Recursos: Supabase `upuhppsbolpdpaighzfq`/`fieldforce`; GitHub `vidal-renao/fieldforce-pro`; Vercel `fieldforce-pro`, equipo `vidal-renaos-projects`.
- La corrección de base de datos está aplicada en remoto. El frontend está publicado en la rama y desplegado como preview; no se ha promovido a producción.
- PR #19 conserva su estado remoto; cherry-pick local no equivale a merge ni actualización de main.
- La correspondencia de migración local `20261113233811` y remota `20261114001433` debe conservarse al automatizar futuros cambios.
- La prueba SQL ampliada comprueba permisos y RPC públicas con `SET LOCAL ROLE authenticated` y simula el identificador de usuario en la sesión. No sustituye una prueba HTTP Auth/PostgREST con sesiones reales ni verifica exhaustivamente el flujo positivo de todas las operaciones de órdenes.
- Siete vulnerabilidades moderadas en dependencias transitivas de desarrollo quedan pendientes de evaluación y corrección compatible; no se modificaron versiones automáticamente.
- Falta UAT de la preview con sesión autenticada: 390/1440 px, teclado, foco y navegación DE/EN/ES. La aceptación SQL se limita a la corrección y matriz documentadas; no hay aceptación productiva ni certificación nDSG/WCAG.
- Promoción a producción no autorizada; no deducirla del permiso para preparar recursos y preview.

© VIDAL ECOSYSTEM
