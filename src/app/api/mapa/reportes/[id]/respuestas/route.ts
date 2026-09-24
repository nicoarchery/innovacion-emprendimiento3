import { NextRequest, NextResponse } from "next/server";

import {
  fijarRespuestaOficial,
  insertarRespuesta,
  obtenerReportePorId,
  resumenRespuestasPorReporte,
} from "@/lib/mapa/db";

const MAX_RESPUESTAS_IP_HORA = 20;
const VENTANA_HORA = 60 * 60 * 1000;

const enviosPorIp = new Map<string, number[]>();

function excedeLimiteResuestas(request: NextRequest): boolean {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "desconocida";
  const ahora = Date.now();
  const ventana = (enviosPorIp.get(ip) ?? []).filter((t) => ahora - t < VENTANA_HORA);
  if (ventana.length >= MAX_RESPUESTAS_IP_HORA) {
    enviosPorIp.set(ip, ventana);
    return true;
  }
  enviosPorIp.set(ip, [...ventana, ahora]);
  return false;
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const idReporte = Number((await context.params).id);
  if (!Number.isInteger(idReporte) || idReporte <= 0) {
    return NextResponse.json(
      { success: false, error: "Reporte inválido" },
      { status: 400 }
    );
  }

  try {
    const reporte = obtenerReportePorId(idReporte);
    if (!reporte) {
      return NextResponse.json(
        { success: false, error: "Reporte no encontrado" },
        { status: 404 }
      );
    }

    if (excedeLimiteResuestas(request)) {
      return NextResponse.json(
        {
          success: false,
          error: "Demasiadas respuestas desde este equipo. Intenta más tarde.",
        },
        { status: 429 }
      );
    }

    const body = (await request.json()) as {
      autor?: string;
      texto?: string;
      fijar?: boolean;
    };

    const texto = body.texto?.trim() ?? "";
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

    const fijar = body.fijar === true;
    const hasRespuestas = resumenRespuestasPorReporte(idReporte).total > 0;
    const id = insertarRespuesta({
      id_reporte: idReporte,
      autor: body.autor?.trim() || null,
      texto,
      es_oficial: 0,
      fijada: 0,
    });

    // La primera respuesta se fija como oficial por defecto (demo); si el
    // autor pide fijar, la fija explícitamente (máx 1 por obra).
    const fijadaId =
      fijar || !hasRespuestas ? (fijarRespuestaOficial(id)?.id ?? id) : id;

return NextResponse.json({
      success: true,
      id: fijadaId,
      meta: { resumen: resumenRespuestasPorReporte(idReporte) },
      message: "Respuesta de la empresa registrada.",
    });
  } catch (error) {
    console.error("[API_RESPUESTAS_POST_ERROR]", error);
    return NextResponse.json(
      { success: false, error: "Error guardando la respuesta" },
      { status: 500 }
    );
  }
}