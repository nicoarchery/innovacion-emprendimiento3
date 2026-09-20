---
domain: skill-reference
status: CURRENT
confidence: VERY HIGH
authority: skill
last_verified: 2026-09-20
---

# Reference: Autoridad de fuentes y cómo resolver conflictos

## Jerarquía de autoridad (de mayor a menor)

1. **Implementación**: código en `src/**` (comportamiento real).
2. **Configuración/datos reales**: `data/mapa.db`, `package.json`, `.gitignore`, `opencode.json`, variables env.
3. **Spec actual `complete`** (especificación vigente del comportamiento).
4. **Decisión documentada**: `AGENTS.md`, `README.md`.
5. **Documentación general**: `docs/*.md` (contexto, estrategia, hipótesis).
6. **Roadmap**: specs con status `planned` (`003`-`009`).
7. **Hipótesis**: `docs/archive/*` (monetización, sustento).
8. **Histórico**: commits, docs de sesiones, SPEC_SECOP antiguo, `docs/archive` deprecated.

## Cómo resolver un conflicto de fuentes

- Si código ≠ spec `complete` → **el código manda** (implementación real; la spec puede estar desactualizada si no fue validada).
- Si spec `complete` ≠ doc general → manda la spec (es más específica y reciente).
- Si spec `planned` describe algo que NO está en código → es **roadmap**, no hecho.
- Si doc/archive describe modelo de negocio sin código → es **hipótesis**, tratarla como tal.

## Dónde está documentado

`docs/knowledge/99-source-registry.md` tabla por fuente con `confianza` y `autoridad`. Úsala para citar la referencia correcta.

## Regla operativa

Siempre que cites un dato, di de dónde viene con su autoridad (p.ej. "según `src/lib/mapa/config` [implementation]" vs. "según `docs/02` [documented-decision]").