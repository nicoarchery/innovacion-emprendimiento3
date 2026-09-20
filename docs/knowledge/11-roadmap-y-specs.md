---
domain: roadmap-y-specs
status: ROADMAP
confidence: VERY HIGH
authority: documented-decision
last_verified: 2026-09-20
sources:
- "specs/*/README.md (frontmatter status)"
- "leanspec board (2026-09-20)"
- "AGENTS.md"
---

# 11 — Roadmap y estado de especificaciones

## Estado LeanSpec (verificado 2026-09-20)

- **Completas (10)**: `001` Ingesta SECOP II · `002` Explorador/Dashboard MVP · `010` Aviso de Prototipo · `011` Mapa de Obras de Cali MVP · `012` Extracción y Normalización Obras Cali · `013` DB Local y Sincronización · `014` Geocodificación · `015` Mapa interactivo UI · `016` Rediseño Acta Pública · `017` Precisión de geocodificación Cali.
- **Planned (7)**: `003` Cruce Territorial y Zonas PDET · `004` Captura de Evidencia en Campo (PWA) · `005` Motor de Brechas (Gap) · `006` Canal Comunitario · `007` Reportes ESG/ART · `008` Perfil Público por Empresa · `009` Ingesta VITAL ANLA.
- No hay specs en `draft`/`in-progress` (al momento de la auditoría).

## Lo planificado (003-009) — MIRAR COMO ROADMAP, NO VIGENTE

Estos specs describen la **plataforma original** (ver `02`). NO están implementados (verificable en `03`/`06`/`10`):
- `003` PDET/territorial, `004` campo/evidencia (PWA, GPS/EXIF, offline), `005` gap/alertas, `006` comunidad/moderación, `007` ESG/ART, `008` perfil empresa, `009` VITAL.

**Implicación práctica**: si se pide "implementar 004", hoy NO existe base para evidencias — sería trabajo nuevo desde el mapa/SQLite; el diseño en la spec es la guía.

## Convención de trabajo (AGENTS.md)

- Antes de coding/planning: `npx lean-spec board` + `npx lean-spec search`.
- Crear specs con `npx lean-spec create <nombre> --title "..." --template spec-template`.
- Transiciones: update `--status in-progress` before coding; `complete` al finalizar código+tests+docs; `npx lean-spec validate` antes de commit.
- Mantener specs < ~2k tokens; dividir en sub-specs (`--depends-on`) si crecen.
- Specs viven en `specs/` (esquema LeanSpec con frontmatter: status, created, priority, tags…).

## Prioridades implícitas desde el código (2026-09)

- GEOMAP/pipeline de datos real (commits recientes: sync, geocoding, mapa interactivo) es lo que mueve el repo a día de hoy.
- B2B/ESG se concentra en docs y en leads (simulados) — no en código productivo.