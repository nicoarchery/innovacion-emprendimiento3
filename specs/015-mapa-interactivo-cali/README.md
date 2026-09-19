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
created_at: 2026-09-19T02:37:11.748295120Z
updated_at: 2026-09-19T02:55:08.249476110Z
completed_at: 2026-09-19T02:55:08.249476110Z
transitions:
- status: in-progress
  at: 2026-09-19T02:40:56.500075873Z
- status: complete
  at: 2026-09-19T02:55:08.249476110Z
---

# Mapa Interactivo de Obras de Cali (UI)

> **Status**: planned · **Priority**: high · **Created**: 2026-09-18

## Overview
Ruta pública `/mapa` con el mapa interactivo que es el corazón del MVP: mapa centrado en Cali, marcadores de obras con clustering, ficha resumida por obra y panel de detalle que distingue datos SECOP de datos procesados por la app. Botón "Actualizar mapa".

## Requirements

- **Mapa centrado en Cali:** CUANDO se abre `/mapa`, ENTONCES el mapa DEBE centrarse en Cali (3.4516, -76.5320) con zoom urbano y DEBE poder pan/zoom.
- **Marcadores:** CUANDO hay obras en la DB local, ENTONCES DEBE renderizar un marcador por obra con ubicación `resuelta` (lat/lon válidos); las `no_determinada` NO DEBEN mostrarse.
- **Clustering:** CUANDO hay muchas obras cercanas, ENTONCES DEBE agruparse en clusters con contador.
- **Ficha resumida:** CUANDO el usuario hace clic en un marcador, ENTONCES DEBE abrirse una ficha con: nombre/objeto de la obra, entidad, contratista, valor, estado, fecha inicio/fin y enlace al registro SECOP (url_secop).
- **Panel de detalle:** CUANDO se selecciona una obra, ENTONCES DEBE distinguirse visualmente entre "Información SECOP" (contrato, valor, estado, fechas, entidad, contratista) y "Información procesada por la app" (ubicación/dirección, coordenadas, comuna/barrio, fuente de ubicación y confianza).
- **Filtros mínimos:** CUANDO el usuario filtra, ENTONCES DEBE poder filtrar por: estado de la obra, entidad contratante, rango de valor, fecha (firma o ejecución) y tipo/categoría de obra. (Sin filtros complejos.)
- **Actualizar mapa:** CUANDO el usuario pulsa "Actualizar mapa", ENTONCES DEBE llamarse a `POST /api/mapa/actualizar` y DEBE mostrarse el resumen devuelto (nuevas, actualizadas, ubicaciones geocodificadas, sin ubicación, fecha) en un toast; al terminar DEBE re-renderizarse el mapa con los datos de DB local.
- **Indicador de datos:** CUANDO el mapa está al día, ENTONCES DEBE mostrarse la fecha de última actualización y una nota de "datos no fiables" consistente con `PrototypeNotice`.
- **Estado carga/vacío/error:** CUANDO no hay obras, ENTONCES DEBE mostrarse estado vacío con invitación a "Actualizar mapa". SI el servicio falla, DEBE mostrarse error controlado.

## Technical Approach / Design

- Librerías: `leaflet`, `react-leaflet` v5 (React 19) y `react-leaflet-cluster` (o divIcons propios) + CSS de leaflet importado.
- Tiles: OpenStreetMap estándar con atribución (sin API key; gratuito para MVP).
- Componentes: `src/app/mapa/page.tsx`, `src/components/mapa/MapaCali.tsx`, `ObraMarcador.tsx`, `FichaResumida.tsx`, `PanelDetalleObra.tsx`, `FiltrosMapa.tsx`, `BotónActualizar.tsx`.
- Estado cliente: data de `/api/mapa/obras` (solo DB local), filtros en estado local, `SyncSummary` tras actualizar.
- Ruta añadida a NavBar ("Mapa de obras") manteniendo las rutas actuales.

## Plan

- [x] Instalar leaflet/react-leaflet/react-leaflet-cluster; crear página `/mapa`.
- [x] Renderizar marcadores + clustering + ficha.
- [x] Implementar panel de detalle con distinción SECOP vs procesado.
- [x] Filtros mínimos + botón actualizar con toast de resumen.
- [x] Estados carga/vacío/error y fecha de última actualización.

## Test

- [x] `/mapa` renderiza centrado en Cali con tiles OSM y clustering.
- [x] Obras `no_determinada` no aparecen; las resueltas sí, trazables a SECOP.
- [x] Ficha y panel distinguen SECOP vs. procesado (fuente y confianza).
- [x] Filtros reducen marcadores correctamente.
- [x] "Actualizar mapa" muestra resumen y re-renderiza sin recargar.