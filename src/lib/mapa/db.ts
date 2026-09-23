import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import {
  type EstadoUbicacion,
  type GeoConfianza,
  type ObraRow,
} from "@/lib/mapa/types";
import { CALI_BBOX, canonizarDireccionCO } from "@/lib/mapa/direccionCO";

let db: Database.Database | null = null;

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "mapa.db");

const SCHEMA = `
CREATE TABLE IF NOT EXISTS obras (
  id_contrato TEXT PRIMARY KEY,
  proceso_de_compra TEXT,
  referencia TEXT,
  entidad_nombre TEXT,
  entidad_nit TEXT,
  contratista TEXT,
  contratista_doc TEXT,
  departamento TEXT,
  municipio TEXT,
  descripcion TEXT,
  tipo_contrato TEXT,
  unspsc TEXT,
  estado TEXT,
  fecha_firma TEXT,
  fecha_inicio TEXT,
  fecha_fin TEXT,
  valor INTEGER,
  url_secop TEXT,
  direccion_ejecucion TEXT,
  localizacion TEXT,
  is_obra INTEGER DEFAULT 1,
  obra_score INTEGER DEFAULT 0,
  obra_razon TEXT,
  barrio TEXT,
  comuna TEXT,
  lat REAL,
  lon REAL,
  geo_fuente TEXT,
  geo_confianza TEXT,
  estado_ubicacion TEXT DEFAULT 'pendiente',
  geo_intentos INTEGER DEFAULT 0,
  secop_updated_at TEXT,
  synced_at TEXT,
  hash TEXT,
  created_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_obras_estado ON obras(estado);
CREATE INDEX IF NOT EXISTS idx_obras_municipio ON obras(municipio);
CREATE INDEX IF NOT EXISTS idx_obras_geo ON obras(estado_ubicacion);
CREATE INDEX IF NOT EXISTS idx_obras_entidad ON obras(entidad_nombre);

CREATE TABLE IF NOT EXISTS ubicaciones (
  direccion TEXT PRIMARY KEY,
  lat REAL,
  lon REAL,
  comuna TEXT,
  barrio TEXT,
  display_name TEXT,
  fuente TEXT,
  confianza TEXT,
  fecha TEXT
);

CREATE TABLE IF NOT EXISTS sync_runs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  started_at TEXT,
  finished_at TEXT,
  procesados INTEGER DEFAULT 0,
  nuevas INTEGER DEFAULT 0,
  actualizadas INTEGER DEFAULT 0,
  sin_cambios INTEGER DEFAULT 0,
  geocodificadas INTEGER DEFAULT 0,
  sin_ubicacion INTEGER DEFAULT 0,
  error TEXT
);

CREATE TABLE IF NOT EXISTS meta (
  clave TEXT PRIMARY KEY,
  valor TEXT
);

CREATE TABLE IF NOT EXISTS reportes_ciudadanos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  id_contrato TEXT NOT NULL,
  estado_terreno TEXT,
  avance_observado INTEGER CHECK (avance_observado BETWEEN 0 AND 100),
  calificacion INTEGER CHECK (calificacion BETWEEN 1 AND 5),
  descripcion TEXT,
  foto TEXT,
  contacto TEXT,
  lat REAL,
  lon REAL,
  gps_origen TEXT,
  estado TEXT DEFAULT 'pendiente_moderacion',
  created_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_reportes_contrato ON reportes_ciudadanos(id_contrato);
CREATE INDEX IF NOT EXISTS idx_reportes_estado ON reportes_ciudadanos(estado);
`;

export function getDb(): Database.Database {
  if (!db) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    db = new Database(DB_PATH);
    db.pragma("journal_mode = WAL");
    db.exec(SCHEMA);
  }
  return db;
}

export function closeDb(): void {
  if (db) {
    db.close();
    db = null;
  }
}

