import { createClient } from "@libsql/client";
import {
  type EstadoUbicacion,
  type GeoConfianza,
  type ObraRow,
} from "@/lib/mapa/types";
import { CALI_BBOX, canonizarDireccionCO } from "@/lib/mapa/direccionCO";

const DB_URL = process.env.LIBSQL_URL ?? "file:./data/mapa.db";

let _client: any = null;
let initialized = false;

async function ensureInit(): Promise<void> {
  if (initialized) return;
  _client = createClient({ url: DB_URL });
  initialized = true;
}

export async function getClient(): Promise<any> {
  await ensureInit();
  return _client;
}

// Helper: ejecuta una consulta y retorna las filas como array de objetos
async function query(sql: string, args: any[] = []): Promise<any[]> {
  const client = await getClient();
  const result = await client.execute(sql, args);
  return result.rows ?? [];
}

// Helper: ejecuta una consulta y retorna la primera fila
async function queryOne(sql: string, args: any[] = []): Promise<any | undefined> {
  const rows = await query(sql, args);
  return rows[0];
}

// Helper: ejecuta una consulta que modifica datos
async function exec(sql: string, args: any[] = []): Promise<{ changes: number; lastInsertRowid?: number }> {
  const client = await getClient();
  const result = await client.execute(sql, args);
  return {
    changes: result.changes ?? 0,
    lastInsertRowid: (result as any).lastInsertRowid,
  };
}

export async function closeDb(): Promise<void> {
  if (_client) {
    await _client.close();
    _client = null;
    initialized = false;
  }
}

export async function getObraPorId(id_contrato: string): Promise<ObraRow | undefined> {
  return (await queryOne(
    "SELECT * FROM obras WHERE id_contrato = ?",
    [id_contrato]
  )) as ObraRow | undefined;
}

