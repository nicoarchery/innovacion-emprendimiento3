// Utilidades puras para direcciones colombianas (sin dependencias).
// Centraliza la canonicalización usada como llave de caché y el parseo
// de nomenclatura "Vía N # M-PP" para geocodificación por intersección.

export const CALI_BBOX = {
  minLat: 3.3,
  maxLat: 3.56,
  minLon: -76.66,
  maxLon: -76.42,
};

export function enCali(lat: number, lon: number): boolean {
  return (
    Number.isFinite(lat) &&
    Number.isFinite(lon) &&
    lat >= CALI_BBOX.minLat &&
    lat <= CALI_BBOX.maxLat &&
    lon >= CALI_BBOX.minLon &&
    lon <= CALI_BBOX.maxLon
  );
}

export function distanciaM(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

// Distancia (m) de un punto a un segmento, con proyección equirectangular local.
export function distanciaPuntoSegmentoM(
  pLat: number,
  pLon: number,
  aLat: number,
  aLon: number,
  bLat: number,
  bLon: number
): { distM: number; lat: number; lon: number } {
  const lat0 = (pLat + aLat + bLat) / 3;
  const kx = 111320 * Math.cos((lat0 * Math.PI) / 180);
  const ky = 110540;
  const ax = aLon * kx;
  const ay = aLat * ky;
  const bx = bLon * kx;
  const by = bLat * ky;
  const px = pLon * kx;
  const py = pLat * ky;
  const dx = bx - ax;
  const dy = by - ay;
  const l2 = dx * dx + dy * dy;
  const t = l2 === 0 ? 0 : Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / l2));
  const cx = ax + t * dx;
  const cy = ay + t * dy;
  return { distM: Math.hypot(px - cx, py - cy), lat: cy / ky, lon: cx / kx };
}

const ABREVIATURAS: Array<[RegExp, string]> = [
  [/\bKR\.?A?(?=\s+\d)/g, "CARRERA"],
  [/\bCRA\.?(?=\s+\d)/g, "CARRERA"],
  [/\bCR\.?(?=\s+\d)/g, "CARRERA"],
  [/\bCLL\.?(?=\s+\d)/g, "CALLE"],
  [/\bCL\.?(?=\s+\d)/g, "CALLE"],
  [/\bAVE\.?(?=\s+\d)/g, "AVENIDA"],
  [/\bAV\.?(?=\s+\d)/g, "AVENIDA"],
  [/\bDG\.?(?=\s+\d)/g, "DIAGONAL"],
  [/\bTV\.?(?=\s+\d)/g, "TRANSVERSAL"],
  [/\bNO\.?(?=\s+\d)/g, "#"],
];

const COLA_ADMIN =
  /(?:,\s*)?(?:(?:SANTIAGO DE CALI|CALI|VALLE DEL CAUCA|COLOMBIA)\s*,?\s*)+\s*$/;

export function canonizarDireccionCO(raw?: string | null): string {
  if (!raw) return "";
  let s = raw.replace(/\r?\n/g, " ").replace(/\s+/g, " ").trim().toUpperCase();
  for (const [re, reemplazo] of ABREVIATURAS) {
    s = s.replace(re, reemplazo);
  }
  // "# 6 - 05" -> "#6-05" (con o sin vía previa); "N°" equivale a "#";
  // "# 37 01" (sin guion) -> "#37-01"
  s = s.replace(/N°/g, "#");
  s = s.replace(/#\s*(\d+[A-Z]?)\s*-\s*(\d+)/g, "#$1-$2");
  s = s.replace(/#\s*(\d+[A-Z]?)\s+(\d+)\b/g, "#$1-$2");
  s = s.replace(COLA_ADMIN, "").trim().replace(/[,\s]+$/g, "");
  if (/^(NO PROVISTO|NO DISPONIBLE|SIN DATO|N\/A|NA|SIN DIRECCION)$/.test(s)) {
    return "";
  }
  return s;
}

export interface DireccionParseada {
  via: string;
  numero: string;
  sufijo?: string;
  cruce: string;
  placa: string;
}

const DIR_REGEX =
  /^(CALLE|CARRERA|AVENIDA|DIAGONAL|TRANSVERSAL)\s+(\d+[A-Z]?)(?:\s+(NORTE|SUR|ESTE|OESTE))?\s*#\s*(\d+[A-Z]?)\s*-\s*(\d+)/;

export function parsearDireccionCO(canonica: string): DireccionParseada | null {
  const m = canonica.match(DIR_REGEX);
  if (!m) return null;
  return { via: m[1], numero: m[2], sufijo: m[3], cruce: m[4], placa: m[5] };
}

// Nombres OSM candidatos para la calle del cruce, en orden de intento.
// Si la vía lleva sufijo (NORTE/SUR/...), la transversal suele llevarlo también.
export function callesCruceCandidatas(parseada: DireccionParseada): string[] {
  const base =
    parseada.via === "CARRERA"
      ? [`CALLE ${parseada.cruce}`]
      : parseada.via === "CALLE"
        ? [`CARRERA ${parseada.cruce}`]
        : [`CALLE ${parseada.cruce}`, `CARRERA ${parseada.cruce}`];
  if (!parseada.sufijo) return base;
  const conSufijo = base.map((b) => `${b} ${parseada.sufijo}`);
  return [...conSufijo, ...base];
}

export function nombreViaOSM(parseada: DireccionParseada): string {
  return `${parseada.via} ${parseada.numero}${parseada.sufijo ? ` ${parseada.sufijo}` : ""}`;
}

// OSM usa tipo título ("Carrera 5"); el canónico va en mayúsculas.
export function aTitulo(mayusculas: string): string {
  return mayusculas
    .toLowerCase()
    .replace(/(?:^|\s)\S/g, (c) => c.toUpperCase());
}
