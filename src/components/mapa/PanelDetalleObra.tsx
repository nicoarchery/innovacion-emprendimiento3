import { X, MapPin, FileText, Compass, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCOP } from "@/lib/secop";
import type { ObraMarcador } from "@/components/mapa/mapa-types";

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
  if (fuente === "nominatim") return "Geocodificación OSM / Nominatim (dirección de SECOP)";
  if (fuente === "photon") return "Geocodificación Photon/OSM";
  if (fuente === "texto-contrato") return "Dirección detectada en el objeto del contrato (SECOP)";
  if (fuente === "barrio-objeto") return "Barrio detectado en el objeto del contrato (SECOP)";
  if (fuente === "cache-ubicaciones") return "Coordenadas cacheadas de otra obra con la misma dirección";
  return fuente ?? "Sin dato";
}

export function PanelDetalleObra({ obra, onCerrar }: PanelDetalleObraProps) {
  const coordenadas =
    obra.lat !== null && obra.lon !== null
      ? `${obra.lat.toFixed(5)}, ${obra.lon.toFixed(5)}`
      : "No determinadas";

  return (
    <div className="absolute right-3 top-3 z-[1000] flex max-h-[calc(100%-1.5rem)] w-[22rem] max-w-[calc(100%-1.5rem)] flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
      <div className="flex items-start justify-between gap-2 border-b border-slate-100 px-4 py-3">
        <h3 className="line-clamp-2 text-sm font-bold leading-snug text-slate-900">
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
          <h4 className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-indigo-700">
            <FileText className="h-3.5 w-3.5" /> Información SECOP
          </h4>
          <dl className="space-y-1 text-[13px]">
            <div>
              <dt className="text-[11px] font-medium text-slate-400">Entidad</dt>
              <dd className="font-medium text-slate-800">{obra.entidad ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-[11px] font-medium text-slate-400">Contratista</dt>
              <dd className="text-slate-700">{obra.contratista ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-[11px] font-medium text-slate-400">Valor</dt>
              <dd className="font-semibold text-slate-900">
                {obra.valor !== null ? formatCOP(obra.valor) : "—"}
              </dd>
            </div>
            <div>
              <dt className="text-[11px] font-medium text-slate-400">Estado</dt>
              <dd>{obra.estado ?? "—"}</dd>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <dt className="text-[11px] font-medium text-slate-400">Inicio</dt>
                <dd>{obra.fechaInicio ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-[11px] font-medium text-slate-400">Fin</dt>
                <dd>{obra.fechaFin ?? "—"}</dd>
              </div>
            </div>
            <div>
              <dt className="text-[11px] font-medium text-slate-400">Contrato SECOP</dt>
              <dd className="text-xs text-slate-500">{obra.id}</dd>
            </div>
          </dl>
          {obra.urlSecop ? (
            <a
              href={obra.urlSecop}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-indigo-700 hover:underline"
            >
              Ver registro en SECOP <ExternalLink className="h-3 w-3" />
            </a>
          ) : null}
        </section>

        <section className="rounded-lg bg-amber-50/60 p-3 ring-1 ring-amber-100">
          <h4 className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-amber-800">
            <MapPin className="h-3.5 w-3.5" /> Ubicación (procesada por la app)
          </h4>
          <dl className="space-y-1 text-[13px]">
            <div>
              <dt className="text-[11px] font-medium text-slate-400">Dirección</dt>
              <dd className="text-slate-800">{obra.direccion ?? "No disponible en SECOP"}</dd>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <dt className="text-[11px] font-medium text-slate-400">Barrio</dt>
                <dd>{obra.barrio ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-[11px] font-medium text-slate-400">Comuna</dt>
                <dd>{obra.comuna ?? "—"}</dd>
              </div>
            </div>
            <div>
              <dt className="text-[11px] font-medium text-slate-400">Coordenadas</dt>
              <dd className="font-mono text-xs text-slate-700">{coordenadas}</dd>
            </div>
            <div>
              <dt className="text-[11px] font-medium text-slate-400">Fuente de ubicación</dt>
              <dd className="text-xs text-slate-600">{fuenteLabel(obra.geoFuente)}</dd>
            </div>
            <div>
              <dt className="text-[11px] font-medium text-slate-400">Confianza</dt>
              <dd className="font-semibold text-slate-800">{confianzaLabel(obra.geoConfianza)}</dd>
            </div>
          </dl>
          <p className="mt-2 flex items-start gap-1 text-[11px] leading-snug text-amber-800/80">
            <Compass className="mt-0.5 h-3 w-3 shrink-0" />
            Coordenadas generadas por geocodificación (OSM), no son oficiales ni aportadas por
            SECOP; pueden tener imprecisión.
          </p>
        </section>
      </div>
    </div>
  );
}