import { NextRequest, NextResponse } from "next/server";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const OBRAS_JSON = join(process.cwd(), "public", "obras.json");

function cargarObras() {
  const raw = readFileSync(OBRAS_JSON, "utf8");
  return JSON.parse(raw);
}

function aplicarFiltros(obras: any[], params: URLSearchParams) {
  const q = params.get("q")?.toLowerCase().trim() || "";
  const estado = params.get("estado") || undefined;
  const entidad = params.get("entidad") || undefined;
  const minValor = params.get("minValor") ? parseInt(params.get("minValor")!, 10) : undefined;
  const maxValor = params.get("maxValor") ? parseInt(params.get("maxValor")!, 10) : undefined;
  const fechaInicio = params.get("fechaInicio") || undefined;
  const fechaFin = params.get("fechaFin") || undefined;

  return obras.filter((o) => {
    if (q) {
      const haystack = [
        o.nombre, o.referencia, o.entidad, o.contratista, o.barrio, o.comuna, o.direccion, o.id,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    if (estado && estado !== "todos" && o.estado?.toLowerCase() !== estado.toLowerCase()) return false;
    if (entidad && entidad !== "todos" && o.entidad?.toLowerCase() !== entidad.toLowerCase()) return false;
    if (minValor !== undefined && (o.valor ?? 0) < minValor) return false;
    if (maxValor !== undefined && (o.valor ?? 0) > maxValor) return false;
    if (fechaInicio && fechaInicio !== "todos" && o.fechaInicio?.slice(0, 4) !== fechaInicio) return false;
    if (fechaFin && fechaFin !== "todos" && o.fechaFin?.slice(0, 4) !== fechaFin) return false;
    return true;
  });
}

export async function GET(request: NextRequest) {
  try {
    const { success, data: obrasTodas, meta } = cargarObras();
    const params = request.nextUrl.searchParams;

    const obras = aplicarFiltros(obrasTodas, params);

    return NextResponse.json({
      success,
      data: obras,
      meta,
    });
  } catch (error) {
    console.error("[API_MAPA_OBRAS_ERROR]", error);
    return NextResponse.json(
      { success: false, error: "Error consultando la base local de obras" },
      { status: 500 }
    );
  }
}
