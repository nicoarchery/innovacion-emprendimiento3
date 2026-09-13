<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Metodología de Desarrollo: LeanSpec (Spec-Driven Development)

Este proyecto utiliza **LeanSpec** para optimizar el consumo de contexto (tokens) y asegurar la precisión arquitectónica en el desarrollo asistido por IA.

## 🚨 Reglas Críticas para Agentes de IA

1. **Descubrimiento obligatorio antes de cualquier tarea:**
   - Antes de escribir código o planificar nuevas tareas, consulta el tablero: `npx lean-spec board`.
   - Busca especificaciones existentes relacionadas: `npx lean-spec search "<palabra_clave>"`.
2. **Economía de Contexto (< 2,000 tokens por spec):**
   - Mantén cada archivo de spec conciso, de alta densidad informativa (sintaxis EARS, interfaces I/O exactas, modelos tipados).
   - Verifica el tamaño con: `npx lean-spec tokens <spec-path>`.
   - Si una funcionalidad crece demasiado (>3,500 tokens), divídela en sub-specs dependientes (`--depends-on`).
3. **Creación de Specs estandarizada:**
   - No crees archivos Markdown de especificación manualmente.
   - Usa el comando: `npx lean-spec create <nombre> --title "<Título>" --template spec-template`.
4. **Transición de Estados durante el Trabajo:**
   - Antes de iniciar la codificación: `npx lean-spec update <id> --status in-progress`.
   - Tras completar código, tests y documentación: `npx lean-spec update <id> --status complete`.
5. **Validación de Calidad:**
   - Antes de finalizar cualquier sesión o commit, valida la integridad: `npx lean-spec validate`.
