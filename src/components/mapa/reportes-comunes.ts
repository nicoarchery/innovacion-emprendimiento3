export interface ReporteFila {
  id: number;
  estadoTerreno: string | null;
  avanceObservado: number | null;
  calificacion: number | null;
  descripcion: string | null;
  foto: string | null;
  fecha: string;
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