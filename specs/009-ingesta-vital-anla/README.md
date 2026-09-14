---
status: planned
created: 2026-09-14
priority: medium
tags:
- scraping
- anla
- ambiental
- vital
- compliance
depends_on:
- 001-secop-ingestion
created_at: 2026-09-14T00:12:09.395190712Z
updated_at: 2026-09-14T00:12:09.395190712Z
---

# Ingesta VITAL (ANLA) y Trazabilidad Ambiental

> **Status**: planned · **Priority**: medium · **Created**: 2026-09-13

## Overview

Extrae resoluciones de licenciamiento y compensación ambiental de la Ventanilla Integral de Trámites Ambientales en Línea (VITAL) de la ANLA para enriquecer las fichas de proyecto con trazabilidad ecológica: licencias, actas de compensación y permisos. Complementa con dominio regulatorio la trazabilidad ESG del proyecto.

## Requirements

- **Búsqueda Programada:** CUANDO el worker de ANLA se ejecuta, ENTONCES DEBE consultar resoluciones por NIT de empresa o término (proyecto, licencia).
- **Extracción:** SI se encuentra una resolución relevante, ENTONCES el sistema DEBE extraer número, fecha, tipo de trámite y URL del PDF.
- **OCR:** SI el PDF carece de texto digital, ENTONCES el sistema DEBE aplicar OCR para obtener objeto del trámite y estado.
- **Vinculación:** CUANDO una resolución se asocia a un proyecto (BPIN/NIT/municipio), ENTONCES DEBE actualizar la ficha con `trazabilidad_ambiental`.
- **Historial:** CUANDO el origen cambia una resolución, ENTONCES el sistema DEBE mantener historial de versiones con fechas.
- **Cortesía:** SI VITAL responde HTTP 429/503, ENTONCES el sistema DEBE aplicar backoff con jitter y respetar los límites del origen.

## Technical Approach / Design

- Worker Node.js con Playwright para navegación y descarga de PDFs; `pdf-parse` + Tesseract para OCR.
- Tabla `resoluciones_anla: nro, tipo, fecha, pdf_url, hash, proyecto_id, extraido_at, version`.
- Endpoint `src/app/api/trazabilidad/route.ts` para consultar por NIT y enriquecer fichas.
- Rate limiting estricto y respeto a robots.txt (no abusar del origen estatal).

## Plan

- [ ] Prototipo de scraping del visor VITAL (búsqueda por NIT/término).
- [ ] Pipeline de descarga de PDF + OCR + parseo de metadatos.
- [ ] Modelo `resoluciones_anla` y endpoint de consulta.
- [ ] Vinculación automática con fichas de proyecto.
- [ ] Pruebas de resistencia y cortesía contra el origen.

## Test

- [ ] Resolución con PDF digital extrae número/fecha/tipo correctos.
- [ ] PDF escaneado se resuelve vía OCR.
- [ ] Asociación a proyecto actualiza la ficha con trazabilidad ambiental.
- [ ] Backoff funciona ante 429/503 sin caer en bucle.

## Notes

- Fuente: VITAL/ANLA según inventario de docs/01-contexto-y-recursos.md §3.
- Restringir frecuencia a ventanas nocturnas o de bajo tráfico para cortesía con el origen.