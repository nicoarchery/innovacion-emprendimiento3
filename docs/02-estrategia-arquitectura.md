
# Documento de Definición Estratégica y Arquitectura Técnica

## 1. Definición del Problema

Las empresas e instituciones en Colombia invierten sumas significativas (más de $19 billones de pesos anuales) en proyectos de infraestructura, inversión social y sostenibilidad. Sin embargo, el ecosistema enfrenta cuatro fallas estructurales:

1. **Fragmentación de la información**: cada empresa gestiona sus datos de Responsabilidad Social Corporativa (RSC) y ESG en silos internos (archivos de Excel, PDFs desactualizados), sin un estándar unificado ni repositorios públicos comparables.
2. **Desconexión entre el dato jurídico/presupuestal y la realidad física**: existe un divorcio entre los registros oficiales de contratación (como los reportados en SECOP II) y la ejecución real en campo. Un contrato ejecutado al 100% en papel no garantiza una obra funcional en el territorio.
3. **Opacidad y bajo nivel de verificabilidad**: los grupos de interés (comunidades, auditores, inversionistas ESG, periodistas) carecen de mecanismos auditables y de bajo costo para verificar si los hitos prometidos se cumplieron físicamente.
4. **Invisibilidad territorial y riesgo reputacional**: los proyectos carecen de geolocalización pública interactiva. Esto limita el reconocimiento reputacional de la empresa y genera fricción social, paros o bloqueos por falta de transparencia con las comunidades locales.

---

## 2. Segmento de Clientes y Usuarios

```
                      ┌──────────────────────────────────────────────┐
                      │         CLIENTES PAGADORES (B2B)             │
                      │ Empresas Mineras, Energéticas, Vías,         │
                      │ Fondos ESG, Aseguradoras                     │
                      └──────────────────────┬────────────────────────┘
                                             │
                                             ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                PLATAFORMA CENTRAL                                        │
│    SODA API (SECOP II)  +  Gestión Privada ESG  +  Verificación de Campo (PWA/App)      │
└─────────────────────────────────────────────────────────────────────────────────────────┘
                                             ▲
                                             │
                      ┌──────────────────────┴────────────────────────┐
                      │        USUARIOS VALIDADORES (NO PAGAN)        │
                      │ Comunidades locales, Veedurías acreditadas,   │
                      │ Academia, Periodistas                         │
                      └───────────────────────────────────────────────┘
```

### Cliente Pagador (Foco Primario)

- **Sectores de alta inserción territorial**: energía, minería, hidrocarburos, concesiones viales, construcción y agroindustria.
- **Dolor clave**: necesitan mantener la Licencia Social para Operar (LSO), cumplir con marcos regulatorios (NIIF S1/S2, GRI) y demostrar avance físico real para evitar litigios o bloqueos comunitarios.

### Cliente Pagador (Secundario / Expansión)

- **Fondos de Inversión ESG y Banca Multilateral**: requieren auditoría de riesgos de ejecución en proyectos financiados.
- **Aseguradoras (Pólizas de Cumplimiento)**: buscan monitorear el avance real de obras contra hitos contractuales para mitigar el riesgo de siniestro.

### Usuarios Validadores (Sin Costo)

- **Comunidades beneficiarias, veedurías ciudadanas y academia**: aportan legitimidad al validar hitos físicos en territorio mediante flujos estructurados de auditoría.

---

## 3. Propuesta de Valor

> "La plataforma de inteligencia territorial que transforma datos de contratación pública y reportes corporativos en evidencias geolocalizadas, verificadas y comparables, optimizando el cumplimiento ESG y reduciendo el riesgo de conflicto social en territorio."

### Componentes Clave del Producto

- **Ingesta y cruce automatizado de datos**: sincronización continua con la API pública de SECOP II para auditar contratos de infraestructura y compensación social.
- **Tablero de control y perfil público georreferenciado**: mapas interactivos con estado de avance, inversión por municipio (código DIVIPOLA) e hitos contractuales.
- **Motor de verificación estructurada de campo**: captura de evidencia física (fotografías con metadatos EXIF, coordenadas GPS y marcas de tiempo) procesada en modalidad offline/online.
- **Generador de reportes de cumplimiento**: automatización de informes en estándares internacionales (GRI, ISSB, ODS) y reportes de avance para la Agencia de Renovación del Territorio (ART) en proyectos de Obras por Impuestos (OpI).

---

## 4. Ventaja Competitiva y "Moat"

