---
status: complete
created: 2026-09-19
priority: high
tags:
- mapa
- cali
- secop
- geo
- ui
created_at: 2026-09-19T02:37:10.230501900Z
updated_at: 2026-09-19T02:55:08.246498084Z
completed_at: 2026-09-19T02:55:08.246498084Z
transitions:
- status: in-progress
  at: 2026-09-19T02:40:56.497313884Z
- status: complete
  at: 2026-09-19T02:55:08.246498084Z
---

# Mapa de Obras Públicas de Cali — MVP

> **Status**: planned · **Priority**: high ...

## Problema
Datos de contratación pública existen (SECOP) pero son ilegibles. El ciudadano de Cali no puede ver dónde se ejecutan físicamente las obras financiadas con presupuesto público.

## Usuario objetivo
Ciudadano, veeduría y periodista de Cali que quiere ubicar y entender las obras públicas.

## Hipótesis
Traducir SECOP II a un mapa georreferenciado de obras aumenta la comprensión, la trazabilidad y la rendición de cuentas (flujo SECOP → extracción → cache → geo → mapa → actualización).

## MVP
Mapa de Cali con obras (`tipo_de_contrato=Obra`) con: ficha por obra (datos SECOP + ubicación geocodificada), filtros mínimos, y botón "Actualizar mapa" que sincroniza de forma incremental CON LA DB local y geocodifica solo pendientes.

## Fuera de alcance
Cobertura nacional; app móvil; sistema de usuarios/roles; autenticación compleja; notificaciones; IA/predicciones; análisis anticorrupción; dashboards complejos; denuncias/red social; scraping indiscriminado; arquitectura distribuida.

## User stories
- Como ciudadano, quiero visualizar las obras públicas de Cali en un mapa para conocer dónde se ejecutan.
- Como usuario, quiero consultar la ficha de una obra (contrato, valor, estado, entidad, ubicación y fuente) desde el mapa.
- Como usuario, quiero actualizar manualmente los datos del mapa y ver un resumen de la sincronización.

## Criterios de aceptación
- ABRIR la app → ENTONCES el mapa se centra en Cali.
- CUANDO existen obras → ENTONCES se muestran marcadores trazables a un id de contrato SECOP.
- CUANDO se selecciona una obra → ENTONCES la ficha distingue información de SECOP vs. procesada (ubicación, fuente y confianza).
- CUANDO la ubicación no puede determinarse → ENTONCES la obra se etiqueta "ubicación no determinada" y NO aparece en un punto inventado.
- CUANDO se pulsa "Actualizar mapa" → ENTONCES la DB local se actualiza incrementalmente y se muestra resumen (nuevas/actualizadas/ubicaciones/sin ubicación/fecha).
- El frontend NUNCA consulta SECOP directamente; siempre vía backend y DB local.

## Priorización
- **MUST:** mapa centrado Cali; marcadores de obras (SECOP tipo Obra); ficha SECOP+ubicación; filtros (estado, entidad, rango de valor, fecha); botón actualizar; DB local; confianza de ubicación.
- **SHOULD:** clustering de marcadores; comuna/barrio derivados; resumen de sincronización.
- **COULD:** descarga CSV; ABC de estado por comuna; fuentes complementarias de geolocalización.

## Plan
- [x] Crear specs hijas 012 (extracción), 013 (DB+sync), 014 (geo), 015 (mapa UI).
- [x] Implementar por etapas según specs hijas.
- [x] Criterio principal: abrir la app → mapa Cali → obras → ficha → ubicación confiable → actualizar sin reconstruir DB.

## Test
- [x] Mapa renderiza centrado en Cali.
- [x] Marcadores corresponden a obras trazables a SECOP.
- [x] Obra sin ubicación no aparece en el mapa (etiqueta pendiente).
- [x] "Actualizar mapa" devuelve resumen y persiste en SQLite.