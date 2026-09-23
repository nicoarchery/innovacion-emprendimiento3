"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Clock,
  MessageSquareText,
  Plus,
  Star,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Stamp } from "@/components/Stamp";
import {
  estadoTerrenoDato,
  formatearFecha,
  type ReporteFila,
  type ResumenReportes,
} from "@/components/mapa/reportes-comunes";
import { ReporteCiudadanoModal } from "@/components/mapa/ReporteCiudadanoModal";
import type { ObraMarcador } from "@/components/mapa/mapa-types";

interface ReportesObraModalProps {
  obra: ObraMarcador;
  onClose: () => void;
}

const RESUMEN_VACIO: ResumenReportes = {
  total: 0,
  promedio_calificacion: null,
  con_retraso: 0,
  paralizadas: 0,
};

function BarrasCalificacion({ value }: { value: number | null }) {
  if (value === null) return <span className="text-xs text-tinta/45">Sin calificar</span>;
  return (
    <span className="inline-flex items-center gap-1">
      <span className="font-mono text-xs font-bold tabular-nums text-tinta">
        {value.toFixed(1)}
      </span>
      <span className="inline-flex">
        {[1, 2, 3, 4, 5].map((n) => (
          <Star
            key={n}
            className={`h-3 w-3 ${
              n <= Math.round(value)
                ? "fill-amber-400 text-amber-400"
                : "text-tinta/20"
            }`}
          />
        ))}
      </span>
    </span>
  );
}

export function ReportesObraModal({ obra, onClose }: ReportesObraModalProps) {
  const [reportes, setReportes] = useState<ReporteFila[]>([]);
  const [resumen, setResumen] = useState<ResumenReportes>(RESUMEN_VACIO);
  const [cargando, setCargando] = useState(true);
  const [crearAbierto, setCrearAbierto] = useState(false);

  const cargar = useCallback(async () => {
    try {
      const res = await fetch(`/api/mapa/obras/${obra.id}/reportes`);
      if (!res.ok) return;
      const json = (await res.json()) as {
        success: boolean;
        data: ReporteFila[];
        meta?: { resumen?: ResumenReportes };
      };
      if (json.success) {
        setReportes(json.data ?? []);
        if (json.meta?.resumen) setResumen(json.meta.resumen);
      }
    } finally {
      setCargando(false);
    }
  }, [obra.id]);

  useEffect(() => {
    const timer = setTimeout(() => void cargar(), 0);
    return () => clearTimeout(timer);
  }, [cargar]);

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="flex max-h-[85dvh] max-w-lg flex-col overflow-hidden sm:max-w-xl">
        <DialogHeader>
          <div className="flex items-center gap-2 text-sello">
            <MessageSquareText className="h-5 w-5" />
            <span className="text-xs font-bold uppercase tracking-wider">
              Reportes ciudadanos
            </span>
          </div>
          <DialogTitle className="line-clamp-2 text-xl font-bold leading-tight text-tinta">
            {obra.nombre ?? obra.entidad ?? "Obra sin descripción"}
          </DialogTitle>
          <DialogDescription className="text-sm text-tinta/65">
            Lo que ha registrado la comunidad sobre esta obra.
          </DialogDescription>
        </DialogHeader>

        {!cargando && (
          <div className="flex flex-wrap items-center gap-1.5 border-y border-tinta/10 bg-papel px-5 py-2.5 text-xs">
            <Stamp tone="neutro">{resumen.total} reportes</Stamp>
            {resumen.promedio_calificacion !== null ? (
              <Stamp tone="verificado">
                {resumen.promedio_calificacion.toFixed(1)} / 5
              </Stamp>
            ) : null}
            {resumen.con_retraso > 0 ? (
              <Stamp tone="revision">Con retraso ×{resumen.con_retraso}</Stamp>
            ) : null}
            {resumen.paralizadas > 0 ? (
              <Stamp tone="riesgo">Paralizada ×{resumen.paralizadas}</Stamp>
            ) : null}
          </div>
        )}

        <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
          {cargando ? (
            <p className="py-6 text-center font-mono text-xs uppercase tracking-[0.12em] text-tinta/45">
              Cargando reportes…
            </p>
          ) : reportes.length === 0 ? (
            <div className="rounded-[4px] border border-dashed border-tinta/25 bg-papel p-6 text-center">
              <MessageSquareText className="mx-auto h-8 w-8 text-tinta/25" />
              <p className="mt-2 text-sm font-semibold text-tinta/80">
                Aún no hay reportes para esta obra
              </p>
              <p className="mt-1 text-xs text-tinta/55">
                Sé la primera voz del barrio: reporta cómo va su gestión.
              </p>
            </div>
          ) : (
            reportes.map((r) => (
              <article
                key={r.id}
                className="rounded-[4px] border border-tinta/15 bg-ficha p-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1 font-mono text-[11px] text-tinta/55">
                    <Clock className="h-3 w-3" />
                    {formatearFecha(r.fecha)}
                  </span>
                  <Stamp tone={estadoTerrenoDato(r.estadoTerreno).tone}>
                    {estadoTerrenoDato(r.estadoTerreno).label}
                  </Stamp>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                  <span className="text-tinta/60">
                    Avance observado:{" "}
                    <strong className="font-mono font-bold text-tinta">
                      {r.avanceObservado === null ? "—" : `${r.avanceObservado}%`}
                    </strong>
                  </span>
                  <BarrasCalificacion value={r.calificacion} />
                </div>
                {r.foto ? (
                  <img
                    src={r.foto}
                    alt={r.descripcion ?? "Foto del reporte ciudadano"}
                    className="mt-2 max-h-52 w-full rounded-[4px] border border-tinta/15 object-cover"
                  />
                ) : null}
                {r.descripcion ? (
                  <p className="mt-2 text-[13px] leading-relaxed text-tinta/85">
                    {r.descripcion}
                  </p>
                ) : null}
              </article>
            ))
          )}
        </div>

        <DialogFooter className="gap-2 border-t border-tinta/10 px-5 py-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="text-xs"
          >
            Cerrar
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() => setCrearAbierto(true)}
            className="gap-1.5 bg-primary text-primary-foreground hover:bg-tinta/90 text-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            Reportar esta obra
          </Button>
        </DialogFooter>
      </DialogContent>

      {crearAbierto && (
        <ReporteCiudadanoModal
          obra={obra}
          onClose={() => setCrearAbierto(false)}
          onEnviado={() => void cargar()}
        />
      )}
    </Dialog>
  );
}