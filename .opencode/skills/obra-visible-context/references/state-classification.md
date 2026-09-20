---
domain: skill-reference
status: CURRENT
confidence: VERY HIGH
authority: skill
last_verified: 2026-09-20
---

# Reference: Clasificación de estados del conocimiento

Cada documento de la KB y cada afirmación tienen un **estado** y una **confianza**. Esto evita presentar ficción como hecho.

## Estados de documentación usados

| Estado | Significado | Ejemplo en el proyecto |
|--------|-------------|------------------------|
| `CURRENT` | Existe hoy, verificado | Páginas `/mapa`, scraping SECOP real, SQLite |
| `DESIGNED` | Diseñado/decidido, no necesariamente construido | Visión de plataforma ESG (`docs/02`) |
| `ROADMAP` | Planeado, pendiente de implementación | Specs `003`–`009` |
| `HYPOTHESIS` | Supuesto no validado | Modelo monetización B2B (`docs/archive/modelos_monetizado.md`) |
| `HISTORICAL` | Fue cierto en el pasado, ya no | `docs/archive/*`, nombres previos del proyecto |
| `DEPRECATED` | Reemplazado por una versión más nueva | notación vieja, SPEC_SECOP antiguo |

## Confianza (confidence)

- `VERY HIGH`: leído directamente de código/DB.
- `HIGH`: spec `complete` + consistente con lo observado.
- `MEDIUM`: documentación/varias fuentes coinciden, sin confirmación en código.
- `LOW`: inferencia, doc único, o dato no verificado.
- `UNKNOWN`: no se pudo verificar.

## Reglas

1. Una spec `complete` NO convierte una feature en `CURRENT`; hay que verificarla en código/datos.
2. `HYPOTHESIS`/`ROADMAP` nunca se citan como hechos ("el producto tiene clientes" sin evidencia).
3. El `frontmatter` de cada doc KB expone su estado y confianza: léelos y respétalos.
4. Al actualizar la KB, actualiza también `last_verified`.