import crypto from "node:crypto";
import {
  buscarCacheUbicacion,
  cacheUbicacion,
  listObrasPendientesGeo,
  marcarUbicacion,
  registrarSyncRun,
  totalObras,
  upsertObra,
} from "@/lib/mapa/db";
import { geocodificarObra } from "@/lib/mapa/geocodeService";
import {
  clasificarYFiltrar,
  extraerContratosCali,
} from "@/lib/mapa/secopFetcher";
import type {
  GeoResult,
  ObraNormalizada,
  ObraRow,
  SyncResult,
} from "@/lib/mapa/types";

const CAP_GEOCODIFICACION_CORRIDA = Number(process.env.MAPA_GEO_CAP_CORRIDA ?? 120);

let sincronizando = false;

export function estaSincronizando(): boolean {
  return sincronizando;
}

function calcularHash(contrato: ObraNormalizada, isObra: boolean): string {
  const canonico = [
    contrato.id_contrato,
    contrato.entidad_nombre,
    contrato.entidad_nit,
    contrato.contratista,
    contrato.contratista_doc,
    contrato.descripcion,
    contrato.tipo_contrato,
    contrato.estado,
    contrato.fecha_firma,
    contrato.fecha_inicio,
    contrato.fecha_fin,
    String(contrato.valor),
    contrato.url_secop,
    isObra ? "obra" : "no-obra",
  ].join("|");
  return crypto.createHash("sha1").update(canonico).digest("hex");
}

function construirFila(contrato: ObraNormalizada): ObraRow {
  const clasificacion = clasificarYFiltrar(contrato);
  const now = new Date().toISOString();

  return {
    id_contrato: contrato.id_contrato,
    proceso_de_compra: contrato.proceso_de_compra || null,
    referencia: contrato.referencia || null,
    entidad_nombre: contrato.entidad_nombre || null,
    entidad_nit: contrato.entidad_nit || null,
    contratista: contrato.contratista || null,
    contratista_doc: contrato.contratista_doc || null,
    departamento: contrato.departamento || null,
    municipio: contrato.municipio || null,
    descripcion: contrato.descripcion || null,
    tipo_contrato: contrato.tipo_contrato || null,
    unspsc: contrato.unspsc || null,
    estado: contrato.estado || null,
    fecha_firma: contrato.fecha_firma || null,
    fecha_inicio: contrato.fecha_inicio || null,
    fecha_fin: contrato.fecha_fin || null,
    valor: contrato.valor,
    url_secop: contrato.url_secop || null,
    direccion_ejecucion: contrato.direccion_ejecucion || null,
    localizacion: contrato.localizacion || null,
    is_obra: clasificacion.isObra ? 1 : 0,
    obra_score: clasificacion.score,
    obra_razon: clasificacion.reason,
    barrio: null,
    comuna: null,
    lat: null,
    lon: null,
    geo_fuente: null,
    geo_confianza: null,
    estado_ubicacion: "pendiente",
    geo_intentos: 0,
    secop_updated_at: contrato.secop_updated_at || null,
    synced_at: now,
    hash: calcularHash(contrato, clasificacion.isObra),
    created_at: now,
  };
}

export async function syncMapa(): Promise<SyncResult> {
  if (sincronizando) throw new Error("Ya hay una sincronización en curso");
  sincronizando = true;
  const inicio = Date.now();

  try {
    const contratos = await extraerContratosCali();
    let nuevas = 0;
    let actualizadas = 0;
    let sinCambios = 0;

    for (const contrato of contratos) {
      if (!contrato.id_contrato) continue;
      const fila = construirFila(contrato);
      if (fila.is_obra !== 1) continue;

      const resultado = upsertObra(fila);
      if (resultado === "insert") nuevas++;
      else if (resultado === "update") actualizadas++;
      else sinCambios++;
    }

    const pendientes = listObrasPendientesGeo(CAP_GEOCODIFICACION_CORRIDA);
    let geocodificadas = 0;

    for (const obra of pendientes) {
      const direccionCache = obra.direccion_ejecucion || "";
      const cache = direccionCache ? buscarCacheUbicacion(direccionCache) : null;

      if (cache) {
        marcarUbicacion(
          obra.id_contrato,
          { lat: cache.lat, lon: cache.lon, comuna: cache.comuna ?? undefined, barrio: cache.barrio ?? undefined, fuente: "cache-ubicaciones", confianza: "media" },
          "resuelta"
        );
        geocodificadas++;
        continue;
      }

      if (obra.geo_intentos >= 2) {
        marcarUbicacion(obra.id_contrato, null, "no_determinada");
        continue;
      }

      const geo: GeoResult | null = await geocodificarObra(obra);
      if (geo) {
        marcarUbicacion(obra.id_contrato, geo, "resuelta");
        if (direccionCache) {
          cacheUbicacion(direccionCache, { lat: geo.lat, lon: geo.lon, comuna: geo.comuna, barrio: geo.barrio, displayName: geo.displayName, fuente: geo.fuente, confianza: geo.confianza });
        }
        geocodificadas++;
      }
    }

    const total = totalObras();
    const resultado: SyncResult = {
      procesados: contratos.length,
      nuevas,
      actualizadas,
      sin_cambios: sinCambios,
      geocodificadas,
      sin_ubicacion: total.sin_ubicacion,
      fecha: new Date().toISOString(),
      durSeg: Math.round((Date.now() - inicio) / 1000),
    };

    registrarSyncRun({
      procesados: resultado.procesados,
      nuevas: resultado.nuevas,
      actualizadas: resultado.actualizadas,
      sin_cambios: resultado.sin_cambios,
      geocodificadas: resultado.geocodificadas,
      sin_ubicacion: resultado.sin_ubicacion,
    });

    return resultado;
  } catch (error) {
    const mensaje = (error as Error).message;
    registrarSyncRun({
      procesados: 0,
      nuevas: 0,
      actualizadas: 0,
      sin_cambios: 0,
      geocodificadas: 0,
      sin_ubicacion: 0,
      error: mensaje,
    });
    throw error;
  } finally {
    sincronizando = false;
  }
}