export async function guardarLeadB2b(lead: {
  name: string;
  email: string;
  company: string;
  role?: string;
  sector?: string;
  interes_informe?: number;
}): Promise<void> {
  await exec(
    `INSERT INTO leads_b2b (name, email, company, role, sector, interes_informe)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      lead.name.trim(),
      lead.email.trim(),
      lead.company.trim(),
      lead.role?.trim() ?? null,
      lead.sector?.trim() ?? null,
      lead.interes_informe ?? 0,
    ]
  );
}

export async function upsertObra(obra: ObraRow): Promise<"insert" | "update" | "unchanged"> {
  const existing = await queryOne(
    "SELECT hash FROM obras WHERE id_contrato = ?",
    [obra.id_contrato]
  );

  if (existing?.hash === obra.hash && existing.hash !== "") {
    return "unchanged";
  }

  await exec(
    `INSERT INTO obras (
      id_contrato, proceso_de_compra, referencia, entidad_nombre, entidad_nit,
      contratista, contratista_doc, departamento, municipio, descripcion,
      tipo_contrato, unspsc, estado, fecha_firma, fecha_inicio, fecha_fin,
      valor, valor_pagado, valor_facturado, valor_pendiente_ejecucion, valor_pendiente_pago,
      url_secop, direccion_ejecucion, localizacion, is_obra, obra_score,
      obra_razon, barrio, comuna, lat, lon, geo_fuente, geo_confianza,
      estado_ubicacion, geo_intentos, secop_updated_at, synced_at, hash, created_at
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
    )
    ON CONFLICT(id_contrato) DO UPDATE SET
      proceso_de_compra = excluded.proceso_de_compra,
      referencia = excluded.referencia,
      entidad_nombre = excluded.entidad_nombre,
      entidad_nit = excluded.entidad_nit,
      contratista = excluded.contratista,
      contratista_doc = excluded.contratista_doc,
      departamento = excluded.departamento,
      municipio = excluded.municipio,
      descripcion = excluded.descripcion,
      tipo_contrato = excluded.tipo_contrato,
      unspsc = excluded.unspsc,
      estado = excluded.estado,
      fecha_firma = excluded.fecha_firma,
      fecha_inicio = excluded.fecha_inicio,
      fecha_fin = excluded.fecha_fin,
      valor = excluded.valor,
      valor_pagado = excluded.valor_pagado,
      valor_facturado = excluded.valor_facturado,
      valor_pendiente_ejecucion = excluded.valor_pendiente_ejecucion,
      valor_pendiente_pago = excluded.valor_pendiente_pago,
      url_secop = excluded.url_secop,
      direccion_ejecucion = excluded.direccion_ejecucion,
      localizacion = excluded.localizacion,
      is_obra = excluded.is_obra,
      obra_score = excluded.obra_score,
      obra_razon = excluded.obra_razon,
      secop_updated_at = excluded.secop_updated_at,
      synced_at = excluded.synced_at,
      hash = excluded.hash,
      estado_ubicacion = CASE
        WHEN obras.estado_ubicacion = 'no_determinada' AND excluded.direccion_ejecucion IS NOT NULL
          THEN 'pendiente'
        ELSE obras.estado_ubicacion
      END`,
    [
      obra.id_contrato, obra.proceso_de_compra, obra.referencia, obra.entidad_nombre, obra.entidad_nit,
      obra.contratista, obra.contratista_doc, obra.departamento, obra.municipio, obra.descripcion,
      obra.tipo_contrato, obra.unspsc, obra.estado, obra.fecha_firma, obra.fecha_inicio, obra.fecha_fin,
      obra.valor, obra.valor_pagado, obra.valor_facturado, obra.valor_pendiente_ejecucion, obra.valor_pendiente_pago,
      obra.url_secop, obra.direccion_ejecucion, obra.localizacion, obra.is_obra, obra.obra_score,
      obra.obra_razon, obra.barrio, obra.comuna, obra.lat, obra.lon, obra.geo_fuente, obra.geo_confianza,
      obra.estado_ubicacion, obra.geo_intentos, obra.secop_updated_at, obra.synced_at, obra.hash, obra.created_at,
    ]
  );
  return existing ? "update" : "insert";
}

export async function listObras(filtros?: {
  estado?: string;
  entidad?: string;
  minValor?: number;
  maxValor?: number;
  fecha?: string;
  q?: string;
  fechaInicio?: string;
  fechaFin?: string;
}): Promise<ObraRow[]> {
  const where: string[] = ["is_obra = 1", "estado_ubicacion = 'resuelta'"];
  const params: any[] = [];

  if (filtros?.estado && filtros.estado !== "todos") {
    where.push("estado = ?");
    params.push(filtros.estado);
  }
  if (filtros?.entidad && filtros.entidad !== "todos") {
    where.push("entidad_nombre = ?");
    params.push(filtros.entidad);
  }
  if (filtros?.minValor) {
    where.push("valor >= ?");
    params.push(filtros.minValor);
  }
  if (filtros?.maxValor) {
    where.push("valor <= ?");
    params.push(filtros.maxValor);
  }
  if (filtros?.q) {
    where.push(
      `(descripcion LIKE ? OR entidad_nombre LIKE ? OR contratista LIKE ?
        OR referencia LIKE ? OR id_contrato LIKE ? OR barrio LIKE ? OR comuna LIKE ? OR estado LIKE ?)`
    );
    const q = `%${filtros.q}%`;
    params.push(q, q, q, q, q, q, q);
  }
  if (filtros?.fechaInicio) {
    where.push("fecha_inicio IS NOT NULL");
    where.push("(substr(fecha_inicio,1,4) = ? AND fecha_inicio <> '')");
    params.push(filtros.fechaInicio);
  }
  if (filtros?.fechaFin) {
    where.push("fecha_fin IS NOT NULL");
    where.push("(substr(fecha_fin,1,4) = ? AND fecha_fin <> '')");
    params.push(filtros.fechaFin);
  }
  if (filtros?.fecha && filtros.fecha !== "todos") {
    where.push("fecha_firma IS NOT NULL");
    where.push("(substr(fecha_firma,1,4) = ? AND fecha_firma <> '')");
    params.push(filtros.fecha);
  }

  return (await query(
    `SELECT * FROM obras WHERE ${where.join(" AND ")} ORDER BY valor DESC`,
    params
  )) as ObraRow[];
}

export async function listTodasObras(filtros?: {
  estado?: string;
  entidad?: string;
  minValor?: number;
  maxValor?: number;
  fecha?: string;
  q?: string;
  fechaInicio?: string;
  fechaFin?: string;
  ubicacion?: "ubicadas" | "sin_ubicar";
}): Promise<ObraRow[]> {
  const where: string[] = ["is_obra = 1"];
  const params: any[] = [];

  if (filtros?.estado && filtros.estado !== "todos") {
    where.push("estado = ?");
    params.push(filtros.estado);
  }
  if (filtros?.entidad && filtros.entidad !== "todos") {
    where.push("entidad_nombre = ?");
    params.push(filtros.entidad);
  }
  if (filtros?.minValor) {
    where.push("valor >= ?");
    params.push(filtros.minValor);
  }
  if (filtros?.maxValor) {
    where.push("valor <= ?");
    params.push(filtros.maxValor);
  }
  if (filtros?.q) {
    where.push(
      `(descripcion LIKE ? OR entidad_nombre LIKE ? OR contratista LIKE ?
        OR referencia LIKE ? OR id_contrato LIKE ? OR barrio LIKE ? OR comuna LIKE ? OR estado LIKE ?)`
    );
    const q = `%${filtros.q}%`;
    params.push(q, q, q, q, q, q, q);
  }
  if (filtros?.fechaInicio) {
    where.push("fecha_inicio IS NOT NULL");
    where.push("(substr(fecha_inicio,1,4) = ? AND fecha_inicio <> '')");
    params.push(filtros.fechaInicio);
  }
  if (filtros?.fechaFin) {
    where.push("fecha_fin IS NOT NULL");
    where.push("(substr(fecha_fin,1,4) = ? AND fecha_fin <> '')");
    params.push(filtros.fechaFin);
  }
  if (filtros?.fecha && filtros.fecha !== "todos") {
    where.push("fecha_firma IS NOT NULL");
    where.push("(substr(fecha_firma,1,4) = ? AND fecha_firma <> '')");
    params.push(filtros.fecha);
  }
  if (filtros?.ubicacion === "ubicadas") {
    where.push("estado_ubicacion = 'resuelta'");
  } else if (filtros?.ubicacion === "sin_ubicar") {
    where.push("estado_ubicacion <> 'resuelta'");
  }

  return (await query(
    `SELECT * FROM obras WHERE ${where.join(" AND ")} ORDER BY valor DESC`,
    params
  )) as ObraRow[];
}

export async function aniosFechasDisponibles(): Promise<{ inicio: string[]; fin: string[] }> {
  const inicio = await query(
    `SELECT DISTINCT substr(fecha_inicio,1,4) AS anio FROM obras
     WHERE is_obra = 1 AND fecha_inicio IS NOT NULL AND fecha_inicio <> ''
     ORDER BY anio DESC`
  );
  const fin = await query(
    `SELECT DISTINCT substr(fecha_fin,1,4) AS anio FROM obras
     WHERE is_obra = 1 AND fecha_fin IS NOT NULL AND fecha_fin <> ''
     ORDER BY anio DESC`
  );
  return {
    inicio: inicio.map((r) => r.anio),
    fin: fin.map((r) => r.anio),
  };
}

export async function resumenReportesMasivo(): Promise<Record<string, any>> {
  const rows = await query(
    `SELECT
       id_contrato,
       COUNT(*) AS total,
       AVG(calificacion) AS promedio_calificacion,
       SUM(CASE WHEN estado_terreno = 'ejecucion' THEN 1 ELSE 0 END) AS en_ejecucion,
       SUM(CASE WHEN estado_terreno = 'retraso' THEN 1 ELSE 0 END) AS con_retraso,
       SUM(CASE WHEN estado_terreno = 'paralizada' THEN 1 ELSE 0 END) AS paralizadas
     FROM reportes_ciudadanos
     GROUP BY id_contrato`
  );
  const mapa: Record<string, any> = {};
  for (const r of rows) {
    mapa[r.id_contrato] = {
      total: r.total ?? 0,
      promedio_calificacion: r.promedio_calificacion ?? null,
      en_ejecucion: r.en_ejecucion ?? 0,
      con_retraso: r.con_retraso ?? 0,
      paralizadas: r.paralizadas ?? 0,
    };
  }
  return mapa;
}

export async function avancesCampoPorObra(): Promise<Record<string, number | null>> {
  const rows = await query(
    `SELECT id_contrato, ROUND(AVG(avance_observado), 1) AS prom
     FROM reportes_ciudadanos
     WHERE avance_observado IS NOT NULL
     GROUP BY id_contrato`
  );
  const mapa: Record<string, number | null> = {};
  for (const r of rows) mapa[r.id_contrato] = r.prom ?? null;
  return mapa;
}

export async function listObrasPendientesGeo(limit = 150): Promise<ObraRow[]> {
  return (await query(
    `SELECT * FROM obras
     WHERE is_obra = 1 AND estado_ubicacion = 'pendiente'
     ORDER BY
       (CASE WHEN (fecha_fin IS NOT NULL AND fecha_fin <> '' AND substr(fecha_fin,1,10) >= date('now'))
             OR estado IN ('En ejecución', 'Aprobado')
         THEN 0 ELSE 1 END),
           geo_intentos ASC,
           synced_at ASC
     LIMIT ?`,
    [limit]
  )) as ObraRow[];
}

export async function totalObras(): Promise<{
  resueltas: number;
  pendientes: number;
  sin_ubicacion: number;
  conteo: number;
}> {
  const row = await queryOne(
    `SELECT
       COUNT(*) AS conteo,
       SUM(CASE WHEN estado_ubicacion = 'resuelta' AND is_obra = 1 THEN 1 ELSE 0 END) AS resueltas,
       SUM(CASE WHEN estado_ubicacion = 'pendiente' AND is_obra = 1 THEN 1 ELSE 0 END) AS pendientes,
       SUM(CASE WHEN estado_ubicacion = 'no_determinada' AND is_obra = 1 THEN 1 ELSE 0 END) AS sin_ubicacion
     FROM obras`
  ) as any;

  return {
    conteo: row?.conteo ?? 0,
    resueltas: row?.resueltas ?? 0,
    pendientes: row?.pendientes ?? 0,
    sin_ubicacion: row?.sin_ubicacion ?? 0,
  };
}

export async function entidadesDisponibles(): Promise<string[]> {
  const rows = await query(
    `SELECT DISTINCT entidad_nombre FROM obras
     WHERE is_obra = 1 AND entidad_nombre IS NOT NULL AND entidad_nombre <> ''
     ORDER BY entidad_nombre`
  );
  return rows.map((r) => r.entidad_nombre);
}

export async function estadosDisponibles(): Promise<string[]> {
  const rows = await query(
    `SELECT DISTINCT estado FROM obras
     WHERE is_obra = 1 AND estado IS NOT NULL AND estado <> ''
     ORDER BY estado`
  );
  return rows.map((r) => r.estado);
}

export async function cacheUbicacion(
  direccion: string,
  geo: { lat: number; lon: number; comuna?: string; barrio?: string; displayName?: string; fuente: string; confianza: GeoConfianza }
): Promise<void> {
  await exec(
    `INSERT INTO ubicaciones (direccion, lat, lon, comuna, barrio, display_name, fuente, confianza, fecha)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(direccion) DO UPDATE SET
       lat = excluded.lat, lon = excluded.lon, comuna = excluded.comuna,
       barrio = excluded.barrio, display_name = excluded.display_name,
       fuente = excluded.fuente, confianza = excluded.confianza, fecha = excluded.fecha`,
    [
      direccion,
      geo.lat,
      geo.lon,
      geo.comuna ?? null,
      geo.barrio ?? null,
      geo.displayName ?? null,
      geo.fuente,
      geo.confianza,
      new Date().toISOString(),
    ]
  );
}

export async function buscarCacheUbicacion(
  direccion: string
): Promise<{ lat: number; lon: number; comuna?: string | null; barrio?: string | null } | null> {
  const row = await queryOne(
    "SELECT lat, lon, comuna, barrio FROM ubicaciones WHERE direccion = ?",
    [direccion]
  ) as any;
  if (!row) return null;
  return { lat: row.lat, lon: row.lon, comuna: row.comuna, barrio: row.barrio };
}

export async function marcarUbicacion(
  idContrato: string,
  geo: { lat: number; lon: number; comuna?: string; barrio?: string; fuente: string; confianza: GeoConfianza } | null,
  estado: EstadoUbicacion
): Promise<void> {
  await exec(
    `UPDATE obras SET
       lat = ?, lon = ?, comuna = ?, barrio = ?,
       geo_fuente = ?, geo_confianza = ?,
       estado_ubicacion = ?,
       geo_intentos = geo_intentos + 1
     WHERE id_contrato = ?`,
    [
      geo?.lat ?? null,
      geo?.lon ?? null,
      geo?.comuna ?? null,
      geo?.barrio ?? null,
      geo?.fuente ?? null,
      geo?.confianza ?? null,
      estado,
      idContrato,
    ]
  );
}

export async function registrarSyncRun(run: {
  procesados: number;
  nuevas: number;
  actualizadas: number;
  sin_cambios: number;
  geocodificadas: number;
  sin_ubicacion: number;
  error?: string;
}): Promise<void> {
  const now = new Date().toISOString();
  await exec(
    `INSERT INTO sync_runs (
      started_at, finished_at, procesados, nuevas, actualizadas,
      sin_cambios, geocodificadas, sin_ubicacion, error
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      now, now,
      run.procesados, run.nuevas, run.actualizadas,
      run.sin_cambios, run.geocodificadas, run.sin_ubicacion,
      run.error ?? null,
    ]
  );
}

