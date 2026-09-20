import type { EstadoUbicacion, GeoConfianza, GeoResult, ObraRow } from "@/lib/mapa/types";
import {
  CALI_BBOX,
  aTitulo,
  callesCruceCandidatas,
  canonizarDireccionCO,
  distanciaM,
  distanciaPuntoSegmentoM,
  enCali,
  nombreViaOSM,
  parsearDireccionCO,
  type DireccionParseada,
} from "@/lib/mapa/direccionCO";
import { normalizarDireccion } from "@/lib/mapa/secopFetcher";

const USER_AGENT = "impacto-territorial-secop/1.0 (Mapa obras Cali; contacto: desarrollo)";
const NOMINATIM = "https://nominatim.openstreetmap.org/search";
const PHOTON = "https://photon.komoot.io/api/";
const OVERPASS_URLS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
];
const GAP_NOMINATIM_MS = 1100;
const GAP_OVERPASS_MS = 1500;
const MAX_REINTENTOS = 2;
const UMBRAL_CRUCE_M = 60;

let ultimaNominatim = 0;
let ultimaOverpass = 0;

function esperar(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function turnoNominatim(): Promise<void> {
  const delta = Date.now() - ultimaNominatim;
  if (delta < GAP_NOMINATIM_MS) await esperar(GAP_NOMINATIM_MS - delta);
  ultimaNominatim = Date.now();
}

async function turnoOverpass(): Promise<void> {
  const delta = Date.now() - ultimaOverpass;
  if (delta < GAP_OVERPASS_MS) await esperar(GAP_OVERPASS_MS - delta);
  ultimaOverpass = Date.now();
}

export const CALI_BARRIOS = [
  "San Fernando", "La Flora", "Granada", "El Peñón", "Pance",
  "Ciudad Jardín", "Santa Teresita", "La Alameda", "El Vallado",
  "Siloé", "Terrón Colorado", "Andrés Sanín", "La Luna", "La Marín",
  "Chiminangos", "El Guabal", "La Isla", "Juanambú", "El Hoyo",
  "San Antonio", "San Cayetano", "El Piloto", "Los Chales", "Menga",
  "Panamericano", "Ciudadela Comfandi", "Floralia", "Los Andes", "Unión",
  "Alfonso López", "Petecuy", "Aguablanca", "El Retiro", "Brisas del Cauca",
  "La Esperanza", "Ciudad Córdoba", "Comuneros I", "El Poblado", "Prados del Sur",
  "Alamos", "Bosques del Norte", "Versalles", "La Campiña", "Calima",
  "Los Cámbulos", "La Envidia", "San Pedro", "Cristo Rey", "La Sultana",
  "Vipasa", "Ciudad Modelo", "Las Américas", "Nuevo Latir", "Marroquín",
] as const;

const DIRECCION_REGEX =
  /\b(?:Calle|Carrera|Avenida|Av\.|Diagonal|Transversal|Cra\.|Cl\.|Cll\.|Cll|Ave\.)\s*[#]?\s*\d{1,4}\s*[#-]\s*\d{1,4}\b/gi;

function extraerDireccionDeTexto(texto: string): string {
  const match = texto.match(DIRECCION_REGEX);
  return match ? normalizarDireccion(match[0]) : "";
}

interface NomCandidato {
  lat: number;
  lon: number;
  display: string;
  road?: string;
  city?: string;
  addresstype?: string;
  importance?: number;
  comuna?: string;
  barrio?: string;
}

const VIEWBOX = `${CALI_BBOX.minLon},${CALI_BBOX.maxLat},${CALI_BBOX.maxLon},${CALI_BBOX.minLat}`;

function parseComuna(display: string): string | undefined {
  const m = display.match(/Comuna\s+\d+/i);
  return m ? m[0].replace(/Comuna\s+/i, "Comuna ") : undefined;
}

function aCandidato(r: NomRaw): NomCandidato | null {
  const lat = parseFloat(r.lat);
  const lon = parseFloat(r.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
  const a = r.address ?? {};
  const parts = [a.suburb, a.neighbourhood, a.quarter].filter(Boolean) as string[];
  return {
    lat,
    lon,
    display: r.display_name ?? "",
    road: a.road,
    city: a.city ?? a.municipality ?? a.town ?? a.village,
    addresstype: r.addresstype,
    importance: typeof r.importance === "number" ? r.importance : 0,
    comuna: parts.find((p) => /comuna/i.test(p)) ?? parseComuna(r.display_name ?? ""),
    barrio: parts.find((p) => !/comuna/i.test(p)),
  };
}

interface NomRaw {
  lat: string;
  lon: string;
  display_name?: string;
  addresstype?: string;
  importance?: number;
  address?: {
    road?: string;
    suburb?: string;
    neighbourhood?: string;
    quarter?: string;
    city?: string;
    municipality?: string;
    town?: string;
    village?: string;
  };
}

async function nominatimEstructurado(street: string): Promise<NomCandidato[]> {
  const params = new URLSearchParams();
  params.set("format", "jsonv2");
  params.set("addressdetails", "1");
  params.set("limit", "5");
  params.set("countrycodes", "co");
  params.set("accept-language", "es");
  params.set("viewbox", VIEWBOX);
  params.set("bounded", "1");
  params.set("street", street);
  params.set("city", "Cali");
  params.set("state", "Valle del Cauca");
  params.set("country", "Colombia");

  for (let intento = 0; intento < MAX_REINTENTOS; intento++) {
    await turnoNominatim();
    try {
      const res = await fetch(`${NOMINATIM}?${params.toString()}`, {
        headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
      });
      if (res.status === 429) {
        await esperar(2000);
        continue;
      }
      if (!res.ok) return [];
      const data = (await res.json()) as NomRaw[];
      if (!Array.isArray(data)) return [];
      return data
        .map(aCandidato)
        .filter((c): c is NomCandidato => c !== null);
    } catch {
      return [];
    }
  }
  return [];
}

function esCali(c: NomCandidato): boolean {
  if (!enCali(c.lat, c.lon)) return false;
  if (c.city && !/cali/i.test(c.city)) return false;
  return true;
}

// Filtra candidatos a la vía esperada ("CARRERA 5"): primero coincidencia
// exacta de nombre OSM, si no hay, prefijos ("CARRERA 5 NORTE").
function filtrarPorVia(candidatos: NomCandidato[], viaEsperada: string): NomCandidato[] {
  const enCaliCiudad = candidatos.filter(esCali);
  if (enCaliCiudad.length === 0) return [];
  const normalizados = enCaliCiudad.map((c) => ({
    c,
    road: (c.road ?? "").toUpperCase().trim(),
  }));
  const exactos = normalizados.filter(({ road }) => road === viaEsperada);
  if (exactos.length > 0) return exactos.map(({ c }) => c);
  const prefijos = normalizados.filter(({ road }) =>
    road.startsWith(`${viaEsperada} `)
  );
  return prefijos.map(({ c }) => c);
}

const TIPO_CASA = new Set([
  "house",
  "building",
  "residential",
  "commercial",
  "construction",
  "industrial",
]);

function ordenarCandidatos(candidatos: NomCandidato[]): NomCandidato[] {
  return [...candidatos].sort((a, b) => {
    const casaA = a.addresstype && TIPO_CASA.has(a.addresstype) ? 0 : 1;
    const casaB = b.addresstype && TIPO_CASA.has(b.addresstype) ? 0 : 1;
    if (casaA !== casaB) return casaA - casaB;
    const viaA = a.addresstype === "road" ? 0 : 1;
    const viaB = b.addresstype === "road" ? 0 : 1;
    if (viaA !== viaB) return viaA - viaB;
    return (b.importance ?? 0) - (a.importance ?? 0);
  });
}

function aGeoResult(
  c: NomCandidato,
  fuente: string,
  confianza: GeoConfianza
): GeoResult {
  return {
    lat: c.lat,
    lon: c.lon,
    comuna: c.comuna,
    barrio: c.barrio,
    displayName: c.display,
    fuente,
    confianza,
  };
}

// --- Overpass: intersección geométrica de dos vías ---

interface Punto {
  lat: number;
  lon: number;
}

const cacheCruces = new Map<string, GeoResult | null>();

function claveCruce(a: string, b: string): string {
  return `X|${a}|${b}`;
}

async function fetchOverpass(query: string): Promise<{ nombre: string; puntos: Punto[] }[] | null> {
  const body = new URLSearchParams({ data: query });
  for (const url of OVERPASS_URLS) {
    await turnoOverpass();
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "User-Agent": USER_AGENT,
          Accept: "application/json",
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body,
      });
      if (!res.ok) continue;
      const data = (await res.json()) as {
        elements?: { tags?: { name?: string }; geometry?: Punto[] }[];
      };
      const grupos = new Map<string, Punto[]>();
      for (const el of data.elements ?? []) {
        const nombre = el.tags?.name;
        if (!nombre || !el.geometry || el.geometry.length < 2) continue;
        const lista = grupos.get(nombre) ?? [];
        for (const p of el.geometry) lista.push(p);
        grupos.set(nombre, lista);
      }
      return [...grupos.entries()].map(([nombre, puntos]) => ({ nombre, puntos }));
    } catch {
      continue;
    }
  }
  return null;
}

