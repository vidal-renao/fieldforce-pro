# T03 — Verificación de RLS de lectura

Fecha: 2026-10-30

Estado: **incremento de lectura verificado y aplicado**, T03 completo **NO**.

## Regresión de T01 y T02
- Vercel: despliegue producción T02 READY (SHA 42d71a9).
- CI rama T03: test, lint, typecheck, build y pruebas de idioma DE/EN/ES superados.
- PostgreSQL: seis tablas en fieldforce, todas con RLS activo.
- Proyecto: upuhppsbolpdpaighzfq (Supabase compartido); ninguna alteración a otros esquemas.

## Incremento de T03 ejecutado
Migración: fieldforce_t03_tenant_read_rls.
- Seis políticas SELECT por pertenencia a organization.
- Helper de lectura de rol de miembro en schema interno fieldforce_private; search_path fijo, uid ligado a auth.uid().
- No políticas INSERT/UPDATE/DELETE; el rol authenticated carece de INSERT y anon no tiene USAGE sobre el schema.
- El schema fieldforce no se ha añadido a esquemas expuestos en Data API.

## Prueba transaccional en Postgres
Fixture temporal: dos organizaciones y un cliente por organización, usuario autenticado miembro de organización A.
Resultado: 1 cliente visible en A, 0 clientes visibles en B.
Se hizo ROLLBACK y se verificaron 0 organizations, 0 customers, 0 memberships y 0 work_orders persistentes.

## Pendiente para cerrar T03
1. Autenticación SSR Next.js y configuración de variables públicas no secretas.
2. Onboarding seguro del primer owner y gestión de invitaciones.
3. RLS INSERT/UPDATE/DELETE con limitaciones específicas de roles y pruebas adversariales.
4. Pruebas E2E de login/logout, sesiones, CSRF y mutaciones por tenant.
5. Revisión final de Security/Performance Advisors antes de habilitar operaciones.

© VIDAL ECOSYSTEM
