# VE-FF-AUTH-001 — Recuperación segura de contraseña

Fecha: 2026-11-14. Estado: especificación, plan y decisiones aprobados por Vidal en la conversación. Implementación en curso; no desplegada a producción.

## Objetivo y alcance

Permitir que una persona con cuenta existente solicite un correo de recuperación, valide un enlace de un solo uso y establezca una contraseña nueva antes de continuar la UAT autenticada.

Incluido:

- enlace «He olvidado mi contraseña» desde el login;
- formulario de solicitud con respuesta neutral para evitar enumeración de cuentas;
- callback SSR de Supabase limitado al tipo `recovery` y sin redirecciones abiertas;
- formulario de nueva contraseña en DE/EN/ES;
- validación con Zod, mínimo de 12 caracteres y confirmación coincidente;
- cierre de la sesión temporal de recuperación y nuevo inicio de sesión con la contraseña elegida;
- URLs permitidas y plantilla de correo de recuperación en Supabase;
- pruebas locales, preview y recorrido real con una cuenta de prueba.

Excluido:

- cambiar el correo de una cuenta o crear cuentas nuevas;
- restablecer contraseñas manualmente desde base de datos o exponer credenciales;
- incorporar proveedores sociales, MFA o CAPTCHA en esta tarea;
- cambiar las variables públicas de Supabase que ya están configuradas en Vercel;
- fusionar, promover a producción o modificar otros esquemas del proyecto Supabase compartido sin autorización posterior.

## Arquitectura propuesta

1. `/{locale}/forgot-password` llama desde una Server Action a `resetPasswordForEmail`.
2. El `redirectTo` se construye con un origen permitido: URL de preview de Vercel, URL productiva configurada o `localhost` en desarrollo. No se acepta un host enviado por el formulario.
3. La plantilla de recuperación de Supabase envía el `TokenHash` a `/auth/confirm`, junto con el tipo `recovery` y el destino localizado.
4. `/auth/confirm` verifica el OTP mediante el cliente SSR y solo acepta destinos relativos conocidos bajo `/de`, `/en` o `/es`.
5. `/{locale}/reset-password` requiere la sesión temporal válida y actualiza la contraseña mediante `auth.updateUser`.
6. Tras el cambio, se cierra la sesión temporal y se vuelve al login con confirmación de éxito.

La UI no revela si el correo existe. No se guarda la contraseña, el token o el correo en logs de aplicación.

## Requisitos EARS

| ID | Requisito | Criterio verificable |
|---|---|---|
| AUTH-REC-01 | CUANDO una persona solicite recuperación con un correo sintácticamente válido, el sistema DEBERÁ responder con el mismo mensaje exista o no la cuenta. | No hay enumeración por texto, estado o redirección; Supabase recibe como máximo una solicitud válida. |
| AUTH-REC-02 | SI el correo es inválido, el sistema DEBERÁ rechazarlo localmente sin enviarlo a Supabase. | Zod cubre vacío, formato inválido y longitud superior a 254. |
| AUTH-REC-03 | CUANDO se genere el correo, el sistema DEBERÁ usar un destino incluido en la lista permitida de Supabase. | Localhost, dominio productivo exacto y wildcard de preview documentados; ningún origen del formulario se utiliza. |
| AUTH-REC-04 | CUANDO llegue un enlace de tipo `recovery` válido, el callback DEBERÁ verificar el `token_hash` y crear la sesión temporal antes de mostrar el formulario. | Token válido llega a reset; token ausente, inválido, expirado o de otro tipo vuelve al login con error neutral. |
| AUTH-REC-05 | SI `next` apunta fuera de las rutas localizadas autorizadas, el sistema NO DEBERÁ redirigir a ese destino. | Casos `https://`, `//`, rutas no localizadas y traversal rechazados. |
| AUTH-REC-06 | CUANDO se elija contraseña nueva, el sistema DEBERÁ exigir al menos 12 caracteres y confirmación idéntica. | Casos vacío, corto, desigual y válido cubiertos. |
| AUTH-REC-07 | CUANDO Supabase confirme el cambio, el sistema DEBERÁ cerrar la sesión temporal y pedir un nuevo inicio de sesión. | Login muestra confirmación y la contraseña nueva permite entrar. |
| AUTH-REC-08 | SI el enlace no establece una sesión válida, el sistema NO DEBERÁ permitir `updateUser`. | Acceso directo y sesión expirada redirigen al login. |
| AUTH-REC-09 | CUANDO se muestre el recorrido, el sistema DEBERÁ mantener contenido y nombres accesibles equivalentes en DE/EN/ES. | Claves completas, foco visible, mensajes `status`/`alert` y navegación por teclado. |
| AUTH-REC-10 | CUANDO se valide la tarea, la documentación DEBERÁ separar código, configuración Supabase, correo enviado, preview y producción. | Matriz PASS/FAIL/PENDIENTE con evidencia y sin declarar producción antes de promoverla. |

