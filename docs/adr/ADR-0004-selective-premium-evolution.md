# ADR-0004 — Evolución selectiva hacia Premium v5.1

Fecha: 2026-11-14. Estado: aprobado por Vidal en la conversación de coordinación.

## Contexto

Existen dos proyectos independientes: la demo HTML/CSS/JavaScript Premium v5.1 y el SaaS Next.js. El SaaS contiene fundamentos reutilizables de autenticación, datos, RPC, localización y CI, pero requiere corregir autorización y separar responsabilidades al ampliar funcionalidades. La demo aporta diseño y flujos; sus roles y persistencia son simulados.

## Alternativas

- A: integración progresiva directa. Menor coste inicial, con riesgo de ampliar el acoplamiento existente.
- B: reestructuración selectiva conservando los fundamentos útiles. Coste inicial intermedio y cambios revisables por dominio.
- C: aplicación nueva. Mayor reconstrucción, migración y validación; la auditoría no aporta motivos suficientes para justificarla.

## Decisión

Adoptar B sin reescritura global. Conservar el monolito Next.js 16, TypeScript strict, Supabase, Zod y next-intl DE/EN/ES. La separación de interfaz, casos de uso y datos se realiza donde el alcance aprobado lo requiera.

Adoptar la demo como referencia de diseño claro. Reimplementar los controles de servidor y persistencia que requieran los futuros módulos; no importar roles simulados ni datos ficticios como base productiva.

## Ampliación aprobada el 2026-11-14

Vidal autoriza preparar el proyecto en Supabase, GitHub y Vercel, usando esquema propio en el Supabase con menor carga y evitando duplicados.

Reutilizar `upuhppsbolpdpaighzfq` y su esquema `fieldforce`, con auxiliares `fieldforce_private` y RPC existentes de la aplicación. La comparación verificada por el coordinador observó 3.043 eventos/24 h, 45 MB y una conexión activa, frente a 12.098 eventos/24 h, 82 MB y dos conexiones activas en `focgfmhgfmhmcbywwsej`. Es una instantánea de indicadores, no una garantía de capacidad futura.

Reutilizar el repositorio `vidal-renao/fieldforce-pro` y el proyecto Vercel `fieldforce-pro` del equipo `vidal-renaos-projects`. No crear sustitutos duplicados. Preparar rama/PR y preview separadas de producción.

## Consecuencias y límites

La primera fase cubre seguridad, shell frontend existente y preparación externa en los recursos identificados. No incorpora módulos avanzados ni permite modificar aplicaciones vecinas o configuración global de Auth. La promoción a producción no está autorizada. Un futuro proyecto Supabase dedicado y las reglas funcionales avanzadas requieren decisiones independientes.

## Evidencia de ejecución al 2026-11-14

Supabase local aplicó las 18 migraciones y las pruebas SQL terminaron satisfactoriamente con ROLLBACK. La corrección local `20261113233811` se aplicó en el proyecto seleccionado como `20261114001433 fieldforce_phase1_authorization_null_guards`; la matriz ampliada local/remota pasó y la verificación posterior no encontró fixtures residuales. Se verificaron las tres funciones corregidas y los casos de permisos documentados en aceptación. Estos resultados no certifican todos los módulos ni equivalen a despliegue de la aplicación.

El shell está implementado y las comprobaciones locales reportan 62/62 tests, lint y typecheck sin errores, build satisfactorio. La rama `codex/hardening-phase-1` está publicada en commit `31b9c393fb5ff0809addc7dc3ef8ca83e1dc8501`, con [PR #20 draft](https://github.com/vidal-renao/fieldforce-pro/pull/20), checks satisfactorios y [preview READY](https://fieldforce-1r2o7k4ia-vidal-renaos-projects.vercel.app). Smoke sin sesión satisfactorio; la UI autenticada y aceptación final permanecen pendientes. El detalle de requisitos aceptados y pendientes se mantiene en la [aceptación de fase 1](../acceptance/VE-FF-PREMIUM-001-phase-1.md).

El detalle verificable, QA, tareas y riesgos se centraliza en [VE-FF-PREMIUM-001](../specs/VE-FF-PREMIUM-001-phase-1.md). Este ADR complementa [ADR-0001](ADR-0001-modular-monolith.md); no cambia las versiones del stack.

© VIDAL ECOSYSTEM
