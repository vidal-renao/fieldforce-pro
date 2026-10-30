# ADR-0002 — Modelo de datos compartido multi-tenant

Estado: propuesta implementada en rama T02; no aplicada a una base Supabase.
Fecha: 2026-10-30 · VE-FFP-PLAN-001

## Decisión
Un esquema PostgreSQL con `organization_id` y claves foráneas compuestas para evitar relaciones entre tenants. Seis tablas: organizations, memberships, customers, work_orders, work_order_assignments y work_order_events.

## Límites de seguridad
RLS habilitada en las seis tablas, SIN políticas de acceso durante T02: anon/authenticated quedan bloqueados por defecto. Las políticas y la inicialización segura del primer owner corresponden a T03. No usar claves service_role en el cliente.

## Integridad
Estados y prioridades restringidos por CHECK; restricciones de cierre; claves foráneas compuestas; índices de consulta por organización. La asignación referencia miembros de la misma organización. El rol `technician` deberá validarse adicionalmente en lógica de negocio y políticas de T03.

## Riesgos y pendientes
- El repositorio todavía no tiene un proyecto Supabase propio identificado. No ejecutar esta migración en Ticket System ni en otros proyectos.
- No se ha realizado test SQL contra PostgreSQL real; las pruebas de CI son estructurales.
- Los cambios de estado y registro auditado deberán ejecutarse transaccionalmente en futuras tareas.
- No utilizar cascadas destructivas de tenants sin definir política de retención y borrado nDSG.
- Antes de aplicación: probar con PostgreSQL 17, verificar el plan de migración y advisors de Supabase.

© VIDAL ECOSYSTEM
