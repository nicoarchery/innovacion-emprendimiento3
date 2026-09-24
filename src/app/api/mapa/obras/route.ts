import { NextRequest, NextResponse } from "next/server";
import {
  aniosFechasDisponibles,
  avancesCampoPorObra,
  entidadesDisponibles,
  estadosDisponibles,
  listObras,
  listTodasObras,
  resumenReportesMasivo,
  totalObras,
  ultimaSync,
} from "@/lib/mapa/db";
import {
  calcularN1,
  evaluarBrecha,
} from "@/lib/mapa/brechas";

export async function GET(request: NextRequest) {
  try {
    const params = request.nextUrl.searchParams;
    const estado = params.get("estado") || undefined;
    const entidad = params.get("entidad") || undefined;
    const minValor = params.get("minValor");
    const maxValor = params.get("maxValor");
    const fechaInicio = params.get("fechaInicio") || undefined;
    const fechaFin = params.get("fechaFin") || undefined;
    const q = params.get("q") || undefined;
    const todas = params.get("todas") === "1";
    const ubicacion = params.get("ubicacion") as
      | "ubicadas"
      | "sin_ubicar"
      | undefined;

    const comunes = {
      estado,
      entidad,
      minValor: minValor ? parseInt(minValor, 10) : undefined,
      maxValor: maxValor ? parseInt(maxValor, 10) : undefined,
      q,
      fechaInicio,
      fechaFin,
    };

    const obras = todas
      ? listTodasObras({
          ...comunes,
          ubicacion: ubicacion === "ubicadas" || ubicacion === "sin_ubicar" ? ubicacion : undefined,
        })
      : listObras(comunes);

    const resumenes = todas ? resumenReportesMasivo() : {};
    const avances = avancesCampoPorObra();

    const data = obras.map((o) => {
      const brecha = evaluarBrecha(
        calcularN1(o.valor, o.valor_pendiente_ejecucion),
        avances[o.id_contrato] ?? null
      );
      return {
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
        avanceSecop: brecha.avanceSecop,
        avanceCampo: brecha.avanceCampo,
        brecha: brecha.gap,
        estadoBrecha: brecha.estado,
        reportes: resumenes[o.id_contrato] ?? null,
      };
    });

    const anios = aniosFechasDisponibles();

    return NextResponse.json({
      success: true,
      data,
      meta: {
        totales: totalObras(),
        ultimaSync: ultimaSync(),
        filtros: {
          entidades: entidadesDisponibles(),
          estados: estadosDisponibles(),
          aniosInicio: anios.inicio,
          aniosFin: anios.fin,
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