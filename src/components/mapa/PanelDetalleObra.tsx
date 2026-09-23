"use client";

import { useCallback, useEffect, useState } from "react";
import {
  MessageSquareText,
  Star,
  X,
  MapPin,
  FileText,
  Compass,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCOP } from "@/lib/secop";
import { ReportesObraModal } from "@/components/mapa/ReportesObraModal";
import { ReportesButton } from "@/components/mapa/ReportesButton";
import type { ObraMarcador } from "@/components/mapa/mapa-types";
import type { ResumenReportes } from "@/components/mapa/reportes-comunes";

interface PanelDetalleObraProps {
  obra: ObraMarcador;
  onCerrar: () => void;
}

function confianzaLabel(c: string | null): string {
  if (c === "alta") return "Alta";
  if (c === "media") return "Media";
  if (c === "baja") return "Baja";
  return "Sin dato";
}

function fuenteLabel(fuente: string | null): string {
  if (fuente === "nominatim") return "OpenStreetMap, desde la dirección SECOP";
  if (fuente === "photon") return "Photon/OSM, desde la dirección SECOP";
  if (fuente === "texto-contrato") return "Dirección citada en el objeto del contrato";
  if (fuente === "barrio-objeto") return "Barrio citado en el objeto del contrato";
  if (fuente === "cache-ubicaciones") return "Misma dirección de otra obra ya ubicada";
  if (fuente === "overpass-interseccion") return "Cruce de vías calculado en OpenStreetMap";
  return fuente ?? "Sin dato";
}

