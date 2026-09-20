---
domain: hipotesis
status: HYPOTHESIS
confidence: MEDIUM
authority: documented-decision
last_verified: 2026-09-20
sources:
- "docs/04-hipotesis-validacion.md"
- "docs/01-contexto-y-recursos.md"
- "docs/archive/modelos_monetizado.md"
- "docs/archive/sustento.md"
- "docs/03-prompt-tecnico-mvp.md"
---

# 12 — Hipótesis y validación

## Hipótesis del proyecto (doc `04`)

Documento `docs/04-hipotesis-validacion.md` lista hipótesis de producto/mercado (prob. numeradas). Sobre ellas:

- **Estado**: la mayor parte sigue siendo **hipótesis no validadas con datos propios** (el código actual es prototipo).
- Lo único "validado" en el producto es **técnico**: que SECOP II se puede ingestar y geocodificar para Cali (specs `012`,`013`,`014`,`017` completas y funcionales).

## Qué se validó TÉCNICAMENTE (evidencia de código/DB)

- Se pueden extraer obras de Cali desde SECOP II (fetch real → SQLite).
- Se puede clasificar contratos como "obra" (`clasificador.ts`).
- Se puede geocodificar direcciones en Cali y asignar barrio/comuna (146 de 1434 obras `resuelta`; pipeline v1+v2). Ver `06` para los números vigentes.
- El mapa interactivo carga y filtra (specs 015; rutas API live).

## Hipótesis DE MERCADO/NEGOCIO (pendientes)

Según `docs/01-contexto-y-recursos.md`, `docs/archive/sustento.md`, `docs/archive/modelos_monetizado.md`:
- Empresas pagan por licencia social / ESG (B2B) — **sin evidencia de tracción**.
- Verificación ciudadana aporta valor de transparencia — **sin datos de uso**.
- Gap financiero-vs-campo con alertas (suma de `sustento`/`005`) — **no medido**.

## Diseño de experimentos (docs y specs)

- `docs` mencionan experimentos de validación temprana (encuestas/entrevistas, ver doc 04).
- specs `003`–`009` plantean MVR por segmento (PDET, campo, comunidad, ESG/ART, perfil empresa, ANLA).

## Conclusión operativa

No hay **validación de mercado** publicada con resultados → tratar todo lo de negocio como HYPOTHESIS (ver `00`/`01`). No afirmar que el producto "tiene clientes" con base en docs.