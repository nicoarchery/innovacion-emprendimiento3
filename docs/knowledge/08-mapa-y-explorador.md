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
- `PanelDetalleObra.tsx` — panel lateral con detalle de obra seleccionada (referencia, entidad, contratista, valor, fechas, link SECOP) + sección **Participación ciudadana**: un solo botón **"Ver N reportes"** (`ReportesButton`) que abre la ventana unificada de reportes. Muestra promedio de calificación y avisos de retraso/paralización.
- `ReporteCiudadanoModal.tsx` — modal/formulario de reporte: estado en terreno, % avance observado, calificación 1–5 (opcional), opinión/descripción, foto opcional (≤1.5 MB), contacto opcional y GPS (navegador o coordenada de la obra). POSTea a `/api/mapa/obras/[id]/reportes`. Se abre desde `ReportesObraModal`.
- `ReportesObraModal.tsx` — **ventana unificada de reportes** (ver + crear): lista todos los reportes (fecha, sello de estado, avance, calificación, descripción y **foto si la tiene**) y un botón "Reportar esta obra" que abre `ReporteCiudadanoModal`; al enviar refresca el listado. Compartida entre mapa y explorador.
- `ReportesButton.tsx` — botón unificado **"Ver N reportes"** (mismo en `PanelDetalleObra` y en las filas del explorador).
- `LineaTiempoObra.tsx` — hoja inferior del mapa (bottom sheet) alternada por una flecha en la parte inferior de la vista cuando hay una obra seleccionada; muestra en línea de tiempo (desc) los reportes **con foto**.
- `reportes-comunes.ts` — tipos/helpers compartidos (`ReporteFila`, `ResumenReportes`, `formatearFecha`, `estadoTerrenoDato`).
- `mapa-types.ts` — `ObraMarcador` (incluye `estadoUbicacion` y `reportes`), `TotalesMapa`, `RespuestaObras`, `RespuestaActualizar`, `FiltrosMapaUI`.

Origen de datos: **`/api/mapa/obras`** (real, desde `06`).

## Explorador (`/explorador`)

- `src/app/explorador/page.tsx` → `<SecopExplorer />`:
  - Muestra **todas las obras reales de Cali** (tengan o no ubicación) desde `/api/mapa/obras?todas=1`.
  - Filtros: búsqueda (obra/contratista/entidad/barrio/comuna), estado SECOP, ubicación (todas / en el mapa / sin ubicar) y orden (valor / fecha / nº reportes). **Ya no hay filtros por departamento.**
  - Por fila: botón **"Ver N reportes"** (`ReportesButton`) que abre la misma `ReportesObraModal` que el mapa; la tarjeta derecha resume participación (reportes, calificación, retraso/paralizada).
  - Los datos simulados fueron eliminados (ver `00`): `ProjectDetailsModal`, `CitizenVerificationModal` y `/api/secop` se borraron; `src/lib/secop.ts` se redujo a `formatCOP`.

## Componentes usados en landing

- `HeroSection`, `MapPreviewSection` (mini-vista de mapa/estilo), `ColombiaMap` (mapa Colombia decorativo), `NavBar`, `Footer`, `PrototypeNotice`, `Stamp` (estampa prototipo), secciones B2B/verificación (`VerificationSection`, `B2bLeadMagnet`) → ver `10`.

## Decisiones de UX relevantes

- **Aviso de prototipo** global visible en toda la app (`PrototypeNotice`) : "datos no fiables / prototipo" (`spec 010`).
- El mapa es **consulta ciudadana** (read-only, sin login).
- **Reportes unificados** (decisión 2026-09-23, spec `020`): mapa y explorador comparten un único botón "Ver N reportes" y la misma ventana de ver/crear. El mapa muestra la ubicación interactiva (solo obras `resuelta`); el explorador lista TODAS las obras, con o sin ubicación. Los reportes persisten en `reportes_ciudadanos` (ver `09`).
- Leaflet por SSR: el `Dynamic` wrapper usa `next/dynamic`/`ssr:false`.