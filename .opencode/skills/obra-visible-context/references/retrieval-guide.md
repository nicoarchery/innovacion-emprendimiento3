---
domain: skill-reference
status: CURRENT
confidence: VERY HIGH
authority: skill
last_verified: 2026-09-20
---

# Reference: Guía de recuperación (Retrieval Guide)

Cómo buscar conocimiento de forma efectiva cuando no recuerdas qué archivo contiene algo.

## Búsqueda rápida por tema

| Quieres saber… | Búscalo en |
|----------------|-----------|
| Nombres/identidad del producto | `01-product-identity.md` |
| Visión/estrategia/B2B original | `02-vision-y-producto.md` |
| Qué hay implementado hoy | `03-implementacion-actual.md` |
| Stack/tecnologías | `04-stack-tecnico.md` |
| SECOP, datos, simulación | `05-datos-secop.md` |
| SQLite, sync, estados ub | `06-base-de-datos-sqlite.md` |
| Geocodificación | `07-geocodificacion.md` |
| Mapa/explorador UI | `08-mapa-y-explorador.md` |
| APIs y rutas | `09-apis-y-rutas.md` |
| B2B, leads, monetización | `10-b2b-y-leads.md`, `12` |
| Specs/roadmap LeanSpec | `11-roadmap-y-specs.md` |
| Hipótesis del proyecto | `12-hipotesis-y-validacion.md` |
| Convenciones/decisiones | `13-decisiones-y-convenciones.md` |
| Significados/siglas | `14-glosario.md` |
| Legalidad y TOS de fuentes; ajustes para producción | `15-cumplimiento-legal-tos.md` |
| Autoridad de cada fuente | `99-source-registry.md` |

## Búsqueda con grep

Usa `grep`/`rg` sobre `docs/knowledge/` para términos: `estado_ubicacion`, `geo_confianza`, `SECOP`, `simul`, `roadmap`, `planned`, `lead`, `CO1.PCCNTR`, `PrototypeNotice`, etc.

## Verificación cruzada rápida

- Para confirmar un hecho de datos: abre `src/lib/mapa/db.ts` o consulta `sqlite3 data/mapa.db`.
- Para confirmar un hecho de UI: abre el componente (`src/components/**`).
- Para confirmar estado de spec: `cat specs/<id>/README.md` (frontmatter `status`).

## Recordatorio

Si no encuentras respuesta en la KB → marca la pregunta como `confidence: UNKNOWN` y verifica en código antes de dar una afirmación.