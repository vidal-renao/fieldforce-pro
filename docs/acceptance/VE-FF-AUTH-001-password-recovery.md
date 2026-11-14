# VE-FF-AUTH-001 — Matriz de aceptación

Fecha: 2026-11-14. Estado: aceptación parcial. Código y preview verificados; configuración final de Supabase Auth y recuperación con cuenta real pendientes. Producción no autorizada.

## Evidencia separada

| Área | Estado | Evidencia |
|---|---|---|
| Código | PASS en rama | Commits `ce4f9ca` y `b8103a0` en `codex/hardening-phase-1`; PR #20 continúa draft. |
| Pruebas locales | PASS | 67/67 tests; lint, TypeScript strict y build Next.js 16.4.3 sin errores. |
| CI | PASS | GitHub `quality`, Vercel y Preview Comments satisfactorios para `b8103a0`. |
| Preview | PASS parcial | Deployment `dpl_8uxPJVfR42GX5CXtAh3kLkajgWLF` READY: login y solicitud 200; acceso directo a reset y callback sin token terminan en login con error neutral. |
| Supabase URLs | PENDIENTE de confirmar | Proyecto correcto `upuhppsbolpdpaighzfq`. `localhost:3000/**` ya existía. Se prepararon los destinos exacto y preview restringido, pero el panel perdió conexión durante el guardado y no se declara aplicado. |
| Plantilla recovery | PENDIENTE | Plantilla trilingüe versionada en `docs/auth/password-recovery-template.html`; aún no confirmada en Supabase Auth. |
| Correo real | PENDIENTE | No se ha enviado ni consumido un enlace real. |
| Cambio de contraseña/login | PENDIENTE | Debe realizarlo el titular de la cuenta; no se ha pedido ni almacenado ninguna contraseña. |
| Producción | NO REALIZADA | No hay merge, promoción ni despliegue productivo de estos commits. |

## Requisitos

| ID | Estado | Resultado actual |
|---|---|---|
| AUTH-REC-01 | PASS de código | Respuesta pública neutral; prueba real depende de plantilla/correo. |
| AUTH-REC-02 | PASS | Zod rechaza correo inválido antes de Supabase. |
| AUTH-REC-03 | PENDIENTE | Origen confiable implementado; allowlist remota sin confirmación final. |
| AUTH-REC-04 | PASS de código | Callback limita `recovery`, valida `token_hash` y vincula cookie HTTP-only al usuario; token real pendiente. |
| AUTH-REC-05 | PASS | Lista cerrada DE/EN/ES y pruebas de URL absoluta, protocol-relative, locale desconocido y traversal. |
| AUTH-REC-06 | PASS | Mínimo 12, máximo 1024 y confirmación idéntica. |
| AUTH-REC-07 | PENDIENTE E2E | `signOut({scope: 'local'})` y mensaje de login implementados; cambio real pendiente. |
| AUTH-REC-08 | PASS en preview | Acceso directo sin sesión/cookie vuelve al login; update requiere usuario verificado y cookie vinculada. |
| AUTH-REC-09 | PASS de código | Mensajes y formularios en DE/EN/ES; UAT manual de teclado pendiente. |
| AUTH-REC-10 | PASS parcial | Código, remoto, preview y producción separados en esta matriz. |

## Dependencia del Supabase compartido

El `Site URL` observado pertenece a `invoice-auto`. No se modificó para evitar afectar a otra aplicación. FieldForce suministra un `redirectTo` explícito y debe añadir únicamente:

- `https://fieldforce-pro-six.vercel.app/**`
- `https://fieldforce-*-vidal-renaos-projects.vercel.app/**`

La plantilla trilingüe deberá usar `RedirectTo` y `TokenHash`. Hasta confirmar estas tres operaciones y ejecutar la recuperación real, el resultado es **NO-GO para recuperación operativa y producción**.

© VIDAL ECOSYSTEM
