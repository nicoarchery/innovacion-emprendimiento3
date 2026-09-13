# 1. Organización del Proyecto Realizada

  Se eliminaron archivos duplicados y se centralizó toda la documentación estratégica y de producto dentro del directorio docs:

    ├── .lean-spec/                         # Configuración y plantilla canónica de LeanSpec
    │   ├── config.json
    │   └── templates/spec-template.md
    ├── docs/                               # 📚 Documentación de Negocio y Producto
    │   ├── 01-contexto-y-recursos.md       # Fuentes de datos (SECOP, PDET, ANLA), tecnología y red humana
    │   ├── 02-estrategia-arquitectura.md   # Modelo B2B/B2C, LSO, propuesta de valor y dolores
    │   ├── 03-prompt-tecnico-mvp.md        # Especificación de la landing smoke-test
    │   ├── 04-hipotesis-validacion.md      # Hipótesis H2 (ciudadana) y H7/H9 (empresarial)
    │   └── archive/                        # 🗄️ Historial: SPEC_SECOP original y sesión previa
    ├── specs/                              # ⚡ Especificaciones Técnicas LeanSpec (< 2.000 tokens)
    │   └── 001-secop-ingestion/README.md   # Spec activa de ingesta Socrata (867 tokens ✅)
    ├── src/                                # 💻 Código fuente Next.js 16 (App Router + Tailwind v4)
    ├── AGENTS.md                           # Protocolo estricto para asistentes IA
    └── README.md                           # Índice general del proyecto actualizado
  ──────

## 2. ¿Qué es y cómo se usa el MCP de LeanSpec?

### ¿Qué es el MCP (Model Context Protocol)?

  El Model Context Protocol es un protocolo estándar abierto que permite a los asistentes de IA conectarse directamente a herramientas locales en lugar de requerir que el usuario copie y pegue archivos en el chat.

### ¿Por qué el MCP de LeanSpec ahorra tantos tokens?

  • Sin MCP: Si quieres que la IA implemente una funcionalidad, normalmente debes adjuntar documentos enormes de 20.000 a 40.000 tokens. La IA se atiborra de información, pierde foco (lost-in-the-middle) y gasta mucho dinero en tokens de entrada.
  • Con MCP de LeanSpec: La IA dispone de herramientas nativas (board, search, view, create, update, validate). En lugar de leer todo el proyecto, la IA consulta de manera autónoma únicamente lo que necesita:
      1. Si le preguntas "¿Qué tenemos pendiente de SECOP?", la IA ejecuta internamente la tool search("SECOP") o view("001").
      2. Lee únicamente los 867 tokens de esa spec específica.
      3. Trabaja sobre el código con máxima atención y precisión.

### Herramientas que expone el MCP de LeanSpec

| Herramienta MCP | Propósito                                                                          |
| --------------- | ----------------------------------------------------------------------------------- |
| board           | Muestra el estado global de avance (specs planificadas, en progreso y completadas). |
| search          | Búsqueda semántica o por palabras clave dentro de las specs existentes.           |
| view            | Carga el contenido de una spec específica en la memoria de trabajo de la IA.       |
| create          | Crea una nueva spec con la plantilla oficial y los metadatos requeridos.            |
| update          | Transiciona el estado (planned → in-progress → complete).                         |
| deps            | Consulta el árbol de dependencias (depends_on) entre módulos.                     |
| validate        | Audita que las specs cumplan con las reglas de calidad y formato.                   |
| ──────    |                                                                                     |

### Cómo configurar el MCP en tu entorno

  El servidor MCP de LeanSpec se ejecuta directamente con Bun (recomendado) o con Node/NPX:

    # Con Bun (recomendado en este proyecto):
    bunx lean-spec mcp

    # O con NPX:
    npx -y lean-spec mcp
    # o alternativamente:
    npx -y @leanspec/mcp

#### A. Para Cursor / Windsurf (en .cursor/mcp.json o configuración global de MCP)

  **Opción recomendada (Bun):**

    {
      "mcpServers": {
        "leanspec": {
          "command": "bunx",
          "args": ["lean-spec", "mcp"],
          "cwd": "/home/maro/Drive/INN3/innovacion-emprendimiento3"
        }
      }
    }

  **Opción alternativa (NPX):**

    {
      "mcpServers": {
        "leanspec": {
          "command": "npx",
          "args": ["-y", "lean-spec", "mcp"],
          "cwd": "/home/maro/Drive/INN3/innovacion-emprendimiento3"
        }
      }
    }

#### B. Para Claude Desktop (~/.config/Claude/claude_desktop_config.json)

  **Opción recomendada (Bun):**

    {
      "mcpServers": {
        "leanspec": {
          "command": "bunx",
          "args": ["lean-spec", "mcp"],
          "cwd": "/home/maro/Drive/INN3/innovacion-emprendimiento3"
        }
      }
    }

  **Opción alternativa (NPX):**

    {
      "mcpServers": {
        "leanspec": {
          "command": "npx",
          "args": ["-y", "lean-spec", "mcp"],
          "cwd": "/home/maro/Drive/INN3/innovacion-emprendimiento3"
        }
      }
    }

