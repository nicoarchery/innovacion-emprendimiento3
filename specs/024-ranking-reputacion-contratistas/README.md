---
status: complete
created: 2026-09-24
priority: medium
tags:
- reputacion
- contratistas
- b2b
- ranking
- demo
depends_on:
- 020-explorador-con-datos-reales---reportes-unificados-con-el-mapa
- 008-perfil-publico-b2b
created_at: 2026-09-24T03:37:58.276062474Z
updated_at: 2026-09-24T04:03:30.123934400Z
completed_at: 2026-09-24T04:03:30.123934400Z
transitions:
- status: complete
  at: 2026-09-24T04:03:30.123934400Z
---

# Ranking de Reputación de Contratistas

> **Status**: planned · **Priority**: medium · **Created**: 2026-09-24

## Overview

Clasificar y mostrar la reputación de los contratistas a partir de los reportes ciudadanos y valoraciones previas (calificación 1–5, avance observado, retrasos/paralizadas). Es el activo reputacional que sustenta el perfil público por empresa (008). Para pruebas, los datos de ejemplo se siembran mezclados: seed en la DB o quemados en código (demo).

## Requirements (EARS)

- WHEN se consulta el ranking de contratistas, THEN el sistema DEBE agregar una reputación por `contratista` calculada desde los reportes reales de sus obras (tabla `reportes_ciudadanos`).
- WHEN un contratista tiene ≥ N reportes válidos (umbral configurable, N=3), THEN DEBE asignársele una categoría de reputación (p.ej. `critico` / `observado` / `confiable`) según su score.
- WHEN se calcula el score, THEN DEBE ponderar mínimo: promedio de `calificacion`, % de reportes `con_retraso`/`paralizadas` y novedad de los reportes (los más recientes pesan más).
- WHEN un contratista no alcanza el umbral de reportes, THEN el sistema DEBE mostrarlo como "sin datos suficientes" (NO inventar reputación).
- WHEN se muestra un contratista en ranking, explorador, mapa o ficha de obra, THEN DEBE mostrarse nivel + score + evidencia (número de reportes, promedio).
- WHEN se ordena el ranking, THEN DEBE permitir ordenar por valor de contratos, nº reportes o score.

## Technical Approach / Design

- Vista agregada `resumenReputacionContratistas()` en `src/lib/mapa/db.ts`: `obras JOIN reportes_ciudadanos` agrupado por `contratista`, calculando `score`, `nivel` y conteos en una sola pasada (evita N+1).
- Niveles por umbrales: `score >= 4.2` → confiable; `>= 3.0` → observado; else crítico; sin datos → `sin_datos`.
- Seed demo: función/source `SEED` con reportes de prueba por contratista activable por flag (demo), o SQL sembrado en `data/mapa.db` — mismo criterio del aviso de prototipo (010).
- API `GET /api/mapa/ranking?orden=valor|reportes|score` responde `{ success, data: RankingContratista[], meta }`.
- UI: sección/ranking y badges de nivel reutilizables en fichas de obra y perfil B2B (008).

## Plan

- [x] Vista agregada de reputación + niveles en `db.ts`.
- [x] Seed de datos demo por contratista.
- [x] API `GET /api/mapa/ranking` con ordenación.
- [x] UI ranking + badges de nivel en explorador/ficha.

## Test

- [x] Contratista con ≥3 reportes obtiene nivel y score coherente (verificado contra datos reales).
- [x] Contratista con <3 reportes aparece `sin_datos`.
- [x] Ordenar por score/reportes/valor devuelve el orden esperado.
- [x] `npm run lint`, `tsc --noEmit` y `next build` pasan.

## Notes

- Los datos reales mandan: si no hay reportes suficientes para un contratista, el ranking refleja `sin_datos`, nunca reputación fabricada.
- Complementa la vitrina reputacional del perfil por empresa (008-perfil-publico-b2b).