---
domain: glosario
status: CURRENT
confidence: VERY HIGH
authority: meta
last_verified: 2026-09-20
sources:
- "especificaciones y código del repo (síntesis)"
---

# 14 — Glosario

Términos y siglas usados en el repo/docs/specs.

| Término | Significado |
|---------|-------------|
| **Obra Visible / Obras a la Vista** | Nombre del producto (consulta ciudadana de obra pública). Ver `01`. |
| **SECOP / SECOP II** | Sistema Electrónico para la Contratación Pública (Colombia). Conjunto de datos abiertos consumido (SODA API). Ver `05`. |
| **SODA API** | Socrata Open Data API (protocolo HTTP de datos abiertos de `datos.gov.co`). |
| **UNSPSC** | Código de categoría de bien/servicio (usa prefijos 72/30/39 como señal de obra). |
| **APP** | Asociación Público Privada (tipo de contrato). |
| **PDET** | Programas de Desarrollo con Enfoque Territorial (tema spec `003`). |
| **LSO** | Licencia Social para Operar (concepto B2B, docs). |
| **ESG** | Environmental, Social, Governance (tema specs `007`/`008`). |
| **ART** | Agencia de Renovación del Territorio (**Obras por Impuestos**; tema spec `007`). |
| **Gap / brecha** | Diferencia entre avance financiero (SECOP) y avance físico/campo (spec `005`, `sustento`). |
| **X** (en gap) | (sustento) Índice de brecha = |% ejecución − % avance campo|. |
| **VITAL / ANLA** | Ventanilla Integral de Trámites Ambientales en Línea (spec `009`). |
| **estado_ubicacion** | `pendiente` / `resuelta` / `no_determinada` (columna SQLite). Ver `06`. |
| **geo_confianza** | `alta` / `media` / `baja` (calidad del geocoding). Ver `07`. |
| **sync** | Proceso de sincronización SECOP → SQLite (`syncService.ts`, `sync_runs`). Ver `06`. |
| **PrototypeNotice** | Banner global de aviso de prototipo (`spec 010`). |
| **MarkerCluster** | Agrupación de marcadores Leaflet en el mapa. |
| **Nominatim / Overpass / Photon** | Servicios OSM/geo usados en el pipeline de geocodificación. Ver `07`. |
| **metadato `meta`** | Tabla de parámetros del proceso (p.ej. `geo_migracion_v2`). Ver `06`. |

## Siglas repo/infra

| Sigla | Significado |
|-------|-------------|
| **MCP** | Model Context Protocol (server `lean-spec` en `opencode.json`). |
| **SSR** | Server-Side Rendering (Next.js). |
| **PWA offline** | Aplicación web progresiva con modo offline (propuesto, spec `004`, NO implementado). |