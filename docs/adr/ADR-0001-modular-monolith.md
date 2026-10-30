# ADR-0001 — Monolito modular para el MVP

Estado: aceptado por VE-FFP-PLAN-001 v1.0.
Fecha: 2026-10-30.

## Contexto
FieldForce Pro parte de una aplicación Next.js inicial. El modelo de datos, las políticas RLS y la autenticación corresponden a tareas posteriores.

## Decisión
Mantener un monolito modular Next.js 16 con TypeScript strict y next-intl DE/EN/ES, routing con prefijos y predeterminado DE. Introducir Supabase PostgreSQL y RLS solamente en T02/T03.

## Seguridad y QA
Mínimo privilegio, sin secretos en Git, tests primero, lint, typecheck, build y smoke HTTP en CI. No proclamar preparación productiva ni funcionalidades no implantadas.

## Consecuencias
Menor carga operativa, despliegue sencillo, separación por dominios al crear funcionalidades.

© VIDAL ECOSYSTEM
