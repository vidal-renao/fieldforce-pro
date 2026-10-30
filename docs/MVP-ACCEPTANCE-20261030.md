# FieldForce Pro — MVP de operaciones (30.10.2026)

© VIDAL ECOSYSTEM

## Alcance aprobado
MVP de servicios de campo con Next.js + TypeScript strict, Supabase compartido en el esquema privado `fieldforce`, RLS multiempresa, autenticación SSR, Zod y DE/EN/ES.

## Requisitos EARS
- RF-01: WHEN un usuario autenticado pertenezca a una empresa, THE SYSTEM SHALL mostrar únicamente datos autorizados de su organización.
- RF-02: WHEN un owner/admin valide el formulario, THE SYSTEM SHALL crear clientes asociados a la empresa activa.
- RF-03: WHEN un owner/admin seleccione un cliente de su empresa, THE SYSTEM SHALL crear una orden con prioridad y estado inicial open.
- RF-04: WHEN un owner/admin asigne una orden, THE SYSTEM SHALL aceptar solo técnicos miembros de la misma empresa.
- RF-05: WHEN un técnico tenga un trabajo asignado, THE SYSTEM SHALL permitir marcarlo in_progress o completed, pero no modificar campos administrativos.
- RF-06: WHEN cambie un estado, THE SYSTEM SHALL registrar un evento con actor, estado anterior/nuevo y fecha.
- RF-07: IF un técnico no está asignado, THE SYSTEM SHALL negar acceso y mutación sobre la orden.
- RF-08: WHEN se cree una empresa, THE SYSTEM SHALL rechazar nombres que parezcan códigos de invitación de 32 caracteres.
- RF-09: WHEN se consulte un espacio, THE SYSTEM SHALL respetar el idioma de la interfaz DE/EN/ES.
- RF-10: IF un usuario no tiene permiso o los datos son inválidos, THE SYSTEM SHALL rechazar la acción sin alterar registros.

## Validación PostgreSQL real
Migraciones aplicadas: `fieldforce_mvp_core_rpcs`, `fieldforce_mvp_status_audit`, `fieldforce_mvp_technicians`, `fieldforce_mvp_fk_indexes`, `fieldforce_mvp_technician_read_scope`, `fieldforce_mvp_prevent_token_as_org`, `fieldforce_mvp_private_member_visibility`.

Pruebas realizadas dentro de BEGIN/ROLLBACK (ningún dato ficticio persistente):
- Propietario creó un cliente, una orden, la marcó en curso/completada y leyó los resultados.
- Se registraron correctamente 3 eventos de auditoría para creación y dos cambios.
- La cuenta técnico no pudo crear clientes.
- Propietario asignó una orden al técnico, que la vio y completó.
- El técnico no pudo modificar una orden no asignada.
- Entre dos clientes y dos órdenes, el técnico solo pudo leer el cliente y la orden asignados.
- El técnico solo pudo consultar su propia membership y assignment.
- Se han creado índices de claves foráneas sugeridos por Performance Advisor.
- Se eliminó solo una organización de prueba vacía, conservando VIDAL ECOSYSTEM, un owner y un técnico.

## Limitaciones conocidas
- MVP de operaciones básico, no incluye facturación, notificaciones, adjuntos, modo offline, gestión avanzada de calendarios ni SLA.
- Las listas están paginadas por límite de 200 registros por consulta; antes de escalar se necesita paginación de cursor.
- El backend pasó pruebas SQL transaccionales y la compilación de Vercel preview ha sido READY en commits anteriores de la rama.
- La última validación de GitHub Actions está QUEUED; no se debe declarar CI verde hasta que acabe.
- Prueba E2E de los nuevos formularios en el navegador autenticado aún pendiente.
- La disponibilidad de producción queda condicionada al despliegue final y su inspección.

## Próxima iteración propuesta
Paginación, auditoría de accesibilidad WCAG, métricas Web Vitals/Lighthouse, invitaciones enviadas por email y notificaciones de trabajos asignados.
