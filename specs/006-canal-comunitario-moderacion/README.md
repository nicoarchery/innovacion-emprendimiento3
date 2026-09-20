---
status: planned
created: 2026-09-14
priority: medium
tags:
- reporte-directo
- moderacion
- comunidad
- gobernanza
depends_on:
- 005-gap-analysis-engine
created_at: 2026-09-14T00:12:03.873626367Z
updated_at: 2026-09-20T00:00:00.000000000Z
---

# Canal Comunitario y Moderación (Gobernanza)

> **Status**: planned · **Priority**: medium · **Created**: 2026-09-13

## Overview

Vía de bajo costo para que vecinos, veedurías y JAC reporten el estado real de obras del barrio: **formulario web / PWA (reporte directo a la plataforma) y cola de moderación**. Los reportes validados se convierten en evidencia de campo (N3) y alimentan las reglas de evidencia cruzada del motor de brechas.

> **Decisión 2026-09-20**: se retira WhatsApp (Meta Cloud API) como canal. El reporte ciudadano (texto/foto/GPS) y la confirmación se hacen **directamente en la plataforma** — más simple, sin cuenta Meta ni plantillas, y evita transferir datos personales a terceros. Ver `docs/knowledge/15-cumplimiento-legal-tos.md`.

## Requirements

- **Captura Directa:** CUANDO un ciudadano envía un reporte (texto/foto/GPS) por el formulario web o la app PWA, ENTONCES el sistema DEBE crear un candidato en `pendiente_moderacion`.
- **Moderación:** SI un reporte es duplicado o carece de evidencia suficiente, ENTONCES el sistema DEBE marcarlo `rechazado`; SI es válido, ENTONCES DEBE asociarse al proyecto y entrar al pool N3.
- **Evidencia Cruzada:** CUANDO una alerta se publica, ENTONCES el sistema DEBE exigir ≥3 reportes independientes en radio <500m o 5 días hábiles sin descargos de la empresa.
- **Anti-Spam:** SI un contacto supera 5 reportes/hora, ENTONCES el sistema DEBE bloquear temporalmente sus envíos.
- **Privacidad:** CUANDO se procesa un reporte, ENTONCES el sistema DEBE enmascarar el contacto del ciudadano ante la empresa y terceros.
- **Confirmación:** CUANDO un reporte cambia de estado, ENTONCES el sistema DEBE notificar al ciudadano (por correo o en su sesión de plataforma).

## Technical Approach / Design

- Formulario de reporte en la plataforma (`/reportar` o componente en ficha de obra) que recibe texto, foto y GPS; reutiliza la captura EXIF de `004-captura-evidencia-campo`.
- PWA offline-first reenvía los reportes encolados cuando hay conexión (ver spec 004).
- Cola de moderación asíncrona; panel de moderación con estados y motivos de rechazo.
- Normalización de contacto (correo/sesión), deduplicación por hash(foto+GPS+fecha) y persistencia como candidato.
- Protección del endpoint contra abuso (rate limiting por contacto/IP): anti-spam.

## Plan

- [ ] Formulario web de reporte (texto, foto, GPS) y reutilización de captura PWA (spec 004).
- [ ] Persistencia de candidatos + reglas anti-spam y deduplicación.
- [ ] Cola de moderación + panel con estados y auditoría.
- [ ] Integración con pool N3 del motor de brechas (005-gap-analysis-engine).

## Test

- [ ] Reporte vía formulario web válido crea candidato y confirma al ciudadano.
- [ ] Reporte duplicado se rechaza con motivo.
- [ ] Contacto que excede 5 reportes/hora queda bloqueado temporalmente.

## Notes

- Los datos de contacto del ciudadano NUNCA se exponen a empresas (política de gobernanza del proyecto).
- Validación con veedurías piloto: docs/04-hipotesis-validacion.md, experimento de resolución de disputas.
- A diferencia del diseño anterior (webhook WhatsApp), no hay metadatos de Meta involucrados; la privacidad se gestiona 100% en la plataforma (ver `15-cumplimiento-legal-tos.md`).