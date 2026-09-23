---
status: complete
created: 2026-09-23
priority: high
tags:
- reporte-directo
- ciudadano
- mapa
- moderacion
depends_on:
- 006-canal-comunitario-moderacion
created_at: 2026-09-23T17:27:20.949206667Z
updated_at: 2026-09-23T17:38:13.609225927Z
completed_at: 2026-09-23T17:38:13.609225927Z
transitions:
- status: in-progress
  at: 2026-09-23T17:27:23.166100477Z
- status: complete
  at: 2026-09-23T17:38:13.609225927Z
---

# Reporte ciudadano desde el mapa (ver, reportar, calificar, opinar)

> **Status**: planned · **Priority**: high · **Created**: 2026-09-23

## Overview

El mapa es la puerta de entrada ciudadana: al hacer clic en una obra, el panel de detalle ofrece un botón **"Reportar esta obra"** que abre un modal con el estado real en terreno, % de avance observado, calificación (1–5), opinión/foto (opcional) y GPS. El reporte se persiste como candidato en `pendiente_moderacion` (pool N3 de la spec 006). Este incremento implementa parte de 006 desde el mapa; PWA/offline queda para 004.

## Requirements

- **Acceso desde el mapa:** CUANDO el usuario hace clic en un marcador de obra, ENTONCES el panel de detalle DEBE mostrar un botón "Reportar esta obra".
- **Captura directa:** CUANDO el ciudadano envía el reporte, ENTONCES el sistema DEBE crear una fila en `reportes_ciudadanos` con estado `pendiente_moderacion` asociada al `id_contrato`.
- **Contenido del reporte:** CUANDO se abre el modal, ENTONCES el sistema DEBE permitir: estado en terreno (ejecución/retraso/paralizada), avance observado 0–100 %, calificación 1–5, texto opcional, fotografía opcional.
- **GPS:** SI el navegador entrega geolocalización, ENTONCES DEBE guardarse; SI no, ENTONCES DEBE usarse la coordenada calculada de la obra como posición referencial.
- **Validación:** SI el `id_contrato` no existe en `obras`, ENTONCES el sistema DEBE rechazar el reporte (404).
- **Anti-spam:** SI el mismo contacto/IP supera 5 envíos en la última hora, ENTONCES el sistema DEBE rechazar temporalmente (429).
- **Privacidad:** CUANDO se lista un reporte, ENTONCES el contacto del ciudadano NO DEBE exponerse; solo su resumen (avance, calificación, fecha).

## Technical Approach / Design

- Tabla `reportes_ciudadanos` en `src/lib/mapa/db.ts` (SQLite, migración idempotente en `SCHEMA`).
- Ruta `src/app/api/mapa/obras/[id]/reportes/route.ts`: `GET` (resumen/listado sin contacto) y `POST` (multipart o JSON con foto base64) validando contrato con `obtenerObraPorId`.
- Modal `ReporteCiudadanoModal.tsx` (client) integrado en `PanelDetalleObra`; notificación toast con `ui/use-toast`.
- Botón y contador de reportes en `PanelDetalleObra.tsx`.
- Foto opcional limitada (~1.5 MB) almacenada como data URL; sin parseo EXIF en este incremento.

## Plan

- [x] Tabla `reportes_ciudadanos` + helpers (insertar, listar, contar, rate-limit en memoria).
- [x] API `GET/POST /api/mapa/obras/[id]/reportes` con validación y anti-spam.
- [x] Modal `ReporteCiudadanoModal` desde el panel de detalle del mapa.
- [x] Contador/resumen de reportes en el panel.

## Test

- [x] Enviar reporte desde el mapa crea fila `pendiente_moderacion` y responde success.
- [x] `id_contrato` inexistente responde 404.
- [x] Más de 5 envíos/hora desde el mismo contacto responde 429.
- [x] GET no devuelve el contacto del ciudadano.
- [x] `npm run lint` y `npm run build` pasan.