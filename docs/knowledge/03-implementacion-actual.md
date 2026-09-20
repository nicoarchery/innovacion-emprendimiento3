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
| `/explorador` | `src/app/explorador/page.tsx` | Explorador SECOP (muestra) |
| `/mapa` | `src/app/mapa/page.tsx` | Mapa interactivo de obras de Cali |

## Layout y metadatos

- `src/app/layout.tsx`: header/footer común, lang es, título "Obras de Cali a la vista", **PrototypeNotice global** (`a81d7ac`).
- `src/app/globals.css`: estilos globales Tailwind.

## Componentes principales (src/components)

### Generales / secciones de landing
- `HeroSection`, `MapPreviewSection`, `NavBar`, `Footer`, `PrototypeNotice`, `Stamp`.
- `B2bLeadMagnet` — formulario B2B (ver `10`).
- `VerificationSection`, `CitizenVerificationModal` — modal de "verificar obra" (simulado, ver `10`).
- `ProjectDetailsModal` — detalles de proyecto seleccionado en explorador.
- `ColombiaMap` — mapa de Colombia (probablemente para sección territorial; consultar su uso).
- `ui/` — primitivas shadcn/ui (toaster, etc.).

### Mapa (`src/components/mapa/`)
- `MapaCali.tsx`, `MapaCaliDynamic.tsx` (SSR-safe wrapper), `FiltrosMapa.tsx`, `PanelDetalleObra.tsx`, `mapa-types.ts`.

### Explorador (`/explorador`)
- `SecopExplorer.tsx` — tabla/filtros sobre datos SECOP de muestra.

## Servicios y lógica (src/lib)

- `secop.ts` — fuente SECOP (helper + simulated projects).
- `mapa/db.ts` — capa SQLite (obras, ubicaciones, sync_runs).
- `mapa/syncService.ts` — sync incremental con SECOP (bucle paginado).
- `mapa/secopFetcher.ts` — extracción/normalización SECOP II.
- `mapa/clasificador.ts` — clasifica si un contrato es "obra".
- `mapa/geocodeService.ts` + `mapa/direccionCO.ts` — geocodificación Colombia/Cali.
- `mapa/types.ts` — tipos TS.
- `whatsapp.ts` — helper de enlace WhatsApp (para leads).
- `data.ts` — constantes de datos (ej. municipios) usadas en varios flujos.

## APIs implementadas (src/app/api)

- `/secop` (GET) — datos SECOP para explorador (usa helper `secop.ts`).
- `/lead-b2b` (POST), `/lead-citizen` (POST) — registro de leads (ver `10`).
- `/mapa/obras` (GET) — obras geolocalizadas.
- `/mapa/actualizar` (POST) — dispara sync SECOP→SQLite (ver `06`).

## Estado de datos

- Base SQLite local `data/mapa.db` (git-ignored). 6 corridas de sync. Detalle completo del esquema y estados: `06-base-de-datos-sqlite.md`; estados de ubicación y pipeline de geocodificación: `07-geocodificacion.md`.

## Prototipo / no producción

- Decisión consciente de fase: MVP con aviso de prototipo; datos "no fiables" señalados al usuario (`PrototypeNotice`).

⚠ **Contradicción menor**: `docs/03-prompt-tecnico-mvp.md` describe implementaciones (p.ej. validación ciudadana "real") que difieren del comportamiento simulado actual (ver `10`).