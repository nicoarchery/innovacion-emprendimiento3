import { NextRequest, NextResponse } from "next/server";

import {
  insertarReporteCiudadano,
  listarReportesPorObra,
  obtenerObraPorId,
  resumenReportesPorObra,
} from "@/lib/mapa/db";

const MAX_FOTO_BYTES = 2_200_000;
const MAX_REPORTES_CONTACTO_HORA = 10;
const MAX_REPORTES_IP_HORA = 40;
const VENTANA_HORA = 60 * 60 * 1000;

const enviosPorClave = new Map<string, number[]>();

function claveCliente(contacto: string | null, request: NextRequest): string {
  const porContacto = contacto?.trim().toLowerCase();
  if (porContacto) return `c:${porContacto}`;
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return `ip:${ip ?? "desconocida"}`;
}

function importantePorClave(clave: string): number {
  return clave.startsWith("c:") ? MAX_REPORTES_CONTACTO_HORA : MAX_REPORTES_IP_HORA;
}

function excedeLimite(clave: string): boolean {
  const ahora = Date.now();
  const ventana = (enviosPorClave.get(clave) ?? []).filter(
    (t) => ahora - t < VENTANA_HORA
  );
  if (ventana.length >= importantePorClave(clave)) {
    enviosPorClave.set(clave, ventana);
    return true;
  }
  enviosPorClave.set(clave, [...ventana, ahora]);
  return false;
}

function limpiarMemoria(): void {
  const ahora = Date.now();
  for (const [clave, tiempos] of enviosPorClave) {
    const vivos = tiempos.filter((t) => ahora - t < VENTANA_HORA);
    if (vivos.length === 0) enviosPorClave.delete(clave);
    else enviosPorClave.set(clave, vivos);
  }
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  try {
    const obra = obtenerObraPorId(id);
    if (!obra) {
      return NextResponse.json(
        { success: false, error: "Obra no encontrada" },
        { status: 404 }
      );
    }
    const reportes = listarReportesPorObra(id).map((r) => ({
      id: r.id,
      estadoTerreno: r.estado_terreno,
      avanceObservado: r.avance_observado,
      calificacion: r.calificacion,
      descripcion: r.descripcion,
      foto: r.foto,
      fecha: r.created_at,
    }));
    return NextResponse.json({
      success: true,
      data: reportes,
      meta: { resumen: resumenReportesPorObra(id) },
    });
  } catch (error) {
    console.error("[API_REPORTES_ERROR]", error);
    return NextResponse.json(
      { success: false, error: "Error consultando los reportes" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  try {
    const obra = obtenerObraPorId(id);
    if (!obra) {
      return NextResponse.json(
        { success: false, error: "Obra no encontrada" },
        { status: 404 }
      );
    }

    limpiarMemoria();
    const body = (await request.json()) as {
      estadoTerreno?: string;
      avanceObservado?: number;
      calificacion?: number;
      descripcion?: string;
      foto?: string;
      contacto?: string;
      lat?: number;
      lon?: number;
      gpsOrigen?: string;
    };

    const contacto = body.contacto?.trim() || null;
    const clave = claveCliente(contacto, request);
    if (excedeLimite(clave)) {
      return NextResponse.json(
        {
          success: false,
          error: "Demasiados reportes desde este contacto. Intenta más tarde.",
        },
        { status: 429 }
      );
    }

    const estadoTerreno = body.estadoTerreno;
    if (
      estadoTerreno &&
      !["ejecucion", "retraso", "paralizada"].includes(estadoTerreno)
    ) {
      return NextResponse.json(
        { success: false, error: "Estado en terreno inválido" },
        { status: 400 }
      );
    }

    const avanceObservado =
      body.avanceObservado === undefined
        ? null
        : Math.round(Number(body.avanceObservado));
    if (
      avanceObservado !== null &&
      (Number.isNaN(avanceObservado) ||
        avanceObservado < 0 ||
        avanceObservado > 100)
    ) {
      return NextResponse.json(
        { success: false, error: "Avance observado inválido (0–100)" },
        { status: 400 }
      );
    }

    const calificacion =
      body.calificacion === undefined
        ? null
        : Math.round(Number(body.calificacion));
    if (
      calificacion !== null &&
      (Number.isNaN(calificacion) ||
        calificacion < 1 ||
        calificacion > 5)
    ) {
      return NextResponse.json(
        { success: false, error: "Calificación inválida (1–5)" },
        { status: 400 }
      );
    }

    const foto = body.foto?.trim() || null;
    if (foto && !/^data:image\/(jpeg|png|webp|gif);base64,/.test(foto.slice(0, 64))) {
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

    const lat = body.lat ?? obra.lat ?? null;
    const lon = body.lon ?? obra.lon ?? null;

    const idReporte = insertarReporteCiudadano({
      id_contrato: id,
      estado_terreno: estadoTerreno ?? null,
      avance_observado: avanceObservado,
      calificacion: calificacion,
      descripcion: body.descripcion?.trim() || null,
      foto,
      contacto,
      lat,
      lon,
      gps_origen: body.gpsOrigen ?? (body.lat !== undefined ? "navegador" : "obra"),
    });

    return NextResponse.json({
      success: true,
      id: idReporte,
      meta: { resumen: resumenReportesPorObra(id) },
      message: "Reporte recibido. Gracias por aportar.",
    });
  } catch (error) {
    console.error("[API_REPORTES_ERROR]", error);
    return NextResponse.json(
      { success: false, error: "Error guardando el reporte" },
      { status: 500 }
    );
  }
}