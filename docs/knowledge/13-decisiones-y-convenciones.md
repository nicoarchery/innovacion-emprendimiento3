---
domain: convenciones
status: CURRENT
confidence: VERY HIGH
authority: implementation
last_verified: 2026-09-20
sources:
- "AGENTS.md"
- ".gitignore"
- "opencode.json"
- "src/lib/mapa/db.ts"
- "src/app/api/**"
---

# 13 — Convenciones y decisiones detectadas

## Convenciones de código del repo

- **Lenguaje**: código/UI en **español** (strings, nombres de variables internos, docs). Identificadores TS en inglés (p.ej. `is_obra` son nombres de columna; variables `ObraNormalizada`).
- **Next.js App Router**: páginas en `src/app/**/page.tsx`, APIs en `src/app/api/**/route.ts`, componentes `src/components/**`, lógica pura `src/lib/**`.
- **Base de datos**: acceso SOLO vía helpers `src/lib/mapa/db.ts` (nunca SQL suelto en componentes). Separatas de sync en `syncService.ts`.
- **Clasificación/geocoding**: toda decisión de "es obra" y "ubicación" pasa por `clasificador.ts`/`geocodeService.ts` (no re-implementes lógica en UI).
- **Manejo de errores API**: `{ success:false, error }` + log con `console.error("[PREFIX_ERROR]", msg)`.
- **Tipos**: usar types de `src/lib/mapa/types.ts` y `mapa-types.ts` (UI). No duplicar.
- **Estado de prototipo**: no "endurecer" falsos flujos (leads loguean solo; ver `10`).

## Convenciones LeanSpec (AGENTS.md)

Revisar obligatoriamente antes de planificar: board + search; crear specs con `lean-spec create`; mantener < 2k tokens; transiciones in-progress → complete; correr `lean-spec validate` antes de commits. (Ver `11`).

## Decisiones implícitas detectadas (inferencias)

| Decisión | Evidencia | Estatus |
|----------|-----------|---------|
| Usar SQLite local en vez de PostGIS (original) | código `db.ts`, `.gitignore` `/data/` | vigente |
| Almacenar normalizado + clasificado + geocodificado | `obras` schema | vigente |
| País de foco: COLOMBIA / ciudad: Cali (gate `enCali`) | `direccionCO.ts` | vigente |
| Mapa público + aviso de prototipo | `PrototypeNotice`, specs 010 | vigente |
| B2B/ESG como roadmap (no implementado) | specs 003-009, docs | roadmap |
| Leads no persistidos (prototipo) | routes `lead-*` | limitación |
| Git: `data/` ignorado (DB no versionada) | `.gitignore` | vigente |

## Decisiones explícitas recientes

| Decisión | Fecha | Efecto | Referencia |
|----------|-------|--------|------------|
| **Retirar WhatsApp del producto**; reporte ciudadano (texto/foto/GPS) se sube **directo a la plataforma** | 2026-09-20 | Se elimina `src/lib/whatsapp.ts` y la variante `whatsapp` de Button; Footer/leads usan enlace a `/mapa` y envío directo a `/api/lead-*`; spec 006 rediseñada sin Meta Cloud API | `10-b2b-y-leads.md`, `15-cumplimiento-legal-tos.md`, spec `006` |
| **Cumplimiento legal/TOS** documentado para producción | 2026-09-20 | Matriz de fuentes (SECOP/OSM/Photon/Overpass/ANLA) con condiciones; ajustes previos a producción: atribución, self-host de geocoding, privacidad Ley 1581/2012 | `15-cumplimiento-legal-tos.md`, `99-master-context.md` §8 |

## Estándares de calidad (dejar el repo limpio)

- No añadir dependencias sin necesidad (`04` patrón ligero).
- No crear specs/arquitectura en Markdown "suelto": usar LeanSpec (`11`).
- Comentarios: usar español; headers significantes; evitar ruido.