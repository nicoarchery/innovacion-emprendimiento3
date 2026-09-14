---
status: planned
created: 2026-09-14
priority: high
tags:
- backend
- rules
- alertas
- esg
- gobernanza
depends_on:
- 001-secop-ingestion
- 002-mvp-dashboard
- 004-captura-evidencia-campo
created_at: 2026-09-14T00:12:01.719407367Z
updated_at: 2026-09-14T00:12:01.719407367Z
---

# Motor de Brechas (Gap Analysis) y Alertas de Riesgo Territorial

> **Status**: planned · **Priority**: high · **Created**: 2026-09-13

## Overview

Reglas de negocio que combinan los tres niveles de verdad: % ejecución SECOP II (N1), % avance reportado por la empresa (N2) y % evidencia de campo (N3). Calcula el Índice de Brecha `|N1 − N3|`, activa Alertas de Riesgo Territorial cuando supera un umbral (>15%) y gestiona los estados de gobernanza (Bajo Revisión Neutra) según el protocolo de resolución de disputas.

## Requirements

- **Cálculo:** CUANDO existen N1 (SECOP) y N3 (campo/evidencias) para un proyecto, ENTONCES el sistema DEBE calcular `gap = |%N1 − %N3|`.
- **Alerta:** SI `gap > 15%`, ENTONCES el sistema DEBE activar la Alerta de Riesgo Territorial y exponerla en dashboard y API.
- **Agregación N3:** CUANDO un proyecto recibe múltiples evidencias, ENTONCES el % de campo DEBE ser el promedio ponderado, dando mayor peso a las evidencias más recientes y geolocalizadas.
- **Revisión Neutra:** SI una veeduría reporta paralización y la empresa presenta actas de interventoría vigentes, ENTONCES el proyecto DEBE pasar a `bajo_revision_neutra`.
- **Publicación de Alerta:** SI una paralización no cuenta con ≥3 reportes independientes en radio <500m ni transcurren 5 días hábiles sin descargos, ENTONCES la alerta DEBE permanecer `no_publicado`.
- **Recálculo:** SI llega una evidencia nueva, ENTONCES el sistema DEBE recalcular gap y estado de alerta en ≤2s.

## Technical Approach / Design

- `src/lib/rules.ts`: funciones puras `computeGap(n1, n3)` y `evaluateAlert(proyecto, evidencias)` desacopladas de la UI y unit-testables.
- Estados del proyecto: `sin_datos | normal | alerta | bajo_revision_neutra | disputa_resuelta`.
- Endpoint `src/app/api/brechas/[id]/route.ts`: expone gap, nivel, evidencias y estado de gobernanza.
- Audit log de transiciones de estado (quién/cuándo/qué) para trazabilidad.

## Plan

- [ ] Implementar `computeGap` y `evaluateAlert` con casos límite (datos faltantes/NaN).
- [ ] Máquina de estados de gobernanza (revisión neutra, evidencia cruzada).
- [ ] Endpoint `/api/brechas` con lectura de N1/N2/N3.
- [ ] Integrar alertas y detalle de disputas en `SecopExplorer` y `ProjectDetailsModal` (002).
- [ ] Audit log de transiciones de estado.

## Test

- [ ] `gap>15` activa alerta; `gap≤15` no (casos frontera).
- [ ] Transición a `bajo_revision_neutra` con descargos de interventoría vigentes.
- [ ] Alerta permanece `no_publicado` con <3 reportes independientes.
- [ ] Recálculo automático ≤2s con evidencias nuevas.

## Notes

- Umbral 15% fijado como hipótesis inicial; se DEBE parametrizar por plan/proyecto.
- Fuente del protocolo de disputas: sección 6.3 de docs/02-estrategia-arquitectura.md.