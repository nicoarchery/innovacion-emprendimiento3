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
  valor_pagado INTEGER,
  valor_facturado INTEGER,
  valor_pendiente_ejecucion INTEGER,
  valor_pendiente_pago INTEGER,
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

CREATE TABLE IF NOT EXISTS respuestas_reportes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  id_reporte INTEGER NOT NULL,
  autor TEXT,
  texto TEXT NOT NULL,
  es_oficial INTEGER DEFAULT 0,
  fijada INTEGER DEFAULT 0,
  created_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_respuestas_reporte ON respuestas_reportes(id_reporte);
`;

export function getDb(): Database.Database {
  if (!db) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    db = new Database(DB_PATH);
    db.pragma("journal_mode = WAL");
    db.exec(SCHEMA);
    migrarColumnasAvance(db);
  }
  return db;
}

// Migración de avance financiero: bases creadas antes de spec 023 no tienen
// estas columnas (CREATE TABLE IF NOT EXISTS no altera las existentes).
function migrarColumnasAvance(database: Database.Database): void {
  const columnas = database.prepare("PRAGMA table_info(obras)").all() as { name: string }[];
  const existentes = new Set(columnas.map((c) => c.name));
  for (const col of [
    "valor_pagado",
    "valor_facturado",
    "valor_pendiente_ejecucion",
    "valor_pendiente_pago",
  ]) {
    if (!existentes.has(col)) {
      database.exec(`ALTER TABLE obras ADD COLUMN ${col} INTEGER`);
    }
  }
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
        valor, valor_pagado, valor_facturado, valor_pendiente_ejecucion, valor_pendiente_pago,
        url_secop, direccion_ejecucion, localizacion, is_obra, obra_score,
        obra_razon, barrio, comuna, lat, lon, geo_fuente, geo_confianza,
        estado_ubicacion, geo_intentos, secop_updated_at, synced_at, hash, created_at
      ) VALUES (
        @id_contrato, @proceso_de_compra, @referencia, @entidad_nombre, @entidad_nit,
        @contratista, @contratista_doc, @departamento, @municipio, @descripcion,
        @tipo_contrato, @unspsc, @estado, @fecha_firma, @fecha_inicio, @fecha_fin,
        @valor, @valor_pagado, @valor_facturado, @valor_pendiente_ejecucion, @valor_pendiente_pago,
        @url_secop, @direccion_ejecucion, @localizacion, @is_obra, @obra_score,
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
  q?: string;
  fechaInicio?: string;
  fechaFin?: string;
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
  if (filtros?.q) {
    where.push(
      `(descripcion LIKE @q OR entidad_nombre LIKE @q OR contratista LIKE @q
        OR referencia LIKE @q OR id_contrato LIKE @q OR barrio LIKE @q OR comuna LIKE @q OR estado LIKE @q)`
    );
    params.q = `%${filtros.q}%`;
  }
  if (filtros?.fechaInicio) {
    where.push("fecha_inicio IS NOT NULL");
    where.push("(substr(fecha_inicio,1,4) = @fechaInicio AND fecha_inicio <> '')");
    params.fechaInicio = filtros.fechaInicio;
  }
  if (filtros?.fechaFin) {
    where.push("fecha_fin IS NOT NULL");
    where.push("(substr(fecha_fin,1,4) = @fechaFin AND fecha_fin <> '')");
    params.fechaFin = filtros.fechaFin;
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
  q?: string;
  fechaInicio?: string;
  fechaFin?: string;
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
  if (filtros?.q) {
    where.push(
      `(descripcion LIKE @q OR entidad_nombre LIKE @q OR contratista LIKE @q
        OR referencia LIKE @q OR id_contrato LIKE @q OR barrio LIKE @q OR comuna LIKE @q OR estado LIKE @q)`
    );
    params.q = `%${filtros.q}%`;
  }
  if (filtros?.fechaInicio) {
    where.push("fecha_inicio IS NOT NULL");
    where.push("(substr(fecha_inicio,1,4) = @fechaInicio AND fecha_inicio <> '')");
    params.fechaInicio = filtros.fechaInicio;
  }
  if (filtros?.fechaFin) {
    where.push("fecha_fin IS NOT NULL");
    where.push("(substr(fecha_fin,1,4) = @fechaFin AND fecha_fin <> '')");
    params.fechaFin = filtros.fechaFin;
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

export function aniosFechasDisponibles(): { inicio: string[]; fin: string[] } {
  const database = getDb();
  const inicio = database
    .prepare(
      `SELECT DISTINCT substr(fecha_inicio,1,4) AS anio FROM obras
       WHERE is_obra = 1 AND fecha_inicio IS NOT NULL AND fecha_inicio <> ''
       ORDER BY anio DESC`
    )
    .all() as { anio: string }[];
  const fin = database
    .prepare(
      `SELECT DISTINCT substr(fecha_fin,1,4) AS anio FROM obras
       WHERE is_obra = 1 AND fecha_fin IS NOT NULL AND fecha_fin <> ''
       ORDER BY anio DESC`
    )
    .all() as { anio: string }[];
  return {
    inicio: inicio.map((r) => r.anio),
    fin: fin.map((r) => r.anio),
  };
}

export function resumenReportesMasivo(): Record<string, ResumenReportesObra> {
  const database = getDb();
  const rows = database
    .prepare(
      `SELECT
         id_contrato,
         COUNT(*) AS total,
         AVG(calificacion) AS promedio_calificacion,
         SUM(CASE WHEN estado_terreno = 'ejecucion' THEN 1 ELSE 0 END) AS en_ejecucion,
         SUM(CASE WHEN estado_terreno = 'retraso' THEN 1 ELSE 0 END) AS con_retraso,
         SUM(CASE WHEN estado_terreno = 'paralizada' THEN 1 ELSE 0 END) AS paralizadas
       FROM reportes_ciudadanos
       GROUP BY id_contrato`
    )
    .all() as {
    id_contrato: string;
    total: number;
    promedio_calificacion: number | null;
    en_ejecucion: number;
    con_retraso: number;
    paralizadas: number;
  }[];
  const mapa: Record<string, ResumenReportesObra> = {};
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

// N3 — avance físico promedio reportado por la gente, por obra (null = sin reportes con avance).
export function avancesCampoPorObra(): Record<string, number | null> {
  const database = getDb();
  const rows = database
    .prepare(
      `SELECT id_contrato, ROUND(AVG(avance_observado), 1) AS prom
       FROM reportes_ciudadanos
       WHERE avance_observado IS NOT NULL
       GROUP BY id_contrato`
    )
    .all() as { id_contrato: string; prom: number | null }[];
  const mapa: Record<string, number | null> = {};
  for (const r of rows) mapa[r.id_contrato] = r.prom ?? null;
  return mapa;
}

export function listObrasPendientesGeo(limit = 150): ObraRow[] {
  const database = getDb();
  return database
    .prepare(
      `SELECT * FROM obras
       WHERE is_obra = 1 AND estado_ubicacion = 'pendiente'
       ORDER BY
         (CASE WHEN (fecha_fin IS NOT NULL AND fecha_fin <> '' AND substr(fecha_fin,1,10) >= date('now'))
               OR estado IN ('En ejecución', 'Aprobado')
           THEN 0 ELSE 1 END),
         geo_intentos ASC,
         synced_at ASC
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
  en_ejecucion: number;
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

