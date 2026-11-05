import { NextRequest, NextResponse } from "next/server";
import { guardarUbicacionComunitaria } from "@/lib/mapa/db";

type Body = {
  id_contrato: string;
  lat: number;
  lon: number;
  reportado_por?: string;
};

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Body;
    const { id_contrato, lat, lon, reportado_por } = body;

    if (!id_contrato || typeof lat !== "number" || typeof lon !== "number") {
      return NextResponse.json(
        { success: false, error: "Datos incompletos" },
        { status: 400 }
      );
    }

    await guardarUbicacionComunitaria({
      id_contrato,
      lat,
      lon,
      reportado_por: reportado_por ?? "anonimo",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[API_UBICACION_COMUNITARIA_ERROR]", error);
    return NextResponse.json(
      { success: false, error: "Error guardando ubicación comunitaria" },
      { status: 500 }
    );
  }
}
