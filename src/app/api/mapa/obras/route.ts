import { NextRequest, NextResponse } from "next/server";
import {
  entidadesDisponibles,
  estadosDisponibles,
  listObras,
  listTodasObras,
  resumenReportesMasivo,
  totalObras,
  ultimaSync,
} from "@/lib/mapa/db";

export async function GET(request: NextRequest) {
  try {
    const params = request.nextUrl.searchParams;
    const estado = params.get("estado") || undefined;
    const entidad = params.get("entidad") || undefined;
    const minValor = params.get("minValor");
    const maxValor = params.get("maxValor");
    const fecha = params.get("fecha") || undefined;
    const todas = params.get("todas") === "1";
    const ubicacion = params.get("ubicacion") as
      | "ubicadas"
      | "sin_ubicar"
      | undefined;

    const obras = todas
      ? listTodasObras({
          estado,
          entidad,
          minValor: minValor ? parseInt(minValor, 10) : undefined,
          maxValor: maxValor ? parseInt(maxValor, 10) : undefined,
          fecha,
          ubicacion: ubicacion === "ubicadas" || ubicacion === "sin_ubicar" ? ubicacion : undefined,
        })
      : listObras({
          estado,
          entidad,
          minValor: minValor ? parseInt(minValor, 10) : undefined,
          maxValor: maxValor ? parseInt(maxValor, 10) : undefined,
          fecha,
        });

    const resumenes = todas ? resumenReportesMasivo() : {};

    const data = obras.map((o) => ({
      id: o.id_contrato,
      referencia: o.referencia,
      nombre: o.descripcion,
      entidad: o.entidad_nombre,
      contratista: o.contratista,
      estado: o.estado,
      valor: o.valor,
      fechaInicio: o.fecha_inicio,
      fechaFin: o.fecha_fin,
      urlSecop: o.url_secop,
      comuna: o.comuna,
      barrio: o.barrio,
      direccion: o.direccion_ejecucion,
      lat: o.lat,
      lon: o.lon,
      geoFuente: o.geo_fuente,
      geoConfianza: o.geo_confianza,
      estadoUbicacion: o.estado_ubicacion,
      syncedAt: o.synced_at,
      reportes: resumenes[o.id_contrato] ?? null,
    }));

    return NextResponse.json({
      success: true,
      data,
      meta: {
        totales: totalObras(),
        ultimaSync: ultimaSync(),
        filtros: {
          entidades: entidadesDisponibles(),
          estados: estadosDisponibles(),
        },
      },
    });
  } catch (error) {
    console.error("[API_MAPA_OBRAS_ERROR]", error);
    return NextResponse.json(
      { success: false, error: "Error consultando la base local de obras" },
      { status: 500 }
    );
  }
}