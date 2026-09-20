---
domain: geocodificacion
status: CURRENT
confidence: VERY HIGH
authority: implementation
last_verified: 2026-09-20
sources:
- "src/lib/mapa/geocodeService.ts"
- "src/lib/mapa/direccionCO.ts"
- "src/lib/mapa/db.ts"
- "specs/014-geocodificacion-ubicacion/README.md"
- "specs/017-precision-geocodificacion-cali/README.md"
---

# 07 — Geocodificación de ubicación de obras

## Propósito

Convertir la dirección de ejecución (texto libre de SECOP) + descripción del contrato en coordenadas `lat/lon` + `barrio/comuna`, asignando `estado_ubicacion`, `geo_confianza` y `geo_fuente`. Resultado va a `obras` (`06`).

## Ámbito geográfico

- **Cali (Valle del Cauca, Colombia)**, uso de `enCali()` como gate de validación (toda lat/lon resultante se valida dentro de Cali).
- `CALI_BARRIOS`: lista de ~55 barrios conocidos (referencia de Cali).

## Pipeline (fuentes y orden)

`geocodeService.ts` implementa varios niveles:

1. **Nominatim (OSM)** con `viewbox`/`bounded` de Cali, `countrycodes=co`. (fuente: `nominatim`)
2. **Overpass API** para resolver **intersecciones de vías** (Cali bbox) cuando la dirección es del estilo "Calle M # N-PP" → `overpass-interseccion`.
3. **Photon (komoot)** como fallback (última opción) → `photon`.
4. Fallback por **texto de la descripción del contrato** (extrae dirección) → `texto-contrato`.
5. Fallback por **mención de barrio** en la descripción → `barrio-objeto` (confianza baja).

## Confianza (`geo_confianza`)

| Fuente | Confianza típica |
|--------|------------------|
| Nominatim (predio/vía directa) | alta |
| Overpass intersección | alta |
| Photon | media |
| texto-contrato | media |
| barrio-objeto | baja |

## Criterio de "resuelta"

- Una obra obtiene `estado_ubicacion='resuelta'` cuando el pipeline produce coordenadas dentro de Cali con una de las fuentes anteriores (`lat`/`lon` no nulos).
- `no_determinada` / `pendiente`: no se logró geo válido o no se intentó aún.

## Salidas

`ObraRow` campos de geo: `barrio`, `comuna`, `lat`, `lon`, `geo_fuente`, `geo_confianza`, `estado_ubicacion`, `geo_intentos`, más `direccion_ejecucion` normalizada (`normalizarDireccion`).

## PC / mejoras registradas en specs

- `014-geocodificacion-ubicacion` (complete): define este pipeline.
- `017-precision-geocodificacion-cali` (complete): adds OSM intersección para mejor precisión (Overpass); hace `geo_migracion_v2` en `meta`.

## Notas operativas

- **Rate-limit**: Nominatim/Overpass tienen cortes (gap entre peticiones) y `MAPA_GEO_CAP_CORRIDA` pausa por corrida de sync. No lanzar geocodificación masiva sin respetar eso (ver `06`).
- **Idempotencia**: cada obra re-consumible; la migración `geo_migracion_v2` re-procesó pendientes sin duplicar resueltas (ver `06`).