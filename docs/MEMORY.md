# FieldForce Pro — Índice de estado

Actualizado: 2026-11-14. Reglas compartidas: [AGENTS.md](../AGENTS.md).

- Repositorio: `vidal-renao/fieldforce-pro`. Base auditada: `66966aa3a040365d534ff8f1c6bb7a6cdeab7435`.
- El estado T01 de la versión anterior de este índice estaba obsoleto: existen autenticación, clientes, órdenes, asignaciones, invitaciones y auditoría.
- Arquitectura B y fase 1 aprobadas: [ADR-0004](adr/ADR-0004-selective-premium-evolution.md) y [EARS, QA y tareas](specs/VE-FF-PREMIUM-001-phase-1.md).
- Trabajo activo: hardening de autorización y shell frontend basado en la demo. [Aceptación parcial y evidencia](acceptance/VE-FF-PREMIUM-001-phase-1.md): matriz SQL ampliada local/remota PASS en el alcance documentado; UAT visual pendiente.
- Stack conservado: Next.js 16.4.3, React 19.3.0, TypeScript strict, next-intl 4.14.9, Supabase y Zod. Locales: DE predeterminado, EN y ES.
- Demo Premium v5.1 independiente del SaaS. No importar su persistencia ni sus roles simulados.
- Recursos seleccionados: Supabase `upuhppsbolpdpaighzfq`, esquema propio existente `fieldforce`; GitHub `vidal-renao/fieldforce-pro`; Vercel `fieldforce-pro`, equipo `vidal-renaos-projects`. Reutilizarlos y evitar duplicados. La comparación de carga está en la spec.
- Supabase local aplicó 18 migraciones. Corrección local `20261113233811` aplicada en remoto como `20261114001433 fieldforce_phase1_authorization_null_guards`; pruebas SQL con ROLLBACK PASS, sin fixtures remotos residuales, y tres funciones fail-closed verificadas.
- App local: 62/62 tests, lint/typecheck sin errores y build Next.js 16.4.3 OK. Audit: siete moderadas transitivas de desarrollo, cero altas/críticas, sin fix automático.
- Rama `codex/hardening-phase-1` publicada, commit `31b9c393fb5ff0809addc7dc3ef8ca83e1dc8501`; [PR #20 draft](https://github.com/vidal-renao/fieldforce-pro/pull/20), checks quality/Vercel/Preview Comments PASS.
- [Preview READY](https://fieldforce-1r2o7k4ia-vidal-renaos-projects.vercel.app), deployment `dpl_HitdF5RQV2TwGZzCgRWR69ZMj24D`; rutas DE/EN/ES 200, dashboard sin sesión redirige 307 a login. UI autenticada a 390/1440 px y teclado pendiente. Promoción productiva no autorizada.
- Contrato operativo previo: [VE-FF-MVP-002 T02](specs/VE-FF-MVP-002-T02-operational-contract.md). Su evidencia histórica no sustituye validación actual.
- Cuatro commits de código/tests de PR #19 incorporados por cherry-pick local; la PR no se fusionó y main remoto no se declara actualizado.

Siguiente puerta: entrega con evidencia de requisitos, cambios locales/remotos, preview, limitaciones y aceptación de la fase. Mantener producción separada y sin promoción implícita.

© VIDAL ECOSYSTEM