export async function ultimaSync(): Promise<{
  finished_at: string;
  nuevas: number;
  actualizadas: number;
  geocodificadas: number;
  sin_ubicacion: number;
  procesados: number;
} | null> {
  const row = await queryOne(
    `SELECT finished_at, nuevas, actualizadas, geocodificadas, sin_ubicacion, procesados
     FROM sync_runs ORDER BY id DESC LIMIT 1`
  ) as any;
  return row ?? null;
}

export async function obtenerObraPorId(idContrato: string): Promise<ObraRow | null> {
  const row = await queryOne(
    "SELECT * FROM obras WHERE id_contrato = ?",
    [idContrato]
  ) as ObraRow | undefined;
  return row ?? null;
}

export interface NuevoReporteCiudadano {
  id_contrato: string;
  estado_terreno?: string | null;
  avance_observado?: number | null;
  calificacion?: number | null;
  descripcion?: string | null;
  foto?: string | null;
  contacto?: string | null;
  lat?: number | null;
  lon?: number | null;
  gps_origen?: string | null;
}

export interface ReporteCiudadanoRow {
  id: number;
  id_contrato: string;
  estado_terreno: string | null;
  avance_observado: number | null;
  calificacion: number | null;
  descripcion: string | null;
  foto: string | null;
  contacto: string | null;
  lat: number | null;
  lon: number | null;
  gps_origen: string | null;
  estado: string;
  created_at: string;
}