| Competidor / Alternativa           | Alcance Tradicional                                                                   | Nuestra Diferenciación                                                                |
| ---------------------------------- | ------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| Merco / Sellos de Sostenibilidad   | Miden reputación percibida mediante encuestas corporativas.                          | Medición sobre evidencia física y contractual verificada proyecto por proyecto.      |
| Software ESG Interno (ej. Prodity) | Tableros privados para gestión interna sin vitrina ni datos públicos.               | Integración entre datos públicos oficiales (SECOP II) + vitrina territorial externa. |
| Sistemas Estatales (SECOP / PIIP)  | Registros administrativos gubernamentales difíciles de consultar o auditar en campo. | Capa de usabilidad visual, geolocalización y validación en terreno.                  |

**Moat (Barrera de Entrada)**: la combinación entre tecnología de geoprocesamiento, la ingesta automatizada de datos estatales vía SODA API y la red de captura de evidencias en territorio crea una barrera difícil de replicar por software de gestión puramente corporativo.

---

## 5. Modelo de Negocio y Monetización

### Suscripción SaaS B2B Empresarial (cobro anual/mensual)

- **Tier Base (ESG Analytics)**: consolidación de datos, conectores API con SECOP II y reportes automáticos GRI/ISSB.
- **Tier Pro (Licencia Social & Territorio)**: perfil público geolocalizado, módulo de mapa interactivo e integración con la App de captura de campo.
- **Tier Enterprise (Trazabilidad de Contratistas)**: auditoría de la cadena de suministro y contratistas de ejecución social.

### Módulo Especializado para Obras por Impuestos (OpI)

- Fee fijado por proyecto monitoreado para garantizar la trazabilidad de la ejecución presupuestal y física exigida por la DIAN y la ART.

### Reportes de Auditoría de Riesgo (B2B Financial Services)

- Venta de informes de riesgo de ejecución y retraso contractual para aseguradoras y fondos de inversión.

---

## 6. Arquitectura Técnica y Datos

### 6.1 Ingesta de Datos: API SECOP II (SODA REST API)

El sistema consume los conjuntos de datos abiertos del portal datos.gov.co mediante el protocolo Socrata Open Data API (SODA).

**Parámetros de conexión**

- **Endpoint base**: `https://www.datos.gov.co/resource/jgit-wwov.json` (Dataset de Procesos de Contratación SECOP II)
- **Autenticación**: inclusión obligatoria del token de aplicación en el encabezado HTTP:

```http
X-App-Token: TU_APP_TOKEN_AQUI
```

**Campos clave ingeridos y mapeados**

```json
{
  "nit_entidad": "899999090",
  "nombre_entidad": "ALCALDIA MUNICIPAL DE...",
  "documento_proveedor": "900123456",
  "proveedor_adjudicado": "CONSORCIO INFRAESTRUCTURA SOCIAL",
  "objeto_del_proceso": "Construcción de placa huella y centro comunitario...",
  "cuantia_del_contrato": "1500000000",
  "estado_contrato": "En ejecucion",
  "departamento": "Valle del Cauca",
  "municipio": "Cali",
  "codigo_categoria_unspsc": "72141103"
}
```

### 6.2 Diagrama de Arquitectura del Sistema

```
┌────────────────────────────────────────────────────────────────────────┐
│                           FUENTES DE DATOS                              │
│  ┌──────────────────────────┐        ┌───────────────────────────────┐ │
│  │ API SECOP II (SODA HTTP) │        │ Cargas Privadas (ERP / Excel) │ │
│  └────────────┬─────────────┘        └──────────────┬────────────────┘ │
└───────────────┼─────────────────────────────────────┼───────────────────┘
                │                                     │
                ▼                                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      CAPA DE INGESTA Y PROCESAMIENTO                    │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ ETL Service (Node.js / Python)                                   │  │
│  │ - Validador de Headers (X-App-Token)                             │  │
│  │ - Normalizador de Códigos DIVIPOLA y UNSPSC                      │  │
│  └──────────────────────────────┬───────────────────────────────────┘  │
└─────────────────────────────────┼────────────────────────────────────────┘
                                   │
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                         ALMACENAMIENTO CENTRAL                          │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Base de Datos Relacional y Geoespacial (PostgreSQL + PostGIS)    │  │
│  │ - Tablas de Contratos, Proyectos, Evidencias, Audit Logs         │  │
│  └──────────────────────────────┬───────────────────────────────────┘  │
└─────────────────────────────────┼────────────────────────────────────────┘
                                   │
                 ┌─────────────────┴─────────────────┐
                 ▼                                   ▼
┌──────────────────────────────┐    ┌────────────────────────────────────┐
│    CORE API / RULES ENGINE   │    │      MÓDULO DE VERIFICACIÓN       │
│ - Cálculo de Brecha (Gap)    │    │ - App Móvil / PWA Offline          │
│ - Motores de Reporte ESG     │    │ - Validación GPS / EXIF / Fotos    │
└───────────────┬──────────────┘    └─────────────────┬──────────────────┘
                │                                     │
                └─────────────────┬───────────────────┘
                                   │
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                           CAPA DE PRESENTACIÓN                          │
│  ┌──────────────────────────┐        ┌───────────────────────────────┐ │
│  │ Dashboard B2B Empresarial│        │ Portal Público / Mapa Geo     │ │
│  └──────────────────────────┘        └───────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────┘
```

