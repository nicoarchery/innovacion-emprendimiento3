
# Estrategia de Validación (Smoke Test) con Meta Ads

## Estrategia 1: Validar el Lado Ciudadano (Hipótesis H2)

Es el camino más directo, económico y fácil de ajustar al marco académico. El cliente B2B solo pagará si sabe que la comunidad realmente va a usar la plataforma.

**Objetivo**: medir el tráfico e interés de ciudadanos y líderes comunitarios por consultar las obras de su municipio.

**Segmentación en Meta Ads**: segmentación geográfica hiper-focalizada en 2 o 3 municipios con alta presencia de proyectos (ej. Puerto Gaitán, Montelíbano, Yumbo o zonas PDET/ZOMAC).

### El Anuncio (Creative)

- **Imagen/Video**: un mapa con pines sobre su municipio.
- **Copy**: "¿Sabes en qué se están invirtiendo los fondos de infraestructura y desarrollo social en [Nombre del Municipio]? Consulta el mapa abierto de proyectos verificados."
- **Acción requerida (Conversion Event)**: el anuncio lleva a una Landing Page básica con un mapa interactivo (o prototipo de Figma embed) y un botón: "Notificarme cuando se actualice una obra en mi barrio" (pide correo o WhatsApp).

**Métrica clave**: CTR (> 2.5%), costo por clic (CPC) y tasa de registro/conversión en la landing page (> 10%).

---

## Estrategia 2: Validar el Lado B2B / Decisiones de Compra (Hipótesis H7 y H9)

Aunque LinkedIn Ads es el canal natural B2B, Meta Ads funciona para capturar la atención de directivos fuera de su horario laboral si usas el gancho correcto (Lead Magnet).

**Objetivo**: probar la intención de compra o curiosidad de gerentes de sostenibilidad, ESG y asuntos corporativos.

**Segmentación en Meta Ads**:

- **Intereses**: Responsabilidad Social Empresarial, Sostenibilidad, Criterios ESG, GRI (Global Reporting Initiative), Normas ISO 14001.
- **Cargos/Títulos (Job Titles)**: Gerente de Sostenibilidad, Director de Asuntos Corporativos, Jefe de RSE, Consultor ESG.

### El Anuncio (Creative)

- **Imagen**: un gráfico tipo Benchmarking que compara a 3 grandes empresas del sector energético o minero en Colombia.
- **Copy**: "Descarga el Informe de Transparencia e Impacto Territorial 2026: Descubre cómo se comparan las inversiones sociales de tu sector en Colombia. [Descargar PDF Gratuito]."
- **Acción requerida**: formulario de clientes potenciales de Meta (Instant Form) o Landing Page con formulario donde deban ingresar: Nombre, Empresa, Cargo y Correo corporativo para recibir el informe.

**Métrica clave**: tasa de conversión de formulario y Costo por Lead B2B (CPL). Si los directivos dejan sus datos reales, validas que el dolor y el incentivo competitivo son reales.

---

---

## Experimentos Complementarios de Validación

> 1. **Venta en Frío con MVP "Espejo" (Lado B2B):** Mapear manualmente 3 proyectos reales de una empresa de infraestructura/energía (ej. Enel o Ecopetrol en Meta) consumiendo datos de SECOP II y ANLA. Presentar este dashboard pre-armado al Director de Sostenibilidad para medir su disposición de pago real antes de desarrollar la automatización.
> 2. **Prototipar Protocolo de Resolución de Disputas (Lado Gobernanza):** Evaluar con 2 veedurías y 1 empresa piloto la aceptación de las reglas de moderación (alertas de paralización requiriendo mínimo 3 reportes o revisión neutra) para validar que no ahuyenten a las empresas ni desincentiven a los ciudadanos.

---

## Mapeo de la Campaña para la Universidad

| Elemento del Experimento | Configuración para tu Proyecto |
| :--- | :--- |
| **Público Objetivo A (H2)** | Residentes de municipios objetivo + Intereses en Veeduría, Noticias Locales, Liderazgo Comunitario. |
| **Público Objetivo B (H7/H9)** | Profesionales en Colombia + Intereses en ESG, Sostenibilidad, Desarrollo Sostenible, Normas ISO. |
| **Experimento Directo (B2B)** | Presentación de MVP "Espejo" a directivos de sostenibilidad (Venta en frío). |
| **Presupuesto Mínimo** | $5 a $10 USD diarios durante 5 a 7 días. |
| **Landing Page / Destino** | Página construida en Next.js (Smoke Test) conectada a Google Analytics / Meta Pixel. |
| **Criterio de Éxito** | Ciudadanos: +500 clics y +50 registros en la zona. B2B: +5 leads calificados con correo corporativo real y 2 reuniones agendadas con MVP Espejo. |

---

## Argumento para Defenderlo ante tu Profesor

> "A diferencia de un e-commerce B2C que busca la venta directa de un producto físico, en una plataforma B2B/B2G de impacto territorial utilizamos Meta Ads como un Smoke Test de Doble Vía: por un lado medimos el costo de adquisición de tráfico comunitario (demanda de información) mediante geofencing, y por el otro evaluamos la tasa de conversión de leads B2B mediante la descarga de informes de benchmarking sectorial y la validación en frío de un MVP Espejo pre-armado."
