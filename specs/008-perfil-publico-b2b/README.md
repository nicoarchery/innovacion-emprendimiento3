---
status: planned
created: 2026-09-14
priority: medium
tags:
- b2b
- perfil-publico
- benchmark
- mapa
depends_on:
- 002-mvp-dashboard
- 005-gap-analysis-engine
- 007-reportes-esg-art
created_at: 2026-09-14T00:12:06.322547882Z
updated_at: 2026-09-14T00:12:06.322547882Z
---

# Perfil Público Georreferenciado por Empresa

> **Status**: planned · **Priority**: medium · **Created**: 2026-09-13

## Overview

Vitrina pública de impacto territorial por empresa (NIT): mapa con sus obras verificadas, indicadores de brecha, badges PDET/ZOMAC, reportes ESG descargables y benchmark anónimo sectorial. Es el activo reputacional que sustenta los planes Pro/Enterprise y activa el gancho B2B desde la landing.

## Requirements

- **Perfil por NIT:** CUANDO el público visita `/{slug-empresa}`, ENTONCES el sistema DEBE mostrar mapa, obras, estados de alerta y métricas agregadas de la empresa.
- **Control de Visibilidad:** SI la empresa es cliente Pro/Enterprise, ENTONCES puede activar/desactivar la visibilidad de proyectos específicos.
- **Benchmark Anónimo:** CUANDO se muestra la comparativa sectorial, ENTONCES el sistema DEBE anonimizar a los competidores no clientes.
- **SEO/Compartición:** CUANDO se publica un perfil, ENTONCES DEBE ser indexable y con metadatos Open Graph para compartir en redes.
- **Conversión:** CUANDO se visita el perfil de una empresa no cliente, ENTONCES el sistema DEBE mostrar CTA "Reclama tu perfil" → lead B2B (lead-b2b).
- **Actualidad:** CUANDO cambia el gap o estado de un proyecto (005-gap-analysis-engine), ENTONCES el perfil público DEBE reflejarlo en ≤10min.

## Technical Approach / Design

- Ruta dinámica `src/app/empresa/[nit]/page.tsx` server-rendered con ISR (revalidate 600s).
- Reutiliza componentes del explorador (002): `ColombiaMap`, `ProjectDetailsModal`, badges de alerta y PDET (003).
- Derivación de slug a partir del NIT; metadatos Open Graph por empresa.
- Filtro de proyectos no visibles en la capa de datos antes de renderizar.

## Plan

- [ ] Endpoint de datos públicos por NIT (contratos verificados + brechas).
- [ ] Página `empresa/[nit]` con mapa, listado, métricas y reportes (007).
- [ ] Lógica de visibilidad por plan (cliente vs. no cliente).
- [ ] Benchmark sectorial anonimizado + CTA de conversión B2B.
- [ ] Open Graph, SEO e ISR.

## Test

- [ ] Perfil por NIT renderiza proyectos y estados correctos.
- [ ] Proyecto desactivado por cliente no aparece públicamente.
- [ ] Benchmark no expone competidores no clientes.
- [ ] Cambio de brecha (005-gap-analysis-engine) se refleja en ≤10min por ISR.
- [ ] CTA de no-cliente redirige a captura de lead B2B.

## Notes

- Este perfil es el "MVP Espejo" automatizado de docs/04-hipotesis-validacion.md (venta en frío a directivos de sostenibilidad).