export interface ResumenReportesObra {
  total: number;
  promedio_calificacion: number | null;
  en_ejecucion: number;
  con_retraso: number;
  paralizadas: number;
}

export async function insertarReporteCiudadano(reporte: NuevoReporteCiudadano): Promise<number> {
  const result = await exec(
    `INSERT INTO reportes_ciudadanos (
      id_contrato, estado_terreno, avance_observado, calificacion,
      descripcion, foto, contacto, lat, lon, gps_origen, estado, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pendiente_moderacion', ?)`,
    [
      reporte.id_contrato,
      reporte.estado_terreno ?? null,
      reporte.avance_observado ?? null,
      reporte.calificacion ?? null,
      reporte.descripcion ?? null,
      reporte.foto ?? null,
      reporte.contacto ?? null,
      reporte.lat ?? null,
      reporte.lon ?? null,
      reporte.gps_origen ?? null,
      new Date().toISOString(),
    ]
  );
  return result.lastInsertRowid ?? 0;
}

export async function obtenerReportePorId(id: number): Promise<ReporteCiudadanoRow | null> {
  return (await queryOne(
    "SELECT * FROM reportes_ciudadanos WHERE id = ?",
    [id]
  )) as ReporteCiudadanoRow | null;
}

export async function actualizarReporteCiudadano(
  id: number,
  campos: Omit<NuevoReporteCiudadano, "id_contrato">
): Promise<void> {
  await exec(
    `UPDATE reportes_ciudadanos SET
       estado_terreno = ?,
       avance_observado = ?,
       calificacion = ?,
       descripcion = ?,
       foto = ?,
       lat = ?,
       lon = ?,
       gps_origen = ?
     WHERE id = ?`,
    [
      campos.estado_terreno ?? null,
      campos.avance_observado ?? null,
      campos.calificacion ?? null,
      campos.descripcion ?? null,
      campos.foto ?? null,
      campos.lat ?? null,
      campos.lon ?? null,
      campos.gps_origen ?? null,
      id,
    ]
  );
}

