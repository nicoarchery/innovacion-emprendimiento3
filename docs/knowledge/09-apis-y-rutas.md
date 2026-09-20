---
domain: apis-y-rutas
status: CURRENT
confidence: VERY HIGH
authority: implementation
last_verified: 2026-09-20
sources:
- "src/app/api/**"
- "src/lib/mapa/db.ts"
- "src/lib/secop.ts"
- "package.json (script/servidor)"
---

# 09 — APIs y rutas implementadas

Todas viven en `src/app/api/` (App Router route handlers).

## Tabla de endpoints

| Método | Ruta | Uso | Comportamiento real |
|--------|------|-----|---------------------|
| GET | `/secop` | Explorador | Devuelve datos SECOP (helper `src/lib/secop.ts`). **Fuente simulada/ligera** |
| POST | `/lead-b2b` | Lead B2B (empresa) | Registro lead (ver `10`) |
| POST | `/lead-citizen` | Lead ciudadano/verificación | Registro lead (ver `10`) |
| GET | `/mapa/obras` | Mapa | Devuelve obras reales (desde SQLite) + `totales`, `ultimaSync`, `filtros` (`entidades`, `estados`) + metadata |
| POST | `/mapa/actualizar` | Trigger sync | Dispara `syncMapa()` → actualiza SQLite. Si ya corre, `409 {success:false,...}` |

## Comportamientos normalizados

- Respuestas JSON: `{ success: boolean, ... }` (patrón usado constantemente; verificar con cada handler).
- Errores: `console.error("...")` + JSON con `error`.
- `mapa/actualizar`: usa `estaSincronizando()` (singleton en memoria) para evitar concurrencia (código 409 con mensaje).

## Validación de datos

- `lead-b2b` y `lead-citizen`: validan payload (formato email / nombre / municipio) — son leads reales en intención pero actualmente **solo se loguean** (ver `10`).
- `secop`: no valida DB local (usa fetch directo).

## Seguridad / límites que conocemos

- No hay autenticación en rutas (prototipo).
- El costo real de datos está en el fetch SECOP (mundo exterior) y en el sync (`mapa/actualizar`), no en lecturas (`mapa/obras` es read).

## Nota de congruencia con specs

- `specs/011-013-015` (complete) describen exactamente estas rutas (obras, actualizar, mapa). Coinciden con la implementación (a diferencia de simulaciones del explorador, ver `08`).

## Cómo añadir una nueva API

1. Crea `src/app/api/<nombre>/route.ts` con handler exportado (GET/POST…).
2. Usa `NextResponse.json`; pattern `{success, data/error}` consistente.
3. Si toca datos del mapa, usa helpers de `src/lib/mapa/db.ts` (no SQL suelto).