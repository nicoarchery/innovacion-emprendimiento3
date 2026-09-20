---
domain: stack-tecnico
status: CURRENT
confidence: VERY HIGH
authority: implementation
last_verified: 2026-09-20
sources:
- "package.json"
- "src/app/layout.tsx"
- ".gitignore"
- "opencode.json"
---

# 04 — Stack técnico

## Runtime / framework

| Capa | Tecnología | Notas |
|------|-----------|-------|
| Framework | **Next.js 16** (App Router) | SSR. Rutas API en `src/app/api` |
| UI | React 19 + TS | Sin UI lib extra pesada; shadcn/ui-style (`components/ui/`) |
| Styling | Tailwind CSS | `globals.css` + clases utilitarias |
| DB | **better-sqlite3** (`data/mapa.db`) | Síncrono, local. Git-ignored (`/data/`) |
| Maps | **Leaflet + react-leaflet + markercluster** | `src/components/mapa/` |
| Fonts | next/font/google (de `layout.tsx`) | — |

## Datos de `package.json` (verificado)

- `name: impacto-territorial-landing`
- Next.js ~16.x, React 19.x, better-sqlite3, leaflet, react-leaflet, leaflet.markercluster.
- Scripts: desarrollo/build/start embebidos en Next.

## Herramientas de trabajo

- **LeanSpec** (MCP server en `opencode.json`, specs en `specs/`). Ver `AGENTS.md` y `11-roadmap-y-specs.md`.
- Git ignores: `.next/`, `data/` (la base SQLite no se versiona), `.env*`.
- Variables de entorno NO versionadas (`.env*`): se requieren para ejecutar extracción SECOP correctamente (ver `05`).

## Conclusión práctica

- No usar librerías externas nuevas sin necesidad: el patrón es **SQLite síncrono + componentes Next/React propios + Leaflet**.
- Todo el trabajo de datos vive en `src/lib/**`; UI en `src/components/**`; rutas API en `src/app/api/**`.