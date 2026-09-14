---
status: planned
created: 2026-09-14
priority: medium
tags:
- whatsapp
- moderacion
- comunidad
- gobernanza
depends_on:
- 005-gap-analysis-engine
created_at: 2026-09-14T00:12:03.873626367Z
updated_at: 2026-09-14T00:12:03.873626367Z
---

# Canal Comunitario y Moderación (Gobernanza)

> **Status**: planned · **Priority**: medium · **Created**: 2026-09-13

## Overview

Vía de bajo costo para que vecinos, veedurías y JAC reporten el estado real de obras del barrio: bot de WhatsApp (Meta Cloud API), formulario web y cola de moderación. Los reportes validados se convierten en evidencia de campo (N3) y alimentan las reglas de evidencia cruzada del motor de brechas.

## Requirements

- **Captura Multicanal:** CUANDO un ciudadano envía un reporte (texto/foto/GPS) por WhatsApp o formulario web, ENTONCES el sistema DEBE crear un candidato en `pendiente_moderacion`.
- **Moderación:** SI un reporte es duplicado o carece de evidencia suficiente, ENTONCES el sistema DEBE marcarlo `rechazado`; SI es válido, ENTONCES DEBE asociarse al proyecto y entrar al pool N3.
- **Evidencia Cruzada:** CUANDO una alerta se publica, ENTONCES el sistema DEBE exigir ≥3 reportes independientes en radio <500m o 5 días hábiles sin descargos de la empresa.
- **Anti-Spam:** SI un contacto supera 5 reportes/hora, ENTONCES el sistema DEBE bloquear temporalmente sus envíos.
- **Privacidad:** CUANDO se procesa un reporte, ENTONCES el sistema DEBE enmascarar el contacto del ciudadano ante la empresa y terceros.
- **Confirmación:** CUANDO un reporte cambia de estado, ENTONCES el sistema DEBE notificar al ciudadano por su canal original.

## Technical Approach / Design

- Webhook `src/app/api/whatsapp/route.ts`: verificación de firma de Meta, recepción de mensajes (texto/documento/ubicación) y respuesta inmediata.
- Cola de moderación asíncrona; panel de moderación con estados y motivos de rechazo.
- Normalización de contacto (número), deduplicación por hash(foto+GPS+fecha) y persistencia como candidato.
- Firma y validación de `X-Hub-Signature-256` para seguridad del webhook.

## Plan

- [ ] Configuración de Meta Cloud API (token, número, webhook firmado).
- [ ] Handler de mensajes WhatsApp (texto, foto, ubicación) y formulario web.
- [ ] Cola de moderación + reglas anti-spam y deduplicación.
- [ ] Panel de moderación con estados y auditoría.
- [ ] Integración con pool N3 del motor de brechas (005-gap-analysis-engine).

## Test

- [ ] Mensaje WhatsApp válido crea candidato y responde confirmación.
- [ ] Reporte duplicado se rechaza con motivo.
- [ ] Contacto que excede 5 reportes/hora queda bloqueado temporalmente.
- [ ] Webhook rechaza firmas inválidas (401).

## Notes

- Los datos de contacto del ciudadano NUNCA se exponen a empresas (política de gobernanza del proyecto).
- Validación con veedurías piloto: docs/04-hipotesis-validacion.md, experimento de resolución de disputas.