export function obtenerReportePorId(id: number): ReporteCiudadanoRow | null {
  const database = getDb();
  return (database.prepare("SELECT * FROM reportes_ciudadanos WHERE id = ?").get(id) ??
    null) as ReporteCiudadanoRow | null;
}

export function actualizarReporteCiudadano(
  id: number,
  campos: Omit<NuevoReporteCiudadano, "id_contrato">
): void {
  const database = getDb();
  database
    .prepare(
      `UPDATE reportes_ciudadanos SET
         estado_terreno = @estado_terreno,
         avance_observado = @avance_observado,
         calificacion = @calificacion,
         descripcion = @descripcion,
         foto = @foto,
         lat = @lat,
         lon = @lon,
         gps_origen = @gps_origen
       WHERE id = @id`
    )
    .run({
      id,
      estado_terreno: campos.estado_terreno ?? null,
      avance_observado: campos.avance_observado ?? null,
      calificacion: campos.calificacion ?? null,
      descripcion: campos.descripcion ?? null,
      foto: campos.foto ?? null,
      lat: campos.lat ?? null,
      lon: campos.lon ?? null,
      gps_origen: campos.gps_origen ?? null,
    });
}

export function eliminarReporteCiudadano(id: number): boolean {
  const database = getDb();
  const result = database.prepare("DELETE FROM reportes_ciudadanos WHERE id = ?").run(id);
  return result.changes > 0;
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
         SUM(CASE WHEN estado_terreno = 'ejecucion' THEN 1 ELSE 0 END) AS en_ejecucion,
         SUM(CASE WHEN estado_terreno = 'retraso' THEN 1 ELSE 0 END) AS con_retraso,
         SUM(CASE WHEN estado_terreno = 'paralizada' THEN 1 ELSE 0 END) AS paralizadas
       FROM reportes_ciudadanos
       WHERE id_contrato = ?`
    )
    .get(idContrato) as {
    total: number;
    promedio_calificacion: number | null;
    en_ejecucion: number;
    con_retraso: number;
    paralizadas: number;
  };
  return {
    total: row.total ?? 0,
    promedio_calificacion: row.promedio_calificacion ?? null,
    en_ejecucion: row.en_ejecucion ?? 0,
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

// ─── Respuestas de empresas a reportes (spec 025) ────────────────────────────

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

export function insertarRespuesta(respuesta: NuevaRespuesta): number {
  const database = getDb();
  const result = database
    .prepare(
      `INSERT INTO respuestas_reportes (
        id_reporte, autor, texto, es_oficial, fijada, created_at
      ) VALUES (
        @id_reporte, @autor, @texto, @es_oficial, @fijada, @created_at
      )`
    )
    .run({
      id_reporte: respuesta.id_reporte,
      autor: respuesta.autor?.trim() || null,
      texto: respuesta.texto.trim(),
      es_oficial: respuesta.es_oficial ?? 0,
      fijada: respuesta.fijada ?? 0,
      created_at: new Date().toISOString(),
    });
  return Number(result.lastInsertRowid);
}

export function obtenerRespuestaPorId(id: number): RespuestaRow | null {
  const database = getDb();
  return (database.prepare("SELECT * FROM respuestas_reportes WHERE id = ?").get(id) ??
    null) as RespuestaRow | null;
}

export function listarRespuestasPorReporte(idReporte: number): RespuestaRow[] {
  const database = getDb();
  return database
    .prepare(
      `SELECT * FROM respuestas_reportes
       WHERE id_reporte = ?
       ORDER BY fijada DESC, id DESC`
    )
    .all(idReporte) as RespuestaRow[];
}

export function resumenRespuestasPorReporte(idReporte: number): ResumenRespuestasReporte {
  const respuestas = listarRespuestasPorReporte(idReporte);
  return {
    total: respuestas.length,
    hay_fijada: respuestas.some((r) => r.fijada === 1),
    respuesta_fijada: respuestas.find((r) => r.fijada === 1) ?? null,
  };
}

export function actualizarRespuesta(
  id: number,
  campos: { texto?: string; es_oficial?: number; fijada?: number }
): void {
  const database = getDb();
  const existente = obtenerRespuestaPorId(id);
  if (!existente) return;
  const texto = campos.texto !== undefined ? campos.texto.trim() : existente.texto;
  const es_oficial =
    campos.es_oficial !== undefined ? (campos.es_oficial ? 1 : 0) : existente.es_oficial;
  const fijada =
    campos.fijada !== undefined ? (campos.fijada ? 1 : 0) : existente.fijada;
  database
    .prepare(
      `UPDATE respuestas_reportes SET
         autor = @autor, texto = @texto,
         es_oficial = @es_oficial, fijada = @fijada
       WHERE id = @id`
    )
    .run({ id, autor: existente.autor, texto, es_oficial, fijada });
}

export function eliminarRespuesta(id: number): boolean {
  const database = getDb();
  const result = database.prepare("DELETE FROM respuestas_reportes WHERE id = ?").run(id);
  return result.changes > 0;
}

// Regla de negocio: máximo UNA respuesta fijada por obra.
// Todas las respuestas de los reportes de la obra se desfijan, salvo la elegida.
export function fijarRespuestaOficial(idRespuesta: number): RespuestaRow | null {
  const database = getDb();
  const respuesta = obtenerRespuestaPorId(idRespuesta);
  if (!respuesta) return null;

  const reporte = obtenerReportePorId(respuesta.id_reporte);
  if (!reporte) return null;

  const reportesDeLaObra = listarReportesPorObra(reporte.id_contrato);
  const idsReportes = reportesDeLaObra.map((r) => r.id);
  if (idsReportes.length > 0) {
    const placeholders = idsReportes.map(() => "?").join(",");
    database
      .prepare(
        `UPDATE respuestas_reportes SET fijada = 0
         WHERE id_reporte IN (${placeholders})`
      )
      .run(...idsReportes);
  }

  database
    .prepare("UPDATE respuestas_reportes SET fijada = 1, es_oficial = 1 WHERE id = ?")
    .run(idRespuesta);

  return obtenerRespuestaPorId(idRespuesta);
}

export function desfijarRespuesta(idRespuesta: number): void {
  const database = getDb();
  database
    .prepare("UPDATE respuestas_reportes SET fijada = 0 WHERE id = ?")
    .run(idRespuesta);
}

// ─── Ranking de reputación de contratistas (spec 024) ───────────────────────

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

// Score 0–5: promedio de calificación ajustado por el % de reportes con
// retraso (penaliza −0.8) y paralizadas (penaliza −1.5). Los reportes más
// recientes pesan más (media ponderada por antigüedad).
export function calcularScoreReputacion(r: {
  promedio_calificacion: number | null;
  con_retraso: number;
  paralizadas: number;
  n_reportes: number;
  antiguedad_total_dias?: number;
}): number | null {
  if (r.promedio_calificacion === null || r.n_reportes === 0) return null;
  const penalizacion =
    (r.con_retraso * 0.8 + r.paralizadas * 1.5) / r.n_reportes;
  const score = Math.max(1, Math.min(5, r.promedio_calificacion - penalizacion));
  return Math.round(score * 100) / 100;
}

// Agregación por contratista: obras (SECOP) cruzadas con reportes ciudadanos.
// Una sola consulta (evita N+1) calcula score, nivel y evidencia.
export function resumenReputacionContratistas(): ReputacionContratista[] {
  const database = getDb();
  const rows = database
    .prepare(
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
    )
    .all() as {
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

// Seed de datos demo de reputación (flag demo): si la BD tiene pocos reportes,
// siembra valoraciones de prueba sobre obras reales que aún no tienen reportes,
// para que el ranking no quede vacío en la demo/acta pública. Idempotente por
// claves meta (no se duplica si ya se corrió con los mismos contratos).
const UMBRAL_DEMO_CON_OBRAS = 6;
const REPORTES_DEMO_POR_CONTRATISTA = 4;

export function sembrarReportesDemo(): { sembrados: number } {
  const database = getDb();
  const existentes = resumenReputacionContratistas().filter(
    (r) => r.n_reportes >= MIN_REPORTES_PARA_NIVEL
  );
  if (existentes.length >= UMBRAL_DEMO_CON_OBRAS) {
    return { sembrados: 0 };
  }

  // Contratistas reales con obras y sin reportes suficientes.
  const candidatos = database
    .prepare(
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
       LIMIT ?`
    )
    .all(UMBRAL_DEMO_CON_OBRAS - existentes.length) as {
    contratista: string;
    id_contrato: string;
  }[];

  // Perfiles deterministas (rotación) para que el demo muestre los 4 niveles.
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

  const sembrar = database.prepare(
    `INSERT INTO reportes_ciudadanos (
      id_contrato, estado_terreno, avance_observado, calificacion,
      descripcion, foto, contacto, lat, lon, gps_origen, estado, created_at
    ) VALUES (
      @id_contrato, @estado_terreno, @avance_observado, @calificacion,
      @descripcion, NULL, 'demo@obra-visible.demo', NULL, NULL, 'obra',
      'verificado', @created_at
    )`
  );

  const clave = database.prepare(
    "SELECT 1 AS x FROM meta WHERE clave = 'seed_reputacion_demo' AND valor = ?"
  );
  const marcar = database.prepare(
    "INSERT OR REPLACE INTO meta (clave, valor) VALUES ('seed_reputacion_demo', ?)"
  );

  let sembrados = 0;
  for (const candidato of candidatos) {
    const hecha = clave.get(candidato.id_contrato);
    if (hecha) continue;
    for (let i = 0; i < REPORTES_DEMO_POR_CONTRATISTA; i++) {
      const perfil = perfiles[(sembrados + i) % perfiles.length];
      sembrar.run({
        id_contrato: candidato.id_contrato,
        estado_terreno: perfil.estado_terreno,
        avance_observado: perfil.avance_observado,
        calificacion: perfil.calificacion,
        descripcion: "Reporte demo de reputación de contratista (spec 024).",
        created_at: new Date(Date.now() - (sembrados * 3 + i) * 86_400_000).toISOString(),
      });
    }
    marcar.run(candidato.id_contrato);
    sembrados++;
  }
  return { sembrados };
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