// Bbox urbano para consultas Overpass (cubre todas las comunas de Cali;
// el gate de validación usa el bbox metro más amplio de direccionCO).
const OVERPASS_BBOX = "3.32,-76.61,3.52,-76.44";

function cruceMasCercano(a: Punto[], b: Punto[]): { punto: Punto; gapM: number } | null {
  let mejor: { punto: Punto; gapM: number } | null = null;
  const segmentos = (pts: Punto[]): Array<[Punto, Punto]> => {
    const out: Array<[Punto, Punto]> = [];
    for (let i = 0; i < pts.length - 1; i++) out.push([pts[i], pts[i + 1]]);
    return out;
  };
  const segA = segmentos(a);
  const segB = segmentos(b);
  if (segA.length === 0 || segB.length === 0) return null;
  // Cruces en X sin nodo compartido: se proyecta cada nodo sobre los
  // segmentos de la otra vía (distancia punto-segmento real).
  for (const [p1, p2] of segA) {
    for (const [q1, q2] of segB) {
      for (const p of [p1, p2]) {
        const r = distanciaPuntoSegmentoM(p.lat, p.lon, q1.lat, q1.lon, q2.lat, q2.lon);
        if (!mejor || r.distM < mejor.gapM) {
          mejor = { punto: { lat: r.lat, lon: r.lon }, gapM: r.distM };
        }
      }
      for (const q of [q1, q2]) {
        const r = distanciaPuntoSegmentoM(q.lat, q.lon, p1.lat, p1.lon, p2.lat, p2.lon);
        if (!mejor || r.distM < mejor.gapM) {
          mejor = { punto: { lat: r.lat, lon: r.lon }, gapM: r.distM };
        }
      }
    }
  }
  return mejor;
}

