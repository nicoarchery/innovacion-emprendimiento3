---
name: obra-visible-context
description: Cargar o localizar el conocimiento contextual del proyecto Obra Visible (KB en docs/knowledge/). Úsalo cuando una tarea necesite entender qué existe en el proyecto, el estado real del producto, términos, contradicciones históricas, o cuándo se requiere contexto veraz antes de escribir código o responder preguntas sobre el código.
---

# Contexto del proyecto Obra Visible

Guía para cargar y usar el conocimiento del proyecto sin leer todo el repositorio y sin caer en las contradicciones históricas.

## Cuándo usar

- Antes de implementar, refactorizar o planificar algo en este repo (obligatorio consultar primero).
- Cuando se pregunte "¿qué existe?", "¿cómo funciona X?", "¿cuál es el estado de Y?" sobre el producto, datos, mapa, SECOP, specs, hipótesis o monetización.
- Al evaluar specs planificadas (003-009) frente a lo implementado.
- Al decidir si un dato es real vs. simulado.

## Paso 1 — Localiza la KB

Los archivos viven en `docs/knowledge/`:

| Archivo | Para qué |
|---------|----------|
| `README.md` | Qué es la KB y cómo usarla |
| `00-index.md` | Mapa de dominios → cuál leer según la tarea |
| `01`…`14` | Conocimiento por dominio (ver `00-index.md`) |
| `99-source-registry.md` | Fuentes y niveles de autoridad |

## Paso 2 — Reglas de veracidad (nunca modificar)

1. **Jerarquía de autoridad**: implementación (`src/`, `data/mapa.db`) > configuración/datos reales > spec actual `complete` > decisión documentada > doc general > roadmap (specs `planned`) > hipótesis > histórico (docs/archive).
2. Los datos del **mapa** vienen de SQLite (`data/mapa.db`); el **explorador** usa datos simulados (`src/lib/secop.ts`). No los mezcles.
3. Las specs `003`–`009` (B2B/ESG/campo) son **roadmap**, no están implementadas.
4. Los leads (`/api/lead-b2b`, `/api/lead-citizen`) y la verificación ciudadana (`CitizenVerificationModal`) son **simulaciones/logs**, no persisten.
5. Los números de la DB (ej. 1434 obras, 146 resueltas) cambian con cada sync: re-consultar antes de usarlos.

## Paso 3 — Comportamiento

1. **Mínima lectura útil**: identifica el dominio en `00-index.md` y lee sólamente esos archivos (no todo `docs/knowledge/`).
2. **Evidencia primero**: ante conflicto entre fuentes, gana lo verificado en código/datos (`99-source-registry.md` marca la autoridad de cada fuente).
3. **Estado**: distingue `CURRENT` (existe hoy) de `DESIGNED`/`ROADMAP` (planes) y `HYPOTHESIS`/`HISTORICAL` (no vigente). No presentes planes como hechos.
4. **Contradicciones**: si detectas una nueva discrepancia no documentada, menciónala y actualiza el doc correspondiente con una marca `⚠ Contradicción`.
5. **No inventes**: si la KB no trae información, velo por el código antes de dar por hecho algo; marca `confidence: UNKNOWN` si no puedes verificarlo.

## Paso 4 — Salida

Cuando respondas con base en esta skill, indica la fuente como `docs/knowledge/<archivo>` (y nota la autoridad usada, p.ej. "según spec 015 vs. implementación"). Si la respuesta depende de un dato volátil (counts DB, fecha del último sync), añade "(verificado <fecha>)".

## Restricciones

- No editar `docs/knowledge/` sin motivo de actualización justificado (nueva evidencia o corrección).
- No duplicar la KB en la skill: los detalles viven en los archivos, no aquí.