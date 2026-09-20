
# **Documento de Contexto y Recursos: Plataforma de Trazabilidad de Impacto RSC**

**Proyecto de Innovación 3**
Este documento consolida el contexto fundacional del proyecto y el inventario exhaustivo de recursos requeridos para su desarrollo. Se omite deliberadamente la arquitectura de implementación para enfocar el análisis en la disponibilidad, viabilidad y orquestación de los activos necesarios.

## **1\. Contexto Estratégico del Proyecto**

Las empresas e instituciones en Colombia invierten sumas significativas en proyectos de infraestructura e impacto social, enfrentando tres fallas estructurales: fragmentación de la información, baja verificabilidad externa e invisibilidad territorial. La solución propuesta es una plataforma B2B/B2C que permite a las empresas mostrar su impacto verificado, geolocalizado y comparable, fortaleciendo su reputación ante inversionistas, reguladores (estándares ISSB/GRI) y comunidades locales.

## **2\. Clientes B2B Objetivo y Obras Representativas en Colombia**

Para la tracción inicial de la plataforma, se priorizan empresas con alta inserción territorial y proyectos de infraestructura/desarrollo social con impacto directo en comunidades:

| Empresa (Sector) | Proyecto / Obra Específica | Foco de Visibilidad (RSC/ESG) |
| :--- | :--- | :--- |
| **Enel Colombia** (Energía) | Parque Solar Guayepo I y II (Atlántico) | Contratación de mano de obra local, compensación forestal, electrificación rural. |
| **Odinsa / Grupo Argos** (Infraestructura) | Concesión Pacífico 2 y 3 (Antioquia/Eje Cafetero) | Proyectos productivos para comunidades aledañas, reforestación de cuencas, mitigación de ruido. |
| **Cerrejón** (Minería) | Rehabilitación de sistemas de agua (La Guajira) | Entrega de microacueductos y mantenimiento de molinos de viento para comunidades Wayuu. |
| **Celsia** (Energía) | Programa ReverdeC y Granjas Solares (Tolima/Valle) | Restauración ecológica de cuencas hidrográficas y siembra masiva de árboles. |
| **Ecopetrol** (Hidrocarburos) | Obras por Impuestos: Vías y Acueductos (Meta/Casanare) | Pavimentación de vías terciarias y dotación de escuelas públicas en zonas PDET (ej. Vía Guamal, Meta - BPIN). |
| **Promigas** (Infraestructura de Gas) | Conexiones rurales de gas natural (Caribe) | Transición energética en hogares de estrato 1 y 2, sustitución de cocción con leña. |

## **3\. Recursos de Datos e Información Pública**

El núcleo de la plataforma depende de la disponibilidad y acceso a fuentes de datos gubernamentales y corporativas.

| Fuente de Datos | Naturaleza del Recurso | Propósito en el Proyecto |
| :--- | :--- | :--- |
| **SECOP II (SODA API)** | API Pública REST (`6qex-kahp.json` Contratos, `p6dx-8zbt.json` Procesos) en datos.gov.co | Extracción automatizada de contratos, presupuestos, contratistas y cronogramas oficiales de Obras por Impuestos y proyectos públicos. |
| **SIIPO (DNP)** | Sistema de Información de Intervención Pública | Seguimiento presupuestal y de avance en inversión pública y regalías. |
| **SIT / ART** | Visores Geoespaciales / Fichas PDET (GeoJSON) | Delimitación de polígonos territoriales, coordenadas por BPIN y validación de beneficiarios en municipios PDET. |
| **VITAL (ANLA)** | Ventanilla Integral de Trámites Ambientales | Web scraping / extracción de resoluciones de licenciamiento y compensación ecológica. |
| **Sistemas ERP Corporativos** | APIs Privadas / Webhooks (SAP, Odoo) | Ingesta de datos financieros y avance de obra reportado internamente por la empresa. |

## **4\. Recursos Tecnológicos y Herramientas**

Para materializar la propuesta de valor sin entrar en la arquitectura de software, se requieren los siguientes recursos tecnológicos, alineados con la eficiencia y el escalamiento.

> * **Infraestructura de Ingesta y Automatización:** Plataformas de integración corporativa (flujos tipo *Make* / Webhooks) para conectar los datos de las empresas, procesar eventos y orquestar flujos de trabajo de manera ágil.
> * **Recursos de Almacenamiento:** *Buckets* de almacenamiento en la nube (ej. Google Cloud Storage) para alojar evidencia gráfica de las obras, metadatos EXIF espaciales y documentos extraídos del gobierno.
> * **Frameworks de Interfaz Ciudadana:** Entornos de desarrollo para aplicaciones móviles orientadas a entornos rurales o de baja conectividad (enfoque *local-first*) para la validación comunitaria, con captura de evidencia y reportes directos en la plataforma.
> * **Herramientas de Procesamiento de Datos:** Motores de *web scraping* (Selenium/Playwright), OCR para lectura de actas físicas y modelos de procesamiento de lenguaje/audio para interpretar reportes comunitarios.
> * **Entornos de Desarrollo:** Estaciones de trabajo ágiles basadas en distribuciones Linux para el equipo técnico.

## **5\. Recursos Humanos y de Capital Social (El "Moat")**

La ventaja competitiva no reside únicamente en el código, sino en la red humana de verificación y relaciones territoriales.

| Rol / Actor | Aporte Estratégico |
| :--- | :--- |
| **Veedurías Ciudadanas y JAC** | Son el motor de verificación en terreno. Proveen fotografías, reportes de paralización y validación del impacto real de la infraestructura. |
| **Directores de Sostenibilidad (RSC/ESG)** | Validan el encaje producto-mercado, proveen acceso a datos corporativos y son los clientes principales del servicio. |
| **Equipo de Ingeniería y Datos** | Encargados de limpiar, normalizar y cruzar los datos abiertos del gobierno con las métricas corporativas. |
| **Gestores Territoriales o Aliados** | Personal o aliados (ej. universidades regionales) encargados de establecer los canales de confianza iniciales con las comunidades. |

## **6\. Recursos Operativos y Financieros**

Para ejecutar las fases iniciales de validación (MVP) y escalamiento, se deben asegurar los siguientes activos:

> 1. **Presupuesto de Infraestructura Cloud:** Cubrimiento de costos de consumo de APIs comerciales (geocodificación, almacenamiento), alojamiento de bases de datos y almacenamiento masivo de evidencia visual.
> 2. **Estrategia MVP "Espejo" (Venta en frío):** Mapeo manual pre-armado de 3 proyectos reales de una empresa objetivo utilizando datos públicos fragmentados (SECOP II, ANLA), presentado al Director de Sostenibilidad para demostrar el valor de la automatización.
> 3. **Credenciales y Tokens de Acceso:** Aprobación de cuentas de desarrollador (App Tokens `X-App-Token`) en el portal de Datos Abiertos de Colombia para escalar las peticiones a la API de SECOP sin bloqueos por *rate limiting*.