async function geocodeInterseccion(
  viaA: string,
  viaB: string
): Promise<GeoResult | null> {
  const clave = claveCruce(viaA, viaB);
  if (cacheCruces.has(clave)) return cacheCruces.get(clave) ?? null;

  const nombreA = aTitulo(viaA);
  const nombreB = aTitulo(viaB);
  const query = `[out:json][timeout:40];(way["name"="${nombreA}"](${OVERPASS_BBOX});way["name"="${nombreB}"](${OVERPASS_BBOX}););out geom;`;
  const grupos = await fetchOverpass(query);

  let resultado: GeoResult | null = null;
  if (grupos) {
    const gA = grupos.find((g) => g.nombre === nombreA);
    const gB = grupos.find((g) => g.nombre === nombreB);
    if (gA && gB) {
      const cruce = cruceMasCercano(gA.puntos, gB.puntos);
      if (cruce && cruce.gapM <= UMBRAL_CRUCE_M && enCali(cruce.punto.lat, cruce.punto.lon)) {
        resultado = {
          lat: cruce.punto.lat,
          lon: cruce.punto.lon,
          displayName: `Cruce ${nombreA} con ${nombreB}, Cali`,
          fuente: "overpass-interseccion",
          confianza: "alta",
        };
      }
    }
  }
  cacheCruces.set(clave, resultado);
  return resultado;
}

// --- Photon (último recurso, validado) ---

