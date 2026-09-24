import { NextRequest, NextResponse } from "next/server";

import {
  actualizarRespuesta,
  desfijarRespuesta,
  eliminarRespuesta,
  fijarRespuestaOficial,
  obtenerRespuestaPorId,
  resumenRespuestasPorReporte,
} from "@/lib/mapa/db";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const id = Number((await context.params).id);
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json(
      { success: false, error: "Respuesta inválida" },
      { status: 400 }
    );
  }

  try {
    const existente = obtenerRespuestaPorId(id);
    if (!existente) {
      return NextResponse.json(
        { success: false, error: "Respuesta no encontrada" },
        { status: 404 }
      );
    }

    const body = (await request.json()) as {
      texto?: string;
      fijar?: boolean;
      desfijar?: boolean;
    };

    if (body.texto !== undefined) {
      const texto = body.texto.trim();
      if (!texto) {
        return NextResponse.json(
          { success: false, error: "El texto de la respuesta no puede ir vacío" },
          { status: 400 }
        );
      }
      if (texto.length > 2000) {
        return NextResponse.json(
          { success: false, error: "La respuesta excede el máximo de 2000 caracteres" },
          { status: 400 }
        );
      }
      actualizarRespuesta(id, { texto });
    }

    if (body.desfijar === true) {
      desfijarRespuesta(id);
    } else if (body.fijar === true) {
      fijarRespuestaOficial(id);
    }

    const actualizada = obtenerRespuestaPorId(id);
    return NextResponse.json({
      success: true,
      data: actualizada,
      meta: actualizada
        ? { resumen: resumenRespuestasPorReporte(actualizada.id_reporte) }
        : undefined,
    });
  } catch (error) {
    console.error("[API_RESPUESTA_PATCH_ERROR]", error);
    return NextResponse.json(
      { success: false, error: "Error editando la respuesta" },
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
      { success: false, error: "Respuesta inválida" },
      { status: 400 }
    );
  }

  const existente = obtenerRespuestaPorId(id);
  if (!existente) {
    return NextResponse.json(
      { success: false, error: "Respuesta no encontrada" },
      { status: 404 }
    );
  }

  eliminarRespuesta(id);
  return NextResponse.json({
    success: true,
    id,
    meta: { resumen: resumenRespuestasPorReporte(existente.id_reporte) },
  });
}