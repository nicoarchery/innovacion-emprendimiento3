---
domain: skill-reference
status: CURRENT
confidence: VERY HIGH
authority: skill
last_verified: 2026-09-20
---

# Reference: Protocolo de contexto (Minimum Relevant Context)

Regla de oro: cargar **solo lo mínimo necesario** para la tarea, no toda la KB.

## Flujo de decisión

1. Leer `docs/knowledge/00-index.md` (siempre, es corto).
2. Identificar dominio(s) tocados por la tarea.
3. Leer SOLO esos archivos de dominio (12 candidatos: `01`…`12`, más `13` si es trabajo de código y `14` si hay términos).
4. Si la tarea toca datos del mapa/cifras → además `06-base-de-datos-sqlite.md` y re-consultar DB.
5. Si la tarea toca especificaciones → `11-roadmap-y-specs.md` y, de ser necesario, el `specs/<id>/README.md` concreto.

## Orden de carga sugerido por tipo de tarea

| Tarea | Documentos |
|-------|-----------|
| "¿Qué existe? / vista general" | `README`, `00`, `01`, `03` |
| Cambiar UI (mapa/explorador/landing) | `03`, `08`, `10` |
| Cambiar APIs | `09`, `06` |
| Cambiar sincronización/ingesta | `05`, `06`, `07` |
| Planificar/priorizar | `11`, `02`, `12` |
| Preguntas de negocio/mercado | `02`, `12`, `10` |

## Qué NO hacer

- No leer `docs/knowledge/` completo por cada pregunta.
- No usar specs `planned` como especificación de lo existente.
- No citar counts de DB sin fecha de verificación.