#### C. Para VS Code (GitHub Copilot Chat con soporte MCP)

  En tu .vscode/settings.json:

  **Opción recomendada (Bun):**

    {
      "github.copilot.chat.mcp.servers": {
        "leanspec": {
          "command": "bunx",
          "args": ["lean-spec", "mcp"],
          "cwd": "${workspaceFolder}"
        }
      }
    }

  **Opción alternativa (NPX):**

    {
      "github.copilot.chat.mcp.servers": {
        "leanspec": {
          "command": "npx",
          "args": ["-y", "lean-spec", "mcp"],
          "cwd": "${workspaceFolder}"
        }
      }
    }

     
     
  #### D. Para Antigravity IDE (~/.gemini/config/mcp_config.json)
  En tu archivo global `~/.gemini/config/mcp_config.json` (o dentro de `.agents/mcp_config.json`):

  **Opción recomendada (Bun):**

    {
      "mcpServers": {
        "leanspec": {
          "command": "bunx",
          "args": ["lean-spec", "mcp"],
          "cwd": "/home/maro/Drive/INN3/innovacion-emprendimiento3"
        }
      }
    }
  **Opción alternativa (NPX):**
  
    {
      "mcpServers": {
        "leanspec": {
          "command": "npx",
          "args": ["-y", "lean-spec", "mcp"],
          "cwd": "/home/maro/Drive/INN3/innovacion-emprendimiento3"
        }
      }
    }
  │ Nota: Si estás usando Antigravity, **no es estrictamente obligatorio configurar el servidor MCP** porque el agente ya tiene permisos de ejecución de comandos (`run_command`). Puedes pedirle en el chat en lenguaje natural que consulte el tablero, actualice una spec o valide el proyecto, y el agente invocará automáticamente `bunx lean-spec ...`. No obstante, configurar el MCP añade las tools formalmente en la barra de herramientas del agente.

  │ Nota: Si estás usando un asistente de IA en consola o terminal (como Antigravity o Gemini CLI) que ya tiene acceso a la ejecución de comandos bash, este puede invocar directamente los comandos CLI de lean-spec (`bunx lean-spec board`, `bunx lean-spec update`, etc.) con exactamente las mismas capacidades y sin necesidad de configurar un servidor MCP externo.
  ──────

## 3. ¿Cómo se trabaja con LeanSpec? (Metodología SDD)

  LeanSpec implementa Spec-Driven Development (Desarrollo Guiado por Especificaciones) bajo el principio de Economía de Contexto:

  ┌────────────────────────────┐   ┌────────────────────┐   ┌───────────────────────┐   ┌──────────────────────────────┐   ┌────────────────────┐
  │                            │   │                    │   │                       │   │                              │   │                    │
  │        1. Descubrir        │   │  2. Diseñar Spec   │   │     3. Implementar    │   │          4. Validar          │   │    5. Completar    │
  │                            ├──►│                    ├──►│                       ├──►│                              ├──►│                    │
  │ (lean-spec board / search) │   │ (lean-spec create) │   │ (status: in-progress) │   │ (lean-spec validate + tests) │   │ (status: complete) │
  │                            │   │                    │   │                       │   │                              │   │                    │
  └────────────────────────────┘   └────────────────────┘   └───────────────────────┘   └──────────────────────────────┘   └────────────────────┘

### ⚡ Uso Rápido con Bun (`bunx` y scripts)

  En este proyecto, donde el runtime y gestor de paquetes principal es **Bun**, utilizar `bunx` en lugar de `npx` ofrece ejecución prácticamente instantánea (en milisegundos) y sin overhead de descarga recurrente.

#### 1. Ejecución directa con `bunx` (sin instalar nada extra)
  Puedes correr cualquier comando de LeanSpec anteponiendo `bunx`:
  
    bunx lean-spec <comando>

#### 2. Instalación local como devDependency (opcional, para máxima velocidad y modo offline)
  Si deseas fijar la versión en el proyecto y habilitar atajos nativos en scripts:

    bun add -d lean-spec

  Y añadir atajos en el bloque `"scripts"` de `package.json`:

    {
      "scripts": {
        "spec:board": "lean-spec board",
        "spec:create": "lean-spec create",
        "spec:validate": "lean-spec validate",
        "spec:ui": "lean-spec ui"
      }
    }

  Permitiendo ejecutarlos simplemente con:
  
    bun run spec:board
    # o directamente:
    bun lean-spec board

#### Tabla de Equivalencias: Bun vs Node

