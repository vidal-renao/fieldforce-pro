# FieldForce Pro

SaaS de gestión de servicios de campo de VIDAL ECOSYSTEM.

> Estado: foundation T01. Esta versión incluye una landing localizada, no funciones de negocio. Supabase, autenticación, órdenes de trabajo y dashboard están pendientes de otras tareas aprobadas.

## Stack
Next.js 16.4.3, React 19.3.0, next-intl 4.14.9, TypeScript strict, Tailwind CSS 4.

## Entorno local
Requiere Node.js 22 y npm.

```bash
npm ci
npm run dev
```

Rutas: `/de` (predeterminada), `/en`, `/es`. La raíz `/` redirige a `/de`.

## Calidad
```bash
npm test
npm run lint
npm run typecheck
npm run build
```

GitHub Actions comprueba además las rutas localizadas a través de HTTP, así como la redirección raíz.

## Ingeniería
- `docs/adr/ADR-0001-modular-monolith.md`
- `docs/MEMORY.md`
- `docs/CHANGELOG.md`
- `tests/i18n.test.mjs`

No añadir credenciales a Git. T02 (modelo de datos) no debe iniciarse sin autorización expresa.

© VIDAL ECOSYSTEM
