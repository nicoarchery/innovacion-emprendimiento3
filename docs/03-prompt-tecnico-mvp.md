
# PROMPT TÉCNICO: Implementación de Landing Page para Validación de Mercado (Smoke Test)

## 1. Contexto del Proyecto y Objetivo Técnico

Este proyecto consiste en desarrollar una **Landing Page de Validación (Smoke Test)** orientada a probar dos hipótesis clave de mercado:

1. **Hipótesis H2 (Lado Ciudadano):** Medir el interés comunitario por consultar y verificar proyectos de infraestructura/ESG en su municipio.
2. **Hipótesis H7/H9 (Lado B2B Empresarial):** Medir la intención de captación de leads de directivos de sostenibilidad mediante la descarga de un "Informe de Benchmarking Territorial 2026".

La aplicación debe ser ultra-rápida, completamente responsiva, SEO-friendly y estar instrumentada con eventos de analítica (Meta Pixel / GA4) para registrar conversiones de ambos segmentos de usuarios.

---

## 2. Stack Tecnológico Requerido

- **Framework:** Next.js 14+ (App Router, TypeScript).
- **Estilos:** Tailwind CSS + Lucide React (Iconos).
- **Componentes UI:** Shadcn UI (Dialog, Button, Input, Card, Tabs, Toast).
- **Mapas (Mock Interactivo):** `leaflet` + `react-leaflet` (o componentes mock SVG/Mapbox con datos sintéticos georreferenciados en Colombia).
- **Analítica:** Script Head para Meta Pixel (`fbq`) y Google Analytics 4 (`gtag`).

---

## 3. Estructura de Componentes y Páginas

src/
├── app/
│   ├── layout.tsx             # Layout global con scripts de Meta Pixel
│   ├── page.tsx               # Página principal (Landing Page)
│   └── api/
│       ├── lead-b2b/route.ts   # Endpoint para captura de leads B2B
│       └── lead-citizen/route.ts # Endpoint para registro de alertas ciudadanas
├── components/
│   ├── HeroSection.tsx        # Propuesta de valor + navegación por roles
│   ├── MapPreviewSection.tsx  # Mapa interactivo de obras (Hipótesis H2)
│   ├── B2bLeadMagnet.tsx      # Mapeo comparativo + Formulario PDF (Hipótesis H7/H9)
│   ├── VerificationSection.tsx# Explicación de motor de brechas SECOP II + Campo
│   ├── AnalyticsTracker.ts    # Helper para disparar eventos de Meta Pixel
│   └── ui/                    # Componentes Shadcn UI



---
## 4. Especificaciones Detalladas por Sección

### A. Layout Global (`app/layout.tsx`)
- Incluir soporte para variables de entorno `NEXT_PUBLIC_META_PIXEL_ID`.
- Inyectar el script de Meta Pixel en `<head>` para rastrear `PageView`.

### B. Hero Section (`components/HeroSection.tsx`)
- **Titular Principal:** *"La plataforma de inteligencia territorial que conecta la inversión corporativa con la realidad de las comunidades en Colombia."*
- **Subtitular:** *"Transparencia verificada entre datos de SECOP II, reportes ESG y evidencias en campo."*
- **Dual CTA:**
  - Botón Primario (Ciudadanos): *"Explorar Mapa de Obras en mi Municipio"* $\rightarrow$ Scroll suave a `#mapa-ciudadano`.
  - Botón Secundario (Empresas): *"Solicitar Reporte Competitivo ESG"* $\rightarrow$ Scroll suave a `#lead-b2b`.

### C. Módulo Mapa de Obras - Lado Ciudadano (`components/MapPreviewSection.tsx`)
- **Propósito:** Validar Hipótesis H2.
- **Funcionalidad:**
  - Buscador/Selector de Municipio (Pre-cargado con municipios clave: Cali, Puerto Gaitán, Montelíbano, Yumbo, Cartagena).
  - Mapa interactivo mostrando 5-8 pines de proyectos simulados (ej. *"Placa Huella Vía Rural"*, *"Centro de Salud Comunitario"*).
  - Al hacer clic en un pin, desplegar Modal / Drawer con detalles:
    - Estado de Ejecución SECOP II vs. Evidencia Física en Campo.
    - Botón de Acción: *"¿Vives cerca? Recibir alertas sobre esta obra"*.
  - **Formulario de Registro Ciudadano:**
    - Campo: Correo electrónico o WhatsApp.
    - Campo: Municipio de interés.
    - Evento de Analítica: Disparar `fbq('track', 'CompleteRegistration', { content_name: 'Alerts_Citizen' })`.

### D. Módulo Lead Magnet B2B - Lado Corporativo (`components/B2bLeadMagnet.tsx`)
- **Propósito:** Validar Hipótesis H7 y H9.
- **Funcionalidad:**
  - Visualización previa de una gráfica de *Benchmarking Sectorial* (ejemplo comparativo anónimo de inversión social entre 3 empresas del sector energético).
  - **Formulario de Captura (Lead Magnet):**
    - Campos obligatorios: Nombre completo, Correo corporativo, Nombre de la Empresa, Cargo (Dropdown: Gerente Sostenibilidad, Director Asuntos Corporativos, Consultor ESG, Otro), Sector industrial.
    - Botón de Envío: *"Descargar Informe de Transparencia e Impacto Territorial 2026 (PDF)"*.
  - **Lógica al enviar:**
    - Disparar evento Meta Pixel: `fbq('track', 'Lead', { content_category: 'B2B_Report_Download' })`.
    - Mostrar mensaje de confirmación / Descarga simulada del PDF de prueba.

### E. Módulo de Verificación e Integración (`components/VerificationSection.tsx`)
- **Propósito:** Explicar el diferencial tecnológico (SODA API SECOP II + Fotos Georreferenciadas Offline + Veedurías).
- Infografía paso a paso estructurada mediante cards:
  1. *Ingesta Pública (SECOP II)*
  2. *Auditoría Territorial (App Offline)*
  3. *Motor de Brecha (Gap Analysis)*.
---
## 5. Endpoints de API (Backend Mínimo)

Crea handlers en `app/api/` para registrar los envíos en una base de datos temporal (Supabase, Firebase o un archivo JSON local durante el test):

```typescript
// app/api/lead-b2b/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = await request.json();
  const { name, email, company, role, sector } = body;

  // Validar correo corporativo (rechazar dominios genéricos como gmail.com si aplica)
  if (!email || !company) {

    return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 });
  }

  // Guardar lead en base de datos / webhook / consola
  console.log('[LEAD B2B CAPTURADO]:', { name, email, company, role, sector, timestamp: new Date() });

  return NextResponse.json({ success: true, message: 'Lead registrado exitosamente' });
}





6. Requerimientos de Diseño y UX
Paleta de Colores: Verdes sostenibles (Emerald-700/800), Azules corporativos (Slate-900, Indigo-900), Fondos limpios (Slate-50).

Tipografía: Inter o Plus Jakarta Sans.

Performance: Carga inicial bajo 1.5s, imágenes optimizadas con next/image.

Mobile First: El 80% del tráfico proveniente de Meta Ads será desde dispositivos móviles. Asegurar que los modals, mapas y formularios funcionen perfectamente en pantallas pequeñas.
```
