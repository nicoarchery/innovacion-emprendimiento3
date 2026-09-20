---
domain: cumplimiento-legal-tos
status: CURRENT
confidence: HIGH
authority: documented-decision
last_verified: 2026-09-20
sources:
- "web: datos.gov.co términos y condiciones (herramientas.datos.gov.co/terminos)"
- "web: datos.gov.co dataset SECOP II (licencia CC BY-SA 4.0)"
- "web: OSMF Nominatim Usage Policy (operations.osmfoundation.org/policies/nominatim)"
- "web: Overpass API Commons/usage y wiki OSM"
- "web: Photon API terms (photon.komoot.io)"
- "web: WhatsApp Business Messaging Policy y Business Solution Terms"
- "web: ANLA términos y condiciones web (pruebas.anla.gov.co/terminos-y-condiciones)"
- "Ley 1712 de 2014 (transparencia); Ley 1581 de 2012 y Decreto 1074 de 2015 (datos personales); Ley 1273 de 2009"
- "decisión 2026-09-20: retirar WhatsApp del producto (confirmado en conversación)"
---

# 15 — Cumplimiento legal y TOS de fuentes

> **Propósito**: dejar constancia de las condiciones legales/de uso de cada fuente de información usada o planeada por el proyecto, y de qué ajustar **al pasar a producción real**. Este documento no es asesoría legal; resume lo verificado en las fuentes citadas y marca lo que requiere revisión con abogado antes de producción.

## Regla general

- Los datos de **contratación pública y trámites** (SECOP II, VITAL/ANLA) son **información pública** en Colombia (Ley 1712 de 2014): pueden usarse, aprovecharse y transformarse libremente, incluso con fines comerciales. Sin embargo, **cada plataforma ponen condiciones técnicas de uso** (límites, atribución, prohibición de scraping agresivo) que sí obligan al proyecto.
- Los **datos personales** (contactos de ciudadanos/empresas en leads y reportes) se rigen por la **Ley 1581 de 2012** + Decreto 1074 de 2015, con independencia de la fuente.
- El proyecto es **una app cliente** de estos servicios: el cierre de una API puede cortar el producto. Mantener esa dependencia explícita (ver `05`, `13`).

## Matriz fuente → uso → condición

| Fuente | Uso del proyecto | ¿Permitido? | Condiciones / límites | Ajuste antes de producción |
|--------|------------------|-------------|------------------------|----------------------------|
| **datos.gov.co / SECOP II** (Socrata) | Ingesta de contratos de Cali (CURRENT) y procesos (explorador) | ✅ Sí, expresamente (Ley 1712 + TyC del portal: uso libre, incluso comercial) | Licencia dataset **CC BY-SA 4.0** → **atribución obligatoria**; la licencia vence sobre el dataset ("ShareAlike" si se hace obra derivada sustancial). Se recomienda `SOCRATA_APP_TOKEN` | Mantener crédito/enlace a la fuente en UI (ya existe vía `url_secop`); revisar si los productos derivados (fichas, informes B2B) califican como "foreign data" o activan ShareAlike → **consulta legal** |
| **Nominatim (OSM)** | Geocodificación (primer nivel del pipeline) | ✅ Sí (uso público moderado) | Máx **1 req/seg**; **User-Agent/Referer válido**; atribución "© OpenStreetMap contributors"/ODbL. **Prohibido**: auto-complete, consultas sistemáticas (grid/reproceso masivo), re-venta de resultados de geocoding. OSMF avisa que apps comerciales pueden perder acceso sin aviso | Atribuir OSM en mapa/fichas; **self-host Nominatim o proveedor comercial** (OpenCage/Geofabrik/Stadia) antes de cobrar a clientes |
| **Overpass API** (overpass-api.de) | Geocodificación por intersección de vías (nivel 2) | ✅ Sí (uso esporádico) | ~**10.000 consultas/día o <1 GB/día** (esporádico); uso regular ≈ ÷100; **uso comercial → self-host o servidores de pago**; UA/Referer requerido; no scripts paralelos | Cachear; migrar a extracto/self-host cuando el geo pipeline sea regular |
| **Photon (komoot)** | Geocodificación por texto (nivel 3) | ✅ Sí (uso razonable) | "Welcome to use… extensive usage throttled or banned"; **sin garantía de disponibilidad**; para volumen: correr su propia instancia | Self-host si se vuelve de alta demanda; no construir producto sobre la instancia pública |
| **WhatsApp (Meta Cloud)** | (PLANEADO en spec 006) → **RETIRADO 2026-09-20** | Se elimina del diseño | Opt-in del usuario; mensajes proactivos solo por plantilla aprobada; ventana de servicio de 24 h; prohibido usar datos de la API para tracking/perfiles; requiere cuenta Meta Business Manager | No aplica (decisión: fuera del producto). Queda registrado en `docs/knowledge/11`, `13` y spec 006 |
| **VITAL / ANLA** | (ROADMAP, spec 009) ingesta de licencias ambientales + OCR | ⚠ Parcial | La web ANLA permite **consulta libre** (Ley 1712) y declara no responsabilizarse del mal uso por terceros; **NO autoriza scraping a gran escala**; VITAL es un aplicativo con registro para trámites (no es portal de descarga masiva) | Preferir **datos abiertos/APIs oficiales**; si se hace scraping: bajo volumen, respetando robots.txt, sin evadir controles, con backoff cortés → evitar activar la Ley 1273 de 2009 (acceso no autorizado) |
| **Meta Ads / Pixel / GA4** | Validación de hipótesis (docs/04) y analítica (CURRENT, condicionada por env) | ✅ Sí | Políticas Meta de publicidad y cookies; el Pixel en landing requiere consentimiento de cookies/EU y privacidad conforme al país de usuarios | Implementar banner de cookies/consentimiento antes de producción |