## QA de la especificación

| Riesgo o ambigüedad | Resolución propuesta |
|---|---|
| Enumeración de cuentas | Mensaje idéntico para correo existente, inexistente y respuesta remota no sensible. |
| Open redirect en callback | Lista cerrada de locales y destino relativo; no aceptar URL absoluta ni cabecera `Host` como autoridad. |
| Preview con URL variable | Wildcard oficial `https://*-vidal-renaos-projects.vercel.app/**`; producción usa URL exacta. |
| Enlace consumido por escáner de correo | Usar plantilla con `TokenHash` y callback SSR; registrar como limitación y comprobar con el proveedor real. |
| Localización del correo | Una única plantilla trilingüe mientras no exista preferencia de idioma fiable en Auth. |
| Cuenta inexistente | No se crea usuario ni se confirma su ausencia. |
| Política de sesiones tras cambiar contraseña | Propuesta: cerrar la sesión temporal local y exigir login nuevo; invalidación global queda fuera salvo aprobación específica. |
| SMTP de Supabase | El proveedor por defecto sirve para la prueba inicial, pero SMTP propio y límites deben evaluarse antes de producción. |
| Protección de contraseñas filtradas | El asesor indica que está desactivada; se documenta como decisión de seguridad separada, no se activa implícitamente. |

## Plan — una fase, máximo diez tareas

| Tarea | Trabajo | Estado |
|---|---|---|
| T01 | Aprobar esta especificación, el plan y las decisiones de contraseña/sesión. | Aprobada |
| T02 | Escribir pruebas de solicitud neutral, validación, callback, redirección cerrada, actualización e idiomas. | Pendiente |
| T03 | Implementar solicitud de recuperación y enlace desde login. | Pendiente |
| T04 | Implementar callback SSR seguro y pantalla localizada de nueva contraseña. | Pendiente |
| T05 | Configurar URL productiva, wildcard preview, localhost y plantilla recovery en Supabase. | Pendiente |
| T06 | Ejecutar tests, lint, typecheck y build; revisar el diff. | Pendiente |
| T07 | Desplegar preview desde la rama existente y verificar rutas sin token. | Pendiente |
| T08 | Solicitar un correo real para una cuenta de prueba y completar el cambio de contraseña. | Pendiente |
| T09 | Ejecutar login y UAT básica tras el cambio; verificar que no se filtren datos ni tokens. | Pendiente |
| T10 | Documentar evidencia, riesgos y presentar go/no-go; producción permanece separada. | Pendiente |

## Decisiones aprobadas

1. Contraseña mínima de 12 caracteres.
2. Cerrar solo la sesión temporal después del cambio y exigir login nuevo; no invalidar otras sesiones en esta tarea.
3. Plantilla de correo trilingüe provisional.
4. Usar el proveedor de correo actual únicamente para desbloquear la UAT; evaluar SMTP propio antes de producción.

© VIDAL ECOSYSTEM