export function upsertObra(obra: ObraRow): "insert" | "update" | "unchanged" {
  const database = getDb();
  const existing = database
    .prepare("SELECT hash FROM obras WHERE id_contrato = ?")
    .get(obra.id_contrato) as { hash: string } | undefined;

  if (existing?.hash === obra.hash && existing.hash !== "") {
    return "unchanged";
  }

  database
    .prepare(
      `INSERT INTO obras (
        id_contrato, proceso_de_compra, referencia, entidad_nombre, entidad_nit,
        contratista, contratista_doc, departamento, municipio, descripcion,
        tipo_contrato, unspsc, estado, fecha_firma, fecha_inicio, fecha_fin,
        valor, url_secop, direccion_ejecucion, localizacion, is_obra, obra_score,
        obra_razon, barrio, comuna, lat, lon, geo_fuente, geo_confianza,
        estado_ubicacion, geo_intentos, secop_updated_at, synced_at, hash, created_at
      ) VALUES (
        @id_contrato, @proceso_de_compra, @referencia, @entidad_nombre, @entidad_nit,
        @contratista, @contratista_doc, @departamento, @municipio, @descripcion,
        @tipo_contrato, @unspsc, @estado, @fecha_firma, @fecha_inicio, @fecha_fin,
        @valor, @url_secop, @direccion_ejecucion, @localizacion, @is_obra, @obra_score,
        @obra_razon, @barrio, @comuna, @lat, @lon, @geo_fuente, @geo_confianza,
        @estado_ubicacion, @geo_intentos, @secop_updated_at, @synced_at, @hash, @created_at
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
        END
    `
    )
    .run(obra);

  return existing ? "update" : "insert";
}

export function listObras(filtros?: {
  estado?: string;
  entidad?: string;
  minValor?: number;
  maxValor?: number;
  fecha?: string;
}): ObraRow[] {
  const database = getDb();
  const where: string[] = ["is_obra = 1", "estado_ubicacion = 'resuelta'"];
  const params: Record<string, unknown> = {};

  if (filtros?.estado && filtros.estado !== "todos") {
    where.push("estado = @estado");
    params.estado = filtros.estado;
  }
  if (filtros?.entidad && filtros.entidad !== "todos") {
    where.push("entidad_nombre = @entidad");
    params.entidad = filtros.entidad;
  }
  if (filtros?.minValor) {
    where.push("valor >= @minValor");
    params.minValor = filtros.minValor;
  }
  if (filtros?.maxValor) {
    where.push("valor <= @maxValor");
    params.maxValor = filtros.maxValor;
  }
  if (filtros?.fecha && filtros.fecha !== "todos") {
    where.push("fecha_firma IS NOT NULL");
    where.push("(substr(fecha_firma,1,4) = @fecha AND fecha_firma <> '')");
    params.fecha = filtros.fecha;
  }

  return database
    .prepare(`SELECT * FROM obras WHERE ${where.join(" AND ")} ORDER BY valor DESC`)
    .all(params) as ObraRow[];
}

export function listTodasObras(filtros?: {
  estado?: string;
  entidad?: string;
  minValor?: number;
  maxValor?: number;
  fecha?: string;
  ubicacion?: "ubicadas" | "sin_ubicar";
}): ObraRow[] {
  const database = getDb();
  const where: string[] = ["is_obra = 1"];
  const params: Record<string, unknown> = {};

  if (filtros?.estado && filtros.estado !== "todos") {
    where.push("estado = @estado");
    params.estado = filtros.estado;
  }
  if (filtros?.entidad && filtros.entidad !== "todos") {
    where.push("entidad_nombre = @entidad");
    params.entidad = filtros.entidad;
  }
  if (filtros?.minValor) {
    where.push("valor >= @minValor");
    params.minValor = filtros.minValor;
  }
  if (filtros?.maxValor) {
    where.push("valor <= @maxValor");
    params.maxValor = filtros.maxValor;
  }
  if (filtros?.fecha && filtros.fecha !== "todos") {
    where.push("fecha_firma IS NOT NULL");
    where.push("(substr(fecha_firma,1,4) = @fecha AND fecha_firma <> '')");
    params.fecha = filtros.fecha;
  }
  if (filtros?.ubicacion === "ubicadas") {
    where.push("estado_ubicacion = 'resuelta'");
  } else if (filtros?.ubicacion === "sin_ubicar") {
    where.push("estado_ubicacion <> 'resuelta'");
  }

  return database
    .prepare(`SELECT * FROM obras WHERE ${where.join(" AND ")} ORDER BY valor DESC`)
    .all(params) as ObraRow[];
}

