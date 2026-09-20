---
domain: meta
status: CURRENT
confidence: VERY HIGH
authority: meta
last_verified: 2026-09-20
sources:
- "repo: git log (14 commits, 2026-09-12 a 2026-09-20)"
- "repo: estructura de archivos verificada"
---

# Knowledge Base — Obra Visible

Esta carpeta concentra el **conocimiento operativo del proyecto Obra Visible** ("Obras a la Vista", consulta ciudadana de obra pública en Cali), consolidado a partir de una auditoría completa del repositorio en 2026-09-20. Su propósito es que un agente de IA (u otro desarrollador) alcance contexto correcto sin re-leer todo el código y **sin incurrir en las contradicciones históricas** del proyecto.

## Qué contiene

- `00-index.md` — mapa de dominios de conocimiento y cuándo consultar cada uno.
- `01-…14` — conocimiento por dominio (identidad, visión, implementación, stack, datos, geocodificación, mapa, explorador, APIs, leads, specs, roadmaps, glosario).
- `99-source-registry.md` — registro de fuentes primarias consultadas (código, docs, specs, DB, git) sin datos de la aplicación en sí.

## Cómo usar esta KB

1. **Si recién conoces el proyecto**: lee `00-index.md` → `01` → `03` → `06` → `07`.
2. **Si vas a tocar código**: lee además `04` (stack) y el dominio específico del cambio (`05`–`11`).
3. **Siempre**: respeta el frontmatter. `status` dice qué existe hoy; `confidence` & `authority` dicen qué tan confiable es la afirmación. Una afirmación con `authority: implementation` domina sobre cualquier spec o documento.
4. **Contradicciones**: están marcadas en cada doc con `⚠ Contradicción:` y resumidas en `00-index.md`. No intentes "arreglarlas" sin decidir antes cuál es la fuente de verdad (resolución pendiente).

## Conocimiento ausente

- No existe (todavía) un `99-master-context.md` que consolide todo en un solo archivo. Esta KB está diseñada para generarlo si se pide.
- No hay registro formal de decisiones (ADR). Las decisiones históricas se infieren del código y los commits.
- Sin master-context: este README + `00-index.md` cumplen esa función orgánicamente.