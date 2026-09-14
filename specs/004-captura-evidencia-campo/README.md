---
status: planned
created: 2026-09-14
priority: high
tags:
- pwa
- offline
- exif
- gps
- verificacion
depends_on:
- 001-secop-ingestion
created_at: 2026-09-14T00:11:31.621082097Z
updated_at: 2026-09-14T00:11:31.621082097Z
---

# Captura de Evidencia en Campo (PWA Offline)

> **Status**: planned · **Priority**: high · **Created**: 2026-09-13

## Overview

Aplicación web progresiva (PWA) para verificación física de obras en terreno por veedurías e inspectores. Captura fotografías con metadatos EXIF (GPS y marca de tiempo), reporta % de avance físico y estados de paralización en modalidad offline-first (cola local), sincronizando cuando la conectividad regresa. Alimenta el Nivel 3 (Evidencia de Campo) del motor de brechas.

## Requirements

- **Captura Multimedia:** CUANDO el usuario reporta evidencia de una obra, ENTONCES el sistema DEBE capturar al menos una fotografía junto con sus metadatos EXIF (latitud, longitud, timestamp).
- **Offline-First:** CUANDO el dispositivo está sin conexión, ENTONCES el reporte DEBE encolarse en almacenamiento local hasta que se restablezca la red.
- **Sincronización:** CUANDO la conectividad vuelve, ENTONCES el sistema DEBE sincronizar la cola en orden cronológico, confirmando cada envío.
- **Validación de Metadatos:** SI una foto no tiene coordenadas GPS válidas o fecha, ENTONCES el sistema DEBE marcarla como `evidencia_invalida` y requerir corrección manual.
- **Vínculo Contractual:** CUANDO se crea un reporte, ENTONCES el sistema DEBE exigir un `id_contrato` válido de SECOP II (001).
- **Privacidad:** CUANDO se sube una foto, ENTONCES NUNCA se DEBE exponer el EXIF crudo fuera del sistema; solo coordenadas y fecha saneadas.
- **Deduplicación:** SI una evidencia duplica (misma foto, GPS y timestamp) una existente, ENTONCES el sistema DEBE rechazarla con estado `duplicated`.

## Technical Approach / Design

- PWA con Next.js: manifest + Service Worker, caché de assets y cola de envíos en IndexedDB.
- Lectura EXIF en cliente (exifr) antes de subir; se envían solo lat/lng/timestamp saneados.
- Endpoint `src/app/api/evidencias/route.ts`: acepta multipart (foto + JSON), valida `id_contrato` y metadatos, persiste y dispara recálculo de brecha (005-gap-analysis-engine).
- Binario en bucket de objetos (`evidencias/{id_contrato}/{uuid}.jpg`); metadatos en bd relacional.
- Estados: `pending | synced | invalid | duplicated`.

## Plan

- [ ] Configurar manifest, Service Worker y hook de conectividad (online/offline).
- [ ] Implementar captura de foto + extractor EXIF + validación GPS/fecha.
- [ ] Implementar cola offline y motor de sincronización al recuperar red.
- [ ] Endpoint `/api/evidencias` con validación, deduplicación y persistencia.
- [ ] Integrar listado de evidencias por proyecto en el explorador (002).

## Test

- [ ] Foto con EXIF válido persiste evidencia y actualiza estado de proyecto.
- [ ] Reportes offline se sincronizan al reconectar sin pérdidas ni duplicados.
- [ ] Foto sin GPS queda `evidencia_invalida` y exige corrección.
- [ ] Endpoint rechaza `id_contrato` inexistente (400).

## Notes

- Costo operativo: verificación automatizada (EXIF/GPS) disponible en todos los planes; auditoría física y encuestas comunitarias quedan reservadas al plan premium según 02-estrategia-arquitectura.md.