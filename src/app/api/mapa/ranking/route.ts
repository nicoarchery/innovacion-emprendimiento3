import { NextRequest, NextResponse } from "next/server";

import {
  resumenReputacionContratistas,
  sembrarReportesDemo,
} from "@/lib/mapa/db";

type OrdenRanking = "valor" | "reportes" | "score";

const ORDENES_VALIDAS: OrdenRanking[] = ["valor", "reportes", "score"];

function ordenarRanking(
  data: ReturnType<typeof resumenReputacionContratistas>,
  orden: OrdenRanking
): ReturnType<typeof resumenReputacionContratistas> {
  const copia = [...data];
  if (orden === "valor") {
    copia.sort((a, b) => (b.valor_concesionado ?? 0) - (a.valor_concesionado ?? 0));
  } else if (orden === "reportes") {
    copia.sort((a, b) => b.n_reportes - a.n_reportes);
  } else {
    // score DESC, y los sin datos al final.
    copia.sort((a, b) => {
      if (a.score === null && b.score === null) return 0;
      if (a.score === null) return 1;
      if (b.score === null) return -1;
      return b.score - a.score;
    });
  }
  return copia;
}

export async function GET(request: NextRequest) {
  try {
    const params = request.nextUrl.searchParams;
    const ordenRaw = params.get("orden");
    const orden: OrdenRanking = ORDENES_VALIDAS.includes(ordenRaw as OrdenRanking)
      ? (ordenRaw as OrdenRanking)
      : "score";
    const limitRaw = params.get("limit");
    const limit = limitRaw ? Math.min(50, Math.max(1, Number(limitRaw))) : 25;

    const data = ordenarRanking(resumenReputacionContratistas(), orden);
    const conNivel = data.filter((r) => r.nivel !== "sin_datos").length;

    return NextResponse.json({
      success: true,
      data: limit ? data.slice(0, limit) : data,
      meta: {
        orden,
        totalContratistas: data.length,
        conNivel,
        umbral: 3,
        sinDatosReportados: data.length - conNivel,
      },
    });
  } catch (error) {
    console.error("[API_RANKING_ERROR]", error);
    return NextResponse.json(
      { success: false, error: "Error consultando el ranking de contratistas" },
      { status: 500 }
    );
  }
}

// POST /api/mapa/ranking?demo=1 → siembra reportes demo de reputación
export async function POST() {
  try {
    const { sembrados } = sembrarReportesDemo();
    return NextResponse.json({ success: true, sembrados });
  } catch (error) {
    console.error("[API_RANKING_SEED_ERROR]", error);
    return NextResponse.json(
      { success: false, error: "Error sembrando datos demo de reputación" },
      { status: 500 }
    );
  }
}