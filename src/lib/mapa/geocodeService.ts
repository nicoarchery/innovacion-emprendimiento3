import type { EstadoUbicacion, GeoConfianza, GeoResult, ObraRow } from "@/lib/mapa/types";
import { normalizarDireccion } from "@/lib/mapa/secopFetcher";

const USER_AGENT = "impacto-territorial-secop/1.0 (Mapa obras Cali; contacto: desarrollo)";
const NOMINATIM = "https://nominatim.openstreetmap.org/search";
const PHOTON = "https://photon.komoot.io/api/";
const GAP_MS = 1100;
const MAX_REINTENTOS = 2;

let ultimaLlamada = 0;

function esperar(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function respetarRateLimit(): Promise<void> {
  const ahora = Date.now();
  const delta = ahora - ultimaLlamada;
  if (delta < GAP_MS) await esperar(GAP_MS - delta);
  ultimaLlamada = Date.now();
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

async function geocodeNominatim(query: string): Promise<GeoResult | null> {
  const params = new URLSearchParams();
  params.set("format", "jsonv2");
  params.set("limit", "1");
  params.set("countrycodes", "co");
  params.set("accept-language", "es");
  params.set("q", query);

  for (let intento = 0; intento < MAX_REINTENTOS; intento++) {
    await respetarRateLimit();
    try {
      const res = await fetch(`${NOMINATIM}?${params.toString()}`, {
        headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
      });
      if (res.status === 429) {
        await esperar(2000);
        continue;
      }
      if (!res.ok) return null;
      const data = (await res.json()) as NomResult[];
      if (!Array.isArray(data) || data.length === 0) return null;
      return parseNominatim(data[0], "nominatim");
    } catch {
      return null;
    }
  }
  return null;
}

interface NomResult {
  lat: string;
  lon: string;
  display_name: string;
  address?: {
    suburb?: string;
    neighbourhood?: string;
    quarter?: string;
    city?: string;
    municipality?: string;
    county?: string;
  };
}

function parseComuna(display: string): string | undefined {
  const m = display.match(/Comuna\s+\d+/i);
  return m ? m[0].replace(/Comuna\s+/i, "Comuna ") : undefined;
}

function parseNominatim(r: NomResult, fuente: string): GeoResult {
  const address = r.address ?? {};
  const parts = [address.suburb, address.neighbourhood, address.quarter].filter(Boolean) as string[];
  const comuna = parts.find((p) => /comuna/i.test(p)) ?? parseComuna(r.display_name);
  const barrio = parts.find((p) => !/comuna/i.test(p));

  return {
    lat: parseFloat(r.lat),
    lon: parseFloat(r.lon),
    comuna,
    barrio,
    displayName: r.display_name,
    fuente,
    confianza: "alta",
  };
}

async function geocodePhoton(query: string): Promise<GeoResult | null> {
  try {
    const params = new URLSearchParams({ q: query, lang: "es", limit: "1" });
    const res = await fetch(`${PHOTON}?${params.toString()}`, {
      headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { features?: { geometry?: { coordinates?: number[] }; properties?: Record<string, string> }[] };
    const feat = data.features?.[0];
    if (!feat?.geometry?.coordinates) return null;
    const props = feat.properties ?? {};
    const parts = [props.district, props.suburb, props.city].filter(Boolean);
    return {
      lat: feat.geometry.coordinates[1],
      lon: feat.geometry.coordinates[0],
      barrio: parts[0],
      displayName: `${parts.join(", ")}`,
      fuente: "photon",
      confianza: "media",
    };
  } catch {
    return null;
  }
}

async function geocodificarConsulta(query: string): Promise<GeoResult | null> {
  const nominatim = await geocodeNominatim(query);
  if (nominatim) return nominatim;
  return geocodePhoton(query);
}

export async function geocodificarObra(obra: ObraRow): Promise<GeoResult | null> {
  const direccion = normalizarDireccion(obra.direccion_ejecucion ?? "");

  if (direccion.length > 4) {
    const geo = await geocodificarConsulta(`${direccion}, Cali, Valle del Cauca`);
    if (geo) {
      // Confianza: alta si la dirección incluye número de predio
      geo.confianza = /\d{1,4}\s*[#-]\s*\d{1,4}/.test(direccion) ? "alta" : "media";
      return geo;
    }
  }

  const desdeTexto = extraerDireccionDeTexto(obra.descripcion ?? "");
  if (desdeTexto) {
    const geo = await geocodificarConsulta(`${desdeTexto}, Cali`);
    if (geo) {
      geo.fuente = "texto-contrato";
      geo.confianza = "media";
      return geo;
    }
  }

  const desc = (obra.descripcion ?? "").toLowerCase();
  for (const barrio of CALI_BARRIOS) {
    if (desc.includes(barrio.toLowerCase())) {
      const geo = await geocodificarConsulta(`${barrio}, Cali`);
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