export async function eliminarReporteCiudadano(id: number): Promise<boolean> {
  const result = await exec("DELETE FROM reportes_ciudadanos WHERE id = ?", [id]);
  return result.changes > 0;
}

export async function listarReportesPorObra(idContrato: string): Promise<ReporteCiudadanoRow[]> {
  return (await query(
    `SELECT * FROM reportes_ciudadanos
     WHERE id_contrato = ?
     ORDER BY id DESC LIMIT 50`,
    [idContrato]
  )) as ReporteCiudadanoRow[];
}

export async function resumenReportesPorObra(idContrato: string): Promise<ResumenReportesObra> {
  const row = await queryOne(
    `SELECT
       COUNT(*) AS total,
       AVG(calificacion) AS promedio_calificacion,
       SUM(CASE WHEN estado_terreno = 'ejecucion' THEN 1 ELSE 0 END) AS en_ejecucion,
       SUM(CASE WHEN estado_terreno = 'retraso' THEN 1 ELSE 0 END) AS con_retraso,
       SUM(CASE WHEN estado_terreno = 'paralizada' THEN 1 ELSE 0 END) AS paralizadas
     FROM reportes_ciudadanos
     WHERE id_contrato = ?`,
    [idContrato]
  ) as any;
  return {
    total: row?.total ?? 0,
    promedio_calificacion: row?.promedio_calificacion ?? null,
    en_ejecucion: row?.en_ejecucion ?? 0,
    con_retraso: row?.con_retraso ?? 0,
    paralizadas: row?.paralizadas ?? 0,
  };
}