export function PanelDetalleObra({ obra, onCerrar }: PanelDetalleObraProps) {
  const [listadoAbierto, setListadoAbierto] = useState(false);
  const [resumen, setResumen] = useState<ResumenReportes>(
    obra.reportes ?? {
      total: 0,
      promedio_calificacion: null,
      con_retraso: 0,
      paralizadas: 0,
    }
  );

  const cargarResumen = useCallback(async () => {
    try {
      const res = await fetch(`/api/mapa/obras/${obra.id}/reportes`);
      if (!res.ok) return;
      const json = (await res.json()) as {
        success: boolean;
        meta?: { resumen?: ResumenReportes };
      };
      if (json.success && json.meta?.resumen) setResumen(json.meta.resumen);
    } catch {
      // El resumen es informativo; no bloquear el panel si falla.
    }
  }, [obra.id]);

  useEffect(() => {
    const timer = setTimeout(() => void cargarResumen(), 0);
    return () => clearTimeout(timer);
  }, [cargarResumen, obra.id]);

  const coordenadas =
    obra.lat !== null && obra.lon !== null
      ? `${obra.lat.toFixed(5)}, ${obra.lon.toFixed(5)}`
      : "No determinadas";

  return (
    <div className="absolute right-3 top-3 z-[1000] flex max-h-[calc(100%-1.5rem)] w-[22rem] max-w-[calc(100%-1.5rem)] flex-col overflow-hidden rounded-[4px] border border-tinta/25 bg-ficha shadow-xl">
      <div className="flex items-start justify-between gap-2 border-b border-tinta/15 px-4 py-3">
        <h3 className="line-clamp-2 font-display text-base font-semibold leading-snug text-tinta">
          {obra.nombre ?? "Obra sin descripción"}
        </h3>
        <Button
          variant="ghost"
          size="icon"
          className="-mr-2 -mt-1 h-8 w-8 shrink-0"
          onClick={onCerrar}
          aria-label="Cerrar panel"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-3 overflow-y-auto px-4 py-3">
        <section>
          <h4 className="mb-1.5 flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-sello">
            <FileText className="h-3.5 w-3.5" /> Registro SECOP
          </h4>
          <dl className="space-y-1 text-[13px]">
            <div>
              <dt className="text-[11px] text-tinta/50">Entidad</dt>
              <dd className="font-medium text-tinta">{obra.entidad ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-[11px] text-tinta/50">Contratista</dt>
              <dd className="text-tinta/80">{obra.contratista ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-[11px] text-tinta/50">Valor</dt>
              <dd className="font-mono font-bold tabular-nums text-tinta">
                {obra.valor !== null ? formatCOP(obra.valor) : "—"}
              </dd>
            </div>
            <div>
              <dt className="text-[11px] text-tinta/50">Estado</dt>
              <dd>{obra.estado ?? "—"}</dd>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <dt className="text-[11px] text-tinta/50">Inicio</dt>
                <dd>{obra.fechaInicio ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-[11px] text-tinta/50">Fin</dt>
                <dd>{obra.fechaFin ?? "—"}</dd>
              </div>
            </div>
            <div>
              <dt className="text-[11px] text-tinta/50">Contrato</dt>
              <dd className="font-mono text-xs text-tinta/60">{obra.id}</dd>
            </div>
          </dl>
          {obra.urlSecop ? (
            <a
              href={obra.urlSecop}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-sello underline-offset-4 hover:underline"
            >
              Ver en SECOP <ExternalLink className="h-3 w-3" />
            </a>
          ) : null}
        </section>

        <section className="border border-green-800/25 bg-green-50/70 p-3">
          <h4 className="mb-1.5 flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-green-900">
            <MessageSquareText className="h-3.5 w-3.5" /> Participación ciudadana
          </h4>
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <ReportesButton
              total={resumen.total}
              onClick={() => setListadoAbierto(true)}
            />
            {resumen.promedio_calificacion !== null ? (
              <span className="inline-flex items-center gap-1 rounded border border-green-800/25 bg-white px-2 py-0.5 font-semibold text-green-900">
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                {resumen.promedio_calificacion.toFixed(1)}
              </span>
            ) : null}
            {resumen.con_retraso > 0 ? (
              <span className="rounded border border-amber-700/30 bg-amber-50 px-2 py-0.5 font-semibold text-amber-800">
                {resumen.con_retraso} con retraso
              </span>
            ) : null}
            {resumen.paralizadas > 0 ? (
              <span className="rounded border border-rose-700/30 bg-rose-50 px-2 py-0.5 font-semibold text-rose-800">
                {resumen.paralizadas} paralizadas
              </span>
            ) : null}
          </div>
        </section>

        <section className="border border-amber-700/30 bg-amber-50/70 p-3">
          <h4 className="mb-1.5 flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-amber-800">
            <MapPin className="h-3.5 w-3.5" /> Ubicación calculada
          </h4>
          <dl className="space-y-1 text-[13px]">
            <div>
              <dt className="text-[11px] text-tinta/50">Dirección SECOP</dt>
              <dd className="text-tinta/85">{obra.direccion ?? "SECOP no la publica"}</dd>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <dt className="text-[11px] text-tinta/50">Barrio</dt>
                <dd>{obra.barrio ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-[11px] text-tinta/50">Comuna</dt>
                <dd>{obra.comuna ?? "—"}</dd>
              </div>
            </div>
            <div>
              <dt className="text-[11px] text-tinta/50">Coordenadas</dt>
              <dd className="font-mono text-xs tabular-nums text-tinta/80">{coordenadas}</dd>
            </div>
            <div>
              <dt className="text-[11px] text-tinta/50">Cómo se ubicó</dt>
              <dd className="text-xs text-tinta/70">{fuenteLabel(obra.geoFuente)}</dd>
            </div>
            <div>
              <dt className="text-[11px] text-tinta/50">Confianza</dt>
              <dd className="font-semibold text-tinta">{confianzaLabel(obra.geoConfianza)}</dd>
            </div>
          </dl>
          <p className="mt-2 flex items-start gap-1 text-[11px] leading-snug text-amber-800/80">
            <Compass className="mt-0.5 h-3 w-3 shrink-0" />
            Coordenada aproximada. SECOP no publica coordenadas; la calculamos
            con OpenStreetMap. Confírmala en terreno.
          </p>
        </section>
      </div>

      {listadoAbierto && (
        <ReportesObraModal
          obra={obra}
          onClose={() => {
            setListadoAbierto(false);
            void cargarResumen();
          }}
        />
      )}
    </div>
  );
}