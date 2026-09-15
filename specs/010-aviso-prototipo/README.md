---
status: complete
created: 2026-09-15
priority: high
tags:
- aviso
- prototipo
- compliance
- ux
created_at: 2026-09-15T00:46:22.712906344Z
updated_at: 2026-09-15T00:47:49.206825391Z
completed_at: 2026-09-15T00:47:49.206825391Z
transitions:
- status: in-progress
  at: 2026-09-15T00:46:26.348249231Z
- status: complete
  at: 2026-09-15T00:47:49.206825391Z
---

# Aviso de Prototipo y Datos No Fiables

> **Status**: in-progress · **Priority**: high · **Created**: 2026-09-13

## Overview

La plataforma inicia la exposición pública real (canales de pauta y acceso directo). Varios indicadores del explorador son simulados o estimados (SECOP II real con % de avance y evidencia de campo fabricados, proyectos seed ilustrativos). Para evitar usos indebidos y malentendidos, se requiere un aviso formal, visible en TODAS las páginas, que declare el carácter de prototipo y la no fiabilidad de los datos.

## Requirements

- **Alcance Global:** CUANDO un usuario carga cualquier página pública (portada, explorador y futuras), ENTONCES el sistema DEBE mostrar el aviso de prototipo.
- **Posición:** CUANDO se renderiza la página, ENTONCES el aviso DEBE ubicarse en la parte superior, por encima de la navegación, sin interrumpir el contenido principal.
- **Contenido:** SI la plataforma exhibe datos del explorador, ENTONCES el aviso DEBE declarar que: (a) es un prototipo en validación, (b) los datos provienen parcialmente de SECOP II y parcialmente de información simulada o estimada con fines demostrativos, y (c) no constituye información oficial ni debe usarse para decisiones legales, contractuales o de inversión.
- **Persistencia:** SI el usuario navega entre páginas, ENTONCES el aviso DEBE mantenerse visible sin requerir acción de cierre.
- **Consistencia Visual:** CUANDO se muestra, ENTONCES el aviso DEBE usar el estilo visual del sitio (tipografía Plus Jakarta Sans, paleta slate/emerald) y un icono de advertencia.

## Technical Approach / Design

- Componente servidor `src/components/PrototypeNotice.tsx` (sin estado, sin JS de cliente).
- Renderizado en el root layout `src/app/layout.tsx` dentro de `<body>`, antes de `{children}`, heredando al 100% de las páginas actuales y futuras.
- Icono `TriangleAlert` de lucide-react; texto formal en párrafo compacto responsive.

## Plan

- [x] Crear `src/components/PrototypeNotice.tsx` con el mensaje formal.
- [x] Integrarlo en `src/app/layout.tsx` sobre todos los children.
- [x] Verificar render en portada y `/explorador`.
- [x] Validar con `bun run build` y `npx lean-spec validate`.

## Test

- [x] El aviso aparece en la portada y en `/explorador`.
- [x] El texto declara prototipo, datos simulados/estimados y no uso oficial.
- [x] El build TypeScript y de producción completa sin errores.

## Notes

- Redacción formal y sobria; no usar el aviso como mensaje de marketing.
- Actualizar la redacción si futuras fases (specs 004–009) incorporan datos verificados.