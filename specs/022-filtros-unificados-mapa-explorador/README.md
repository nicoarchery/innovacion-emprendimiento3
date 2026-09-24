---
status: complete
created: 2026-09-24
priority: medium
tags:
- filtros
- mapa
- explorador
- ui
- spec-driven
created_at: 2026-09-24T00:20:16.459501540Z
updated_at: 2026-09-24T00:23:51.167032985Z
completed_at: 2026-09-24T00:23:51.167032985Z
transitions:
- status: complete
  at: 2026-09-24T00:23:51.167032985Z
---

# Filtros unificados mapa/explorador: buscador, ayuda de estados y fechas inicio/fin

> **Status**: in-progress · **Priority**: medium

## Overview

Mapa y explorador deben tener **las mismas funcionalidades de filtrado** con visualización distinta. Hoy el explorador no tiene entidad/valor/fechas y el mapa no tiene buscador; además el único filtro de año (firma) debe reemplazarse por **dos filtros independientes**: año de inicio y año de fin de la obra.

## Requirements (EARS)

- CUANDO el usuario pasa el cursor o hace click en un icono "?" junto al filtro de Estado, ENTONCES se muestra un popup que explica cada estado SECOP disponible.
- CUANDO se filtra por "Año de inicio" únicamente, ENTONCES solo se consideran obras cuya `fecha_inicio` cae en ese año (sin condicionar la fecha de fin, que queda vacía).
- CUANDO se filtra por "Año de fin" únicamente, ENTONCES idem sobre `fecha_fin`.
- CUANDO ambos años se seleccionan, ENTONCES se aplican en conjunto (AND).
- CUANDO se escribe en el buscador del mapa, ENTONCES se filtran obras por nombre/entidad/contratista/referencia/barrio/comuna/estado (mismo criterio ya usado en el explorador).
- CUANDO el buscador está vacío, ENTONCES no filtra.
- CUANDO se aplican filtros en el mapa, ENTONCES la API devuelve obras pre-filtradas vía query params (`q`, `estado`, `entidad`, `minValor`, `maxValor`, `fechaInicio`, `fechaFin`).
- CUANDO se aplican filtros en el explorador, ENTONCES el filtrado es en cliente sobre `/api/mapa/obras?todas=1`.

## Technical Approach / Design

- `db.ts`: `listObras` y `listTodasObras` ganan `q`, `fechaInicio`, `fechaFin` (year sobre `substr(fecha_inicio,1,4)`/`fecha_fin`); `busqueda` con `LIKE`. Nueva `aniosFechasDisponibles()` → `{ inicio: string[], fin: string[] }`.
- API `/mapa/obras`: reemplaza param `fecha` por `fechaInicio`+`fechaFin`, suma `q`; `meta.filtros` agrega `aniosInicio`, `aniosFin`.
- `mapa-types.ts`: `FiltrosMapaUI` → `{ busqueda, estado, entidad, minValor, maxValor, fechaInicio, fechaFin }` (fuera `fecha`).
- Nuevo `AyudaEstados.tsx`: botón "?" + popover con explicación de cada estado (popup compartido).
- `FiltrosMapa.tsx`: agrega buscador, `?` en Estado, y dos selects Año de inicio / Año de fin.
- `SecopExplorer.tsx`: agrega entidad, valor mín/máx, año inicio y año fin; `?` junto al filtro de estado; reset ("Borrar filtros") limpia todo.

## Plan

- [x] db.ts: filtros `q`, `fechaInicio`, `fechaFin` + `aniosFechasDisponibles`
- [x] API: params `q`/`fechaInicio`/`fechaFin`, meta con años
- [x] tipos compartidos `FiltrosMapaUI` y `AyudaEstados`
- [x] FiltrosMapa (buscador + ? + dos años)
- [x] SecopExplorer (entidad/valor/años + ? + reset)
- [x] tsc, eslint, build, smoke API

## Test

- [x] API: `?fechaInicio=2024` devuelve 27 resueltas (coincide con SQL de la DB); `?fechaFin=2025` = 20; combinación `2024+2026` = 0 (verificado: las obras que inician 2024 terminan en 2024/2025/2027, no es bug); `?q=alcantarillado` = 12; `?estado=En ejecución&todas=1` = 221
- [x] Build + lint + tsc OK
- [x] Smoke/UI: el mapa filtra vía la misma API ya verificada (`q`, `fechaInicio`, `fechaFin`, `estado`, `entidad`, valores); el explorador aplica las mismas condiciones en cliente sobre `todas=1`. Validación visual queda a cargo del usuario en `npm run dev`

## Notes

- Los años base se derivan de los datos (`aniosInicio`/`aniosFin`), no son listas fijas.
- `fecha_inicio` está vacía en ~162 obras; el filtro simplemente no las incluye salvo que no haya filtro de año.