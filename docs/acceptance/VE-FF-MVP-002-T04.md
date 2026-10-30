# FieldForce Pro — T04 Clientes (VE-FF-MVP-002)
© VIDAL ECOSYSTEM

## Alcance implementado en rama
- Perfil individual de cliente restringido a owner/admin.
- Lectura segura mediante RPC individual; edición de nombre, correo, teléfono y notas internas (Zod + RLS).
- Órdenes vinculadas al cliente, con acceso a ficha de trabajo.
- Enlace desde listado general.
- Localización DE/EN/ES para elementos nuevos.

## EARS / aceptación
- RF-T04-01 WHEN owner/admin abre cliente de su empresa, SYSTEM SHALL mostrar su perfil y órdenes relacionadas.
- RF-T04-02 WHEN owner/admin guarda datos válidos, SYSTEM SHALL aplicar cambios solo a su organización.
- RF-T04-03 IF technician intenta editar un cliente, SYSTEM SHALL impedir la mutación.
- RF-T04-04 IF se solicita un cliente de otra organización, SYSTEM SHALL devolver cero registros.
- RF-T04-05 WHEN cambia de idioma, SYSTEM SHALL mostrar los textos del módulo en DE/EN/ES.

## QA ejecutada
2026-10-30 — transacción PostgreSQL BEGIN/ROLLBACK:
- Owner pudo leer el cliente QA y su única orden asociada.
- Owner pudo actualizar la ficha dentro de la transacción.
- Técnico no pudo cambiar el cliente.
- Consulta con organización incorrecta devolvió cero registros.
- ROLLBACK aplicado; no persistieron cambios de pruebas.

## Pendiente
- GitHub CI completo y revisión de PR.
- No aplicar migración a producción ni publicar hasta release agrupada.
- Pruebas de navegador autenticado, a11y, móvil y edición real.
- Búsqueda y paginación de lista (actualmente máximo 200), y paginación de órdenes relacionadas (actualmente máximo 100).
- Notas internas: garantizar que no se expongan en las vistas de técnico.

## Ampliación: búsqueda y paginación
- Directorio con filtro por nombre, correo o teléfono y paginación de 20 registros, página máxima y tamaño controlado en SQL.
- Prueba SQL de consulta filtrada realizada con BEGIN/ROLLBACK: Cliente QA FieldForce, total_count=1. Sin mutaciones persistentes.
- CI de rama: pasos de tests, lint, typecheck, build y smoke superados en último workflow consultado.
- Pendiente: validación adversarial de búsqueda, pruebas de carga e integración en navegador. Sin despliegue.
