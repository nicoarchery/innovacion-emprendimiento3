---
domain: datos-secop
status: CURRENT
confidence: VERY HIGH
authority: implementation
last_verified: 2026-09-20
sources:
- "src/lib/secop.ts"
- "src/lib/mapa/secopFetcher.ts"
- "src/lib/mapa/clasificador.ts"
- "src/components/SecopExplorer.tsx"
- "docs/03-prompt-tecnico-mvp.md"
---

# 05 — Datos SECOP II

## Fuente oficial

SODA API de SECOP II (Colombia Gov), datasets de contratos/procesos. Docs originales mencionan endpoints de `datos.gov.co` (`data/...$id`). En código real:

- `src/lib/mapa/secopFetcher.ts`: consulta el dataset de **contratos** SECOP II filtrando por ciudad=**CALI** y tipo de contrato **Obra / Concesión / Asociación Público Privada** (criterio `CALI_CRITERIA`).
- `src/lib/secop.ts`: endpoint de **procesos de contratación** (dataset separado) usado por el **explorador**.

## Fetch real (secopFetcher)

- Paginación: `$limit`/`$offset`, SODA. Timeout por página; `SOCRATA_APP_TOKEN` opcional como header `X-App-Token` (token no versionado).
- **Normalización**: mapa de campos SECOP (id, proceso, entidad, contratista, fechas, valor, dirección de ejecución, etc.) a tipos TS (`ObraNormalizada`).
- `clasificador.ts`: decide si un contrato es "obra" pública (score por tipo de contrato + prefix UNSPSC + keywords) → `is_obra`, `obra_score`, `obra_razon`.

## Simulación (explorador) — ¡IMPORTANTE!

- `src/lib/secop.ts` incluye un conjunto **simulado/hardcodeado** (`SEED_PROJECTS`) y `SecopExplorer` lo pinta como "explorador".
- estos proyectos simulados NO provienen de la DB SQLite ni del fetch paginado real.
- ⇒ **No confundir** los datos del explorador (simulados) con el mapa (reales desde SQLite). Contradicción clave del proyecto (ver `06` y `08`).

## Almacenamiento real

Los contratos reales de Cali van a `data/mapa.db` (SQLite). Ver `06-base-de-datos-sqlite.md` y `src/lib/mapa/db.ts`.

## Errores relevantes

- SECOP puede rate-limitar (429): el fetcher corta y continúa; el sync por página es tolerante (ver `06`).
- Direcciones vienen en texto libre; requieren normalización + geocode (ver `07`).