## Datos personales (Ley 1581/2012)

Principios bajo los que el proyecto YA diseña, y obligaciones al producir:

- **Finalidad y consentimiento**: si se pide contacto (leads, alertas, reportes), hay que informar el propósito y obtener autorización (política de privacidad + aviso). Hoy `api/lead-*` solo loguean; al persistir se vuelven "datos personales".
- **Sanajeo de EXIF** (spec 004): extraer solo GPS+fecha; no guardar EXIF crudo ni localización excesiva → protege ubicación del ciudadano.
- **Minimización**: el contacto del ciudadano **nunca** se expone a la empresa (política de gobernanza, spec 006) — esto es coherente con la ley.
- **Derechos ARCO**: acceso, rectificación, cancelación, oposición → habilitar mecanismo y responsable de datos.
- **Transferencia a Meta/WhatsApp** (ya fuera de plan): si alguna vez se usara, exige consentimiento adicional y términos de tratamiento de datos de Meta.
- Documentación de retención y borrado.
- Para producción: **designar responsable de tratamiento** y registrar base legal. **Consulta legal recomendada.**

## Notas por fase

- **Prototipo/MVP (hoy)**: uso moderado de Nominatim/Overpass/Photon con UA propio y cache → cumple políticas; atribución OSM pendiente de verificar en UI (`08`). SECOP sin problema mientras se atribuya.
- **Producción (requisitos mínimos antes de vender/monetizar)**:
  1. Atribución visible: SECOP (CC BY-SA) + OpenStreetMap (ODbL).
  2. Migrar geocodificación/Overpass a **self-host o proveedor de pago** (las políticas OSMF lo exigen para uso comercial).
  3. Política de privacidad + consentimiento de cookies + aviso de tratamiento de datos personales.
  4. Revisar con abogado: licencia CC BY-SA sobre productos derivados; alcance de scraping VITAL/ANLA (spec 009).

## Decisiones derivadas

- **2026-09-20 — Retiro de WhatsApp**: el canal comunitario y la confirmación pasan a **cargar el reporte (foto + GPS) directamente a la plataforma** (formulario web / PWA), que es más simple y evita: opt-in, plantillas, ventana de 24 h, cuenta Meta y datos personales vía Meta. Ver `11-roadmap-y-specs.md` y spec `006`.