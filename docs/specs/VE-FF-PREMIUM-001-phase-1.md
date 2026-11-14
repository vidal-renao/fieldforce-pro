# VE-FF-PREMIUM-001 — Arquitectura B y fase 1

Fecha: 2026-11-14. Estado: arquitectura y fase 1 aprobadas por Vidal en la conversación de coordinación. Corrección SQL aplicada y verificada; shell publicado en rama y preview READY con comprobaciones locales/CI satisfactorias. UI autenticada y aceptación completa pendientes según la [matriz de aceptación](../acceptance/VE-FF-PREMIUM-001-phase-1.md).

Ampliación de alcance aprobada el 2026-11-14: preparar el proyecto en Supabase, GitHub y Vercel, usando esquema propio en el proyecto Supabase con menor carga y evitando recursos duplicados. Esta autorización sustituye la exclusión inicial de preparación externa; no acredita acciones ejecutadas ni promoción a producción.

Las instrucciones compartidas corresponden a [AGENTS.md](../../AGENTS.md). Este documento contiene las decisiones y requisitos específicos de esta fase.

## Objetivo y usuarios

Preparar la base existente para evolucionar hacia la experiencia Premium v5.1: corregir la autorización identificada y adoptar su estructura visual clara sin representar módulos inexistentes como funcionalidades operativas. Usuarios: owner/admin y técnico autenticado.

## Evidencia de partida

- Repositorio auditado: `vidal-renao/fieldforce-pro`, commit `66966aa3a040365d534ff8f1c6bb7a6cdeab7435` de `main`.
- El repositorio contiene un MVP de clientes, órdenes, asignaciones, invitaciones y auditoría; los antiguos README y MEMORY describían solamente T01.
- Stack declarado: Next.js 16.4.3, React 19.3.0, TypeScript strict, next-intl 4.14.9, Supabase y Zod. No se autoriza una migración de versiones.
- Demo independiente: `FieldForcePro_v5_1_Codex_Demo_Nueva.html`, SHA-256 `1D3CD91D2AC7D68E9F0CDF671574BD7FADA4470620748776B6121AF96A48B4A9`. Su contenido coincide con `index.html` del ZIP facilitado. No forma parte del historial del SaaS.
- La revisión estática identificó autorización que no rechaza explícitamente un rol `NULL` en funciones SQL privilegiadas. La evaluación booleana se verificó mediante lectura; no se ejecutó una explotación con escrituras.
- La demo contiene persistencia local y roles simulados. Sus resultados QA declarados no sustituyen pruebas reproducidas del SaaS.
- La PR #19 de autenticación estaba abierta durante la auditoría. Su existencia y CI previo no equivalen a integración ni aceptación del recorrido autenticado.

## Arquitectura aprobada

Alternativa B: reestructuración selectiva del monolito existente, conservando los componentes y servicios útiles. Mantener Next.js 16, TypeScript strict, Supabase, Zod y next-intl DE/EN/ES. Separar progresivamente presentación, lógica de negocio y acceso a datos únicamente donde el cambio lo requiera.

La referencia visual es la demo: cabecera azul oscuro, superficie principal clara, tarjetas blancas, navegación y jerarquía de información coherentes. No copiar su estado global, persistencia local ni selectores de rol como mecanismos productivos.

Se conservan las decisiones operativas documentadas: un técnico responsable por orden, reapertura explícita de `completed` por owner/admin con motivo y auditoría, y `cancelled` terminal. Esta fase no introduce `paused` ni cambia la máquina de estados.

## Recursos existentes y ampliación aprobada

El coordinador verificó los siguientes indicadores al seleccionar el destino. Son una instantánea comparativa de actividad, tamaño y conexiones; no constituyen una medición completa de CPU, memoria, IOPS ni capacidad futura.

| Proyecto Supabase | Eventos en 24 h | Tamaño observado | Conexiones activas |
|---|---:|---:|---:|
| `focgfmhgfmhmcbywwsej` | 12.098 | 82 MB | 2 |
| `upuhppsbolpdpaighzfq` | 3.043 | 45 MB | 1 |

