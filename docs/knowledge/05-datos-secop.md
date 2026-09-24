---
domain: datos-secop
status: CURRENT
confidence: VERY HIGH
authority: implementation
last_verified: 2026-09-24
sources:
- "src/lib/secop.ts"
- "src/lib/mapa/secopFetcher.ts"
- "src/lib/mapa/clasificador.ts"
- "src/components/SecopExplorer.tsx"
- "src/lib/mapa/brechas.ts"
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

## ⚠️ Datos de avance financiero — dataset truncado (2026-09-23)

> El espejo de contratos SECOP II (`jbjy-vk9h`, "SECOP II - Contratos Electrónicos") fue **re-publicado/rotado** y desde 2026-09-23T08:36Z contiene **exactamente 1000 filas** (offset 999 → 1 fila; offset 1000 → 0). El dataset ya NO contiene nuestros 1434 contratos históricos de obra de Cali: verificado el mismo día por `id_contrato` y por `referencia_del_contrato` únicos (0 coincidencias). No es fallo aislado de búsqueda; es el espejo el que cambió.
- Implicaciones: la DB local es **el archivo histórico** y se conserva (sync upsert, nunca delete). El fetch de nuevas pasadas ahora trae 0 filas para Cali → el fetcher escribe un aviso `[EXTRACCION_SECOP_AVISO]` en logs y la DB queda intacta.
- Campos de avance financiero existentes en la fuente: `valor_pagado`, `valor_facturado`, `valor_pendiente_de_ejecucion`, `valor_pendiente_de_pago`. **Miden ejecución económica, no física.**
- `SECOP II - Procesos` (`p6dx-8zbt`) sigue completo (>1000 filas), pero es el dataset de procesos; `SECOP Integrado` (`rpmr-utcd`) NO trae campos de avance → **no usar como sustituto** de N1.
- Consecuencia operativa: mientras el dataset no tenga nuestros contratos, `avanceSecop` (N1) queda `null` → estado `sin_datos` (nunca falsa alerta). Ver `09` (API) y `023-motor-brechas-avance-secop-campo`.