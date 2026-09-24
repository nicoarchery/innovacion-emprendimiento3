---
status: complete
created: 2026-09-24
priority: medium
tags:
- reporte-ciudadano
- crud
- demo
- ui
created_at: 2026-09-24T00:04:41.546392551Z
updated_at: 2026-09-24T00:06:33.734668330Z
completed_at: 2026-09-24T00:06:33.734668330Z
transitions:
- status: complete
  at: 2026-09-24T00:06:33.734668330Z
---

# Edición y borrado de reportes ciudadanos para demo (con fotos)

> **Status**: in-progress · **Priority**: medium

## Overview

La app es un demo/acta pública: quien presenta la demo debe poder **editar y eliminar** reportes ciudadanos (incluida su foto) para corregir datos de prueba o retirar evidencias sin editar SQL a mano. Hoy solo existe crear + listar.

## Requirements (EARS)

- CUANDO la ventana "Reportes ciudadanos" lista un reporte, ENTONCES cada tarjeta muestra acciones "Editar" y "Eliminar" (modo demo, sin autenticación).
- CUANDO se elimina un reporte, ENTONCES la API DELETE lo borra de la BD y la UI refresca lista + resumen (contadores `total`, `en_ejecucion`, `con_retraso`, `paralizadas`, promedio).
- CUANDO se edita un reporte con el modal pre-cargado (estado, avance, calificación, descripción, foto), ENTONCES la API PATCH persiste los cambios y la UI refresca.
- CUANDO se cambia la foto al editar, ENTONCES se reemplaza la imagen (se validan mime/tamaño igual que en creación).
- CUANDO el reporte a editar/eliminar no existe, ENTONCES la API responde 404.
- CUANDO DELETE/PATCH recibe payload inválido, ENTONCES responde 400 (mismas validaciones de POST).

## Technical Approach / Design

- BD (`db.ts`): `obtenerReportePorId(id)`, `actualizarReporteCiudadano(id, campos)`, `eliminarReporteCiudadano(id)` sobre `reportes_ciudadanos`.
- API nueva `src/app/api/mapa/reportes/[id]/route.ts`: `PATCH` (edita) y `DELETE` (borra). Validaciones reutilizadas del POST (estado_terreno, avance 0–100, calificación 1–5, foto data-url + `MAX_FOTO_BYTES`). Sin anti-spam (demo).
- UI `ReportesObraModal`: botones Editar/Eliminar por tarjeta; "Eliminar" con confirmación inline (`¿Eliminar?`).
- UI `ReporteCiudadanoModal`: prop opcional `reporte` → modo edición (título "Editar reporte", submit `PATCH /api/mapa/reportes/{id}`, campos precargados).

## Plan

- [x] DB: obtener/actualizar/eliminar reporte
- [x] API PATCH/DELETE `/api/mapa/reportes/[id]`
- [x] ReporteCiudadanoModal modo edición (precarga + PATCH)
- [x] ReportesObraModal acciones Editar/Eliminar + confirmación
- [x] Builder + smoke test manual

## Test

- [x] tsc --noEmit y eslint sin errores
- [x] next build OK
- [x] Smoke: crear reporte temporal → PATCH (cambia estado/avance/calificación/descripción/quita foto) → DELETE, y verificar que el resumen de `CO1.PCCNTR.1012429` vuelve a `total: 3`. Reportes reales del usuario intactos (no se borran).

## Notes

- `GET /api/mapa/obras/[id]/reportes` no expone `contacto`; al editar no se pide contacto.
- Borrar un reporte de prueba del usuario (1 ejecución/1 retraso/1 paralizada en `CO1.PCCNTR.1012429`) solo se hará si el usuario lo pide explícitamente.