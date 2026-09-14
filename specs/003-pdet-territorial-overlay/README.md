---
status: planned
created: 2026-09-13
priority: high
tags:
- geo
- pdet
- zomac
- datos-abiertos
- analitica
depends_on:
- 001-secop-ingestion
- 002-mvp-dashboard
created_at: 2026-09-13T23:50:25.794346363Z
updated_at: 2026-09-14T00:12:21.787440052Z
---

# Cruce Territorial y Zonas PDET

> **Status**: planned · **Priority**: high · **Created**: 2026-09-13

## Overview

Georreferencia los contratos de SECOP II contra la zonificación oficial de Programas de Desarrollo con Enfoque Territorial (PDET) y Zonas Más Afectadas por el Conflicto (ZOMAC). Asocia cada contrato a su municipio y código DIVIPOLA, permitiendo filtrar y priorizar inversiones en regiones PDET/ZOMAC directamente desde el explorador territorial.

## Requirements

- **Asignación DIVIPOLA:** CUANDO se carga el catálogo de contratos (001), ENTONCES el sistema DEBE asignar a cada contrato su municipio y código DIVIPOLA normalizado a partir de `departamento`/`municipio`.
- **Vinculación PDET:** SI el municipio del contrato pertenece a la lista oficial de municipios PDET (16 subregiones), ENTONCES el sistema DEBE etiquetar el proyecto con `zona_pdet` e indicar la subregión.
- **Cursor ZOMAC:** SI el municipio pertenece a la lista ZOMAC, ENTONCES el sistema DEBE etiquetar el proyecto con `zona_zomac` y los beneficios fiscales aplicables (p. ej. Obras por Impuestos).
- **Filtro en UI:** CUANDO el usuario activa el filtro "PDET/ZOMAC" en `/explorador`, ENTONCES el sistema DEBE mostrar solo los contratos de dichas zonas y actualizar métricas y mapa.
- **Consistencia:** SI un contrato no se puede asignar a DIVIPOLA, ENTONCES el sistema DEBE marcarlo `geo_status=unresolved` y excluirlo de los agregados territoriales.
- **Cruce con brechas:** CUANDO se muestra la ficha de un proyecto PDET, ENTONCES el sistema DEBE exponer el estado de brecha (005) junto al badge territorial.

## Technical Approach / Design

- Norma `src/lib/divipola.ts`: diccionario completo municipio→código DIVIPOLA→(`pdet` subregión | `zomac` | regular).
- Carga de fuentes oficiales: listado de municipios PDET (ART) y decretos ZOMAC/OpI.
- Endpoint `src/app/api/zonas/route.ts`: expone subregiones/polígonos y el cruce contratos↔zona.
- En `SecopExplorer` (002): badges "PDET · {subregión}" y "ZOMAC" + filtro de zona y herramienta de normalización.

## Plan

- [ ] Implementar `src/lib/divipola.ts` con diccionario municipio/código/PDET/ZOMAC.
- [ ] Cargar listados oficiales ART (PDET) y decretos ZOMAC.
- [ ] Normalizar los contratos en la fase de ingesta (001) con `geo_status`.
- [ ] Crear endpoint `/api/zonas` con cruce contratos↔zona.
- [ ] Integrar badges y filtro PDET/ZOMAC en el explorador (002).
- [ ] Validar con `bun run build` y `npx lean-spec validate`.

## Test

- [ ] Contrato de municipio PDET (p. ej. San José del Guaviare) queda etiquetado con subregión.
- [ ] Filtro PDET/ZOMAC devuelve únicamente contratos de dichas zonas.
- [ ] Contrato con municipio desconocido queda `geo_status=unresolved` sin romper agregados.
- [ ] Ficha de proyecto PDET incluye el estado de brecha (005).

## Notes

- Fuentes: mapa PDET de la ART y Decreto 1650/2017 (listado ZOMAC).
- En el MVP basta la codificación por municipio; las geometrías/polígonos se agregan en fases posteriores con PostGIS.