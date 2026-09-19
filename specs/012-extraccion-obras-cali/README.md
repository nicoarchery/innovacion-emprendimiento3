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
created_at: 2026-09-19T02:37:10.596597466Z
updated_at: 2026-09-19T02:55:08.247726833Z
completed_at: 2026-09-19T02:55:08.247726833Z
transitions:
- status: in-progress
  at: 2026-09-19T02:40:56.498270658Z
- status: complete
  at: 2026-09-19T02:55:08.247726833Z
---

# Extracción y Normalización de Obras SECOP — Cali

> **Status**: planned · **Priority**: high · **Created**: 2026-09-18

## Overview
Nuevo pipeline de extracción SECOP II dedicado al mapa: consulta el dataset de Contratos Electrónicos (`jbjy-vk9h` en datos.gov.co), filtra estrictamente a obras en Cali, normaliza al modelo `Obra`, aplica un clasificador de obra documentado y persiste en la tabla `obras`. Complementa (no rompe) la ingesta existente de `src/lib/secop.ts`.

## Requirements

- **Filtro Cali:** CUANDO se extrae, ENTONCES el sistema DEBE incluir solo registros con `ciudad` = Cali (y, si el registro lo indica, departamento Valle del Cauca).
- **Criterio de obra:** CUANDO un contrato es `tipo_de_contrato = 'Obra'` ENTONCES DEBE considerarse obra. SI adicionalmente su UNSPSC principal inicia en 72/30/39 O su descripción contiene términos (construct*, adecuaci*, rehabilit*, mejoramiento, mantenimiento, infraestructura, paviment*, andén, puente, colegio, hospital, parque, escenario deportivo, espacio público) ENTONCES DEBE reforzar el score.
- **Campos extraídos:** CUANDO se normaliza, ENTONCES DEBE guardar como mínimo: id_contrato, proceso_de_compra, referencia_del_contrato, nombre/nit de entidad, nombre/doc contratista, departamento, ciudad, descripcion_del_proceso, tipo_de_contrato, codigo_de_categoria_principal (unspsc), estado_contrato, fecha_de_firma/inicio/fin, valor_del_contrato, urlproceso, direcci_n_de_ejecuci_n_del_contrato, localizaci_n, ultima_actualizacion.
- **Persistencia:** CUANDO se normaliza correctamente, ENTONCES el sistema DEBE insertar/actualizar la fila en `obras` usando `id_contrato` como clave única (ver spec 013).
- **Solo obras:** SI un registro no se clasifica como obra, ENTONCES el sistema DEBE excluirlo del mapa (aunque se puede conservar en un flag `is_obra=false` para estadísticas).
- **No duplicados:** CUANDO ya existe `id_contrato`, ENTONCES el sistema DEBE actualizar la fila, no duplicarla.
- **Limitación de volumen:** CUANDO el dataset es masivo (1.429 obras en Cali), ENTONCES el sistema DEBE paginar (`$limit`/`$offset` con `$order` estable) y procesar por lotes para evitar timeouts.

## Technical Approach / Design

- Nuevo módulo `src/lib/mapa/secopFetcher.ts` (o `src/lib/mapa/ingesta.ts`) independiente de `src/lib/secop.ts`.
- Endpoint fuente: `https://www.datos.gov.co/resource/jbjy-vk9h.json` con `$where=upper(ciudad)='CALI' and tipo_de_contrato in ('Obra','Concesión','Asociación Público Privada')`.
- Clasificador: función pura `classifyObra(descripcion, tipo, unspsc)` → `{isObra, score, reason}`; resultados guardados para iterar mejora.
- Normalizador de valores (COP string→number, fechas→ISO, dirección→texto normalizado quebrantando saltos de línea).

## Plan

- [x] Crear módulo de extracción+normalización (pagina SECOP II, filtro Cali/obra).
- [x] Implementar `classifyObra` con scoring y razón.
- [x] Persistir en `obras` (depende de DB de spec 013; implementar integración al unísono).

## Test

- [x] Extracción paginada recupera contratos de Cali y tipo Obra.
- [x] Clasificador etiqueta obras reales (sample con direcciones) correctamente.
- [x] Registro de otro municipio es excluido.
- [x] `id_contrato` duplicado no genera fila repetida.