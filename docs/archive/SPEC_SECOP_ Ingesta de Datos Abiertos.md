# **Especificación de Módulo: Ingesta SECOP II (SPEC\_SECOP)**

**Contexto:** Sincronización automática de datos de contratos de infraestructura desde la API pública de SECOP II (Socrata) hacia la base de datos central de la plataforma RSC.

## **1\. Modelos de Dominio (Data Structures)**

Definición estricta de las entidades manejadas por este módulo.

> * **Contract (Contrato):**  
  * id\_contrato (String, Primary Key)  
  * bpin (String, Nullable, Index)  
  * valor\_adjudicado (Decimal)  
  * estado (String)  
  * fecha\_firma (Date)  
  * contratista\_nit (String)  
  * departamento (String)

## **2\. Reglas de Negocio (Sintaxis EARS)**

Reglas inmutables para el comportamiento del servicio.

> * **Precondición:** EL sistema DEBE tener configurado un X-App-Token válido en las variables de entorno para evitar rate-limits.  
> * **Ejecución (Trigger):** CUANDO el *cronjob* programado se ejecute, ENTONCES el sistema DEBE consultar los contratos ordenados por fecha de actualización reciente.  
> * **Actualización (Upsert \- Conflicto):** SI el id\_contrato ya existe en la base de datos local, ENTONCES el sistema DEBE actualizar los campos estado y valor\_adjudicado.  
> * **Inserción (Upsert \- Nuevo):** SI el id\_contrato no existe, ENTONCES el sistema DEBE insertar el nuevo registro.  
> * **Manejo de Fallos:** SI la API de Socrata retorna un código HTTP 429, ENTONCES el sistema DEBE pausar la ejecución aplicando *backoff exponencial* antes de reintentar.

## **3\. Interfaz de Red (I/O)**

Parámetros exactos para la comunicación externa.  
`# HTTP Request`  
`Method: GET`  
`URL: https://www.datos.gov.co/resource/6qex-kahp.json`  
`Headers:`   
  `X-App-Token: ${SOCRATA_APP_TOKEN}`

`# Socrata Query Language (SoQL) Params`  
`$limit: 1000`  
`$offset: {paginacion_dinamica}`  
`$order: fecha_de_firma DESC`

## **4\. Entorno y Empaquetado**

El servicio se estructurará como un *worker* independiente desarrollado en un entorno Ubuntu nativo. Se empaquetará mediante un Dockerfile dedicado para asegurar la portabilidad del proceso de ingesta, facilitando su integración en los flujos automatizados de CI/CD mediante GitHub Actions.