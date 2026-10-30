# VE-FF-MVP-002 — T02 · Contrato operativo de órdenes

**Estado:** Propuesto para revisión. Sin cambios de esquema ni datos de producción.  
**Fecha:** 2026-10-30. **Autoría:** © VIDAL ECOSYSTEM.

## Evidencia contrastada
- GitHub y PostgreSQL contienen los estados `open`, `assigned`, `in_progress`, `completed`, `cancelled`.
- `public.fieldforce_change_order_status` acepta cualquier estado enumerado y no valida la transición previa.
- `fieldforce_private.technician_change_status` acepta `in_progress` o `completed` mientras el estado actual no sea cerrado, y exige asignación y rol technician.
- `public.fieldforce_assign_technician` exige rol owner/admin y pertenencia técnica; usa `on conflict do nothing`, devuelve false al duplicar, sin restricción de orden cerrada.
- `work_orders_closed_consistency` comprueba coherencia entre closed_at y estado terminal, pero no define máquina de estados.
- El cierre real de QA-001 está verificado con actor technician y tres eventos. Debe mantenerse inmutable durante el trabajo de T02.

## Máquina de estados propuesta (debe aprobarse)
| Estado actual | Destino permitido | Actor |
|---|---|---|
| open | assigned, in_progress, cancelled | owner/admin |
| assigned | in_progress, cancelled | owner/admin; technician asignado solo a in_progress |
| open | in_progress | technician asignado (compatibilidad con QA-001) |
| in_progress | completed, cancelled | owner/admin; technician asignado solo a completed |
| completed | ninguno | terminal |
| cancelled | ninguno | terminal |

No se permite `open → completed` directamente. Cualquier reapertura requiere un flujo futuro explícito, no incluido en v0.2. Una transición idéntica devuelve un resultado idempotente sin crear eventos duplicados.

## Reglas de asignación propuestas
- Solo owner/admin pueden asignar/reasignar; técnico debe ser miembro de la misma organización.
- No asignar ni reasignar órdenes terminales.
- Segunda asignación idéntica: devolver éxito idempotente sin duplicar registros.
- Reasignación: operación explícita y atómica. Mantener inicialmente un único responsable por orden (ver pregunta abierta sobre varios técnicos).
- Registrar evento de asignación con actor; no usar directamente el formulario como única fuente de autorización.

## Contratos y seguridad
- Mantener esquema privado `fieldforce`, RPCs públicas `SECURITY INVOKER` y ayudantes `SECURITY DEFINER` solo en `fieldforce_private` cuando sea imprescindible.
- Controlar transiciones en capa SQL, no confiar en valores de formulario.
- Validar con Zod en Server Actions; actor derivado de auth.uid(), nunca de un parámetro aportado por cliente.
- Controlar carrera con actualización condicionada al estado actual y transacción; auditoría y cambio atómicos.
- Fechas `scheduled_for` en UTC y presentación según zona del usuario; `closed_at` obligatoria solo para terminales.
- Historizar actor, before/after y timestamp. Restringir acceso a eventos según RLS de la orden.
- Conservar datos de la orden de prueba QA-001 sin escribir sobre ella.

## Matriz QA test-first
| Test | Caso | Resultado esperado |
|---|---|---|
| QA-T02-01 | owner pasa open→assigned | éxito + evento |
| QA-T02-02 | technician asignado pasa open/assigned→in_progress | éxito |
| QA-T02-03 | technician intenta open→completed | denegado |
| QA-T02-04 | technician no asignado cambia estado | denegado |
| QA-T02-05 | owner intenta completed→open | denegado |
| QA-T02-06 | asignación a otra organización | denegada |
| QA-T02-07 | asignación duplicada | idempotente, sin evento extra |
| QA-T02-08 | asignar orden terminal | denegado |
| QA-T02-09 | actualizar dos veces a la vez | una transición y un evento |
| QA-T02-10 | usuario anon accede a RPC | denegado |

Todos los tests de DB con transacciones reversibles, preferiblemente una instancia aislada. CI ejecuta tests de contrato y Playwright comprueba E2E.

## ADR propuesto
**ADR-0003 — Estado y asignación transaccional:** adoptar máquina de estados auditable con transiciones SQL explícitas. Descartar controles únicamente frontend por el riesgo de API directa. Reabrir órdenes requerirá proceso futuro independiente. Limitar un responsable reduce complejidad del MVP, pero requiere confirmación del usuario.

## Decisiones a confirmar
1. ¿Una orden puede tener varios técnicos a la vez o solo uno responsable?
2. ¿Una orden completada puede reabrirse por owner/admin en v0.2 o debe ser terminal?

**Puerta de aprobación:** no aplicar migraciones ni alterar reglas reales sin confirmar estas decisiones.
