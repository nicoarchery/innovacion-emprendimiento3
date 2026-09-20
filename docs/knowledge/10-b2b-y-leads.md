---
domain: b2b-y-leads
status: CURRENT
confidence: VERY HIGH
authority: implementation
last_verified: 2026-09-20
sources:
- "src/components/B2bLeadMagnet.tsx"
- "src/components/VerificationSection.tsx"
- "src/components/CitizenVerificationModal.tsx"
- "src/app/api/lead-b2b/route.ts"
- "src/app/api/lead-citizen/route.ts"
- "docs/archive/modelos_monetizado.md"
---

# 10 — B2B y flujo de leads

## Panorama

- **B2B**: propuesta de monetización/valor (empresas con licencia social para operar, ESG) documentada en `docs/archive/modelos_monetizado.md` (untracked) y specs `003`–`009` (planned). **No hay funcionalidad B2B completa implementada**; solo:
  - `B2bLeadMagnet` — componente de captación de lead B2B (formulario).
  - `api/lead-b2b` — endpoint que valida y loguea el lead.
- **Verificación ciudadana**: `VerificationSection` + `CitizenVerificationModal` + `api/lead-citizen`.

## Comportamiento real de las rutas de lead

- `POST /api/lead-b2b`: valida payload `{empresa, nombre, email, ...}`, **registra (log)**, responde success. **No persiste en DB** (no hay tabla de leads).
- `POST /api/lead-citizen`: similar para ciudadano/verificación (nombre/correo/mensaje), **solo loguea** la acción de "verificación".

## `CitizenVerificationModal` (⚠ clave)

- **Simula** el flujo de verificación en campo (espera, estado "verificando", éxito) pero no captura GPS/EXIF real ni persiste evidencia (como aspiran specs `004`/`014` y `docs`).
- Es una **simulación de cliente-only** para el prototipo de consulta ciudadana.
- ⇒ En la práctica: el "verifica la obra" NO produce datos en `06`.

## Enlaces de contacto

> **Decisión 2026-09-20**: se elimina WhatsApp del producto (helper `src/lib/whatsapp.ts` borrado). Los formularios de contacto/lead envían el dato directamente a `/api/lead-*` (que hoy solo loguea). La captura ciudadana futura será reporte directo en la plataforma (spec 006) — ver `15-cumplimiento-legal-tos.md`.

## Estado real

| Elemento | Status |
|----------|--------|
| Formulario B2B (UI) | Implementado (prototipo) |
| Almacenamiento de leads | **NO** (solo log) |
| Verificación ciudadana real | **NO** (simulada) |
| Enlaces de contacto (correo/teléfono) | Implementados |

## Recomendación al trabajar aquí

- Si el requisito futuro es persistir leads/verificaciones: crear tabla en SQLite (ver `06`) o servicio; el patrón de ruta ya está en `09`.