export function resumenReportesMasivo(): Record<string, ResumenReportesObra> {
  const database = getDb();
  const rows = database
    .prepare(
      `SELECT
         id_contrato,
         COUNT(*) AS total,
         AVG(calificacion) AS promedio_calificacion,
         SUM(CASE WHEN estado_terreno = 'retraso' THEN 1 ELSE 0 END) AS con_retraso,
         SUM(CASE WHEN estado_terreno = 'paralizada' THEN 1 ELSE 0 END) AS paralizadas
       FROM reportes_ciudadanos
       GROUP BY id_contrato`
    )
    .all() as {
    id_contrato: string;
    total: number;
    promedio_calificacion: number | null;
    con_retraso: number;
    paralizadas: number;
  }[];
  const mapa: Record<string, ResumenReportesObra> = {};
  for (const r of rows) {
    mapa[r.id_contrato] = {
      total: r.total ?? 0,
      promedio_calificacion: r.promedio_calificacion ?? null,
      con_retraso: r.con_retraso ?? 0,
      paralizadas: r.paralizadas ?? 0,
    };
  }
  return mapa;
}

export function listObrasPendientesGeo(limit = 150): ObraRow[] {
  const database = getDb();
  return database
    .prepare(
      `SELECT * FROM obras
       WHERE is_obra = 1 AND estado_ubicacion = 'pendiente'
       ORDER BY geo_intentos ASC, synced_at ASC
       LIMIT ?`
    )
    .all(limit) as ObraRow[];
}

export function totalObras(): { resueltas: number; pendientes: number; sin_ubicacion: number; conteo: number } {
  const database = getDb();
  const row = database
    .prepare(
      `SELECT
         COUNT(*) AS conteo,
         SUM(CASE WHEN estado_ubicacion = 'resuelta' AND is_obra = 1 THEN 1 ELSE 0 END) AS resueltas,
         SUM(CASE WHEN estado_ubicacion = 'pendiente' AND is_obra = 1 THEN 1 ELSE 0 END) AS pendientes,
         SUM(CASE WHEN estado_ubicacion = 'no_determinada' AND is_obra = 1 THEN 1 ELSE 0 END) AS sin_ubicacion
       FROM obras`
    )
    .get() as { conteo: number; resueltas: number; pendientes: number; sin_ubicacion: number };

  return {
    conteo: row.conteo ?? 0,
    resueltas: row.resueltas ?? 0,
    pendientes: row.pendientes ?? 0,
    sin_ubicacion: row.sin_ubicacion ?? 0,
  };
}

export function entidadesDisponibles(): string[] {
  const database = getDb();
  const rows = database
    .prepare(
      `SELECT DISTINCT entidad_nombre FROM obras
       WHERE is_obra = 1 AND entidad_nombre IS NOT NULL AND entidad_nombre <> ''
       ORDER BY entidad_nombre`
    )
    .all() as { entidad_nombre: string }[];
  return rows.map((r) => r.entidad_nombre);
}

export function estadosDisponibles(): string[] {
  const database = getDb();
  const rows = database
    .prepare(
      `SELECT DISTINCT estado FROM obras
       WHERE is_obra = 1 AND estado IS NOT NULL AND estado <> ''
       ORDER BY estado`
    )
    .all() as { estado: string }[];
  return rows.map((r) => r.estado);
}

export function cacheUbicacion(direccion: string, geo: { lat: number; lon: number; comuna?: string; barrio?: string; displayName?: string; fuente: string; confianza: GeoConfianza }): void {
  const database = getDb();
  database
    .prepare(
      `INSERT INTO ubicaciones (direccion, lat, lon, comuna, barrio, display_name, fuente, confianza, fecha)
       VALUES (@direccion, @lat, @lon, @comuna, @barrio, @displayName, @fuente, @confianza, @fecha)
       ON CONFLICT(direccion) DO UPDATE SET
         lat = excluded.lat, lon = excluded.lon, comuna = excluded.comuna,
         barrio = excluded.barrio, display_name = excluded.display_name,
         fuente = excluded.fuente, confianza = excluded.confianza, fecha = excluded.fecha`
    )
    .run({
      direccion: direccion,
      lat: geo.lat,
      lon: geo.lon,
      comuna: geo.comuna ?? null,
      barrio: geo.barrio ?? null,
      displayName: geo.displayName ?? null,
      fuente: geo.fuente,
      confianza: geo.confianza,
      fecha: new Date().toISOString(),
    });
}

