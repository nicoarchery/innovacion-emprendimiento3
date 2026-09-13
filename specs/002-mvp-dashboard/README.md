---
status: complete
created: 2026-09-13
priority: medium
depends_on:
- 001-secop-ingestion
created_at: 2026-09-13T23:29:08.909118859Z
updated_at: 2026-09-13T23:32:53.446244769Z
completed_at: 2026-09-13T23:32:53.446244769Z
transitions:
- status: in-progress
  at: 2026-09-13T23:29:13.782659909Z
- status: complete
  at: 2026-09-13T23:32:53.446244769Z
---

# Explorador Territorial y Dashboard MVP

> **Status**: planned · **Priority**: medium · **Created**: 2026-09-13

## Overview

Dashboard y explorador territorial interactivo para el MVP funcional. Permite a los usuarios y directivos visualizar contratos de obra pública auditados desde SECOP II, calcular desviaciones (Gap Analysis) contra la evidencia física en terreno y registrar validaciones comunitarias con recálculo dinámico en el navegador.

## Requirements

Reglas del sistema bajo sintaxis EARS:

- [x] **Carga Inicial:** CUANDO el usuario accede a la vista `/explorador`, ENTONCES el sistema DEBE cargar y renderizar los contratos de SECOP II junto con los indicadores agregados (Total Inversión, Contratos Auditados, Alertas de Brecha).
- [x] **Filtro Territorial:** CUANDO el usuario selecciona un departamento o municipio, ENTONCES el sistema DEBE filtrar reactivamente la lista de obras y actualizar las métricas de resumen.
- [x] **Búsqueda Textual:** CUANDO el usuario ingresa un término en la barra de búsqueda, ENTONCES el sistema DEBE filtrar por objeto contractual, contratista o entidad compradora.
- [x] **Cálculo de Brecha (Gap Analysis):** SI la diferencia absoluta $| \% \text{SECOP II} - \% \text{Evidencia Campo} | > 15\%$, ENTONCES el sistema DEBE marcar el proyecto con el badge "Alerta de Riesgo Territorial".
- [x] **Validación Ciudadana:** CUANDO un usuario envía un reporte de evidencia comunitaria (avance %, observación, foto simulada), ENTONCES el sistema DEBE actualizar el porcentaje de campo del proyecto y recalcular inmediatamente el índice de brecha.
- [x] **Ficha Técnica y ESG:** CUANDO el usuario solicita el detalle de un proyecto, ENTONCES el sistema DEBE mostrar el modal con los metadatos contractuales (NIT, valor, fechas) y estimaciones de impacto ESG.

## Technical Approach / Design

### 1. Componentes
- `src/app/explorador/page.tsx`: Página contenedora del dashboard.
- `src/components/SecopExplorer.tsx`: Contenedor principal con filtros, buscador, cards estadísticas y listado de obras.
- `src/components/CitizenVerificationModal.tsx`: Formulario para envío de reportes de veeduría y actualización de estado.
- `src/components/ProjectDetailsModal.tsx`: Ficha técnica extendida con desglose financiero, contratista y métricas ESG.

### 2. Flujo de Datos
- Consulta inicial a `/api/secop` (o fallback instantáneo en caso de timeout o modo offline).
- Estado reactivo en cliente para gestionar filtros, ordenamiento y evidencias comunitarias reportadas durante la sesión.

## Plan

- [x] Crear cliente `src/lib/secop.ts` y endpoint `src/app/api/secop/route.ts`.
- [x] Construir `src/components/CitizenVerificationModal.tsx`.
- [x] Construir `src/components/ProjectDetailsModal.tsx`.
- [x] Construir `src/components/SecopExplorer.tsx` con filtros y estadísticas.
- [x] Crear página `src/app/explorador/page.tsx`.
- [x] Integrar navegación en `NavBar.tsx` y `HeroSection.tsx`.
- [x] Validar con `bun run build` y `bunx lean-spec validate`.

## Test

- [x] Verificar que la consulta a `/api/secop` retorna contratos válidos o fallback tipado.
- [x] Verificar que el filtro por departamento actualiza los contratos visibles y métricas.
- [x] Verificar que el reporte ciudadano en el modal altera el % de campo y la brecha del proyecto.
- [x] Verificar que `bun run build` completa sin errores de TypeScript ni empaquetado.