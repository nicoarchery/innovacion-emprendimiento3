## Objetivo

Necesito evolucionar el MVP actual para que el **producto principal sea un mapa interactivo de obras públicas en la ciudad de Cali**, alimentado con información de contratación pública proveniente de SECOP.

El alcance inicial debe estar estrictamente limitado a **Cali, Valle del Cauca**. No quiero construir todavía una plataforma nacional ni cubrir todo Colombia. El objetivo del MVP es demostrar que podemos obtener información de obras públicas desde SECOP, transformarla en datos útiles, ubicarlas geográficamente y visualizarlas de manera clara sobre un mapa.

Usa **Lean Spec** para definir y acotar el trabajo. Prioriza un MVP funcional y demostrable sobre funcionalidades secundarias.

---

# 1. Pregunta crítica que debe resolverse primero: ubicación de las obras

Antes de implementar el mapa, analiza técnicamente si es posible obtener de SECOP, mediante sus APIs/datasets disponibles, la **ubicación física de la obra**.

Es importante distinguir entre:

* ubicación de la entidad contratante;
* municipio de la entidad;
* dirección de ejecución;
* dirección del proyecto;
* coordenadas geográficas;
* ubicación geográfica del contrato;
* cualquier otro campo que permita determinar dónde se ejecuta físicamente la obra.

No asumas que el campo `Localización` de SECOP representa la ubicación de la obra. Verifica qué significa realmente cada campo utilizado.

### Debes investigar:

1. Qué datasets de SECOP I/II son relevantes para identificar obras.
2. Qué campos contienen información geográfica.
3. Si existen directamente:

   * latitud;
   * longitud;
   * dirección;
   * barrio;
   * comuna;
   * dirección de ejecución;
   * ubicación del proyecto.
4. Si estos datos están disponibles mediante API.
5. Si existen datos complementarios en otros datasets públicos que permitan obtener la ubicación.
6. Si es necesario utilizar geocodificación para convertir una dirección en coordenadas.

### Si SECOP no proporciona coordenadas directamente

Diseña una estrategia alternativa para conseguir la ubicación.

La estrategia debe seguir este orden de preferencia:

**Nivel 1 — Coordenadas existentes**

* Utilizar latitud/longitud proporcionadas directamente por una fuente oficial.

**Nivel 2 — Dirección existente**

* Extraer la dirección de ejecución de la obra.
* Geocodificarla.
* Guardar las coordenadas resultantes en nuestra base de datos.

**Nivel 3 — Información textual**

* Utilizar información disponible en el objeto del contrato, descripción del proceso, documentos asociados u otros campos públicos.
* Detectar direcciones, calles, barrios, comunas o referencias geográficas.
* Geocodificar cuando sea posible.

**Nivel 4 — Fuentes públicas complementarias**

* Investigar fuentes oficiales de la Alcaldía de Cali, datos abiertos de Cali u otras fuentes públicas que permitan complementar la ubicación.

No inventes coordenadas.

Si una obra no puede ubicarse con suficiente confianza, debe quedar registrada como **“ubicación pendiente/no determinada”** y no debe aparecer artificialmente en un punto incorrecto del mapa.

---

# 2. Alcance geográfico

El MVP debe estar restringido exclusivamente a:

**Cali, Valle del Cauca, Colombia.**

El sistema debe filtrar los datos para evitar que contratos de otros municipios aparezcan en el mapa.

Debe contemplarse que una entidad pueda estar registrada en Cali pero que el contrato corresponda a una obra ejecutada en otro municipio.

Por lo tanto, el criterio de inclusión debe intentar determinar **dónde se ejecuta la obra**, no únicamente dónde está registrada la entidad contratante.

---

# 3. Qué debe considerarse una “obra”

Define una estrategia para identificar contratos/procesos relacionados con obras públicas.

Investiga qué campos de SECOP permiten detectar estos registros, utilizando principalmente:

* descripción/objeto del proceso;
* tipo de contrato;
* categoría UNSPSC;
* estado del contrato;
* fechas;
* entidad contratante;
* información de ejecución;
* cualquier campo adicional relevante.

Evita depender exclusivamente de una búsqueda textual simple como `"obra"`.

Diseña un criterio razonable y documentado para identificar contratos que potencialmente representan:

* construcción;
* mantenimiento;
* adecuación;
* rehabilitación;
* mejoramiento;
* infraestructura;
* vías;
* parques;
* colegios;
* hospitales;
* puentes;
* escenarios deportivos;
* espacio público;
* infraestructura urbana;
* otras obras físicas públicas.

