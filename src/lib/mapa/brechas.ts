export type EstadoBrecha = "sin_datos" | "normal" | "alerta";

export const UMBRAL_BRECHA = 15;

export interface BrechaResultado {
  avanceSecop: number | null;
  avanceCampo: number | null;
  gap: number | null;
  estado: EstadoBrecha;
  umbral: number;
}

function redondear(pct: number): number {
  return Math.round(pct * 10) / 10;
}

/**
 * N1 — avance financiero que SECOP reporta.
 * (% de ejecución = 1 − valor_pendiente_de_ejecucion / valor_del_contrato)
 * Devuelve null cuando no hay datos fiables (valor nulo, o el espejo de datos
 * no trajo valor_pendiente_de_ejecucion), nunca una cifra inventada.
 */
export function calcularN1(
  valor: number | null | undefined,
  valorPendienteEjecucion: number | null | undefined
): number | null {
  if (!valor || valor <= 0) return null;
  if (valorPendienteEjecucion === null || valorPendienteEjecucion === undefined) return null;
  const pend = Math.max(0, Math.min(valor, valorPendienteEjecucion));
  return redondear((1 - pend / valor) * 100);
}

/**
 * N3 — avance físico promedio reportado por la gente en campo.
 */
export function calcularN3(avances: Array<number | null | undefined>): number | null {
  const validos = avances.filter(
    (a): a is number => typeof a === "number" && a >= 0 && a <= 100
  );
  if (validos.length === 0) return null;
  return redondear(validos.reduce((s, a) => s + a, 0) / validos.length);
}

/**
 * Evalúa la brecha |N1 − N3| contra el umbral.
 * - `sin_datos`: falta N1 o N3 → nunca alerta.
 * - `normal`: hay ambos y |gap| <= umbral.
 * - `alerta`: hay ambos y |gap| > umbral.
 */
export function evaluarBrecha(
  n1: number | null,
  n3: number | null,
  umbral = UMBRAL_BRECHA
): BrechaResultado {
  let estado: EstadoBrecha = "sin_datos";
  let gap: number | null = null;
  if (n1 !== null && n3 !== null) {
    gap = redondear(Math.abs(n1 - n3));
    estado = gap > umbral ? "alerta" : "normal";
  }
  return { avanceSecop: n1, avanceCampo: n3, gap, estado, umbral };
}