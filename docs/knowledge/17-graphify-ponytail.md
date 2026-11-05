---
domain: herramientas-conocimiento-asistente
status: CURRENT
confidence: VERY HIGH
authority: implementation
last_verified: 2026-11-04
sources:
- "github: https://github.com/colbymchenry/codegraph (README, instalado vía install.sh del repo)"
- "codegraph CLI v1.6.2 (linux-x64), instalado en /home/maro/.local/bin/codegraph"
- "proyecto indexado: .codegraph/codegraph.db — 66 files, 1,046 nodes, 2,061 edges, 235ms"
- "npm: @dietrichgebert/ponytail@5.3.3 (Dietrich Gebert), opencode-plugin válido, registrado en opencode.json"
- "npm uninstall -g graphify-opencode@1.1.1 (desinstalado)"
- "npm uninstall -g codegraph@1.0.0 (paquete npm roto, desinstalado tras fallar MODULE_NOT_FOUND)"
---

# 17 — Herramientas de asistente de código / conocimiento (codegraph, ponytail)

## Contexto

El usuario pidió instalar y usar **codegraph** (https://github.com/colbymchenry/codegraph) siguiendo las instrucciones del README del repo (no el paquete npm), y revisar a qué se refería con **ponytail** (https://github.com/dietrichgebert/ponytail). Se documenta el resultado real de instalación y uso en este proyecto.

## codegraph — instalado y USABLE (vía install.sh del README, no npm)

### Qué es

Herramienta 100% local que convierte codebases en un grafo de conocimiento consultable (símbolos, aristas, archivos, búsqueda full-text FTS5 en SQLite). Kernel en Rust, soporta 20+ lenguajes, framework-aware (incluye Next.js App Router y Pages Router), auto-sync en cambios de archivo, un solo MCP tool `codegraph_explore`.

### Estado de instalación y uso en este proyecto

- **Desinstalado el paquete npm roto**: `npm uninstall -g codegraph@1.0.0` (el paquete npm `codegraph` solo traía `package.json` sin `dist` ni `bin` → MODULE_NOT_FOUND).
- **Instalado vía install.sh del README** (la forma correcta según el repo): `curl -fsSL https://raw.githubusercontent.com/colbymchenry/codegraph/main/install.sh | sh`
  - Versión: **CodeGraph v1.6.2 (linux-x64)**
  - Instalado en: `/home/maro/.codegraph/versions/v1.6.2`
  - Linked: `/home/maro/.local/bin/codegraph`
- **Wire up con OpenCode**: `codegraph install --yes` — configuró el MCP server `codegraph` para opencode (y otros agentes detectados).
- **Índice del proyecto**: `codegraph init` en este repo → **OK**:
  - 66 files indexados
  - 1,046 nodes, 2,061 edges en 235ms
  - Base de datos local: `.codegraph/codegraph.db` (2.4 MB)
  - Auto-sync activo (watcher nativo, debounce 2s)

### Comprobación de uso real

Se ejecutó `codegraph explore "B2bLeadMagnet lead form"` y devolvió:
- 19 símbolos en 4 archivos, con call paths y blast radius
- Source verbatim y line-numbered de `src/components/B2bLeadMagnet.tsx`
- Ejemplo de blast radius: `B2bLeadMagnet` (2 callers en `src/app/page.tsx`), `formatCOP` (8 callers en 4 componentes de mapa/secop)

**Conclusión**: codegraph SÍ se instaló y SÍ se usó contra este proyecto siguiendo las instrucciones del README del repo. El índice está disponible para esta sesión y se mantiene actualizado con auto-sync.

### Cómo usarlo en este proyecto

- CLI: `codegraph explore "<símbolos o pregunta>"` (desde la raíz del proyecto, usa `.codegraph/` automáticamente)
- MCP tool (quando disponible en el agente): `codegraph_explore` con `projectPath` apuntando a este repo
- Re-indexar tras cambios: automático (auto-sync); forzar con `codegraph sync` o `codegraph index`

## ponytail — de Dietrich Gebert (https://github.com/dietrichgebert/ponytail)

### Qué es

**NO es** la herramienta "mantenimiento de múltiples sitios" del paquete `ponytail` de zhabinsky (confusión por nombre similar).

El ponytail de Dietrich Gebert es un **skill / opencode-plugin de asistente de código**: modo "lazy senior dev". Principio: el mejor código es el código que no se escribe. Resuelve el problema con el menor código nuevo posible (YAGNI, stdlib y nativos antes que dependencias nuevas, una abstracción menos, el diff más corto que funcione). Trae 6 skills:
- `ponytail` — modo lazy mínimo-código.
- `ponytail-review` — review de calidad de un diff.
- `ponytail-audit` — auditoría de todo el repo (qué borrar/simplificar).
- `ponytail-debt` — ledger de atajos/comentarios `shortcut:`.
- `ponytail-gain` — scoreboard de impacto medido.
- `ponytail-help` — referencia rápida de niveles y comandos.

Niveles: `lite`, `full` (default), `ultra`. Comando: `/ponytail [lite|full|ultra|off]`.

### Estado de instalación y uso en este proyecto

- **Instalado globalmente**: `npm install -g @dietrichgebert/ponytail@5.3.3` (OK).
- **Tipo**: `opencode-plugin` (keywords incluyen `opencode-plugin`, `opencode`). Expone `./.opencode/plugins/ponytail.mjs`.
- **Aplicable a este proyecto**: **SÍ**. Es un plugin OpenCode, directamente usable como asistente de código sobre este repo Next.js.
- **Configuración**: registrado en `opencode.json` (`"plugins": ["@dietrichgebert/ponytail@5.3.3"]`), reemplazando la entrada previa de `graphify-opencode`.

### Nivel activo

Ponytail está activo en modo **full** (default) para esta sesión, hasta que el usuario diga `stop ponytail` o `normal mode`, o cambie con `/ponytail lite|ultra|off`.

## graphify-opencode — desinstalado

Se desinstaló con `npm uninstall -g graphify-opencode`. Su entrada se removió de `opencode.json`. No se usó (requería cuenta Graphify + OAuth y no se tenía).

## Resumen de decisión

| Herramienta | Estado | ¿Usable en este proyecto? |
|-------------|--------|---------------------------|
| `codegraph` | Instalado vía install.sh del README; proyecto indexado | **Sí** — `codegraph explore` / `codegraph_explore` funcionando |
| `@dietrichgebert/ponytail` | Instalado, plugin válido, en opencode.json | **Sí** — opencode-plugin, asistente lazy/YAGNI (`/ponytail`) |
| `graphify-opencode` | Desinstalado | No (requería cuenta Graphify) |

## Referencia cruzada KB

- Ver `00-index.md` (dominio 17), `99-source-registry.md` (fuentes npm/README), `13-decisiones-y-convenciones.md` (patrones de herramientas del repo), `.opencode/skills/obra-visible-context/SKILL.md` (sección herramientas evaluadas).