async function geocodePhoton(query: string): Promise<GeoResult | null> {
  try {
    const params = new URLSearchParams({ q: query, lang: "es", limit: "3" });
    const res = await fetch(`${PHOTON}?${params.toString()}`, {
      headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { features?: { geometry?: { coordinates?: number[] }; properties?: Record<string, string> }[] };
    for (const feat of data.features ?? []) {
      const coords = feat.geometry?.coordinates;
      if (!coords || coords.length < 2) continue;
      const lon = coords[0];
      const lat = coords[1];
      if (!enCali(lat, lon)) continue;
      const props = feat.properties ?? {};
      const ciudad = `${props.city ?? ""} ${props.county ?? ""} ${props.state ?? ""}`;
      if (!/cali/i.test(ciudad)) continue;
      const parts = [props.district, props.suburb, props.city].filter(Boolean);
      return {
        lat,
        lon,
        barrio: parts[0],
        displayName: parts.join(", "),
        fuente: "photon",
        confianza: "media",
      };
    }
    return null;
  } catch {
    return null;
  }
}

// --- Pipeline principal ---

async function resolverDireccion(canon: string): Promise<GeoResult | null> {
  const parseada: DireccionParseada | null = parsearDireccionCO(canon);
  const viaEsperada = parseada ? nombreViaOSM(parseada) : null;
  const calleQuery = parseada
    ? `${viaEsperada} #${parseada.cruce}-${parseada.placa}`
    : canon;

  // Nivel 1: número de predio resuelto por Nominatim (techo de precisión OSM).
  const candidatos = await nominatimEstructurado(calleQuery);
  const enVia = viaEsperada ? filtrarPorVia(candidatos, viaEsperada) : candidatos.filter(esCali);
  const ordenados = ordenarCandidatos(enVia);
  const casa = ordenados.find(
    (c) => c.addresstype && TIPO_CASA.has(c.addresstype)
  );
  if (casa) return aGeoResult(casa, "nominatim", "alta");

  // Nivel 2: intersección geométrica (nomenclatura colombiana: # M-PP vive junto a la calle M).
  if (parseada) {
    for (const cruce of callesCruceCandidatas(parseada)) {
      const interseccion = await geocodeInterseccion(nombreViaOSM(parseada), cruce);
      if (interseccion) return interseccion;
    }
  }

  // Nivel 3: centroide del tramo correcto (validado en Cali y en la vía).
  // Con varios tramos homónimos se elige el más cercano a su media:
  // descarta valores atípicos de sectores lejanos.
  const viales = ordenados.filter((c) => c.addresstype === "road");
  if (viales.length > 0) {
    let elegido = viales[0];
    if (viales.length > 1) {
      const mediaLat = viales.reduce((s, c) => s + c.lat, 0) / viales.length;
      const mediaLon = viales.reduce((s, c) => s + c.lon, 0) / viales.length;
      elegido = viales.reduce((a, b) =>
        distanciaM(a.lat, a.lon, mediaLat, mediaLon) <=
        distanciaM(b.lat, b.lon, mediaLat, mediaLon)
          ? a
          : b
      );
    }
    return aGeoResult(elegido, "nominatim", "media");
  }
  if (ordenados.length > 0) return aGeoResult(ordenados[0], "nominatim", "media");

  // Nivel 4: Photon validado.
  return geocodePhoton(`${canon}, Cali, Valle del Cauca`);
}

export async function geocodificarObra(obra: ObraRow): Promise<GeoResult | null> {
  const canon = canonizarDireccionCO(obra.direccion_ejecucion ?? "");

  if (canon.length > 4) {
    const geo = await resolverDireccion(canon);
    if (geo) return geo;
  }

  const desdeTexto = extraerDireccionDeTexto(obra.descripcion ?? "");
  const canonTexto = canonizarDireccionCO(desdeTexto);
  if (canonTexto.length > 4) {
    const geo = await resolverDireccion(canonTexto);
    if (geo) {
      geo.fuente = "texto-contrato";
      geo.confianza = "media";
      return geo;
    }
  }

  const desc = (obra.descripcion ?? "").toLowerCase();
  for (const barrio of CALI_BARRIOS) {
    if (desc.includes(barrio.toLowerCase())) {
      const geo = await geocodePhoton(`${barrio}, Cali, Valle del Cauca`);
      if (geo) {
        geo.barrio = barrio;
        geo.fuente = "barrio-objeto";
        geo.confianza = "baja";
        return geo;
      }
    }
  }

  return null;
}

export function estadoInicialUbicacion(): EstadoUbicacion {
  return "pendiente";
}

export function geoConfianzaLabel(c: GeoConfianza | null): string {
  return c === "alta" ? "Alta" : c === "media" ? "Media" : "Baja";
}
