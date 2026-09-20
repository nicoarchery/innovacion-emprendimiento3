---
status: complete
created: 2026-09-20
priority: medium
created_at: 2026-09-20T01:38:40.174257325Z
updated_at: 2026-09-20T01:54:45.084137539Z
completed_at: 2026-09-20T01:54:45.084137539Z
transitions:
- status: in-progress
  at: 2026-09-20T01:38:40.221006314Z
- status: complete
  at: 2026-09-20T01:54:45.084137539Z
---

# Precisión de geocodificación Cali: intersecciones OSM

> **Status**: in-progress · **Priority**: medium · **Created**: 2026-09-20

## Overview

Verificación manual del usuario: `Cra 5 # 6 - 05` (centro, Comuna 3) quedó en 3.41084, -76.58121 (suroccidente), error de varios km. Diagnóstico: el pipeline tomaba el resultado #1 de Nominatim sin validar; `Cra` vs `Carrera` generaban llaves de caché distintas con puntos distintos (envenenamiento por caché: 56 filas comparten esa dirección); ningún gate geográfico. OSM no tiene números de predio en esas vías, así que la precisión puerta-a-puerta de Google no es alcanzable con Nominatim; la nomenclatura CO (`Vía N # M-PP` vive junto a la calle M) permite intersección geométrica vía Overpass con error ~100 m.

## Requirements

- WHEN se geocodifica una dirección THEN se usa su forma canónica (mayúsculas, abreviaturas expandidas, `#6-05`, sin cola administrativa) como query y llave de caché.
- WHEN la dirección parsea como `Vía N # M-PP` THEN se intenta cruce geométrico Overpass (nombres exactos, gap < 60 m) antes que centroide.
- WHEN cualquier nivel produce un punto THEN se descarta si cae fuera del bbox metro Cali (3.30–3.56, -76.66–-76.42); nunca se cachea ni guarda.
- WHEN un candidato Nominatim declara vía THEN se exige coincidencia con la vía parseada y ciudad Cali.
- WHEN corre el sync THEN una migración una-sola-vez purga caché fuera de bbox, elimina llaves no canónicas y devuelve a pendiente las resueltas sin entrada canónica.

## Technical Approach / Design

- Nuevo `src/lib/mapa/direccionCO.ts` (puro): `canonizarDireccionCO`, `parsearDireccionCO`, `callesCruceCandidatas`, `enCali`, `distanciaM`.
- `geocodeService.ts` niveles: 1) predio Nominatim estructurado (`addresstype` casa, confianza alta); 2) intersección Overpass POST (primario + mirror kumi, gap 1.5 s, caché en memoria por par), confianza alta; 3) centroide validado, media; 4) Photon validado; 5) texto/barrio existentes con gate.
- `db.ts`: tabla `meta` + `migrarGeoV2()` idempotente. `syncService.ts`: la invoca y usa llave canónica. `PanelDetalleObra`: label `overpass-interseccion`.

## Plan

- [x] Diagnóstico del caso Cra 5 #6-05 (caché envenenada + sin validación)
- [x] Módulo direccionCO + pipeline v2 en geocodeService
- [x] Migración geo v2 en db + llaves canónicas en syncService + label panel
- [x] Prueba con muestra de direcciones (distancia a referencia < 400 m) + build/lint/validate

## Test

- [x] `CARRERA 5 #6-05` resuelve a < 400 m de 3.449339, -76.536504 (cruce OSM verificado)
- [x] Sync de prueba: 0 puntos nuevos fuera del bbox; re-sync idempotente
- [x] `bun run build`, `bun run lint` (solo preexistentes), `bunx lean-spec validate`

## Notes

Supersede parcial de 014 (estrategia de niveles): mantiene niveles pero con validación y cruce geométrico. Depende de APIs externas gratuitas (Nominatim 1 req/s, Overpass uso justo con gaps).
