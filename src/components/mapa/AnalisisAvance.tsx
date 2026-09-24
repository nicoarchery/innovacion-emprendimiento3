"use client";

import { AlertTriangle, Info, TrendingUp } from "lucide-react";
import type { ObraMarcador } from "@/components/mapa/mapa-types";
import { cn } from "@/lib/utils";

interface AnalisisAvanceProps {
  obra: ObraMarcador;
  compact?: boolean;
  className?: string;
}

/**
 * Análisis de avance: compara lo que SECOP reporta como avance financiero
 * (N1) contra el avance físico que la gente reporta en campo (N3).
 * - `sin_datos`: falta N1 (source no publica avance financiero) o N3.
 * - `normal`: |N1 − N3| <= 15.
 * - `alerta`: |N1 − N3| > 15 (riesgo territorial).
 */
export function AnalisisAvance({ obra, compact, className }: AnalisisAvanceProps) {
  const { avanceSecop, avanceCampo, brecha, estadoBrecha } = obra;

  return (
    <section
      className={cn(
        "rounded-[4px] border p-3",
        estadoBrecha === "alerta"
          ? "border-rose-700/30 bg-rose-50/70"
          : "border-tinta/15 bg-papel",
        className
      )}
    >
      <h4
        className={cn(
          "mb-2 flex items-center gap-1.5 font-mono font-bold uppercase tracking-[0.12em]",
          estadoBrecha === "alerta" ? "text-rose-800" : "text-tinta/70"
        )}
      >
        {estadoBrecha === "alerta" ? (
          <AlertTriangle className="h-3.5 w-3.5" />
        ) : (
          <TrendingUp className="h-3.5 w-3.5" />
        )}
        Análisis de avance
      </h4>

      {estadoBrecha === "sin_datos" ? (
        <p className="text-[11px] leading-snug text-tinta/55">
          No hay con qué comparar todavía: SECOP no publica avance financiero
          para esta obra o aún no hay reportes con porcentaje de avance en
          campo.
        </p>
      ) : (
        <div className="space-y-2">
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-semibold text-tinta/80">SECOP (financiero)</span>
              <span className="font-mono font-bold tabular-nums text-tinta">
                {avanceSecop !== null ? `${avanceSecop}%` : "—"}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-tinta/10">
              <div
                className="h-full rounded-full bg-green-800/80 transition-all"
                style={{ width: `${Math.max(0, Math.min(100, avanceSecop ?? 0))}%` }}
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-semibold text-tinta/80">Campo (vecinos)</span>
              <span className="font-mono font-bold tabular-nums text-tinta">
                {avanceCampo !== null ? `${avanceCampo}%` : "—"}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-tinta/10">
              <div
                className="h-full rounded-full bg-amber-700/90 transition-all"
                style={{ width: `${Math.max(0, Math.min(100, avanceCampo ?? 0))}%` }}
              />
            </div>
          </div>

          <p
            className={cn(
              "text-[11px] font-semibold",
              estadoBrecha === "alerta" ? "text-rose-800" : "text-green-800"
            )}
          >
            {estadoBrecha === "alerta"
              ? `⚠ Brecha de ${brecha} puntos — avance oficial y real no coinciden.`
              : `Sin alerta · brecha de ${brecha} puntos (límite 15).`}
          </p>
        </div>
      )}

      {!compact ? (
        <details className="mt-2">
          <summary className="flex cursor-pointer items-center gap-1 text-[11px] font-semibold text-tinta/60 hover:text-tinta">
            <Info className="h-3 w-3" /> ¿Cómo se lee esta comparación?
          </summary>
          <p className="mt-1 space-y-1 text-[11px] leading-snug text-tinta/60">
            <span className="block">
              <span className="font-semibold text-tinta/75">SECOP</span> reporta el{" "}
              <em>avance financiero</em>: cuánta plata del contrato se ha
              ejecutado y pagado. <span className="font-semibold text-tinta/75">Campo</span> es lo
              que los vecinos reportan como <em>avance físico</em> de la obra.
            </span>
            <span className="block">
              Si la plata avanza pero la obra no se ve (SECOP alto, campo bajo),
              hay señal de riesgo. Si la obra avanza pero la plata no
              (campo alto, SECOP bajo), hay desfinanciamiento.
            </span>
            <span className="block">
              Una diferencia mayor a 15 puntos activa la alerta de brecha.
            </span>
          </p>
        </details>
      ) : null}
    </section>
  );
}