export interface RespuestaFila {
  id: number;
  autor: string | null;
  texto: string;
  esOficial: boolean;
  fijada: boolean;
  fecha: string;
}

export interface ReporteFila {
  id: number;
  estadoTerreno: string | null;
  avanceObservado: number | null;
  calificacion: number | null;
  descripcion: string | null;
  foto: string | null;
  fecha: string;
  respuestas?: RespuestaFila[];
}

export interface ResumenReportes {
  total: number;
  promedio_calificacion: number | null;
  en_ejecucion: number;
  con_retraso: number;
  paralizadas: number;
}

export function formatearFecha(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function estadoTerrenoDato(
  estado: string | null
): {
  label: string;
  tone: "sello" | "revision" | "riesgo" | "neutro";
} {
  if (estado === "ejecucion") return { label: "En ejecución", tone: "sello" };
  if (estado === "retraso") return { label: "Con retraso", tone: "revision" };
  if (estado === "paralizada") return { label: "Paralizada", tone: "riesgo" };
  return { label: "Sin estado", tone: "neutro" };
}

export type NivelReputacion = "confiable" | "observado" | "critico" | "sin_datos";

const NIVEL_LABEL: Record<NivelReputacion, string> = {
  confiable: "Confiable",
  observado: "Observado",
  critico: "Crítico",
  sin_datos: "Sin datos",
};

export function nivelReputacionDato(
  nivel: NivelReputacion | null | undefined
): {
  label: string;
  tone: "verificado" | "revision" | "riesgo" | "neutro";
} {
  if (nivel === "confiable") return { label: NIVEL_LABEL.confiable, tone: "verificado" };
  if (nivel === "observado") return { label: NIVEL_LABEL.observado, tone: "revision" };
  if (nivel === "critico") return { label: NIVEL_LABEL.critico, tone: "riesgo" };
  return { label: NIVEL_LABEL.sin_datos, tone: "neutro" };
}