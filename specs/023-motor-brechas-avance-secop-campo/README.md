---
status: complete
created: 2026-09-24
priority: high
tags:
- brechas
- gap-analysis
- secop
- reporte-ciudadano
- fiable
created_at: 2026-09-24T01:16:33.779692118Z
updated_at: 2026-09-24T02:06:58.329312508Z
completed_at: 2026-09-24T02:06:58.329312508Z
transitions:
- status: in-progress
  at: 2026-09-24T01:16:49.993244716Z
- status: complete
  at: 2026-09-24T02:06:58.329312508Z
---

# Motor de brechas: avance SECOP vs campo (gap analysis)

> **Status**: complete · **Priority**: high · **Created**: 2026-09-24

## Overview

Comparar el **avance financiero que SECOP reporta (N1)** con el **avance físico que la gente reporta en campo (N3)**. Si la diferencia supera el umbral (15 puntos), se marca la obra con alerta de brecha. Antes de esto (spec pendiente), se diagnosticó que el dataset `jbjy-vk9h` (SECOP II Contratos) fue truncado a 1000 filas el 2026-09-23: los contratos históricos de la DB ya no están en el espejo → N1 debe soportar "sin datos" sin generar falsas alertas.

## Requirements

- **Campos fuente:** CUANDO el fetcher lee SECOP II, ENTONCES DEBE capturar `valor_pagado`, `valor_facturado`, `valor_pendiente_de_ejecucion` y `valor_pendiente_de_pago`, y persistirlos por obra (NULL si el dato no existe).
- **N1:** CUANDO una obra tiene `valor > 0` y `valor_pendiente_ejecucion` NO nulo, ENTONCES `n1 = (1 − valor_pendiente_ejecucion / valor) × 100`; SI falta ese dato, ENTONCES `n1 = null` (sin datos SECOP).
- **N3:** CUANDO una obra tiene reportes con `avance_observado`, ENTONCES `n3 = promedio` de los avances reportados; SI no hay reportes con avance, ENTONCES `n3 = null`.
- **Alerta:** SI `n1` y `n3` NO son nulos Y `|n1 − n3| > 15`, ENTONCES la obra se marca `alerta`; SI `|n1 − n3| ≤ 15`, `normal`; SI falta N1 o N3, `sin_datos` (no hay alerta).
- **Fiabilidad:** SI la ingestión del dataset devuelve 0 filas o mucho menos que lo esperado, ENTONCES el sync DEBE registrar una advertencia sin borrar datos existentes (los sync son upsert, nunca delete).

## Technical Approach / Design

- `src/lib/mapa/brechas.ts`: funciones puras `calcularN1`, `calcularN3`, `evaluarBrecha` (unit-testables, sin UI/DB).
- Migración SQLite `obras`: columnas `valor_pagado`, `valor_facturado`, `valor_pendiente_ejecucion`, `valor_pendiente_pago` (INTEGER, nullable) — `ensureSchema` con `ALTER TABLE IF NOT EXISTS`.
- `secopFetcher.ts`: `RawContratoSecop` + `ObraNormalizada` + `normalizarContrato` incluyen los 4 campos; aviso si una pasada de páginas trae 0 filas (dataset truncado/comienzo de ventana).
- API `/mapa/obras` (y `?todas=1`): cada obra expone `avanceSecop` (n1 pct), `avanceCampo` (n3 pct), `brecha` (pct abs) y `estadoBrecha` (`sin_datos | normal | alerta`). JOIN con `reportes_ciudadanos` para N3.
- UI: bloque "Análisis de avance" en `PanelDetalleObra` (mapa) y ficha del `SecopExplorer`: dos barras (SECOP y campo), etiqueta de alerta (>15) y **guía de lectura** breve (qué significa cada zona y su matiz: pagado alto sin avance físico = señal; avance sin pago = desfinanciamiento).

## Plan

- [x] `brechas.ts` con `calcularN1`/`calcularN3`/`evaluarBrecha` + test rápido
- [x] Migración columnas `obras` (ALTER TABLE) en `ensureSchema`
- [x] Fetcher: 4 campos nuevos en tipos/normalización/upsert + aviso de dataset truncado
- [x] API obras: exponer avanceSecop/avanceCampo/brecha/estadoBrecha (N3 por reportes)
- [x] UI mapa (`PanelDetalleObra`) y explorador: barras + alerta + guía de lectura
- [x] KB: `05` (diagnóstico truncamiento) · `06` (columnas) · `08` (UI) · `09` (API) · `99` (resumen)

## Test

- [x] `calcularN1`: valor=100M, pend_ejec=60M → 40.0; pend null → null
- [x] `evaluarBrecha`: n1=90, n3=40 → |50| alerta; n1=90, n3=85 → normal; falta n1 → sin_datos
- [x] API: obra con reportes devuelve `estadoBrecha` correcto; obra sin reportes → `sin_datos`
- [x] Sync con 0 filas: aviso en logs, DB intacta
- [x] tsc + eslint + build

## Notes

- `rpmr-utcd` (SECOP Integrado) NO trae campos de avance → no usarlo como sustituto. Fuente canónica de N1 sigue siendo `jbjy-vk9h` cuando esté completa; mientras no, N1 queda null (ver `05`).