### 6.3 Lógica del Motor de Verificación de Brecha (Gap Analysis Engine)

El valor del sistema radica en calcular la desviación entre tres fuentes de verdad:

**Índice de Brecha (Gap) = | % Ejecución SECOP II − % Avance Evidencia Campo |**

- **Nivel 1 (Dato Oficial SECOP II)**: registra el avance financiero/contractual según pagos directos reportados en la plataforma estatal.
- **Nivel 2 (Reporte Empresarial Privado)**: registra el avance estimado programado por la gerencia del proyecto.
- **Nivel 3 (Evidencia de Campo)**: datos capturados mediante fotografías geotagueadas por inspectores o veedurías acreditadas con la App offline.

Si la brecha entre el % de Ejecución Registrada y la Evidencia Físicamente Validada supera un umbral definido (ej. **> 15%**), el sistema activa una **Alerta de Riesgo Territorial**, permitiendo a la gerencia intervenir antes de que se genere un conflicto comunitario o una sanción regulatoria.

#### Verificación Asimétrica (Control de Costos de Operación)

Para garantizar la rentabilidad del modelo SaaS y evitar que el costo operativo de la verificación asfixie los márgenes:

1. **Verificación Base (Automatizada / Bajo Costo)**: disponible en todos los planes. Utiliza ingesta de APIs públicas (SECOP II, SIIPO), análisis satelital y validación de metadatos EXIF (GPS y marcas de tiempo) en fotografías enviadas por la comunidad.
2. **Verificación Premium (Auditoría Profunda / Alto Valor)**: reservada para contratos corporativos o proyectos de alta fricción social. Incluye auditorías físicas en terreno, encuestas de percepción comunitaria y concertación con veedurías regionales.

#### Protocolo de Gobernanza y Resolución de Disputas (Moderación)

Para proteger la neutralidad de la plataforma y evitar la cooptación política o disputas sindicales locales:

- **Mecanismo de Desescalamiento**: Si una veeduría reporta la paralización de una obra pero la empresa presenta actas de interventoría vigentes, la obra entra en estado de *"Bajo Revisión Neutra"*.
- **Evidencia Cruzada**: La alerta de paralización solo se hace pública en el mapa si cuenta con al menos 3 reportes independientes geolocalizados en un radio < 500m o si transcurren 5 días hábiles sin descargos formales de la empresa.

---

### 6.4 Ejemplo de Referencia: Proyecto Obras por Impuestos (OxI)

**Proyecto Modelo:** Pavimentación de Vía Terciaria en Guamal (Meta) – Ejecutado por Ecopetrol (Código BPIN).

| Categoría de Datos | Dato Específico a Obtener | Plataforma / Fuente de Origen | Mecanismo de Ingesta Técnico |
| :--- | :--- | :--- | :--- |
| **Geolocalización** | Coordenadas trayecto (Lat/Lon), polígono y municipio. | **SIT (ART)** / **Visor DNP** / datos.gov.co | Consumo de API SODA filtrando por BPIN $\rightarrow$ Descarga GeoJSON. |
| **Ejecución y Costos** | Presupuesto ($12.500M COP), % avance financiero, contratista, fechas. | **SECOP II** (`6qex-kahp`) y **SIIPO** | Consultas a API REST de SECOP II por NIT de Ecopetrol / Código de contrato. |
| **Métricas ESG / GRI** | Beneficiarios (4.500 hab.), empleos locales generados, toneladas CO2. | **ERP Ecopetrol (SAP)** / **Ficha ART** | Integración B2B vía Webhooks / Ingesta de fichas técnicas de la ART. |
| **Trazabilidad Ambiental** | Licencia ambiental, actas de compensación ecológica. | **VITAL (ANLA)** | Web Scraping automatizado en VITAL sobre resoluciones en PDF. |
| **Verificación Ciudadana** | Fotografías con EXIF, reportes de estado físico, alertas. | **Plataforma / Bot WhatsApp** | Captura comunitaria mediante bot de WhatsApp $\rightarrow$ Extracción de EXIF (GPS/Fecha). |
