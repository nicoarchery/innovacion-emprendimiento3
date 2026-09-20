---
domain: mapa-y-explorador
status: CURRENT
confidence: VERY HIGH
authority: implementation
last_verified: 2026-09-20
sources:
- "src/components/mapa/**"
- "src/components/SecopExplorer.tsx"
- "src/components/ProjectDetailsModal.tsx"
- "src/app/explorador/page.tsx"
- "src/lib/data.ts"
- "specs/011,012,013,015"
---

# 08 — Mapa y explorador (UI)

## Mapa de Cali (`/mapa`)

Componentes en `src/components/mapa/`:
- `MapaCaliDynamic.tsx` — wrapper SSR-safe para `MapaCali.tsx` (Leaflet no corre en servidor).
- `MapaCali.tsx` — mapa Leaflet (tiles OSM) + marker cluster de obras con `lat/lon`.
- `FiltrosMapa.tsx` — filtros por `estado` (contrato), `entidad`, `minValor`, `maxValor`, `fecha` (UI). Dato procedente de `/api/mapa/obras`.
- `PanelDetalleObra.tsx` — panel lateral con detalle de obra seleccionada (referencia, entidad, contratista, valor, fechas, link SECOP).
- `mapa-types.ts` — `ObraMarcador`, `TotalesMapa`, `RespuestaObras`, `RespuestaActualizar`, `FiltrosMapaUI`.

Origen de datos: **`/api/mapa/obras`** (real, desde `06`).

## Explorador (`/explorador`)

- `src/app/explorador/page.tsx` → `<SecopExplorer />`:
  - Filtros: búsqueda, departamento, estado contrato.
  - Tabla/pantalla de proyectos con detalle (`ProjectDetailsModal`).
  - **Origen de datos: simulados** (`src/lib/secop.ts` `SEED_PROJECTS` + endpoint SECOP para ligero histórico). **No es la DB real.** (ver `05`).
- Nota: los proyectos simulados incluyen entidades/obras de ejemplo variadas (incluyen "pct avance" financiero, "gap" etc.) que NO existen en `06`.

## Componentes usados en landing

- `HeroSection`, `MapPreviewSection` (mini-vista de mapa/estilo), `ColombiaMap` (mapa Colombia decorativo), `NavBar`, `Footer`, `PrototypeNotice`, `Stamp` (estampa prototipo), secciones B2B/verificación (`VerificationSection`, `B2bLeadMagnet`, `CitizenVerificationModal`) → ver `10`.
- `ProjectDetailsModal` compartido entre explorador y mapa para detalle de obra/proyecto.

## Decisiones de UX relevantes

- **Aviso de prototipo** global visible en toda la app (`PrototypeNotice`) : "datos no fiables / prototipo" (`spec 010`).
- El mapa es **consulta ciudadana** (read-only, sin login).
- Leaflet por SSR: el `Dynamic` wrapper usa `next/dynamic`/`ssr:false`.

## Advertencia

Si un cambio debe tocar "proyectos del explorador": recuerda que son simulados — SI el objetivo es mostrar datos reales, hay que conectarlo a `/api/mapa/obras` o a la DB (decisión de producto pendiente, ver `00`).