export function buscarCacheUbicacion(direccion: string): {
  lat: number;
  lon: number;
  comuna?: string | null;
  barrio?: string | null;
} | null {
  const database = getDb();
  const row = database
    .prepare(
      "SELECT lat, lon, comuna, barrio FROM ubicaciones WHERE direccion = ?"
    )
    .get(direccion) as { lat: number; lon: number; comuna: string | null; barrio: string | null } | undefined;
  if (!row) return null;
  return { lat: row.lat, lon: row.lon, comuna: row.comuna, barrio: row.barrio };
}

export function marcarUbicacion(
  idContrato: string,
  geo: { lat: number; lon: number; comuna?: string; barrio?: string; fuente: string; confianza: GeoConfianza } | null,
  estado: EstadoUbicacion
): void {
  const database = getDb();
  database
    .prepare(
      `UPDATE obras SET
         lat = @lat, lon = @lon, comuna = @comuna, barrio = @barrio,
         geo_fuente = @fuente, geo_confianza = @confianza,
         estado_ubicacion = @estado,
         geo_intentos = geo_intentos + 1
       WHERE id_contrato = @id`
    )
    .run({
      id: idContrato,
      lat: geo?.lat ?? null,
      lon: geo?.lon ?? null,
      comuna: geo?.comuna ?? null,
      barrio: geo?.barrio ?? null,
      fuente: geo?.fuente ?? null,
      confianza: geo?.confianza ?? null,
      estado,
    });
}

export function registrarSyncRun(run: {
  procesados: number;
  nuevas: number;
  actualizadas: number;
  sin_cambios: number;
  geocodificadas: number;
  sin_ubicacion: number;
  error?: string;
}): void {
  const database = getDb();
  const now = new Date().toISOString();
  database
    .prepare(
      `INSERT INTO sync_runs (
        started_at, finished_at, procesados, nuevas, actualizadas,
        sin_cambios, geocodificadas, sin_ubicacion, error
      ) VALUES (@started, @finished, @procesados, @nuevas, @actualizadas, @sin_cambios, @geocodificadas, @sin_ubicacion, @error)`
    )
    .run({
      started: now,
      finished: now,
      procesados: run.procesados,
      nuevas: run.nuevas,
      actualizadas: run.actualizadas,
      sin_cambios: run.sin_cambios,
      geocodificadas: run.geocodificadas,
      sin_ubicacion: run.sin_ubicacion,
      error: run.error ?? null,
    });
}

export function ultimaSync(): { finished_at: string; nuevas: number; actualizadas: number; geocodificadas: number; sin_ubicacion: number; procesados: number } | null {
  const database = getDb();
  const row = database
    .prepare(
      `SELECT finished_at, nuevas, actualizadas, geocodificadas, sin_ubicacion, procesados
       FROM sync_runs ORDER BY id DESC LIMIT 1`
    )
    .get() as
    | { finished_at: string; nuevas: number; actualizadas: number; geocodificadas: number; sin_ubicacion: number; procesados: number }
    | undefined;
  return row ?? null;
}

export function obtenerObraPorId(idContrato: string): ObraRow | null {
  const database = getDb();
  const row = database
    .prepare("SELECT * FROM obras WHERE id_contrato = ?")
    .get(idContrato) as ObraRow | undefined;
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
  con_retraso: number;
  paralizadas: number;
}

export function insertarReporteCiudadano(reporte: NuevoReporteCiudadano): number {
  const database = getDb();
  const result = database
    .prepare(
      `INSERT INTO reportes_ciudadanos (
        id_contrato, estado_terreno, avance_observado, calificacion,
        descripcion, foto, contacto, lat, lon, gps_origen, estado, created_at
      ) VALUES (
        @id_contrato, @estado_terreno, @avance_observado, @calificacion,
        @descripcion, @foto, @contacto, @lat, @lon, @gps_origen, 'pendiente_moderacion', @created_at
      )`
    )
    .run({
      id_contrato: reporte.id_contrato,
      estado_terreno: reporte.estado_terreno ?? null,
      avance_observado: reporte.avance_observado ?? null,
      calificacion: reporte.calificacion ?? null,
      descripcion: reporte.descripcion ?? null,
      foto: reporte.foto ?? null,
      contacto: reporte.contacto ?? null,
      lat: reporte.lat ?? null,
      lon: reporte.lon ?? null,
      gps_origen: reporte.gps_origen ?? null,
      created_at: new Date().toISOString(),
    });
  return Number(result.lastInsertRowid);
}

