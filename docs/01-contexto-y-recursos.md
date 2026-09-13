
# **Documento de Contexto y Recursos: Plataforma de Trazabilidad de Impacto RSC**

**Proyecto de Innovación 3**
Este documento consolida el contexto fundacional del proyecto y el inventario exhaustivo de recursos requeridos para su desarrollo. Se omite deliberadamente la arquitectura de implementación para enfocar el análisis en la disponibilidad, viabilidad y orquestación de los activos necesarios.

## **1\. Contexto Estratégico del Proyecto**

Las empresas e instituciones en Colombia invierten sumas significativas en proyectos de infraestructura e impacto social, enfrentando tres fallas estructurales: fragmentación de la información, baja verificabilidad externa e invisibilidad territorial. La solución propuesta es una plataforma B2B/B2C que permite a las empresas mostrar su impacto verificado, geolocalizado y comparable, fortaleciendo su reputación ante inversionistas, reguladores (estándares ISSB/GRI) y comunidades locales.

## **2\. Recursos de Datos e Información Pública**

El núcleo de la plataforma depende de la disponibilidad y acceso a fuentes de datos gubernamentales y corporativas.

| Fuente de Datos           | Naturaleza del Recurso              | Propósito en el Proyecto                                                                                               |
| :------------------------ | :---------------------------------- | :---------------------------------------------------------------------------------------------------------------------- |
| SECOP II (Socrata API)    | API Pública (datos.gov.co)         | Extracción de contratos, presupuestos, contratistas y cronogramas oficiales de Obras por Impuestos y proyectos mixtos. |
| SIT / ART                 | Visores Geoespaciales / Fichas PDET | Delimitación de polígonos territoriales y validación de beneficiarios en zonas PDET.                                 |
| VITAL (ANLA)              | Documentos Públicos (Resoluciones) | Trazabilidad de licencias ambientales y compromisos de compensación ecológica.                                        |
| Sistemas ERP Corporativos | APIs Privadas / Webhooks            | Ingesta de datos financieros y avance de obra reportado por la empresa (ej. integración con ecosistemas ERP/gestión). |

## **3\. Recursos Tecnológicos y Herramientas**

Para materializar la propuesta de valor sin entrar en la arquitectura de software, se requieren los siguientes recursos tecnológicos, alineados con la eficiencia y el escalamiento.

> * **Infraestructura de Ingesta y Automatización:** Plataformas de integración corporativa (flujos tipo *Make*) para conectar los datos de las empresas, procesar webhooks y orquestar flujos de trabajo de manera ágil.
> * **Recursos de Almacenamiento:** *Buckets* de almacenamiento en la nube (ej. Google Cloud Storage) para alojar evidencia gráfica de las obras, metadatos EXIF espaciales y documentos extraídos del gobierno.
> * **Frameworks de Interfaz Ciudadana:** Entornos de desarrollo para aplicaciones móviles orientadas a entornos rurales o de baja conectividad (enfoque *local-first*) y herramientas de inteligencia artificial conversacional (bots de WhatsApp / Copilot Studio) para la validación comunitaria.
> * **Herramientas de Procesamiento de Datos:** Motores de *web scraping*, OCR para lectura de actas físicas y modelos locales de procesamiento de lenguaje y audio para interpretar quejas comunitarias.
> * **Entornos de Desarrollo:** Estaciones de trabajo ágiles basadas en distribuciones Linux (ej. Ubuntu) para el equipo técnico.

## **4\. Recursos Humanos y de Capital Social (El "Moat")**

La ventaja competitiva no reside en el código, sino en la red humana de verificación.

| Rol / Actor                                      | Aporte Estratégico                                                                                                                             |
| :----------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------- |
| **Veedurías Ciudadanas y JAC**            | Son el motor de verificación en terreno. Proveen fotografías, reportes de paralización y validación del impacto real de la infraestructura. |
| **Directores de Sostenibilidad (RSC/ESG)** | Validan el encaje producto-mercado, proveen acceso a datos corporativos y son los clientes principales del servicio.                            |
| **Equipo de Ingeniería y Datos**          | Encargados de limpiar, normalizar y cruzar los datos abiertos del gobierno con las métricas corporativas.                                      |
| **Gestores Territoriales o Aliados**       | Personal o aliados (ej. universidades regionales) encargados de establecer los canales de confianza iniciales con las comunidades.              |

## **5\. Recursos Operativos y Financieros**

Para ejecutar las fases iniciales de validación (MVP) y escalamiento, se deben asegurar los siguientes activos:

> 1. **Presupuesto de Infraestructura Cloud:** Cubrimiento de costos de consumo de APIs comerciales (mensajería de WhatsApp), alojamiento de bases de datos y almacenamiento masivo de evidencia visual.
> 2. **Capital para Pruebas Piloto (Bootstrapping):** Fondos operativos para realizar un mapeo "espejo" inicial con proyectos de 2-3 empresas ancla (ej. sector energía) como herramienta de venta en frío.
> 3. **Credenciales y Tokens de Acceso:** Aprobación de cuentas de desarrollador (App Tokens) en el portal de Datos Abiertos de Colombia para escalar las peticiones a la API de SECOP sin bloqueos de límite.