export async function contarReportesRecientesPorContacto(contacto: string, desde: string): Promise<number> {
  const row = await queryOne(
    `SELECT COUNT(*) AS n FROM reportes_ciudadanos
     WHERE contacto = ? AND created_at >= ?`,
    [contacto, desde]
  ) as any;
  return row?.n ?? 0;
}

export interface NuevaRespuesta {
  id_reporte: number;
  autor?: string | null;
  texto: string;
  es_oficial?: number;
  fijada?: number;
}

export interface RespuestaRow {
  id: number;
  id_reporte: number;
  autor: string | null;
  texto: string;
  es_oficial: number;
  fijada: number;
  created_at: string;
}

export interface ResumenRespuestasReporte {
  total: number;
  hay_fijada: boolean;
  respuesta_fijada: RespuestaRow | null;
}

export async function insertarRespuesta(respuesta: NuevaRespuesta): Promise<number> {
  const result = await exec(
    `INSERT INTO respuestas_reportes (
      id_reporte, autor, texto, es_oficial, fijada, created_at
    ) VALUES (?, ?, ?, ?, ?, ?)`,
    [
      respuesta.id_reporte,
      respuesta.autor?.trim() || null,
      respuesta.texto.trim(),
      respuesta.es_oficial ?? 0,
      respuesta.fijada ?? 0,
      new Date().toISOString(),
    ]
  );
  return result.lastInsertRowid ?? 0;
}

export async function obtenerRespuestaPorId(id: number): Promise<RespuestaRow | null> {
  return (await queryOne(
    "SELECT * FROM respuestas_reportes WHERE id = ?",
    [id]
  )) as RespuestaRow | null;
}

export async function listarRespuestasPorReporte(idReporte: number): Promise<RespuestaRow[]> {
  return (await query(
    `SELECT * FROM respuestas_reportes
     WHERE id_reporte = ?
     ORDER BY fijada DESC, id DESC`,
    [idReporte]
  )) as RespuestaRow[];
}

export async function resumenRespuestasPorReporte(idReporte: number): Promise<ResumenRespuestasReporte> {
  const respuestas = await listarRespuestasPorReporte(idReporte);
  return {
    total: respuestas.length,
    hay_fijada: respuestas.some((r) => r.fijada === 1),
    respuesta_fijada: respuestas.find((r) => r.fijada === 1) ?? null,
  };
}

export async function actualizarRespuesta(
  id: number,
  campos: { texto?: string; es_oficial?: number; fijada?: number }
): Promise<void> {
  const existente = await obtenerRespuestaPorId(id);
  if (!existente) return;
  const texto = campos.texto !== undefined ? campos.texto.trim() : existente.texto;
  const es_oficial =
    campos.es_oficial !== undefined ? (campos.es_oficial ? 1 : 0) : existente.es_oficial;
  const fijada =
    campos.fijada !== undefined ? (campos.fijada ? 1 : 0) : existente.fijada;
  await exec(
    `UPDATE respuestas_reportes SET
       autor = ?, texto = ?,
       es_oficial = ?, fijada = ?
     WHERE id = ?`,
    [existente.autor, texto, es_oficial, fijada, id]
  );
}

export async function eliminarRespuesta(id: number): Promise<boolean> {
  const result = await exec("DELETE FROM respuestas_reportes WHERE id = ?", [id]);
  return result.changes > 0;
}

export async function fijarRespuestaOficial(idRespuesta: number): Promise<RespuestaRow | null> {
  const respuesta = await obtenerRespuestaPorId(idRespuesta);
  if (!respuesta) return null;

  const reporte = await obtenerReportePorId(respuesta.id_reporte);
  if (!reporte) return null;

  const reportesDeLaObra = await listarReportesPorObra(reporte.id_contrato);
  const idsReportes = reportesDeLaObra.map((r) => r.id);
  if (idsReportes.length > 0) {
    const placeholders = idsReportes.map(() => "?").join(",");
    await exec(
      `UPDATE respuestas_reportes SET fijada = 0
       WHERE id_reporte IN (${placeholders})`,
      idsReportes
    );
  }

  await exec(
    "UPDATE respuestas_reportes SET fijada = 1, es_oficial = 1 WHERE id = ?",
    [idRespuesta]
  );

  return await obtenerRespuestaPorId(idRespuesta);
}

