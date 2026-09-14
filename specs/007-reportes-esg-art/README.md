---
status: planned
created: 2026-09-14
priority: medium
tags:
- reportes
- gri
- issb
- ods
- art
- obras-impuestos
depends_on:
- 001-secop-ingestion
- 005-gap-analysis-engine
created_at: 2026-09-14T00:12:04.526621777Z
updated_at: 2026-09-14T00:12:04.526621777Z
---

# Reportes ESG y Avance ART (Obras por Impuestos)

> **Status**: planned · **Priority**: medium · **Created**: 2026-09-13

## Overview

Generador automatizado de informes en estándares GRI/ISSB/ODS a partir de datos verificados del motor de brechas, y del reporte de avance que exigen la ART y la DIAN en proyectos de Obras por Impuestos (OpI). Convierte N1/N2/N3 en documentos consumibles por clientes B2B y por la regulación.

## Requirements

- **Selección de Plantilla:** CUANDO el usuario B2B selecciona empresa/proyecto y estándar (GRI, ISSB, ODS, OpI/ART), ENTONCES el sistema DEBE generar el informe con los indicadores requeridos por el estándar.
- **Datos Verificados:** SI el informe incluye métricas de avance, ENTONCES SOLO DEBE usar datos N1/N2/N3 con su fuente y fecha de corte.
- **Exportación:** CUANDO el informe se descarga, ENTONCES el sistema DEBE emitir PDF y (para ART/DIAN) XLSX con número de versión y fecha de generación.
- **Cumplimiento OpI:** CUANDO el proyecto es Obras por Impuestos, ENTONCES el informe DEBE incluir BPIN, entidad, contratista, presupuesto y % de avance físico/financiero.
- **Trazabilidad:** SI una métrica proviene de evidencia de campo (004-captura-evidencia-campo), ENTONCES el informe DEBE citar el id de evidencia y sus coordenadas.
- **Branding:** CUANDO se exporta, ENTONCES el sistema DEBE aplicar la marca de la empresa contratante.

## Technical Approach / Design

- Plantillas por estándar en `src/lib/reportes/templates/` (GRI, ISSB, ODS, OpI-ART).
- Render servidor: PDF (react-pdf o Playwright) y XLSX (SheetJS) en cola de trabajos.
- Endpoint `src/app/api/reportes/route.ts`: POST crea job, GET consulta estado, GET `/download` obtiene artefacto.
- Histórico de versiones por empresa/estándar con vista previa en navegador.

## Plan

- [ ] Definir estructura de datos por plantilla (indicadores y campos OpI/ART).
- [ ] Implementar generador PDF y XLSX con cola de trabajos.
- [ ] Endpoint `/api/reportes` (crear/estado/descarga).
- [ ] Vista previa e historial de versiones.
- [ ] Validar con una ficha real de OpI (ej. vía Guamal, Meta).

## Test

- [ ] Informe GRI/ISSB generado solo con datos verificados y fuente citada.
- [ ] Reporte OpI incluye los campos exigidos por ART/DIAN.
- [ ] PDF descargable reproducible (mismos datos → mismos valores).
- [ ] Exportación con marca y branding de la empresa.

## Notes

- Estándares objetivo: GRI 403/410, ISSB (NIIF S1/S2) y ODS 8/9/11/17, según docs/02-estrategia-arquitectura.md §5.
- Fee por proyecto monitoreado para OpI como fuente de ingresos.