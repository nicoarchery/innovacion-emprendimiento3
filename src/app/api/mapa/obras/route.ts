import { NextRequest, NextResponse } from "next/server";
import {
  aniosFechasDisponibles,
  avancesCampoPorObra,
  entidadesDisponibles,
  estadosDisponibles,
  listObras,
  listTodasObras,
  resumenReportesMasivo,
  resumenReputacionContratistas,
  totalObras,
  ultimaSync,
} from "@/lib/mapa/db";
import { calcularN1, evaluarBrecha } from "@/lib/mapa/brechas";

// Obra demo Cañas Gordas: datos de pagos inyectados para el guion GTM.
// SECOP II no publica pagos para este contrato; el 70 % es inventado.
const OBRA_DEMO_PAGOS = {
  id: "CO1.PCCNTR.8373561",
  valorPagado: 177050013385,
  valorFacturado: 177050013385,
  geoFuente: "demo",
  // SECOP (financiero): dato de demo, 70 % de ejecución
  avanceSecop: 70,
} as const;

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
      ? await listTodasObras({
          ...comunes,
          ubicacion: ubicacion === "ubicadas" || ubicacion === "sin_ubicar" ? ubicacion : undefined,
        })
      : await listObras(comunes);

    const resumenes = todas ? await resumenReportesMasivo() : {};
    const avances = await avancesCampoPorObra();

    const reputacionPorContratista = new Map(
      (await resumenReputacionContratistas()).map((r) => [
        r.contratista,
        { score: r.score, nivel: r.nivel, nReportes: r.n_reportes },
      ])
    );

    let data = obras.map((o) => {
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
        valorPagado: o.valor_pagado ?? null,
        valorFacturado: o.valor_facturado ?? null,
        valorPendienteEjecucion: o.valor_pendiente_ejecucion ?? null,
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
        reputacion: o.contratista
          ? (reputacionPorContratista.get(o.contratista) ?? null)
          : null,
      };
    });

    // Sobrescribir la obra demo con los valores de OBRA_DEMO_PAGOS (70 % ejecución,
    // dato inventado para el guion GTM, no de SECOP).
    data = data.map((o) => {
      if (o.id !== OBRA_DEMO_PAGOS.id) return o;
      const nuevaBrecha = evaluarBrecha(
        OBRA_DEMO_PAGOS.avanceSecop,
        o.avanceCampo ?? null
      );
      return {
        ...o,
        valorPagado: OBRA_DEMO_PAGOS.valorPagado,
        valorFacturado: OBRA_DEMO_PAGOS.valorFacturado,
        geoFuente: OBRA_DEMO_PAGOS.geoFuente,
        avanceSecop: OBRA_DEMO_PAGOS.avanceSecop,
        brecha: nuevaBrecha.gap,
        estadoBrecha: nuevaBrecha.estado,
      };
    });

    const anios = await aniosFechasDisponibles();

    return NextResponse.json({
      success: true,
      data,
      meta: {
        totales: await totalObras(),
        ultimaSync: await ultimaSync(),
        filtros: {
          entidades: await entidadesDisponibles(),
          estados: await estadosDisponibles(),
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
