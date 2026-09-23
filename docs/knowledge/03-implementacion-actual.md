---
domain: implementacion-actual
status: CURRENT
confidence: VERY HIGH
authority: implementation
last_verified: 2026-09-20
sources:
- "src/app/**"
- "src/components/**"
- "src/lib/**"
- "package.json"
- "README.md"
---

# 03 — Implementación actual (qué existe HOY)

## Framework y stack

- **Next.js 16** (App Router), React 19, TypeScript. Tailwind CSS. Node/better-sqlite3. Leaflet para mapas. Detalle en `04-stack-tecnico.md`.

## Páginas (App Router)

| Ruta | Archivo | Contenido |
|------|---------|-----------|
| `/` | `src/app/page.tsx` | Landing pública (Hero, MapPreview, secciones, B2B lead, etc.) |
| `/explorador` | `src/app/explorador/page.tsx` | Explorador de todas las obras reales de Cali |
| `/mapa` | `src/app/mapa/page.tsx` | Mapa interactivo de obras de Cali |

## Layout y metadatos

- `src/app/layout.tsx`: header/footer común, lang es, título "Obras de Cali a la vista", **PrototypeNotice global** (`a81d7ac`).
- `src/app/globals.css`: estilos globales Tailwind.

## Componentes principales (src/components)

### Generales / secciones de landing
- `HeroSection`, `MapPreviewSection`, `NavBar`, `Footer`, `PrototypeNotice`, `Stamp`.
- `B2bLeadMagnet` — formulario B2B (ver `10`).
- `VerificationSection` — sección de verificación ciudadana (ver `10`); el modal simulado asociado (`CitizenVerificationModal`) fue eliminado en spec `020`.
- `ColombiaMap` — mapa de Colombia (probablemente para sección territorial; consultar su uso).
- `ui/` — primitivas shadcn/ui (toaster, etc.).

### Mapa (`src/components/mapa/`)
- `MapaCali.tsx`, `MapaCaliDynamic.tsx` (SSR-safe wrapper), `FiltrosMapa.tsx`, `PanelDetalleObra.tsx`, `ReporteCiudadanoModal.tsx` (reporte/calificación/opinión ciudadana), `ReportesObraModal.tsx` (ventana unificada ver+crear reportes), `ReportesButton.tsx`, `LineaTiempoObra.tsx`, `reportes-comunes.ts`, `mapa-types.ts`.

### Explorador (`/explorador`)
- `SecopExplorer.tsx` — lista TODAS las obras reales de Cali (`/api/mapa/obras?todas=1`), con/sin ubicación, + filtros (búsqueda, estado, ubicación) y botón "Ver N reportes" compartido con el mapa.

## Servicios y lógica (src/lib)

- `secop.ts` — solo `formatCOP` (formateador de COP). La fuente simulada fue eliminada (spec `020`).
- `mapa/db.ts` — capa SQLite (obras, ubicaciones, sync_runs).
- `mapa/syncService.ts` — sync incremental con SECOP (bucle paginado).
- `mapa/secopFetcher.ts` — extracción/normalización SECOP II.
- `mapa/clasificador.ts` — clasifica si un contrato es "obra".
- `mapa/geocodeService.ts` + `mapa/direccionCO.ts` — geocodificación Colombia/Cali.
- `mapa/types.ts` — tipos TS.
- `data.ts` — constantes de datos (ej. municipios) usadas en varios flujos.

## APIs implementadas (src/app/api)

- `/lead-b2b` (POST), `/lead-citizen` (POST) — registro de leads (ver `10`).
- `/mapa/obras` (GET) — obras geolocalizadas; `?todas=1` devuelve todas (con/sin ubicación, con `reportes` por obra).
- `/mapa/actualizar` (POST) — dispara sync SECOP→SQLite (ver `06`).
- `/mapa/obras/[id]/reportes` (GET/POST) — reportes ciudadanos por obra (persisten en SQLite, ver `09`).
- El endpoint `/secop` fue **eliminado** (spec `020`).

## Estado de datos

- Base SQLite local `data/mapa.db` (git-ignored). 6 corridas de sync. Detalle completo del esquema y estados: `06-base-de-datos-sqlite.md`; estados de ubicación y pipeline de geocodificación: `07-geocodificacion.md`.

## Prototipo / no producción

- Decisión consciente de fase: MVP con aviso de prototipo; datos "no fiables" señalados al usuario (`PrototypeNotice`).

⚠ **Contradicción menor**: `docs/03-prompt-tecnico-mvp.md` describe implementaciones (p.ej. validación ciudadana "real") que difieren del comportamiento simulado actual (ver `10`).