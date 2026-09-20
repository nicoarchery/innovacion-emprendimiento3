---
domain: product-identity
status: CURRENT
confidence: VERY HIGH
authority: implementation
last_verified: 2026-09-20
sources:
- "README.md"
- "src/app/layout.tsx"
- "package.json"
- "git log"
---

# 01 — Identidad del producto

## Nombre y propósito

- **Nombre oficial del proyecto en la KB**: **Obra Visible**.
- **Nombre en la landing/UI**: "Obras a la Vista" — "Consulta ciudadana de obra pública en Cali" (`README.md`).
- **Title de página (metadata)**: "Obras de Cali a la vista" (`src/app/layout.tsx`). HTML estático no importado por componente.
- **package.json**: `name: impacto-territorial-landing` (nombre histórico/legacy del repo).

**Conclusión**: todos son el mismo proyecto. La KB fija **Obra Visible** como identidad interna; la UI usa "Obras a la Vista".

## Qué es

Producto web (Next.js) de **consulta ciudadana de obra pública** en Cali, Colombia. Comienza como un prototipo de MVP con **aviso de prototipo** (`PrototypeNotice`) que informa que los datos no son fiables/curado (ver `03-implementacion-actual.md`).

## Historia del product identity (evolución)

| Fase | Nombre / enfoque | Evidencia |
|------|-------------------|-----------|
| Inicial (doc) | "Plataforma de inteligencia territorial… (ESG B2B)" | `docs/01-contexto-y-recursos.md`, `docs/02-estrategia-arquitectura.md`, `docs/archive/sustento.md` |
| Repo/commit | `impacto-territorial-landing` ("landingpage"), `explorador territorial` | `package.json`, git log 2026-09-13 |
| MVP actual | "Obras a la Vista / consulta ciudadana de obra pública en Cali" | `README.md`, código (landing, explorador, mapa) |
| Underlying framework | "LeanSpec" specs de producto | `specs/001-017`, `AGENTS.md` |

⚠ **Contradicción detectada**: la identidad B2B/ESG (empresas, mineras, fondo ESG) de `docs/*` y `specs/003-009` aún **no existe** como código (solo landing/consulta ciudadana). No asumir que el producto actual ES la plataforma ESG.

## Audiencia (según docs, no código)

- Usuarios verificadores (comunidad, veedurías, academia) — en ORIGEN eran el piloto "Consulta ciudadana".
- Clientes B2B pagadores (empresas con licencia social) — **solo especificación / docs**, no código.

## Datos duros del proyecto

- Gestión de estado de trabajo: **LeanSpec** (ver `AGENTS.md`, `11-roadmap-y-specs.md`).
- Repo git: 14 commits visibles 2026-09-12 → 2026-09-20 (fecha última feature: geocoding + Overpass).
- Estado actual: **MVP funcional** con landing pública + explorador + mapa Cali (ver `03`).