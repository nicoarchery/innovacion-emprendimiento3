---
status: complete
created: 2026-09-24
priority: medium
tags:
- reportes
- b2b
- respuestas
- moderacion
- ui
depends_on:
- 018-reporte-ciudadano-mapa
- 021-edicion-borrado-reportes-demo
- 006-canal-comunitario-moderacion
created_at: 2026-09-24T03:38:20.695687504Z
updated_at: 2026-09-24T04:03:30.781370924Z
completed_at: 2026-09-24T04:03:30.781370924Z
transitions:
- status: complete
  at: 2026-09-24T04:03:30.781370924Z
---

# Interacción en Reportes: Respuestas Oficiales de Empresas y Fijado

> **Status**: planned · **Priority**: medium · **Created**: 2026-09-24

## Overview

Permitir que las empresas (contratistas) respondan directamente a los reportes publicados sobre ellas desde el listado de reportes de una obra, y que puedan destacar una respuesta oficial como **fijada/pinada** (reporte fijado). Esto convierte el panel de reportes en un espacio de rendición de cuentas bidireccional: ciudadano reporta, empresa descarga. La respuesta fijada se muestra primero como voz oficial verificada.

## Requirements (EARS)

- WHEN una empresa quiere dar una respuesta oficial a un reporte, THEN el sistema DEBE permitir crear una `respuesta` asociada al reporte (autor empresa, texto, fecha), visible en el listado de reportes de la obra.
- WHEN se crea una respuesta, THEN el sistema DEBE validar que el `id_reporte` exista y pertenezca a una obra; SI no, THEN DEBE responder 404.
- WHEN una respuesta es oficial y validada, THEN el contratista DEBE poder marcarla como **fijada** (pin): a lo sumo UNA respuesta fijada por obra.
- WHEN una obra tiene una respuesta fijada, THEN el sistema DEBE mostrarla primero (arriba del hilo), con insignia "Oficial" / "Respuesta de la empresa".
- WHEN se lista un reporte o su hilo de respuestas, THEN el sistema NO DEBE exponer el contacto del ciudadano; la respuesta solo muestra autor/empresa, texto y fecha.
- WHEN la empresa no completa el texto de la respuesta, THEN el sistema DEBE rechazarla (400).
- SI la app está en modo demo, THEN NO se exige autenticación real: `autor` se captura como texto y la validación de "empresa" corresponde al contratista de la obra.

## Technical Approach / Design

- Tabla `respuestas_reportes` en `src/lib/mapa/db.ts` (SQLite, migración idempotente en `SCHEMA`): `id INTEGER PK AUTOINCREMENT`, `id_reporte INTEGER NOT NULL`, `autor TEXT`, `texto TEXT`, `es_oficial INTEGER DEFAULT 0`, `fijada INTEGER DEFAULT 0`, `created_at TEXT`.
- Índice `idx_respuestas_reporte ON respuestas_reportes(id_reporte)`; unicidad parcial de fijada por obra resuelta en la capa de servicio (1 fijada por obra).
- API:
  - `POST /api/mapa/reportes/[id]/respuestas` → crea respuesta (valida reporte existe, texto no vacío, anti-spam básico).
  - `PATCH /api/mapa/respuestas/[id]` → editar texto o alternar `es_oficial`/`fijada` (al fijar, desfija las otras de la misma obra).
  - `DELETE /api/mapa/respuestas/[id]` → eliminar respuesta (demo).
  - `GET /api/mapa/obras/[id]/reportes` extiende cada reporte con `respuestas` (supra-fijada primero).
- UI `ReportesObraModal`: bajo cada reporte, hilo contraído de respuestas + formulario "Responder como empresa (NIT/contratista)"; botón "Fijar como oficial" visible solo para respuestas del contratista de la obra (demo: cualquier autor).
- Reutiliza convenciones de `ui/use-toast`, validaciones de POST de 021, y el aviso de prototipo (010) para datos demo.

## Plan

- [x] Tabla `respuestas_reportes` + helpers DB (insertar, listar, editar, eliminar, fijar con desfijar por obra).
- [x] API `POST/PATCH/DELETE` respuestas y extensión de `GET reportes` con hilo.
- [x] UI: hilo de respuestas + formulario en `ReportesObraModal`.
- [x] Pin "Oficial" con posición prioritaria y regla 1 por obra.

## Test

- [x] Crear respuesta a un reporte válido responde success y aparece en el hilo.
- [x] Reporte inexistente en POST responde 404; texto vacío responde 400.
- [x] Al fijar una respuesta, las demás de la misma obra quedan desfijadas (máx 1 fijada).
- [x] GET no expone `contacto` del ciudadano en reportes ni respuestas.
- [x] `npm run lint`, `tsc --noEmit` y `next build` pasan.

## Notes

- Se apoya en el pool `pendiente_moderacion` de 006 solo para validar la obra/contratista; la respuesta en sí no requiere moderación previa en demo.
- La respuesta fijada será la base del "descargo oficial" que exige la regla de evidencia cruzada del motor de brechas (005-gap-analysis-engine).
- Alineado con la privacidad de 006: el contacto ciudadano NUNCA se muestra a la empresa.