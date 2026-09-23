---
status: complete
created: 2026-09-23
priority: high
tags:
- mapa
- fotos
- timeline
- reporte-ciudadano
depends_on:
- 018-reporte-ciudadano-mapa
created_at: 2026-09-23T19:16:03.151706506Z
updated_at: 2026-09-23T19:19:19.414824208Z
completed_at: 2026-09-23T19:19:19.414824208Z
transitions:
- status: in-progress
  at: 2026-09-23T19:16:08.208398282Z
- status: complete
  at: 2026-09-23T19:19:19.414824208Z
---

# Línea de tiempo de fotos en el mapa + fotos en listado de reportes

> **Status**: planned · **Priority**: high · **Created**: 2026-09-23

## Overview

Cuando se selecciona una obra en el mapa, una flecha en la parte inferior abre/cierra una **vista de línea de tiempo** (ventana aparte del panel de detalle) con las fotos subidas por la comunidad en los reportes. Además, el listado de reportes (`ReportesObraModal`) muestra la foto de cada reporte cuando la tiene.

## Requirements

- **Flecha de apertura:** CUANDO el usuario selecciona un marcador de obra, ENTONCES la parte inferior del mapa DEBE mostrar una flecha/botón que alterna la vista de línea de tiempo.
- **Línea de tiempo:** CUANDO la vista está abierta, ENTONCES DEBE mostrar en orden cronológico (desc) cada reporte **con foto**: imagen, fecha, estado en terreno, avance observado.
- **Cierre:** CUANDO el usuario vuelve a pulsar la flecha o cambia de obra, ENTONCES la vista DEBE cerrarse.
- **Fotos en listado:** CUANDO `ReportesObraModal` lista los reportes, ENTONCES DEBE mostrar la foto de cada reporte si existe.
- **Datos:** CUANDO `GET /api/mapa/obras/[id]/reportes` responde, ENTONCES DEBE incluir el campo `foto` por reporte (data URL) si existe.

## Technical Approach / Design

- API GET: agregar `foto` al mapeo de `listarReportesPorObra`; validar en POST que `foto` sea data URL `data:image/*` (mime) y no exceda el límite.
- Componente `LineaTiempoObra.tsx` (client): hoja inferior (bottom sheet) + botón flecha; usa `useMap`? NO — se ancla en el contenedor `.relative` de `MapaCali` con z-index sobre Leaflet (~1100).
- `ReportesObraModal.tsx`: render de `<img>` por reporte con descripcion como alt y caption de fecha/estado.

## Plan

- [x] API GET incluye `foto`; POST valida mime data:image y límite.
- [x] `LineaTiempoObra` (flecha + hoja inferior + línea de tiempo).
- [x] Integración en `MapaCali` (estado abrir/cerrar, reseteo al cambiar obra).
- [x] Fotos en `ReportesObraModal`.

## Test

- [x] GET devuelve `foto` por reporte.
- [x] POST con `foto` no-image responde 400.
- [x] Línea de tiempo muestra solo reportes con foto en orden desc.
- [x] `ReportesObraModal` renderiza la foto del reporte.
- [x] `npm run lint` y `npm run build` pasan.