---
status: planned
created: '2026-09-13'
tags: [backend, secop, ingesta, datos-abiertos]
priority: high
---

# Ingesta SECOP II

> **Status**: planned · **Priority**: high · **Created**: 2026-09-13

## Overview

Sincronización automática de datos de contratos de infraestructura y obras públicas desde la API pública de SECOP II (Socrata en datos.gov.co) hacia la base de datos central de la plataforma RSC. Permite alimentar el motor de brechas contractuales vs. verificación física en territorio.

## Requirements

Reglas inmutables para el comportamiento del servicio (Sintaxis EARS):

- [ ] **Precondición:** El sistema DEBE tener configurado un `SOCRATA_APP_TOKEN` válido en las variables de entorno para evitar rate-limits.
- [ ] **Ejecución (Trigger):** CUANDO el worker o cronjob programado se ejecute, ENTONCES el sistema DEBE consultar los contratos ordenados por fecha de actualización reciente.
- [ ] **Actualización (Upsert - Conflicto):** SI el `id_contrato` ya existe en la base de datos local, ENTONCES el sistema DEBE actualizar los campos `estado` y `valor_adjudicado`.
- [ ] **Inserción (Upsert - Nuevo):** SI el `id_contrato` no existe, ENTONCES el sistema DEBE insertar el nuevo registro.
- [ ] **Manejo de Fallos:** SI la API de Socrata retorna un código HTTP 429, ENTONCES el sistema DEBE pausar la ejecución aplicando backoff exponencial antes de reintentar.

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

- [ ] Configurar cliente HTTP para la API de Socrata con inyección de credenciales seguras.
- [ ] Implementar la paginación dinámica por lotes de 1000 registros y control de rate limit.
- [ ] Crear el modelo de datos en base de datos y la función de upsert.
- [ ] Implementar política de reintentos con backoff exponencial para respuestas 429 y 5xx.
- [ ] Empaquetar el worker en Dockerfile y preparar workflow de GitHub Actions.

## Test

- [ ] Validar mapeo de campos JSON de SECOP II a la estructura interna `Contract`.
- [ ] Probar idempotencia del upsert (mismo lote ejecutado dos veces no duplica registros).
- [ ] Simular respuesta 429 de la API para certificar el backoff exponencial.

## Notes

- Fuente de datos oficial: Portal de Datos Abiertos de Colombia (dataset `6qex-kahp`).
- No requiere autenticación privada, pero sí `X-App-Token` para volumen alto de peticiones.