export function listarReportesPorObra(idContrato: string): ReporteCiudadanoRow[] {
  const database = getDb();
  return database
    .prepare(
      `SELECT * FROM reportes_ciudadanos
       WHERE id_contrato = ?
       ORDER BY id DESC LIMIT 50`
    )
    .all(idContrato) as ReporteCiudadanoRow[];
}

export function resumenReportesPorObra(idContrato: string): ResumenReportesObra {
  const database = getDb();
  const row = database
    .prepare(
      `SELECT
         COUNT(*) AS total,
         AVG(calificacion) AS promedio_calificacion,
         SUM(CASE WHEN estado_terreno = 'retraso' THEN 1 ELSE 0 END) AS con_retraso,
         SUM(CASE WHEN estado_terreno = 'paralizada' THEN 1 ELSE 0 END) AS paralizadas
       FROM reportes_ciudadanos
       WHERE id_contrato = ?`
    )
    .get(idContrato) as {
    total: number;
    promedio_calificacion: number | null;
    con_retraso: number;
    paralizadas: number;
  };
  return {
    total: row.total ?? 0,
    promedio_calificacion: row.promedio_calificacion ?? null,
    con_retraso: row.con_retraso ?? 0,
    paralizadas: row.paralizadas ?? 0,
  };
}

export function contarReportesRecientesPorContacto(contacto: string, desde: string): number {
  const database = getDb();
  const row = database
    .prepare(
      `SELECT COUNT(*) AS n FROM reportes_ciudadanos
       WHERE contacto = ? AND created_at >= ?`
    )
    .get(contacto, desde) as { n: number };
  return row.n;
}

// Migración geo v2 (una sola vez): purga puntos fuera del bbox metro,
// elimina llaves de caché no canónicas y devuelve a pendiente las obras
// resueltas sin entrada canónica, para re-resolverlas con el pipeline v2.
export function migrarGeoV2(): {
  purgadas: number;
  llavesViejas: number;
  reabiertas: number;
} {
  const database = getDb();
  const hecha = database
    .prepare("SELECT valor FROM meta WHERE clave = 'geo_migracion_v2'")
    .get() as { valor: string } | undefined;
  if (hecha) return { purgadas: 0, llavesViejas: 0, reabiertas: 0 };

  const purga = database
    .prepare(
      `DELETE FROM ubicaciones WHERE lat NOT BETWEEN ? AND ? OR lon NOT BETWEEN ? AND ?`
    )
    .run(CALI_BBOX.minLat, CALI_BBOX.maxLat, CALI_BBOX.minLon, CALI_BBOX.maxLon);

  const llaves = database
    .prepare("SELECT direccion FROM ubicaciones")
    .all() as { direccion: string }[];
  const borrar = database.prepare("DELETE FROM ubicaciones WHERE direccion = ?");
  let llavesViejas = 0;
  for (const { direccion } of llaves) {
    if (direccion !== canonizarDireccionCO(direccion)) {
      borrar.run(direccion);
      llavesViejas++;
    }
  }

  const resueltas = database
    .prepare(
      "SELECT id_contrato, direccion_ejecucion FROM obras WHERE estado_ubicacion = 'resuelta'"
    )
    .all() as { id_contrato: string; direccion_ejecucion: string | null }[];
  const existe = database.prepare("SELECT 1 FROM ubicaciones WHERE direccion = ?");
  const reset = database.prepare(
    `UPDATE obras SET lat = NULL, lon = NULL, comuna = NULL, barrio = NULL,
      geo_fuente = NULL, geo_confianza = NULL,
      estado_ubicacion = 'pendiente', geo_intentos = 0
     WHERE id_contrato = ?`
  );
  let reabiertas = 0;
  for (const r of resueltas) {
    const canon = canonizarDireccionCO(r.direccion_ejecucion ?? "");
    if (!canon || !existe.get(canon)) {
      reset.run(r.id_contrato);
      reabiertas++;
    }
  }

  database
    .prepare("INSERT INTO meta (clave, valor) VALUES ('geo_migracion_v2', ?)")
    .run(new Date().toISOString());
  return {
    purgadas: Number(purga.changes),
    llavesViejas,
    reabiertas,
  };
}