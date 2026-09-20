---
domain: vison-y-producto
status: DESIGNED
confidence: MEDIUM
authority: documented-decision
last_verified: 2026-09-20
sources:
- "docs/01-contexto-y-recursos.md"
- "docs/02-estrategia-arquitectura.md"
- "docs/03-prompt-tecnico-mvp.md"
- "docs/archive/sustento.md"
- "specs/001-009"
---

# 02 — Visión de producto

## Original (largo plazo, documentada)

Plataforma de **inteligencia territorial** que cruza datos de contratación pública (SECOP) y reportes corporativos ESG en evidencias **geolocalizadas y verificadas**, para optimizar licencia social para operar (LSO) y reducir conflictos sociales. Referencias: `docs/02-estrategia-arquitectura.md`, `docs/archive/sustento.md#`.

**Componentes visionados** (docs/specs, NO todos en código):

1. Ingesta de SECOP II (implementada para Cali).
2. **Motor de verificación en campo** (captura de evidencia GPS/EXIF con PWA offline) — specs `004` (planned), sin código real.
3. **Motor de brechas (gap analysis)**: brecha entre % ejecución SECOP y % avance de campo, alertas territoriales — `005` (planned), NO en código.
4. **Canal comunitario + moderación** — `006` (planned).
5. **Reportes ESG / ART (Obras por Impuestos)** — `007` (planned).
6. **Perfil público georreferenciado por empresa** (B2B) — `008` (planned).
7. **Ingesta VITAL/ANLA** (traza ambiental) — `009` (planned).

## MVP real (implementado)

MVP = **consulta ciudadana de obra pública en Cali**: landing + explorador SECOP pequeña muestra + mapa. Aviso de prototipo público en toda la app (`PrototypeNotice`). Detalle en `03` y `07`.

## Relación MVP ↔ visión

- **Lo real** materializa el *componente público de consulta* de la visión.
- **Lo documentado pero inexistente**: campo, gap engine, comunidades, ESG, perfil B2B, VITAL.

## Decisiones registradas (inferidas de docs/commits)

- Enfoque inicial global↓ → pivote a **Cali / obra pública ciudadana** (commit "landingpage", `README`).
- Aviso de prototipo obligatorio (spec `010`, componente `PrototypeNotice`, commit a81d7ac "add global prototype notice").
- Estrategia de datos: build local desde SECOP II (SODA) contra depender del dashboard (ver `05`).

⚠ **Sin conflicto**: estas son aspiraciones; la fuente de verdad para "qué existe" es `03`.

## Métricas/hipótesis detrás

Ver `12-hipotesis-y-validacion.md` (hipótesis H1..H10 documentadas en `docs/04-hipotesis-validacion.md`).