export async function desfijarRespuesta(idRespuesta: number): Promise<void> {
  await exec("UPDATE respuestas_reportes SET fijada = 0 WHERE id = ?", [idRespuesta]);
}

export type NivelReputacion = "confiable" | "observado" | "critico" | "sin_datos";

export interface ReputacionContratista {
  contratista: string;
  n_obras: number;
  valor_concesionado: number | null;
  n_reportes: number;
  promedio_calificacion: number | null;
  con_retraso: number;
  paralizadas: number;
  score: number | null;
  nivel: NivelReputacion;
}

export const MIN_REPORTES_PARA_NIVEL = 3;

export function nivelReputacion(score: number | null, nReportes: number): NivelReputacion {
  if (score === null || nReportes < MIN_REPORTES_PARA_NIVEL) return "sin_datos";
  if (score >= 4.2) return "confiable";
  if (score >= 3.0) return "observado";
  return "critico";
}

export function calcularScoreReputacion(r: {
  promedio_calificacion: number | null;
  con_retraso: number;
  paralizadas: number;
  n_reportes: number;
  antiguedad_total_dias?: number;
}): number | null {
  if (r.promedio_calificacion === null || r.n_reportes === 0) return null;
  const penalizacion = (r.con_retraso * 0.8 + r.paralizadas * 1.5) / r.n_reportes;
  const score = Math.max(1, Math.min(5, r.promedio_calificacion - penalizacion));
  return Math.round(score * 100) / 100;
}

export async function resumenReputacionContratistas(): Promise<ReputacionContratista[]> {
  const rows = await query(
    `SELECT
       o.contratista AS contratista,
       COUNT(DISTINCT o.id_contrato) AS n_obras,
       (SELECT SUM(ob2.valor) FROM obras ob2
        WHERE ob2.contratista = o.contratista AND ob2.is_obra = 1
       ) AS valor_concesionado,
       COUNT(r.id) AS n_reportes,
       AVG(r.calificacion) AS promedio_calificacion,
       SUM(CASE WHEN r.estado_terreno = 'retraso' THEN 1 ELSE 0 END) AS con_retraso,
       SUM(CASE WHEN r.estado_terreno = 'paralizada' THEN 1 ELSE 0 END) AS paralizadas,
       MIN(r.created_at) AS primer_reporte,
       MAX(r.created_at) AS ultimo_reporte
     FROM obras o
     LEFT JOIN reportes_ciudadanos r ON r.id_contrato = o.id_contrato
     WHERE o.is_obra = 1
       AND o.contratista IS NOT NULL
       AND o.contratista <> ''
     GROUP BY o.contratista`
  ) as {
    contratista: string;
    n_obras: number;
    valor_concesionado: number | null;
    n_reportes: number;
    promedio_calificacion: number | null;
    con_retraso: number;
    paralizadas: number;
    primer_reporte: string | null;
    ultimo_reporte: string | null;
  }[];

  return rows.map((r) => {
    const n_reportes = r.n_reportes ?? 0;
    const score = calcularScoreReputacion({
      promedio_calificacion: r.promedio_calificacion ?? null,
      con_retraso: r.con_retraso ?? 0,
      paralizadas: r.paralizadas ?? 0,
      n_reportes,
    });
    return {
      contratista: r.contratista,
      n_obras: r.n_obras ?? 0,
      valor_concesionado: r.valor_concesionado ?? null,
      n_reportes,
      promedio_calificacion: r.promedio_calificacion ?? null,
      con_retraso: r.con_retraso ?? 0,
      paralizadas: r.paralizadas ?? 0,
      score,
      nivel: nivelReputacion(score, n_reportes),
    };
  });
}

