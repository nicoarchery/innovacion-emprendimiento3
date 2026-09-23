"use client";

import { useCallback, useEffect, useState } from "react";
import { Camera, ChevronDown, ChevronUp, Clock, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Stamp } from "@/components/Stamp";
import {
  estadoTerrenoDato,
  formatearFecha,
  type ReporteFila,
} from "@/components/mapa/reportes-comunes";
import type { ObraMarcador } from "@/components/mapa/mapa-types";

interface LineaTiempoObraProps {
  obra: ObraMarcador;
  abierta: boolean;
  onAlternar: () => void;
}

export function LineaTiempoObra({
  obra,
  abierta,
  onAlternar,
}: LineaTiempoObraProps) {
  const [reportes, setReportes] = useState<ReporteFila[]>([]);
  const [cargando, setCargando] = useState(true);

  const cargar = useCallback(async () => {
    try {
      const res = await fetch(`/api/mapa/obras/${obra.id}/reportes`);
      if (!res.ok) return;
      const json = (await res.json()) as {
        success: boolean;
        data: ReporteFila[];
      };
      if (json.success) setReportes(json.data ?? []);
    } finally {
      setCargando(false);
    }
  }, [obra.id]);

  useEffect(() => {
    const timer = setTimeout(() => void cargar(), 0);
    return () => clearTimeout(timer);
  }, [cargar]);

  const conFotos = reportes.filter((r) => r.foto);

  return (
    <>
      {!abierta ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onAlternar}
          className="absolute bottom-3 left-1/2 z-[1100] -translate-x-1/2 gap-2 border-tinta/25 bg-ficha px-3 py-1.5 shadow-lg hover:border-sello/50 hover:bg-green-50"
        >
          <Camera className="h-4 w-4 text-sello" />
          <span className="font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-tinta">
            Fotos de la obra
          </span>
          <ChevronUp className="h-3.5 w-3.5 text-tinta/50" />
        </Button>
      ) : (
        <div className="absolute inset-x-0 bottom-0 z-[1100] flex max-h-[45%] flex-col overflow-hidden border-t border-tinta/25 bg-ficha shadow-2xl">
          <div className="flex items-center justify-between gap-2 border-b border-tinta/15 px-4 py-2.5">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onAlternar}
              aria-label="Contraer línea de tiempo"
              className="h-8 w-8"
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2">
              <Camera className="h-4 w-4 text-sello" />
              <span className="font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-sello">
                Línea de tiempo
              </span>
              <Stamp tone="neutro">
                {conFotos.length} {conFotos.length === 1 ? "foto" : "fotos"}
              </Stamp>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onAlternar}
              aria-label="Cerrar línea de tiempo"
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-4">
            {cargando ? (
              <p className="py-6 text-center font-mono text-xs uppercase tracking-[0.12em] text-tinta/45">
                Cargando fotos…
              </p>
            ) : conFotos.length === 0 ? (
              <div className="rounded-[4px] border border-dashed border-tinta/25 bg-papel p-6 text-center">
                <Camera className="mx-auto h-8 w-8 text-tinta/25" />
                <p className="mt-2 text-sm font-semibold text-tinta/80">
                  Esta obra aún no tiene fotos de la comunidad
                </p>
                <p className="mt-1 text-xs text-tinta/55">
                  Los reportes con fotografía aparecerán aquí como línea de tiempo.
                </p>
              </div>
            ) : (
              <ol className="relative ml-2 space-y-6 border-l-2 border-tinta/10 pl-5">
                {conFotos.map((r) => {
                  const estado = estadoTerrenoDato(r.estadoTerreno);
                  return (
                    <li key={r.id} className="relative">
                      <span
                        className="absolute -left-[26px] top-4 h-3 w-3 rounded-full border-2 bg-ficha"
                        style={{
                          borderColor:
                            estado.tone === "riesgo"
                              ? "#b91c1c"
                              : estado.tone === "revision"
                                ? "#b45309"
                                : "var(--sello, #166534)",
                        }}
                      />
                      {r.foto ? (
                        <img
                          src={r.foto}
                          alt={r.descripcion ?? "Foto del reporte ciudadano"}
                          className="max-h-56 w-full rounded-[4px] border border-tinta/15 object-cover"
                        />
                      ) : null}
                      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                        <span className="inline-flex items-center gap-1 font-mono text-[11px] text-tinta/55">
                          <Clock className="h-3 w-3" />
                          {formatearFecha(r.fecha)}
                        </span>
                        <Stamp tone={estado.tone}>{estado.label}</Stamp>
                        {r.avanceObservado !== null ? (
                          <span className="text-tinta/60">
                            Avance:{" "}
                            <strong className="font-mono text-tinta">
                              {r.avanceObservado}%
                            </strong>
                          </span>
                        ) : null}
                      </div>
                      {r.descripcion ? (
                        <p className="mt-1.5 text-[13px] leading-relaxed text-tinta/85">
                          {r.descripcion}
                        </p>
                      ) : null}
                    </li>
                  );
                })}
              </ol>
            )}
          </div>
        </div>
      )}
    </>
  );
}