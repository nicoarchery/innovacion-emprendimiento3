// Seed local demo para probar ranking de reputación (024) y
// respuestas de empresa (025) sin depender del dataset SECOP.
//
// Uso: node scripts/seed-demo-local.mjs
// Inserta obras + reportes demo en data/mapa.db (id gig ...). Es idempotente:
// si ya existen obras con esas IDs, no duplica.
import Database from "better-sqlite3";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const db = new Database(join(__dirname, "..", "data", "mapa.db"));

const OBRAS = [
  {
    id: "CO1.DEMO.RANK1",
    referencia: "DEMO-RANK-01",
    entidad: "EMCALI EICE ESP",
    contratista: "CONSTRUCTORA ALFA SAS",
    descripcion: "Repavimentación y espacio público corredor Avenida 6N",
    tipo: "Obra",
    valor: 1_500_000_000,
    direccion: "Av 6N Cali Valle del Cauca",
  },
  {
    id: "CO1.DEMO.RANK2",
    referencia: "DEMO-RANK-02",
    entidad: "EMCALI EICE ESP",
    contratista: "CONSTRUCTORA ALFA SAS",
    descripcion: "Acometida de alcantarillado sector Chipichape",
    tipo: "Obra",
    valor: 800_000_000,
    direccion: "Cl 21 Cali Valle del Cauca",
  },
  {
    id: "CO1.DEMO.RANK3",
    referencia: "DEMO-RANK-03",
    entidad: "Alcaldía de Cali",
    contratista: "CONSTRUCTORA BETA SA",
    descripcion: "Construcción de andenes y parque lineal suroriente",
    tipo: "Obra",
    valor: 1_200_000_000,
    direccion: "Cra 24 Cali Valle del Cauca",
  },
  {
    id: "CO1.DEMO.RANK4",
    referencia: "DEMO-RANK-04",
    entidad: "Alcaldía de Cali",
    contratista: "CONSTRUCTORA GAMMA LTDA",
    descripcion: "Red primaria de acueducto ladera oeste",
    tipo: "Obra",
    valor: 2_000_000_000,
    direccion: "Cl 5 Cali Valle del Cauca",
  },
];

const REPORTES = [
  { obra: "CO1.DEMO.RANK1", terreno: "ejecucion", avance: 80, cal: 5 },
  { obra: "CO1.DEMO.RANK1", terreno: "ejecucion", avance: 70, cal: 4 },
  { obra: "CO1.DEMO.RANK1", terreno: "ejecucion", avance: 60, cal: 4 },
  { obra: "CO1.DEMO.RANK1", terreno: "ejecucion", avance: 90, cal: 5 },
  { obra: "CO1.DEMO.RANK2", terreno: "retraso", avance: 30, cal: 2 },
  { obra: "CO1.DEMO.RANK2", terreno: "ejecucion", avance: 50, cal: 4 },
  { obra: "CO1.DEMO.RANK2", terreno: "retraso", avance: 20, cal: 2 },
  { obra: "CO1.DEMO.RANK2", terreno: "ejecucion", avance: 60, cal: 3 },
  { obra: "CO1.DEMO.RANK3", terreno: "paralizada", avance: 10, cal: 1 },
  { obra: "CO1.DEMO.RANK3", terreno: "paralizada", avance: 5, cal: 1 },
  { obra: "CO1.DEMO.RANK3", terreno: "retraso", avance: 15, cal: 2 },
  { obra: "CO1.DEMO.RANK3", terreno: "ejecucion", avance: 40, cal: 3 },
];

const upsertObra = db.prepare(
  `INSERT INTO obras (
     id_contrato, proceso_de_compra, referencia, entidad_nombre, entidad_nit,
     contratista, contratista_doc, departamento, municipio, descripcion, tipo_contrato,
     unspsc, estado, valor, valor_pagado, valor_pendiente_ejecucion, url_secop,
     direccion_ejecucion, localizacion, is_obra, obra_score, obra_razon,
     barrio, comuna, lat, lon, geo_fuente, geo_confianza, estado_ubicacion,
     geo_intentos, secop_updated_at, synced_at, hash, created_at
   ) VALUES (
     @id_contrato, 'DEMO', @referencia, @entidad_nombre, '999999',
     @contratista, '999999', 'Valle del Cauca', 'Cali', @descripcion, @tipo_contrato,
     '', 'En ejecución', @valor, 0, 0, 'https://secop.gov.co/demo',
     @direccion_ejecucion, 'Colombia, Valle del Cauca, Cali', 1, 0.9, 'demo-local',
     NULL, NULL, @lat, @lon, 'demo', 'media', 'resuelta',
     0, NULL, @synced_at, @hash, @synced_at
   )
   ON CONFLICT(id_contrato) DO UPDATE SET
     contratista = excluded.contratista,
     valor = excluded.valor`
);

const GEO = {
  "CO1.DEMO.RANK1": { lat: 3.4389, lon: -76.5303 },
  "CO1.DEMO.RANK2": { lat: 3.4681, lon: -76.5278 },
  "CO1.DEMO.RANK3": { lat: 3.4007, lon: -76.5506 },
  "CO1.DEMO.RANK4": { lat: 3.4237, lon: -76.5412 },
};

const txObras = db.transaction(() => {
  const now = new Date().toISOString();
  for (const o of OBRAS) {
    const geo = GEO[o.id];
    upsertObra.run({
      ...o,
      id_contrato: o.id,
      entidad_nombre: o.entidad,
      tipo_contrato: o.tipo,
      direccion_ejecucion: o.direccion,
      lat: geo?.lat ?? null,
      lon: geo?.lon ?? null,
      synced_at: now,
      hash: `demo-${o.id}`,
    });
  }
});
txObras();

const insertReporte = db.prepare(
  `INSERT INTO reportes_ciudadanos
     (id_contrato, estado_terreno, avance_observado, calificacion, descripcion, contacto, estado, created_at)
   VALUES (@id_contrato, @estado_terreno, @avance_observado, @calificacion, @descripcion, @contacto, 'verificado', @created_at)`
);

let sembrados = 0;
const txReportes = db.transaction(() => {
  const existentes = new Set(
    db
      .prepare("SELECT DISTINCT id_contrato FROM reportes_ciudadanos WHERE id_contrato LIKE 'CO1.DEMO.RANK%'")
      .all()
      .map((r) => r.id_contrato)
  );
  const obrasConReporte = new Set(REPORTES.map((r) => r.obra));
  for (const obra of obrasConReporte) {
    if (existentes.has(obra)) continue;
    for (const r of REPORTES.filter((x) => x.obra === obra)) {
      insertReporte.run({
        id_contrato: r.obra,
        estado_terreno: r.terreno,
        avance_observado: r.avance,
        calificacion: r.cal,
        descripcion: "Reporte demo para pruebas locales de ranking y respuestas.",
        contacto: "demo@obra-visible.demo",
        created_at: new Date().toISOString(),
      });
      sembrados++;
    }
    existentes.add(obra);
  }
});
txReportes();

console.log(
  JSON.stringify(
    {
      obras: OBRAS.length,
      reportes_insertados: sembrados,
      total_obras_db: db.prepare("SELECT COUNT(*) n FROM obras").get().n,
      total_reportes_db: db.prepare("SELECT COUNT(*) n FROM reportes_ciudadanos").get().n,
    },
    null,
    2
  )
);
db.close();