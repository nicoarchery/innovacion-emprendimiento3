import { NextRequest, NextResponse } from "next/server";

import {
  actualizarReporteCiudadano,
  eliminarReporteCiudadano,
  obtenerReportePorId,
} from "@/lib/mapa/db";

const MAX_FOTO_BYTES = 2_200_000;

const ESTADOS_VALIDOS = new Set(["ejecucion", "retraso", "paralizada"]);
const MIME_FOTO = /^data:image\/(jpeg|png|webp|gif);base64,/;

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const id = Number((await context.params).id);
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json(
      { success: false, error: "Reporte inválido" },
      { status: 400 }
    );
  }

  const existente = obtenerReportePorId(id);
  if (!existente) {
    return NextResponse.json(
      { success: false, error: "Reporte no encontrado" },
      { status: 404 }
    );
  }

  try {
    const body = (await request.json()) as {
      estadoTerreno?: string | null;
      avanceObservado?: number | null;
      calificacion?: number | null;
      descripcion?: string | null;
      foto?: string | null;
    };

    const estadoTerreno = body.estadoTerreno ?? null;
    if (estadoTerreno && !ESTADOS_VALIDOS.has(estadoTerreno)) {
      return NextResponse.json(
        { success: false, error: "Estado en terreno inválido" },
        { status: 400 }
      );
    }

    let avanceObservado = body.avanceObservado ?? existente.avance_observado;
    avanceObservado =
      avanceObservado === null || avanceObservado === undefined
        ? null
        : Math.round(Number(avanceObservado));
    if (
      avanceObservado !== null &&
      (Number.isNaN(avanceObservado) || avanceObservado < 0 || avanceObservado > 100)
    ) {
      return NextResponse.json(
        { success: false, error: "Avance observado inválido (0–100)" },
        { status: 400 }
      );
    }

    let calificacion = body.calificacion ?? existente.calificacion;
    calificacion =
      calificacion === null || calificacion === undefined ? null : Math.round(Number(calificacion));
    if (
      calificacion !== null &&
      (Number.isNaN(calificacion) || calificacion < 1 || calificacion > 5)
    ) {
      return NextResponse.json(
        { success: false, error: "Calificación inválida (1–5)" },
        { status: 400 }
      );
    }

    const foto = body.foto !== undefined ? body.foto?.trim() || null : existente.foto;
    if (foto && !MIME_FOTO.test(foto.slice(0, 64))) {
      return NextResponse.json(
        { success: false, error: "La fotografía debe ser una imagen válida" },
        { status: 400 }
      );
    }
    if (foto && foto.length > MAX_FOTO_BYTES) {
      return NextResponse.json(
        { success: false, error: "La fotografía excede el tamaño máximo" },
        { status: 400 }
      );
    }

    actualizarReporteCiudadano(id, {
      estado_terreno: estadoTerreno,
      avance_observado: avanceObservado,
      calificacion: calificacion,
      descripcion: body.descripcion !== undefined ? body.descripcion?.trim() || null : existente.descripcion,
      foto,
    });

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error("[API_REPORTE_PATCH_ERROR]", error);
    return NextResponse.json(
      { success: false, error: "Error editando el reporte" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const id = Number((await context.params).id);
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json(
      { success: false, error: "Reporte inválido" },
      { status: 400 }
    );
  }

  if (!obtenerReportePorId(id)) {
    return NextResponse.json(
      { success: false, error: "Reporte no encontrado" },
      { status: 404 }
    );
  }

  eliminarReporteCiudadano(id);
  return NextResponse.json({ success: true, id });
}