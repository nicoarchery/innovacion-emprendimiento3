"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AlertTriangle,
  Building2,
  RefreshCw,
  ShieldCheck,
  Star,
  TrendingDown,
} from "lucide-react";
import { Stamp } from "@/components/Stamp";
import { NivelReputacionBadge } from "@/components/mapa/NivelReputacionBadge";
import { formatCOP } from "@/lib/secop";
import { useToast } from "@/hooks/use-toast";
import type { NivelReputacion } from "@/components/mapa/reportes-comunes";

type OrdenRanking = "score" | "reportes" | "valor";

export interface ContratistaRanking {
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

const ORDENES: { id: OrdenRanking; label: string }[] = [
  { id: "score", label: "Mejor score" },
  { id: "reportes", label: "Más reportadas" },
  { id: "valor", label: "Mayor valor" },
];

function formatoRating(value: number | null): string {
  if (value === null) return "—";
  return value.toFixed(1);
}

export function RankingContratistas() {
  const { toast } = useToast();
  const [orden, setOrden] = useState<OrdenRanking>("score");
  const [data, setData] = useState<ContratistaRanking[]>([]);
  const [meta, setMeta] = useState<{
    totalContratistas: number;
    conNivel: number;
    sinDatosReportados: number;
  } | null>(null);
  const [cargando, setCargando] = useState(true);
  const [sembrando, setSembrando] = useState(false);

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const res = await fetch(`/api/mapa/ranking?orden=${orden}`);
      if (!res.ok) throw new Error("El ranking no respondió");
      const json = (await res.json()) as {
        success: boolean;
        data: ContratistaRanking[];
        meta?: typeof meta;
        error?: string;
      };
      if (!json.success) throw new Error(json.error ?? "Error desconocido");
      setData(json.data ?? []);
      setMeta(json.meta ?? null);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "No se pudo cargar el ranking",
        description: (error as Error).message,
      });
    } finally {
      setCargando(false);
    }
  }, [orden, toast]);

  useEffect(() => {
    const timer = setTimeout(() => void cargar(), 0);
    return () => clearTimeout(timer);
  }, [cargar]);

  const sembrarDemo = async () => {
    setSembrando(true);
    try {
      const res = await fetch("/api/mapa/ranking", { method: "POST" });
      const json = (await res.json()) as { success: boolean; sembrados?: number; error?: string };
      if (!res.ok || !json.success) throw new Error(json.error ?? "Error");
      toast({
        title: "Datos demo sembrados",
        description: `${json.sembrados ?? 0} contratistas con reportes de prueba.`,
      });
      await cargar();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "No se pudo sembrar el demo",
        description: (error as Error).message,
      });
    } finally {
      setSembrando(false);
    }
  };

  return (
    <section className="rounded-[4px] border border-tinta/20 bg-ficha p-4 sm:p-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center border border-sello/30 bg-accent/50 text-sello">
            <ShieldCheck className="h-5 w-5" />
          </span>
          <div>
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-sello">
              Ranking · Reputación de contratistas
            </p>
            <h3 className="font-display text-lg font-semibold text-tinta">
              ¿Quién está cumpliendo con su obra?
            </h3>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={orden}
            onChange={(e) => setOrden(e.target.value as OrdenRanking)}
            className="rounded-[3px] border border-tinta/20 bg-papel px-2 py-1.5 text-xs font-medium text-tinta focus:ring-0 cursor-pointer"
          >
            {ORDENES.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => void sembrarDemo()}
            disabled={sembrando}
            className="inline-flex items-center gap-1.5 rounded-[3px] border border-amber-700/40 bg-amber-50 px-2.5 py-1.5 text-xs font-medium text-amber-800 transition-colors hover:bg-amber-100 disabled:opacity-60"
            title="Siembra reportes demo para pruebas (acta pública)."
          >
            <TrendingDown className="h-3.5 w-3.5" />
            {sembrando ? "Sembrando…" : "Sembrar demo"}
          </button>
          <button
            type="button"
            onClick={() => void cargar()}
            disabled={cargando}
            className="inline-flex items-center gap-1.5 rounded-[3px] border border-tinta/20 bg-papel px-2.5 py-1.5 text-xs font-medium text-tinta transition-colors hover:bg-white disabled:opacity-60"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${cargando ? "animate-spin" : ""}`} />
            Actualizar
          </button>
        </div>
      </div>

      {meta && (
        <p className="mt-3 text-[11px] leading-snug text-tinta/55">
          {meta.totalContratistas} contratistas en la base · {meta.conNivel} con
          reputación calculada (≥3 reportes) · {meta.sinDatosReportados} sin datos
          suficientes.
        </p>
      )}

      <div className="mt-4">
        {cargando ? (
          <p className="rounded-[4px] border border-dashed border-tinta/30 bg-papel p-8 text-center font-mono text-xs uppercase tracking-[0.12em] text-tinta/45">
            Calculando reputación…
          </p>
        ) : data.length === 0 ? (
          <div className="rounded-[4px] border border-dashed border-tinta/30 bg-papel p-8 text-center">
            <Building2 className="mx-auto h-8 w-8 text-tinta/25" />
            <p className="mt-2 text-xs text-tinta/60">
              Aún no hay reportes para calcular reputación. Prueba el botón
              &quot;Sembrar demo&quot; para ver el ranking con datos de ejemplo.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-tinta/10">
            {data.map((r, i) => (
              <li key={r.contratista} className="grid gap-2 py-3 sm:grid-cols-[2rem_1fr_auto] sm:items-center">
                <span className="font-mono text-sm font-bold tabular-nums text-tinta/40">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="truncate font-display text-sm font-semibold text-tinta">
                      {r.contratista}
                    </h4>
                    <NivelReputacionBadge nivel={r.nivel} />
                    {r.nivel === "critico" ? (
                      <Stamp tone="riesgo" className="ml-auto sm:ml-0">
                        <AlertTriangle className="h-3 w-3" /> En observación
                      </Stamp>
                    ) : null}
                  </div>
                  <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-tinta/55">
                    <span className="inline-flex items-center gap-1">
                      <Star className="h-3 w-3 text-amber-500" />
                      {formatoRating(r.promedio_calificacion)} / 5
                    </span>
                    <span>{r.n_obras} obras</span>
                    <span>{r.n_reportes} reportes</span>
                    {r.con_retraso > 0 ? (
                      <span className="text-amber-800">{r.con_retraso} con retraso</span>
                    ) : null}
                    {r.paralizadas > 0 ? (
                      <span className="text-red-700">{r.paralizadas} paralizadas</span>
                    ) : null}
                    <span>{r.valor_concesionado !== null ? formatCOP(r.valor_concesionado) : "—"}</span>
                  </div>
                </div>
                <div className="text-right sm:w-16">
                  {r.score !== null ? (
                    <span className="font-mono text-2xl font-bold tabular-nums text-tinta">
                      {r.score.toFixed(1)}
                    </span>
                  ) : (
                    <span className="font-mono text-lg font-semibold text-tinta/30">—</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}