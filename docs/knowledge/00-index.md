---
domain: meta
status: CURRENT
confidence: VERY HIGH
authority: meta
last_verified: 2026-09-20
sources:
- "audit: estructura del repo completa 2026-09-20"
---

# 00 — Índice de dominios de conocimiento

Mapa rápido de la KB. Regla de autoridad: el código manda sobre las specs completas, y éstas sobre las specs planned y los docs. Detalle en `99-source-registry.md`.

## Cuadro de dominios

| Doc | Descriptor | Estado | ¿Cuándo consultarlo? |
|-----|-----------|--------|----------------------|
| `01-product-identity.md` | Identidad, nombre, historia | CURRENT | Siempre, para no inventar nombres/remitirme al pasado |
| `02-vision-y-producto.md` | Producto, usuarios, propuesta de valor original | DESIGNED | Al hablar de "qué debería ser" el producto a largo plazo |
| `03-implementacion-actual.md` | Qué existe HOY (rutas, páginas, flujos) | CURRENT | Antes de tocar cualquier código |
| `04-stack-tecnico.md` | Stack (Next.js, SQLite, Leaflet…), estructuras clave | CURRENT | Antes de tocar build/estructura |
| `05-datos-secop.md` | Fuente SECOP II, normalización, simulación vs. real | CURRENT | Al hacer cambios de ingesta/explorador |
| `06-base-de-datos-sqlite.md` | SQLite `data/mapa.db`: esquema, sync, estados de ubicación | CURRENT | Antes de tocar datos/DB/estados de ubicación |
| `07-geocodificacion.md` | Pipeline de geocodificación y decisión de estados | CURRENT | Al tocar mapa/geocoding |
| `08-mapa-y-explorador.md` | UI del mapa y del explorador territorial | CURRENT | Al tocar componentes de esas páginas |
| `09-apis-y-rutas.md` | Endpoints implementados y su comportamiento real | CURRENT | Al tocar APIs |
| `10-b2b-y-leads.md` | Flujo B2B y leads | CURRENT/HYPOTHESIS | Al tocar formularios/leads |
| `11-roadmap-y-specs.md` | Estado LeanSpec: specs planned vs complete | ROADMAP | Antes de planificar o priorizar trabajo |
| `12-hipotesis-y-validacion.md` | Hipótesis del proyecto y qué se validó/cómo | HYPOTHESIS | Al evaluar producto/mercado |
| `13-decisiones-y-convenciones.md` | Convenciones del repo y decisiones detectadas | CURRENT | Al escribir código para respetar patrones |
| `14-glosario.md` | Términos y siglas usados en el repo | CURRENT | Al leer specs o código |
| `15-cumplimiento-legal-tos.md` | Legalidad y TOS por fuente de datos; ajustes para producción real | CURRENT | Al pasar a producción, monetizar o integrar nuevas fuentes |

## Notas críticas de sesgo

- **Autoridad efectiva**: `src`/`data` (implementation/config-data) > specs completas > specs planned > docs/`docs/archive/` > trabajo futuro.
- **Simulación vs. real**: el explorador y el modal ciudadano son **simulaciones**; la única fuente real es SECOP II + SQLite `data/mapa.db`. Ver `05`, `08`, `10`.
- **Nombres**: "Obras a la Vista" (landing), "Obra Visible" (KB), "Obras de Cali a la vista" (metadata) — mismo proyecto; la KB fija `Obra Visible`. Ver `01`.

## Contradicciones pendientes (resumen)

1. Specs `003`–`009` (B2B/ESG/campo) en estado `planned`, pero `02-vision-y-producto` y docs las tratan como proyecto real → **no confundir con lo implementado**.
2. `CitizenVerificationModal` y formularios/leads: aparentan flujos reales pero son **simulados**/solo loguean. Ver `10`.
3. Modelo de monetización B2B (`docs/archive/modelos_monetizado.md`, untracked) como si existiera → aún **no** es funcionalidad de la app.
4. `docs/01-02-03` describen stack/la plataforma original (BD geoespacial, app campo, ETL Python/PostGIS) que **no coincide** con la implementación (SQLite/Next/TS local).