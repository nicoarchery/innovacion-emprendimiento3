---
status: complete
created: 2026-09-23
tags:
- explorador
- mapa
- reportes
- ui
- backlog
- spec-driven
created_at: 2026-09-23T23:24:37.335285613Z
updated_at: 2026-09-23T23:27:06.972933877Z
completed_at: 2026-09-23T23:27:06.972933877Z
transitions:
- status: complete
  at: 2026-09-23T23:27:06.972933877Z
---

# Explorador con datos reales + reportes unificados con el mapa

## Contexto
Actualmente el explorador (`/explorador`) usa datos simulados (`lib/secop.ts` + `/api/secop`): contratos de todo Colombia con gap/terreno ficticios (`ContractProject`, `CitizenVerificationModal`, `ProjectDetailsModal`). El mapa (`/mapa`) usa la DB real de Cali con reportes ciudadanos reales.

**Objetivo:** el explorador y el mapa deben presentar las mismas funcionalidades: el mapa = ubicación interactiva; el explorador = TODAS las obras de Santiago de Cali (tengan o no ubicación). La parte de REPORTES se unifica: en ambas vistas hay UN solo botón **"Ver N reportes"**; esa ventana lista los reportes Y tiene un botón para crear uno con el formulario existente (`ReporteCiudadanoModal`).

## Requisitos (EARS)

- WHEN el usuario abre `/explorador`, THEN se listan todas las obras reales de Cali (`is_obra = 1`), con o sin `estado_ubicacion` resuelta, cada una con su conteo real de reportes.
- WHEN el usuario pulsa **"Ver N reportes"** en la fila de una obra (explorador O mapa), THEN se abre `ReportesObraModal` con el listado real de reportes y un botón "Nuevo reporte / Reportar esta obra" que abre `ReporteCiudadanoModal` y, al enviar, refresca el listado.
- WHEN el panel de detalle del mapa está abierto, THEN se muestra el botón "Ver N reportes" (sin botón separado "Reportar esta obra").
- WHEN el usuario filtra en el explorador, THEN puede usar búsqueda por texto, filtro por estado SECOP, filtro por ubicación (todas / en el mapa / sin ubicar) y ordenar por valor, fecha o nº reportes. SE ELIMINAN los filtros de departamento.
- WHEN el explorador carga, THEN deja de consumir `/api/secop` y `SEED_PROJECTS`/datos simulados.

## Interfaz I/O

### GET `/api/mapa/obras?todas=1`
- Query params nuevos: `todas=1` (devuelve TODAS las obras, no solo las geocodificadas).
- Respuesta: `{ success, data: ObraMarcador[] cada uno con reportes?: {total, promedio_calificacion, con_retraso, paralizadas}, meta: {totales, ultimaSync, filtros:{entidades, estados}} }`.

### DB (src/lib/mapa/db.ts)
- `listTodasObras(filtros?)` — todas las obras con/sin ubicación + filtros (estado, entidad, min/maxValor, fecha, ubicacion).
- `resumenReportesMasivo(): Record<id_contrato, ResumenReportesObra>` — un solo GROUP BY para N obras (evita N+1).

## Eliminaciones
- `src/components/CitizenVerificationModal.tsx`, `src/components/ProjectDetailsModal.tsx`, `src/app/api/secop/route.ts`.
- `src/lib/secop.ts` se reduce a `formatCOP` (quitar `SEED_PROJECTS`, `ContractProject`, `fetchSecopContracts`).

## Verificación
- `npm run lint` (0 errores en archivos tocados), `tsc --noEmit`, `next build`.
- Prueba funcional manual: `/explorador` lista obras con/sin ubicación; botón "Ver N reportes" idéntico en mapa y explorador; crear reporte desde la ventana de listado refresca el conteo.

## Notas
- `ReporteCiudadanoModal` ya tolera obras sin `lat/lon` (fallback "Cali").
- `PreviewRoute`: sin cambios; el mapa sigue mostrando solo obras `resuelta`.