| Acción | Con Bun (`bunx`) - Recomendado | Con Node (`npx`) |
| ---------------------------------- | ------------------------------------------------------------- | ------------------------------------------------------------- |
| Ver tablero de specs               | `bunx lean-spec board`                                        | `npx lean-spec board`                                         |
| Buscar specs por palabra clave     | `bunx lean-spec search "secop"`                               | `npx lean-spec search "secop"`                                |
| Ver detalle de una spec            | `bunx lean-spec view 001`                                     | `npx lean-spec view 001`                                      |
| Contar tokens de una spec          | `bunx lean-spec tokens specs/001-secop-ingestion/README.md`    | `npx lean-spec tokens specs/001-secop-ingestion/README.md`     |
| Crear nueva spec con plantilla     | `bunx lean-spec create modulo --title "..." --template spec-template` | `npx lean-spec create modulo --title "..." --template spec-template` |
| Asociar dependencias entre specs   | `bunx lean-spec rel add 002 --depends-on 001`                 | `npx lean-spec rel add 002 --depends-on 001`                  |
| Cambiar estado a en progreso       | `bunx lean-spec update 001 --status in-progress`              | `npx lean-spec update 001 --status in-progress`               |
| Cambiar estado a completado        | `bunx lean-spec update 001 --status complete`                 | `npx lean-spec update 001 --status complete`                  |
| Validar integridad y formato       | `bunx lean-spec validate`                                     | `npx lean-spec validate`                                      |
| Iniciar dashboard web interactivo  | `bunx lean-spec ui`                                           | `npx lean-spec ui`                                            |
| Iniciar servidor MCP               | `bunx lean-spec mcp`                                          | `npx -y lean-spec mcp`                                        |

### Reglas de Oro de LeanSpec:

1. Límite de Tokens (< 2.000 tokens):
   Cada spec debe ser concisa y específica de un módulo.
   • < 2.000 tokens: ✅ Óptimo
   • 2.000 - 3.500 tokens: ⚠️ Aceptable
   • > 3.500 tokens: 🔴 Debe dividirse en sub-specs usando dependencias.
2. Alta Densidad de Información:
   • Menos prosa, más estructura: Tablas de modelos de datos, endpoints con headers y parámetros exactos.
   • Sintaxis EARS para Reglas de Negocio:
   • Precondición: El sistema DEBE...
   • Trigger: CUANDO ocurre X, ENTONCES el sistema DEBE...
   • Conflicto: SI existe Y, ENTONCES el sistema DEBE...
   • Error: SI falla Z, ENTONCES el sistema DEBE pausar y aplicar backoff exponencial.
3. El Estado refleja el CÓDIGO, no la escritura del documento:
   • planned: La spec está diseñada y lista para ser abordada.
   • in-progress: Se coloca justo antes de empezar a programar.
   • complete: Se coloca cuando el código está escrito, los tests pasan y las casillas del checklist están marcadas.

  ──────

### Ciclo de Trabajo Paso a Paso (Ejemplo Práctico)

#### Paso 1: Descubrimiento

  Antes de pedirle a la IA "crea un worker de SECOP" o "haz la georreferenciación":

    bunx lean-spec board
    # o: npx lean-spec board

  Ves qué módulos ya están en curso o planificados para no duplicar lógica.

#### Paso 2: Crear una nueva especificación

  Supongamos que vas a definir el módulo de cruce con zonas PDET:

    bunx lean-spec create territorial-overlay --title "Cruce Territorial PDET" --template spec-template
    # o: npx lean-spec create territorial-overlay --title "Cruce Territorial PDET" --template spec-template

  Esto genera specs/002-territorial-overlay/README.md pre-configurado.
  Luego vinculas la dependencia con el módulo de SECOP:

    bunx lean-spec rel add 002-territorial-overlay --depends-on 001-secop-ingestion
    # o: npx lean-spec rel add 002-territorial-overlay --depends-on 001-secop-ingestion

#### Paso 3: Implementación con la IA

  Le pides a la IA:

  │ "Quiero implementar el módulo 001-secop-ingestion. Revisa su spec y pasa su estado a in-progress."

  La IA actualiza el estado:

    bunx lean-spec update 001-secop-ingestion --status in-progress
    # o: npx lean-spec update 001-secop-ingestion --status in-progress

  Y programa el código necesario basándose estrictamente en las reglas y modelos definidos en esa spec.

#### Paso 4: Validación de Calidad

  Antes de finalizar la tarea:

    bunx lean-spec validate
    # o: npx lean-spec validate

  Verifica que las fechas, campos obligatorios y encabezados Markdown sean válidos.

#### Paso 5: Modo Visual (Dashboard Web)

  En cualquier momento puedes ejecutar:

    bunx lean-spec ui
    # o: npx lean-spec ui

  Esto abre un panel web interactivo en tu navegador donde puedes ver el grafo de dependencias de todo tu proyecto, el porcentaje de avance y el estado de cada spec.
