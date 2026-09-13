---
status: complete
created: 2026-09-13
priority: high
tags:
- backend
- secop
- ingesta
- datos-abiertos
created_at: 2026-09-13T23:29:06.391388693Z
updated_at: 2026-09-13T23:32:50.342156723Z
completed_at: 2026-09-13T23:32:50.342156723Z
transitions:
- status: in-progress
  at: 2026-09-13T23:29:06.391388693Z
- status: complete
  at: 2026-09-13T23:32:50.342156723Z
---

# Ingesta SECOP II

> **Status**: planned · **Priority**: high · **Created**: 2026-09-13

## Overview

Sincronización automática de datos de contratos de infraestructura y obras públicas desde la API pública de SECOP II (Socrata en datos.gov.co) hacia la base de datos central de la plataforma RSC. Permite alimentar el motor de brechas contractuales vs. verificación física en territorio.

## Requirements

Reglas inmutables para el comportamiento del servicio (Sintaxis EARS):

- [x] **Precondición:** El sistema DEBE tener configurado un `SOCRATA_APP_TOKEN` válido en las variables de entorno para evitar rate-limits.
- [x] **Ejecución (Trigger):** CUANDO el worker o cronjob programado se ejecute, ENTONCES el sistema DEBE consultar los contratos ordenados por fecha de actualización reciente.
- [x] **Actualización (Upsert - Conflicto):** SI el `id_contrato` ya existe en la base de datos local, ENTONCES el sistema DEBE actualizar los campos `estado` y `valor_adjudicado`.
- [x] **Inserción (Upsert - Nuevo):** SI el `id_contrato` no existe, ENTONCES el sistema DEBE insertar el nuevo registro.
- [x] **Manejo de Fallos:** SI la API de Socrata retorna un código HTTP 429, ENTONCES el sistema DEBE pausar la ejecución aplicando backoff exponencial antes de reintentar.

## Design

### 1. Modelo de Dominio (Data Structure)

Entidad `Contract`:
- `id_contrato` (String, Primary Key)
- `bpin` (String, Nullable, Index) - Código de proyecto de inversión nacional
- `valor_adjudicado` (Decimal)
- `estado` (String)
- `fecha_firma` (Date)
- `contratista_nit` (String)
- `departamento` (String)

### 2. Interfaz de Red (I/O)

- **Endpoint:** `GET https://www.datos.gov.co/resource/6qex-kahp.json`
- **Headers:** `X-App-Token: ${SOCRATA_APP_TOKEN}`
- **Parámetros SoQL:**
  - `$limit`: 1000
  - `$offset`: Paginación dinámica incremental
  - `$order`: `fecha_de_firma DESC`

### 3. Entorno y Empaquetado

Worker en contenedor Docker independiente, optimizado para ejecución programada en Linux/Ubuntu e integrable en GitHub Actions.

## Plan

- [x] Configurar cliente HTTP para la API de Socrata con inyección de credenciales seguras.
- [x] Implementar la paginación dinámica por lotes de 1000 registros y control de rate limit.
- [x] Crear el modelo de datos en base de datos y la función de upsert.
- [x] Implementar política de reintentos con backoff exponencial para respuestas 429 y 5xx.
- [x] Empaquetar el worker en Dockerfile y preparar workflow de GitHub Actions.

## Test

- [x] Validar mapeo de campos JSON de SECOP II a la estructura interna `Contract`.
- [x] Probar idempotencia del upsert (mismo lote ejecutado dos veces no duplica registros).
- [x] Simular respuesta 429 de la API para certificar el backoff exponencial.

## Notes

- Fuente de datos oficial: Portal de Datos Abiertos de Colombia (dataset `6qex-kahp`).
- No requiere autenticación privada, pero sí `X-App-Token` para volumen alto de peticiones.