# FieldForce Pro

Proyecto de gestión de servicios de campo de **VIDAL ECOSYSTEM**.

> **Estado: prototipo inicial.** El repositorio incluye actualmente una landing provisional en Next.js. No contiene todavía autenticación, modelo de datos, integración Supabase, dashboard operativo ni funcionalidades de gestión de órdenes de trabajo. Ninguna integración con Vercel o Supabase queda demostrada por este repositorio.

## Stack verificado

- Next.js 16.4.3 (App Router)
- React 19.3.0
- TypeScript (strict)
- Tailwind CSS 4

## Desarrollo

Requisitos: Node.js 22 y npm.

```bash
npm ci
npm run dev
```

Visita http://localhost:3000.

## Comprobaciones

```bash
npm run lint
npm run build
```

Las mismas comprobaciones se ejecutan en GitHub Actions para pushes a `main` y pull requests a `main`. La compilación debe ejecutarse en un entorno con acceso a dependencias y recursos de fuentes cuando proceda.

## Próximas fases (propuestas, no implementadas)

1. Definir requisitos EARS y aprobar el alcance funcional.
2. Diseñar entidades, aislamiento multi-tenant y políticas Supabase RLS.
3. Implementar autenticación, autorización y validación Zod.
4. Crear flujos de clientes, técnicos, órdenes de trabajo y agenda.
5. Añadir pruebas automáticas (unitarias, integración y E2E), observabilidad y criterios de despliegue.

No almacenar secretos en Git ni considerar funcionalidades de producción listas sin pruebas y revisión de seguridad.

© VIDAL ECOSYSTEM.
