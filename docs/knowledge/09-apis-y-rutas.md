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
| POST | `/lead-b2b` | Lead B2B (empresa) | Registro lead (ver `10`) |
| POST | `/lead-citizen` | Lead ciudadano/verificación | Registro lead (ver `10`) |
| GET | `/mapa/obras` | Mapa | Devuelve obras reales (desde SQLite) + `totales`, `ultimaSync`, `filtros` (`entidades`, `estados`) + metadata. Solo obras `estado_ubicacion='resuelta'` |
| GET | `/mapa/obras?todas=1` | Explorador | Devuelve **todas** las obras reales (`is_obra=1`, con o sin ubicación). Cada obra incluye `estadoUbicacion` y `reportes` (resumen). Acepta `ubicacion=ubicadas|sin_ubicar` |
| POST | `/mapa/actualizar` | Trigger sync | Dispara `syncMapa()` → actualiza SQLite. Si ya corre, `409 {success:false,...}` |
| GET | `/mapa/obras/[id]/reportes` | Reportes de una obra | Resumen (`total`, `promedio_calificacion`, `con_retraso`, `paralizadas`) + listado SIN contacto del ciudadano; cada item incluye `foto` (data URL) si el reporte la tiene |
| POST | `/mapa/obras/[id]/reportes` | Enviar reporte ciudadano | Persiste en `reportes_ciudadanos` (estado `pendiente_moderacion`); valida contrato (404), campos (400), `foto` como `data:image/(jpeg\|png\|webp\|gif)` (400), anti-spam 5/hora por contacto/IP (429) |

## Comportamientos normalizados

- Respuestas JSON: `{ success: boolean, ... }` (patrón usado constantemente; verificar con cada handler).
- Errores: `console.error("...")` + JSON con `error`.
- `mapa/actualizar`: usa `estaSincronizando()` (singleton en memoria) para evitar concurrencia (código 409 con mensaje).

## Validación de datos

- `lead-b2b` y `lead-citizen`: validan payload (formato email / nombre / municipio) — son leads reales en intención pero actualmente **solo se loguean** (ver `10`).
- `/secop` fue **eliminado** (spec `020`): el explorador ya usa la DB real vía `/api/mapa/obras?todas=1`; `src/lib/secop.ts` quedó reducido a `formatCOP`.

## Seguridad / límites que conocemos

- No hay autenticación en rutas (prototipo).
- El costo real de datos está en el fetch SECOP (mundo exterior) y en el sync (`mapa/actualizar`), no en lecturas (`mapa/obras` es read).

## Nota de congruencia con specs

- `specs/011-013-015` (complete) describen exactamente estas rutas (obras, actualizar, mapa). Coinciden con la implementación (a diferencia de simulaciones del explorador, ver `08`).

## Cómo añadir una nueva API

1. Crea `src/app/api/<nombre>/route.ts` con handler exportado (GET/POST…).
2. Usa `NextResponse.json`; pattern `{success, data/error}` consistente.
3. Si toca datos del mapa, usa helpers de `src/lib/mapa/db.ts` (no SQL suelto).

## Nota (2026-09-23)

- `reportes_ciudadanos` es la primera tabla de participación ciudadana **que persiste** en SQLite (a diferencia de `lead-b2b`/`lead-citizen`, que solo loguean — ver `10`). Antes del cierre de esta KB, el flujo de reporte ciudadano (spec `006`) era simulado.