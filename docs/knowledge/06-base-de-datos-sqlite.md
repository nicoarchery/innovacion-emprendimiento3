---
domain: base-de-datos-sqlite
status: CURRENT
confidence: VERY HIGH
authority: config-data
last_verified: 2026-09-20
sources:
- "data/mapa.db (consultado con sqlite3)"
- "src/lib/mapa/db.ts"
- "src/lib/mapa/syncService.ts"
- "src/lib/mapa/types.ts"
---

# 06 — Base de datos SQLite local (`data/mapa.db`)

## Qué es

Base SQLite local, git-ignored (`/data/` en `.gitignore`), creada/actualizada por el sync incremental de SECOP II. No se versiona; se regenera con el sync. Es la **única fuente real de datos de obras** para el mapa.

## Tablas y esquema (de `src/lib/mapa/db.ts`)

### `obras` (registro maestro)
- Clave primaria y campos de contrato SECOP: `id_contrato`, `proceso_de_compra`, `referencia`, `entidad_nombre`, `entidad_nit`, `contratista`, `contratista_doc`, `departamento`, `municipio`, `descripcion`, `tipo_contrato`, `unspsc`, `estado`.
- Datos de consumo: `fecha_firma/inicio/fin`, `valor`, `url_secop`, `direccion_ejecucion`, `localizacion`.
- **Clasificación**: `is_obra` (1/0), `obra_score`, `obra_razon` (del `clasificador.ts`).
- **Geocodificación**: `barrio`, `comuna`, `lat`, `lon`, `geo_fuente`, `geo_confianza`, `estado_ubicacion`, `geo_intentos`.
- Timestamps de ingesta: `secop_updated_at`, `synced_at`, `hash` (integridad), `created_at`.

### `ubicaciones`
- Tabla auxiliar de geolocalización (referenciada desde las obras según `db.ts`).

### `sync_runs`
- Registro histórico de corridas del proceso de sincronización.

### `meta`
- Parámetros/estado genéricos (clave/valor). Contiene marcadores de pipeline (ver "Datos verificados" abajo).

## Estados de ubicación (columna `estado_ubicacion`)

| Valor | Significado | Origen |
|-------|-------------|--------|
| `pendiente` | Todavía no geocodificada (o re-queda pendiente) | inicial / falla |
| `resuelta` | Tiene coords válidas (`lat`/`lon`) | geocode OK |
| `no_determinada` | No se pudo ubicar con certeza | geocode falla final |

Fila tiene además `geo_intentos`, `geo_confianza` (alta/media/baja) y `geo_fuente` (nominatim, overpass-interseccion, photon, texto-contrato, barrio-objeto, etc.).

## Datos verificados en vivo (2026-09-20)

- **Total obras**: 1434.
- Por `tipo_contrato`: `Obra` 1430, `Asociación Público Privada` 3, `Concesión` 1.
- `estado_ubicacion`: **`resuelta` 146**, `pendiente` 1288, `no_determinada` 0.
- `sync_runs`: 6 corridas.
- `meta`: `geo_migracion_v2 = 2026-09-20T01:49:15.987Z` → indica que se aplicó la migración v2 del pipeline de geocodificación; los estados actuales son post-migración.

## Sincronización (`syncService.ts`)

- Fetch paginado SECOP → normalizar (clasificar) → upsert en `obras` → geocodificar pendientes → escribir `sync_runs`.
- Control de concurrencia: flag en memoria `estaSincronizando()` (respuesta 409 en API si ya corre → ver `09`).
- Protecciones: `MAPA_GEO_CAP_CORRIDA` límite de geocodes por corrida (evita rate-limit), hash para detectar cambios, reintentos 429.
- Migraciones de esquema/pipeline: `meta.geo_migracion_v2` (una vez).

## Regla práctica

- **Nunca asumas datos del mapa desde specs o docs**: consulta `obras`/`sync_runs`/`meta` directamente (o lee `db.ts`).
- Si tocas el esquema: aplica migración idempotente y actualiza `meta` con `geo_migracion_vN`.