El sistema debe guardar también la información necesaria para posteriormente mejorar este clasificador.

---

# 4. Base de datos local / caché

No quiero que el frontend haga solicitudes constantes directamente a SECOP.

Implementa una **base de datos local** que funcione como caché/persistencia de los datos obtenidos desde SECOP.

La arquitectura debe ser:

**SECOP → Backend → Base de datos local → Frontend/mapa**

y no:

**Frontend → SECOP**

La base de datos debe almacenar como mínimo:

### Identificación

* ID del proceso
* ID del contrato
* referencia del contrato
* referencia del proceso
* entidad contratante
* NIT de la entidad
* contratista
* NIT del contratista

### Información de la obra

* nombre/título generado
* objeto/descripción original
* tipo de contrato
* categoría UNSPSC
* estado
* fecha de inicio
* fecha de finalización
* valor del contrato
* URL del contrato en SECOP

### Ubicación

* municipio
* departamento
* dirección
* barrio
* comuna
* latitud
* longitud
* fuente de la ubicación
* nivel/confianza de geocodificación
* fecha de geocodificación

### Sincronización

* fecha de creación del registro
* fecha de última actualización en SECOP
* fecha de última sincronización local
* hash/versionado si resulta útil para detectar cambios

---

# 5. Sincronización con SECOP

Implementa un sistema de sincronización incremental.

El objetivo es evitar descargar y procesar innecesariamente toda la información cada vez.

La lógica debería ser aproximadamente:

```text
Usuario pulsa "Actualizar mapa"
        ↓
Backend consulta SECOP
        ↓
Compara con registros locales
        ↓
Detecta:
    - obras nuevas
    - obras modificadas
    - obras que cambiaron de estado
    - cambios en fechas/valores/etc.
        ↓
Actualiza la base de datos local
        ↓
Procesa/geocodifica únicamente registros
que necesiten ubicación
        ↓
Devuelve resultados actualizados
        ↓
Mapa se actualiza
```

Utiliza los identificadores únicos disponibles en SECOP para evitar duplicados.

---

# 6. Botón “Actualizar mapa”

El mapa debe tener un botón claramente visible:

**Actualizar mapa**

Al pulsarlo:

1. Realizar una consulta a SECOP.
2. Detectar nuevos contratos/procesos relevantes para Cali.
3. Detectar cambios en obras existentes.
4. Actualizar los registros locales.
5. Procesar nuevas ubicaciones cuando sea necesario.
6. Actualizar el mapa.
7. Mostrar al usuario un pequeño resumen de la sincronización.

Por ejemplo:

```text
Mapa actualizado

12 obras nuevas
7 obras actualizadas
3 ubicaciones corregidas
1 obra sin ubicación determinada

Última actualización:
18/09/2026 21:35
```

No es necesario implementar todavía sincronización automática en segundo plano. El botón manual es suficiente para el MVP.

---

# 7. Mapa

El mapa es la funcionalidad central del MVP.

Debe mostrar las obras de Cali como marcadores.

Cada marcador debe permitir abrir una ficha resumida con:

* nombre de la obra;
* entidad contratante;
* contratista;
* valor;
* estado;
* fecha de inicio;
* fecha de finalización;
* ubicación;
* enlace al registro original de SECOP.

Si existen muchas obras cercanas, utiliza clustering de marcadores.

---

# 8. Filtros mínimos

El MVP debe tener únicamente los filtros necesarios para hacer útil el mapa.

Como mínimo:

* estado de la obra;
* entidad contratante;
* rango de valor;
* fecha;
* tipo/categoría de obra.

No agregues filtros complejos que no sean necesarios para demostrar el concepto.

---

# 9. Panel de detalle

Al seleccionar una obra desde el mapa, mostrar un panel/modal con información más completa.

Debe existir una distinción clara entre:

**Información obtenida de SECOP**

y

**Información procesada por nuestra aplicación**

Por ejemplo:

```text
Fuente:
SECOP II

ID contrato:
XXXXXXXX

Objeto:
...

Valor:
$...

Estado:
...

Ubicación:
Carrera XX # XX-XX, Cali

Coordenadas:
3.xxxxx, -76.xxxxx

Fuente de ubicación:
Dirección encontrada en datos públicos

Confianza:
Alta
```

---

# 10. Arquitectura

Mantén una arquitectura sencilla y adecuada para un MVP.

Propón y utiliza una estructura similar a:

```text
Frontend
   ↓
Backend / API
   ↓
Service SECOP
   ↓
Base de datos local
   ↓
Service de geocodificación
```

