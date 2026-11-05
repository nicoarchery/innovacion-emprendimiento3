---
domain: gtm-y-ventas
status: CURRENT
confidence: HIGH
authority: documented-decision
last_verified: 2026-11-04
sources:
- "docs/GUION_VIDEO_GTM_5MIN.md (guión de video de venta, 5 min, solo relato en futuro)"
- "docs/Plantilla_financiera_ObraVisible.xlsx (origen del precio $7M, citado en el guion)"
---

# 16 — Plan comercial / Go-To-Market (GTM)

## Resumen

Documento `docs/GUION_VIDEO_GTM_5MIN.md`: guion de video de 5 minutos que expone el plan para conseguir el **primer cliente** de Obra Visible. Todo el relato está en **futuro** (lo que se haría); **no hay ejecución registrada**. Ver `docs/GUION_VIDEO_GTM_5MIN.md` para el texto íntegro.

## Oferta ancla

- **Informe de cumplimiento puntual**: $7.000.000 COP (precio desde `docs/Plantilla_financiera_ObraVisible.xlsx`).
- Qué muestra: qué contratistas cumplen lo que deben, en los tiempos que tocan y con la plata prevista.
- Para qué: que el cliente supervise obras y decida a quién contratar.
- Plazo de entrega: una semana tras aceptar.

## Producto que se demo

- **Mapa funcional** donde el cliente puede buscar una obra, ver plazos y probar la experiencia (todo desde el computador).
- No es la plataforma ESG/B2B completa: esa vive en specs `003`–`009` (planned, **no implementadas**). Ver `02-vision-y-producto.md` y `11-roadmap-y-specs.md`.

## Plan de contacto (no ejecutado)

- **Lista objetivo**: ~15 secretarías, entidades y empresas en Cali que contratan obras (ejemplos: Infraestructura, EMCALI, empresas con obra por impuestos).
- **Canales**: LinkedIn, correo electrónico y visita directa ("así es como ellos hablan de negocios").
- **Táctica**: mensaje corto + video de 30 segundos del mapa; en la reunión se hace demo del mapa con una obra real del cliente; cierre ofreciendo el informe piloto y un formulario para tomar datos.

## Perfil de comprador

- Secretaría, entidad pública o empresa en Cali que contrata obras y desea mejor gestión de sus obras y su dinero.
- Promesa futura (no entregable hoy): opinión ciudadana de las obras y capacidad de darles respuestas.

## Resultados a la fecha (evidencia actual, honesta)

- **Cero ventas, cero clientes, cero interesados contactados.**
- No se armó la lista ni se mandaron los correos.
- Listo: producto funcionando y oferta definida (precio y condiciones).
- **Datos reales en la BD local**: tras ejecutar `POST /api/mapa/actualizar`, la tabla `obras` tiene ~1345 contratos de Cali. **50 obras están geocodificadas** con ubicación en el mapa (incluida la de referencia `CO1.PCCNTR.8373561`, vía Cañaspordas, $252.928.590.550, con marcador naranja especial).
- Postura declarada en el guion: "preferimos decirlo claro antes que inventar una venta".

## Siguiente paso planificado

- Enviar los primeros 15 correos esta semana y grabar cuántos responden, para tener evidencia real.

## Estado y cautelas (KB)

- ⚠ Todo lo anterior es un **plan no ejecutado**: tratar como documento de intención, no como tracción ni validación de mercado.
- No afirmar que hay clientes, ventas o interés validado. Los números reales son cero.
- Relacionado: `10-b2b-y-leads.md` (flujo de leads implementado, solo loguea), `12-hipotesis-y-validacion.md` (hipótesis de mercado sin validar), `15-cumplimiento-legal-tos.md` (ajustes legales antes de monetizar/vender).