export async function sembrarReportesDemo(): Promise<{ sembrados: number }> {
  const existentes = (await resumenReputacionContratistas()).filter(
    (r) => r.n_reportes >= MIN_REPORTES_PARA_NIVEL
  );
  if (existentes.length >= 6) {
    return { sembrados: 0 };
  }

  const candidatos = await query(
    `SELECT o.contratista AS contratista, o.id_contrato AS id_contrato
     FROM obras o
     WHERE o.is_obra = 1
       AND o.contratista IS NOT NULL AND o.contratista <> ''
       AND o.id_contrato NOT IN (
         SELECT id_contrato FROM reportes_ciudadanos
         GROUP BY id_contrato
         HAVING COUNT(*) >= 1
       )
     ORDER BY o.valor DESC
     LIMIT ?`,
    [6 - existentes.length]
  ) as {
    contratista: string;
    id_contrato: string;
  }[];

  const perfiles: Array<{
    estado_terreno: string;
    avance_observado: number;
    calificacion: number;
  }> = [
    { estado_terreno: "ejecucion", avance_observado: 75, calificacion: 5 },
    { estado_terreno: "ejecucion", avance_observado: 60, calificacion: 4 },
    { estado_terreno: "retraso", avance_observado: 30, calificacion: 2 },
    { estado_terreno: "paralizada", avance_observado: 10, calificacion: 1 },
  ];

  let sembrados = 0;
  for (const candidato of candidatos) {
    const hecha = await queryOne(
      "SELECT 1 AS x FROM meta WHERE clave = 'seed_reputacion_demo' AND valor = ?",
      [candidato.id_contrato]
    );
    if (hecha) continue;
    for (let i = 0; i < 4; i++) {
      const perfil = perfiles[(sembrados + i) % perfiles.length];
      await exec(
        `INSERT INTO reportes_ciudadanos (
          id_contrato, estado_terreno, avance_observado, calificacion,
          descripcion, foto, contacto, lat, lon, gps_origen, estado, created_at
        ) VALUES (?, ?, ?, ?, ?, NULL, 'demo@obra-visible.demo', NULL, NULL, 'obra', 'verificado', ?)`,
        [
          candidato.id_contrato,
          perfil.estado_terreno,
          perfil.avance_observado,
          perfil.calificacion,
          "Reporte demo de reputación de contratista (spec 024).",
          new Date(Date.now() - (sembrados * 3 + i) * 86_400_000).toISOString(),
        ]
      );
    }
    await exec(
      "INSERT OR REPLACE INTO meta (clave, valor) VALUES (?, ?)",
      ["seed_reputacion_demo", candidato.id_contrato]
    );
    sembrados++;
  }
  return { sembrados };
}

export async function migrarGeoV2(): Promise<{
  purgadas: number;
  llavesViejas: number;
  reabiertas: number;
}> {
  const hecha = await queryOne(
    "SELECT valor FROM meta WHERE clave = 'geo_migracion_v2'"
  ) as any;
  if (hecha) return { purgadas: 0, llavesViejas: 0, reabiertas: 0 };

  const purga = await exec(
    `DELETE FROM ubicaciones WHERE lat NOT BETWEEN ? AND ? OR lon NOT BETWEEN ? AND ?`,
    [CALI_BBOX.minLat, CALI_BBOX.maxLat, CALI_BBOX.minLon, CALI_BBOX.maxLon]
  );

  const llaves = await query("SELECT direccion FROM ubicaciones") as { direccion: string }[];
  let llavesViejas = 0;
  for (const { direccion } of llaves) {
    if (direccion !== canonizarDireccionCO(direccion)) {
      await exec("DELETE FROM ubicaciones WHERE direccion = ?", [direccion]);
      llavesViejas++;
    }
  }

  const resueltas = await query(
    "SELECT id_contrato, direccion_ejecucion FROM obras WHERE estado_ubicacion = 'resuelta'"
  ) as { id_contrato: string; direccion_ejecucion: string | null }[];
  let reabiertas = 0;
  for (const r of resueltas) {
    const canon = canonizarDireccionCO(r.direccion_ejecucion ?? "");
    if (!canon) {
      await exec(
        `UPDATE obras SET lat = NULL, lon = NULL, comuna = NULL, barrio = NULL,
          geo_fuente = NULL, geo_confianza = NULL,
          estado_ubicacion = 'pendiente', geo_intentos = 0
         WHERE id_contrato = ?`,
        [r.id_contrato]
      );
      reabiertas++;
      continue;
    }
    const existe = await queryOne(
      "SELECT 1 FROM ubicaciones WHERE direccion = ?",
      [canon]
    );
    if (!existe) {
      await exec(
        `UPDATE obras SET lat = NULL, lon = NULL, comuna = NULL, barrio = NULL,
          geo_fuente = NULL, geo_confianza = NULL,
          estado_ubicacion = 'pendiente', geo_intentos = 0
         WHERE id_contrato = ?`,
        [r.id_contrato]
      );
      reabiertas++;
    }
  }

  await exec(
    "INSERT INTO meta (clave, valor) VALUES (?, ?)",
    ["geo_migracion_v2", new Date().toISOString()]
  );
  return {
    purgadas: purga.changes,
    llavesViejas,
    reabiertas,
  };
}
