---
status: complete
created: 2026-09-19
priority: high
tags:
- mapa
- cali
- secop
- geo
- ui
created_at: 2026-09-19T02:37:10.983828700Z
updated_at: 2026-09-19T02:55:08.248350625Z
completed_at: 2026-09-19T02:55:08.248350625Z
transitions:
- status: in-progress
  at: 2026-09-19T02:40:56.498982869Z
- status: complete
  at: 2026-09-19T02:55:08.248350625Z
---

# Base de Datos Local y Sincronización Incremental

> **Status**: planned · **Priority**: high · **Created**: 2026-09-18

## Overview
Implementar la capa de persistencia/caché local (SQLite vía better-sqlite3) y el flujo de sincronización incremental con SECOP: `SECOP → backend → DB local → frontend/mapa`. El frontend NUNCA consulta SECOP directamente. Reemplaza el acceso directo actual de `src/lib/secop.ts` sin romper el explorador existente.

## Requirements

- **DB local:** CUANDO la app inicia o el sistema necesita datos, ENTONCES DEBE poder leer/escribir en una BD SQLite local persistente (`data/mapa.db`), no en memoria volátil.
- **Modelo `obras`:** CUANDO se persiste una obra, ENTONCES la tabla DEBE contener: identificación (id_contrato PK, proceso_de_compra, referencia), entidad (nombre, nit), contratista (nombre, doc), ubicación administrativa (departamento, municipio), obra (descripción, tipo_contrato, unspsc, estado, fechas, valor, url_secop, is_obra, obra_score, obra_razon), ubicación física (direccion_ejecucion, barrio, comuna, lat, lon, geo_fuente, geo_confianza, geo_fecha, estado_ubicacion) y sincronización (secop_updated_at, synced_at, hash).
- **Detección de cambios:** CUANDO llega un registro de SECOP, ENTONCES el sistema DEBE comparar un hash del registro (o campos clave) contra la fila local para decidir insert (nuevo) vs update (modificado) vs unchanged.
- **Sincronización incremental:** CUANDO se dispara una sincronización, ENTONCES el sistema DEBE: (a) extraer obras de SECOP para Cali (spec 012), (b) upsert por id_contrato solo filas nuevas/cambiadas, (c) identificar geocodificación pendiente y delegar (spec 014), (d) registrar la corrida en `sync_runs`.
- **Endpoint de actualización:** CUANDO el usuario pulsa "Actualizar mapa", ENTONCES `POST /api/mapa/actualizar` DEBE ejecutar la sincronización y devolver resumen: `{nuevas, actualizadas, ubicaciones_geocodificadas, sin_ubicacion, fecha_sync}`. El frontend recibe el resumen y re-renderiza.
- **Endpoint de consulta:** CUANDO se solicita `GET /api/mapa/obras`, ENTONCES DEBE responder leyendo SOLO de la DB local (nunca de SECOP), con filtros opcionales (estado, entidad, min/max valor, fecha, comunas).
- **Sin CRON:** CUANDO no hay petición de actualización, ENTONCES el sistema NO DEBE consultar SECOP en segundo plano (MVP manual).
- **Seguridad de unicidad:** CUANDO se upsert, ENTONCES el sistema DEBE deduplicar por id_contrato (evita duplicados ante re-sincronizaciones).

## Technical Approach / Design

- `src/lib/mapa/db.ts`: inicializador singleton de SQLite (WAL), migraciones (CREATE TABLE IF NOT EXISTS), helpers de query con parámetros.
- `src/lib/mapa/syncService.ts`: orquesta extracción→upsert→geo→resumen; retorna `SyncResult`.
- protección: reentrancy lock simple en proceso (flag) para evitar dobles clics simultáneos.
- Umbral: cap de geocodificación por corrida (p. ej. 150) para respetar rate-limit Nominatim.

## Plan

- [x] Instalar mejor-sqlite3 y crear `src/lib/mapa/db.ts` (esquema + migración).
- [x] Implementar upsert con detección por hash y tabla `sync_runs`.
- [x] Crear `POST /api/mapa/actualizar` y `GET /api/mapa/obras`.

## Test

- [x] Re-sincronización idéntica NO duplica filas ni produce "nuevas".
- [x] Modificación de estado o valor en SECOP se detecta como "actualizada".
- [x] GET /api/mapa/obras responde sin red a SECOP.
- [x] POST /api/mapa/actualizar devuelve resumen estructurado y persiste `sync_runs`.
- [x] Doble clic simultáneo no lanza dos sincronizaciones concurrentes.