El frontend no debe conocer directamente las credenciales, endpoints internos ni lógica de consulta de SECOP.

La lógica de:

* consulta;
* filtrado;
* normalización;
* deduplicación;
* sincronización;
* geocodificación;

debe permanecer en el backend.

---

# 11. Lean Spec

Antes de implementar, genera una Lean Spec breve que contenga:

### Problema

¿Qué problema resuelve el producto?

### Usuario objetivo

¿Quién utilizaría este mapa?

### Hipótesis

¿Qué estamos intentando validar?

### MVP

¿Cuál es el mínimo producto necesario para validar la hipótesis?

### Fuera de alcance

Define explícitamente qué NO se implementará todavía.

### User stories

Define únicamente las historias necesarias para el MVP.

Ejemplo:

> Como ciudadano, quiero visualizar las obras públicas de Cali en un mapa para conocer dónde se están ejecutando proyectos financiados mediante contratación pública.

Otra:

> Como usuario, quiero consultar la información básica de una obra desde el mapa para conocer su contrato, valor, estado y entidad responsable.

Otra:

> Como usuario, quiero actualizar manualmente los datos del mapa para consultar cambios recientes en SECOP.

### Criterios de aceptación

Cada funcionalidad debe tener criterios de aceptación verificables.

---

# 12. Priorización

Clasifica las funcionalidades como:

### MUST HAVE

Indispensables para que el MVP funcione.

### SHOULD HAVE

Importantes pero no indispensables.

### COULD HAVE

Funcionalidades futuras.

No permitas que funcionalidades secundarias desplacen el objetivo principal:

> **visualizar obras públicas de Cali en un mapa utilizando información de SECOP.**

---

# 13. Lo que NO quiero todavía

No implementar en esta fase:

* cobertura nacional;
* aplicación móvil;
* sistema de usuarios;
* autenticación compleja;
* notificaciones;
* análisis avanzado de corrupción;
* predicciones;
* inteligencia artificial innecesaria;
* dashboards complejos;
* sistema de denuncias;
* funcionalidades sociales;
* scraping indiscriminado;
* arquitectura distribuida innecesariamente compleja.

El objetivo es demostrar el flujo completo:

**SECOP → extracción → almacenamiento local → procesamiento → geolocalización → mapa → actualización.**

---

# 14. Requisito importante: investigar antes de implementar

Antes de modificar código, analiza el proyecto existente y determina:

1. Qué tecnologías utiliza actualmente.
2. Qué funcionalidades del MVP ya existen.
3. Qué estructura de datos existe.
4. Qué API de SECOP se está utilizando actualmente, si existe.
5. Qué partes pueden reutilizarse.
6. Qué partes deben modificarse.
7. Qué estrategia de geolocalización es técnicamente viable.

No reemplaces tecnologías existentes sin una razón concreta.

Primero entiende la arquitectura actual y luego propón los cambios mínimos necesarios.

---

# 15. Entregables esperados

Antes de comenzar a modificar el código, presenta:

1. **Diagnóstico del MVP actual.**
2. **Respuesta técnica a la pregunta de geolocalización:**

   * ¿SECOP proporciona directamente la ubicación física de las obras?
   * ¿Qué campos pueden utilizarse?
   * ¿Qué limitaciones existen?
3. **Estrategia de geolocalización alternativa**, si es necesaria.
4. **Lean Spec del nuevo MVP.**
5. **Mapa funcional.**
6. **Modelo de datos propuesto.**
7. **Flujo de sincronización SECOP → DB → mapa.**
8. **Plan de implementación por etapas.**

Después de presentar esto, implementa los cambios.

---

# 16. Criterio principal de éxito

El MVP se considera exitoso si puedo abrir la aplicación y:

1. Ver un mapa centrado en Cali.
2. Ver obras públicas identificadas a partir de SECOP.
3. Seleccionar una obra.
4. Consultar su información relevante.
5. Ver su ubicación cuando esta pueda determinarse con suficiente confianza.
6. Saber cuándo fue actualizada la información.
7. Pulsar **“Actualizar mapa”**.
8. Obtener nuevas obras y cambios en las existentes sin tener que reconstruir manualmente la base de datos.
9. Evitar solicitudes innecesarias a SECOP gracias a la base de datos/cache local.

La prioridad absoluta del MVP es que **el mapa funcione correctamente y que los datos mostrados sean trazables a SECOP y/o a una fuente pública de geolocalización claramente identificada.**
