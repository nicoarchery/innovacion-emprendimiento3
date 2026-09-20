---
domain: meta
status: CURRENT
confidence: VERY HIGH
authority: meta
last_verified: 2026-09-20
sources:
- "auditoría completa del repositorio realizada el 2026-09-20"
---

# 99 — Registro de fuentes (Source Registry)

Este es el registro de **fuentes primarias consultadas** para construir esta KB. Cada fuente evalúa por pares: `confianza` (VERY HIGH/HIGH/MEDIUM/LOW/UNKNOWN) y `autoridad` (implementation > config-data > spec-verif > documented-decision > historical).

## Fuentes de máxima autoridad (leídas en vivo)

| Fuente | Tipo | Confianza | Autoridad | Contenido verificado |
|--------|------|-----------|-----------|----------------------|
| `src/lib/mapa/db.ts` | schema | VERY HIGH | implementation | Tablas `obras/ubicaciones/sync_runs/meta`, índices |
| `src/lib/mapa/syncService.ts` | código | VERY HIGH | implementation | Algoritmo sync, hash, cap corrida |
| `src/lib/mapa/secopFetcher.ts` | código | VERY HIGH | implementation | Fetch paginado, normalización, criterio Cali |
| `src/lib/mapa/clasificador.ts` | código | VERY HIGH | implementation | Clasificación obra (score, keywords, UNSPSC) |
| `src/lib/mapa/geocodeService.ts` | código | VERY HIGH | implementation | Pipeline niveles + fuentes/confianzas |
| `src/lib/mapa/direccionCO.ts` | código | VERY HIGH | implementation | `enCali`, `CALI_BBOX`, parseo dirección CO |
| `src/lib/mapa/types.ts` | tipos | VERY HIGH | config-data | Contratos, estado_ubicacion, geo_confianza |
| `src/lib/secop.ts` | código | VERY HIGH | implementation | Endpoint explorador + SEED_PROJECTS (simulado) |
| `src/lib/data.ts` | constante | VERY HIGH | config-data | MUNICIPALITIES, MAP_POSITIONS, MOCK_PROJECTS |
| `src/components/*` (mapa, explorer, citizens, b2b…) | UI | VERY HIGH | implementation | Comportamiento real de UI (simulaciones) |
| `src/app/api/**` | rutas | VERY HIGH | implementation | `/secop`, `/lead-b2b`, `/lead-citizen`, `/mapa/*` |
| `src/app/layout.tsx`, `page.tsx`, `mapa/page.tsx`, `explorador/page.tsx` | páginas | VERY HIGH | implementation | Titles, metadata, estructura |
| `data/mapa.db` (sqlite3 query) | datos vivos | VERIFICADO | config-data | 1434 obras; 146 resueltas; 6 syncs; meta v2 |
| `package.json` | def | VERY HIGH | config-data | Stack, scripts, name legado |
| `.gitignore` | def | VERY HIGH | config-data | `/data/` ignorado |
| `opencode.json` | def | VERY HIGH | config-data | MCP lean-spec |
| `AGENTS.md`, `README.md` | guía | VERY HIGH | documented-decision | Convenciones, identidad "Obras a la Vista" |

## Specs (frente a implementación)

| Spec | Estado frontmatter | Autoridad | Estado REAL detectado |
|------|--------------------|-----------|------------------------|
| `001-secop-ingestion` | complete | spec-verif | Coincide (ingesta SECOP II) |
| `002-mvp-dashboard` | complete | spec-verif | Explorador/MVP implementado (simulado) |
| `003` … `009` | planned | documented-decision | **NO implementado** (roadmap) |
| `010-aviso-prototipo` | complete | spec-verif | PrototypeNotice activo |
| `011`-`015` mapa/sync/geo | complete | spec-verif | Coinciden (código visto) |
| `016-rediseno-acta-publica` | complete | spec-verif | (docs de acta pública) |
| `017-precision-geocodificacion` | complete | spec-verif | Intersección OSM + meta v2 |

## Docs (autoridad media/baja)

| Doc | Autoridad | Notas |
|-----|-----------|-------|
| `docs/01-contexto-y-recursos.md` | documented-decision | Contexto, mercado, recursos |
| `docs/02-estrategia-arquitectura.md` | documented-decision | Visión, arquitectura, monetización B2B |
| `docs/03-prompt-tecnico-mvp.md` | documented-decision | MVP descrito (diffiere de lo implementado) |
| `docs/04-hipotesis-validacion.md` | documented-decision | Hipótesis del proyecto |
| `docs/explica-leanspec.md` | historical | Cómo funciona el manager de specs |
| `docs/archive/*` (sustento, modelos, mejoras, obra visible contxt, session, SPEC_SECOP) | historical/hypothesis | Ideas B2B/ESG, sustento teorico, propuestas de monetización — **no vigentes como producto** |

## Git (historia)

- 14 commits (2026-09-12 → 2026-09-20); ver `01-product-identity.md` para fechas de fase.

## Metodología / límites

- KB construida **sin generar código de app**: verificaciones por lectura + consulta sqlite.
- Los números de la DB (146/1434 etc.) son **puntuales del 2026-09-20**: pueden cambiar tras cada sync. Re-consultar `06` antes de usarlos en decisiones.
- No hay ADRs formales; las "decisiones" en `13` son inferencias (nivel `config-data`/`implementation` cuando hay evidencia en código).

---

Siguiente paso opcional (fuera de esta KB): generar `99-master-context.md` consolidando `00`+`01`…`14` en un único contexto para una sesión.