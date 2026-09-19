# Obras a la Vista · Consulta ciudadana de obra pública en Cali

> Prototipo en validación: consultas contratos de obra desde SECOP II en un mapa, confirmas el avance en terreno y otorgas reconocimiento público a las entidades que cumplen.

---

## 📂 Estructura del Repositorio

```text
├── .lean-spec/       # Configuración y plantillas del framework LeanSpec
├── docs/             # Documentación estratégica y análisis de negocio
│   ├── 01-contexto-y-recursos.md       # Inventario de fuentes de datos, tecnología y red humana
│   ├── 02-estrategia-arquitectura.md   # Modelo B2B/B2C, LSO, dolores y arquitectura macro
│   ├── 03-prompt-tecnico-mvp.md        # Especificaciones del smoke test (landing de validación)
│   ├── 04-hipotesis-validacion.md      # Hipótesis H2 (ciudadana) y H7/H9 (empresarial)
│   └── archive/                        # Sesiones previas y borradores históricos
├── specs/            # Especificaciones modulares y vivas de LeanSpec (< 2.000 tokens c/u)
│   └── 001-secop-ingestion/            # Ingesta y normalización de contratos SECOP II
├── src/              # Código fuente del MVP Frontend (Next.js 16 App Router)
│   ├── app/          # Rutas, API endpoints de leads y layout global
│   ├── components/   # Componentes modulares UI (Hero, Mapa Colombia, B2B Magnet, etc.)
│   └── lib/          # Utilidades, tracking y lógica de cliente
├── AGENTS.md         # Reglas y protocolo de trabajo para agentes de IA
└── package.json      # Dependencias del proyecto
```

---

## 🚀 Inicio Rápido (Frontend MVP)

```bash
# Instalar dependencias
bun install

# Iniciar servidor de desarrollo
bun run dev

# Compilar para producción
bun run build
```

---

## ⚡ Metodología Spec-Driven Development (LeanSpec)

Este proyecto utiliza **LeanSpec** para gobernar el desarrollo agéntico con IA garantizando **Economía de Contexto**:

```bash
# Ver el tablero del proyecto
npx lean-spec board

# Crear una nueva especificación modular
npx lean-spec create <nombre> --title "<Título>" --template spec-template

# Auditar calidad y conformidad de las specs
npx lean-spec validate

# Abrir el panel visual interactivo en el navegador
npx lean-spec ui
```