Decisión: reutilizar `upuhppsbolpdpaighzfq`, con menor actividad en los indicadores observados y con el esquema propio `fieldforce` ya existente. Conservar `fieldforce_private` y las RPC `public.fieldforce_*` necesarias para la arquitectura existente; no crear un segundo esquema para duplicar la aplicación ni alterar objetos de otras aplicaciones. Esta fase no cambia la decisión a un proyecto Supabase dedicado.

Reutilizar también `vidal-renao/fieldforce-pro` en GitHub y el proyecto Vercel `fieldforce-pro` del equipo `vidal-renaos-projects`. Comprobar sus vínculos y configuración antes de crear o cambiar recursos. Preparar la rama/PR y un entorno preview dentro de estos recursos; distinguir cada uno de la rama y del despliegue de producción.

Estado de ejecución de esta ampliación: Supabase local arrancó y aplicó las 18 migraciones, incluida `20261113233811_phase1_authorization_null_guards.sql`. En `upuhppsbolpdpaighzfq` se aplicó la corrección como `20261114001433 fieldforce_phase1_authorization_null_guards`. Las pruebas SQL locales y remotas terminaron con `ROLLBACK`; la comprobación remota posterior encontró cero organizaciones, invitaciones y usuarios de los fixtures y confirmó denegación explícita de pertenencia ausente en las tres funciones. Rama `codex/hardening-phase-1` publicada en commit `31b9c393fb5ff0809addc7dc3ef8ca83e1dc8501`, [PR #20 draft](https://github.com/vidal-renao/fieldforce-pro/pull/20) y [preview READY](https://fieldforce-1r2o7k4ia-vidal-renaos-projects.vercel.app), deployment `dpl_HitdF5RQV2TwGZzCgRWR69ZMj24D`. Checks `quality`, `Vercel` y `Preview Comments` PASS. `/es`, `/de`, `/en` responden 200; dashboard sin sesión ejecuta redirección 307 a login. La promoción productiva no está autorizada.

## Alcance y exclusiones

Incluido: tests primero, corrección versionada del control de autorización identificado, comprobaciones locales disponibles, shell visual y navegación de funcionalidades ya implementadas, documentación y revisión de los cambios. La ampliación incluye preparación en los recursos existentes de Supabase, GitHub y Vercel, con cambios limitados a FieldForce y validación del destino antes de ejecutarlos. No confundir esta autorización con su realización.

Excluido:

- Alterar esquemas, datos, políticas o servicios de otras aplicaciones del Supabase compartido, o cambiar su configuración global de Auth.
- Fusionar a la rama productiva o promover un despliegue a producción sin autorización inequívoca que cubra esa acción.
- Incorporar Dispatch, SLA, activos, mantenimiento, checklist, temporizador o calidad como funcionalidades de servidor en esta fase.
- Crear recursos duplicados, contratar servicios, cambiar dependencias o trasladar la aplicación a otra infraestructura fuera de la preparación aprobada.
- Importar registros ficticios de la demo o utilizar datos personales como fixtures.
- Afirmar aceptación productiva, cumplimiento nDSG o funcionamiento E2E a partir de tests estructurales o build.

Una migración escrita no prueba su aplicación. Para esta corrección sí existen evidencias de aplicación remota y prueba transaccional, separadas de la validación del frontend y de cualquier despliegue de la aplicación; véase la [aceptación](../acceptance/VE-FF-PREMIUM-001-phase-1.md).

## Requisitos EARS y aceptación

| ID | Requisito | Criterio verificable |
|---|---|---|
| P1-SEC-01 | SI el usuario no está autenticado, no pertenece a la empresa destino o carece del rol permitido, el sistema DEBERÁ rechazar la emisión de una invitación. | Casos anónimo, pertenencia ausente/`NULL`, técnico y usuario de otra empresa denegados; owner/admin de la empresa autorizado. |
| P1-SEC-02 | CUANDO una función privilegiada afectada evalúe permisos, el sistema DEBERÁ tratar ausencia de pertenencia como denegación explícita. | Revisión de todas las funciones afectadas; pruebas de rol permitido, prohibido y ausente. Los casos no ejecutados en PostgreSQL se indican como pendientes. |
| P1-SEC-03 | SI una operación se deniega, el sistema DEBERÁ conservar datos y eventos sin cambios persistentes. | Integración aislada verifica ausencia de escrituras; la comprobación remota autorizada usa fixtures ficticios y ROLLBACK, con verificación posterior de ausencia de residuos. |
| P1-UI-01 | CUANDO se muestre el dashboard autenticado, el sistema DEBERÁ aplicar el shell claro inspirado en Premium v5.1 manteniendo las acciones existentes. | Cabecera azul oscuro, superficies claras, tarjetas legibles y navegación operativa; contraste con la referencia documentado. |
| P1-UI-02 | CUANDO el usuario navegue por el shell, el sistema DEBERÁ conservar empresa, idioma y restricciones existentes. | Revisar rutas DE/EN/ES, selección de empresa y controles por rol; el frontend no sustituye la autorización de servidor. |
| P1-UI-03 | SI un módulo de la demo no tiene implementación en el SaaS, el sistema NO DEBERÁ mostrarlo como una función operativa. | No hay enlaces rotos, resultados ficticios ni indicadores que simulen persistencia o servicios reales. |
| P1-UI-04 | CUANDO se utilice el shell en móvil o con teclado, el sistema DEBERÁ mantener navegación y acciones esenciales accesibles. | Inspección a 390 y 1440 px, foco visible, nombres accesibles y ausencia de desbordamiento horizontal global; registrar lo no comprobado. |
| P1-VAL-01 | CUANDO se entregue la fase, la documentación DEBERÁ distinguir cambios escritos, comprobaciones ejecutadas y estado desplegado. | Cada requisito consta como PASS, FAIL o pendiente, con evidencia y limitaciones; no se declara la vulnerabilidad remota corregida sin aplicación y validación autorizadas. |
| P1-INF-01 | CUANDO se prepare la infraestructura de FieldForce, el sistema DEBERÁ reutilizar los recursos identificados y restringir los cambios a la aplicación. | Registro del proyecto/esquema Supabase, repositorio GitHub y proyecto/equipo Vercel; ningún recurso duplicado ni objeto ajeno modificado. |
| P1-INF-02 | CUANDO se prepare o despliegue una preview, la entrega DEBERÁ identificar su rama, commit, URL y estado por separado de producción. | Evidencia de ejecución y verificación de preview; promoción productiva no declarada ni ejecutada por inferencia. |

## QA de especificación

| Cuestión | Resolución en esta fase |
|---|---|
| La demo contiene `paused`; el SaaS contiene `assigned` y `cancelled`. | No modificar estados. La equivalencia se decidirá antes del módulo de ejecución. |
| La demo tiene alcances de clientes/eventos inconsistentes por pantalla. | Conservar autorización del SaaS y corregir el defecto identificado; no importar permisos visuales. |
| La mejora local podría confundirse con remediación productiva. | Registrar por separado migración escrita, aplicación remota y verificación. La preparación externa está aprobada; el riesgo sigue abierto hasta comprobar la remediación. |
| Menor número de eventos podría confundirse con mayor capacidad garantizada. | La elección de `upuhppsbolpdpaighzfq` usa la instantánea disponible y la existencia del esquema; no garantiza capacidad o aislamiento operativo. |
| Preparar Vercel podría confundirse con publicar en producción. | Usar preview identificada y conservar la promoción productiva como puerta pendiente. |
| El diseño está aprobado como referencia, no cada detalle visual. | Respetar composición y paleta; ajustes menores de accesibilidad permitidos, sin añadir alcance funcional. |
| Tests estructurales no prueban RLS ni una operación SQL real. | Se ejecutaron pruebas PostgreSQL locales/remotas ampliadas: permisos anon, RPC públicas con rol authenticated, no miembro, técnico, owner de otra empresa y owner/admin autorizados. No equivalen a Auth/PostgREST ni E2E de navegador. |
| PR #19 no está integrada en la base auditada. | Sus cuatro commits de código/tests se incorporaron mediante cherry-pick local. No se fusionó la PR ni se acredita cambio en main remoto. |
| La demo declara 46 pruebas sin incluir el archivo ejecutable. | No usar ese número como resultado de esta fase. |

## Tareas de fase 1

Máximo diez tareas; el orden mantiene tests antes de implementación. PASS indica el alcance ejecutado de la tarea, no la aceptación completa de la fase. Detalles y límites en la [aceptación](../acceptance/VE-FF-PREMIUM-001-phase-1.md).

| Tarea | Trabajo | Dependencia | Estado verificado |
|---|---|---|---|
| T01 | Fijar base de trabajo y alcance aprobado; revisar instrucciones, cambios ajenos y recursos existentes para evitar duplicados. | Ninguna | PASS |
| T02 | Escribir pruebas relevantes de autorización, incluyendo pertenencia ausente y otra empresa. | T01 | PASS: matriz ampliada local/remota |
| T03 | Preparar corrección versionada de autorización y revisar funciones relacionadas. | T02 | PASS para las tres funciones identificadas |
| T04 | Validar corrección local; preparar aplicación limitada a FieldForce en el Supabase seleccionado y registrar por separado aplicación y verificación remotas. | T03 | PASS en los casos SQL documentados |
| T05 | Definir componentes del shell y verificaciones de navegación, roles e idiomas. | T01 | PASS para componentes y tests locales |
| T06 | Implementar el shell claro sobre los recorridos existentes, sin módulos ficticios. | T05 | PASS de implementación; aceptación visual pendiente |
| T07 | Verificar móvil, teclado, foco, idiomas y estados de interfaz afectados. | T06 | PENDIENTE de navegador autenticado |
| T08 | Ejecutar tests, lint, typecheck y build apropiados; revisar el diff consolidado. | T04, T06 | PASS automatizado/consolidado; T07 sigue independiente y pendiente |
| T09 | Preparar rama/PR y preview en GitHub/Vercel existentes; comprobar configuración y registrar commit, URL y resultados sin promoción productiva. | T08 | PASS: rama publicada, PR #20 draft y preview READY |
| T10 | Consolidar documentación y entrega para aceptación, diferenciando cambios locales, remotos y preview; mantener la puerta de producción. | T07, T09 | PENDIENTE de entrega/aceptación final; matriz documentada |

## Dependencias, riesgos y decisiones pendientes

- El entorno PostgreSQL local y la matriz SQL ampliada local/remota han pasado. La matriz cubre la corrección de autorización especificada; no certifica aislamiento integral de todos los módulos ni el acceso HTTP Auth/PostgREST.
- Los identificadores del historial remoto y los archivos de migración difieren. Para esta corrección: local `20261113233811` corresponde a remoto `20261114001433`; mantener esta correspondencia antes de una futura aplicación automatizada.
- El defecto de pertenencia ausente se corrigió en las tres funciones desplegadas y pasó los casos SQL documentados. Esto no certifica toda la autorización del producto ni el recorrido autenticado de navegador.
- `npm test`: 62/62; lint y typecheck sin errores; build Next.js 16.4.3 satisfactorio. `npm audit`: siete vulnerabilidades moderadas transitivas de desarrollo vía minimatch/@typescript-eslint, cero altas/críticas; no se aplicó fix automático.
- Pendientes para fases posteriores: estado pausado, matriz final de permisos de módulos avanzados, zona horaria y conflictos Dispatch, calendario y versionado SLA, sesiones de temporizador, generación manual/automática de mantenimiento, retención y recuperación.
- Para esta fase está decidido reutilizar Supabase compartido `upuhppsbolpdpaighzfq` y el esquema propio existente. Un futuro traslado a un proyecto dedicado requiere evaluación y autorización independientes.
- La ampliación autoriza la preparación externa descrita; no autoriza nuevas funcionalidades, cambios ajenos a FieldForce ni promoción productiva implícita.

© VIDAL ECOSYSTEM
