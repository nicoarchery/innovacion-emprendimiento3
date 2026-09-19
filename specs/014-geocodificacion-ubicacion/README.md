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
created_at: 2026-09-19T02:37:11.372294456Z
updated_at: 2026-09-19T02:55:08.248918712Z
completed_at: 2026-09-19T02:55:08.248918712Z
transitions:
- status: in-progress
  at: 2026-09-19T02:40:56.499564327Z
- status: complete
  at: 2026-09-19T02:55:08.248918712Z
---

# Geocodificación de Ubicación de Obras

> **Status**: planned · **Priority**: high · **Created**: 2026-09-18

## Overview
Resolver la ubicación física de cada obra con la estrategia por niveles (1→4). SECOP no provee coordenadas (verificado en vivo), pero sí `direcci_n_de_ejecuci_n_del_contrato` (dirección de ejecución) y el dataset `wwhe-4sq8` (Ubicaciones Adicionales). Nivel 2 (geocodificar dirección con Nominatim/OSM) es la ruta principal probada en Cali.

## Requirements

- **Prohibido inventar coordenadas:** CUANDO una obra no puede ubicarse con confianza, ENTONCES el sistema DEBE marcarla como `estado_ubicacion = 'no_determinada'` y DEBE quedar fuera del mapa (spec 015), SIN punto artificial.
- **Cadena de niveles:** CUANDO se resuelve la ubicación de una obra, ENTONCES el sistema DEBE intentar en orden: (1) coordenadas de fuente oficial si existe; (2) geocodificar `dirección de ejecución`/dirección de Ubicaciones Adicionales; (3) extraer direcciones/calles/barrios/comunas del objeto de contrato y geocodificar; (4) fuentes públicas complementarias (datos abiertos Cali, Secretaría de Infraestructura) sin inventar nada.
- **Nominatim:** CUANDO se usa Nominatim, ENTONCES la petición DEBE incluir User-Agent propio y respetar 1 req/s; ENTONCES NO DEBE exceder el cap por corrida de sync.
- **Dedupe de cache:** CUANDO dos obras comparten dirección, ENTONCES el sistema DEBE reutilizar coordenadas cacheadas (tabla `ubicaciones`) para evitar re-geocodificación.
- **Confianza y fuente:** CUANDO se guarda la ubicación, ENTONCES DEBE persistirse `lat, lon, geo_fuente` (p.ej. "nominatim-address", "texto-contrato"), `geo_confianza` (alta: dirección completa resuelta con civico; media: calle/resumen; baja: fallback textual), `geo_fecha` y el método usado.
- **Comuna/barrio:** CUANDO el resultado geocodificado entrega la comuna o barrio, ENTONCES DEBE persistirse en `obras.comuna/barrio` para filtros futuros.
- **Reintento:** CUANDO una geocodificación falla temporalmente (red/rate-limit), ENTONCES el sistema DEBE dejarla como pendiente para la próxima corrida, NO marcarla falsamente como no_determinada salvo tras fallos consistentes (p.ej., 2 intentos sin resultado de dirección).
- **Registro:** CUANDO se procesa una ubicación, ENTONCES DEBE quedar trazado (fuente, confianza, fecha) para auditoría.

## Technical Approach / Design

- `src/lib/mapa/geocodeService.ts`: `Geocodificador` con: normalizado de dirección (quitar saltos de línea, "COLOMBIA"), cache en SQLite, rate-limiter (cola FIFO + sleep 1.05s), fallback Photon si Nominatim falla, parseo de resultado (lat/lon/comuna/barrio/display_name).
- Nivel 3: regex de dirección colombiana (Calle/Carrera/Av [num] # [num]-[num]) + barrios/comunas sobre `descripcion_del_proceso`.
- Estado: obra → `geo_pendiente | resuelta | no_determinada`.

## Plan

- [x] Crear `geocodeService.ts` (Nominatim + cache + rate-limit + Photon fallback).
- [x] Parsear dirección (Nivel 2) y extracción textual (Nivel 3).
- [x] Integrar en `syncService` (spec 013); persistir fuente/confianza/comuna.

## Test

- [x] Dirección "CARRERA 56 #11-36, Cali" → coordenadas reales (validado en vivo 3.4088,-76.5470) con confianza alta.
- [x] Obra sin dirección ni pista textual → `no_determinada`, fuera del mapa.
- [x] Corrección: 2 obras con misma dirección producen 1 sola llamada de geocodificación.
- [x] Mediante 2 corridas el proceso respeta 1 req/s y cap.
- [x] Fallo de red mantiene `geo_pendiente`.