"use client";

import { useCallback, useEffect, useState } from "react";
import L from "leaflet";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import "leaflet.markercluster";
import { RefreshCw, MapPinned, Database } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { formatCOP } from "@/lib/secop";
import { FiltrosMapa } from "@/components/mapa/FiltrosMapa";
import { PanelDetalleObra } from "@/components/mapa/PanelDetalleObra";
import type {
  FiltrosMapaUI,
  ObraMarcador,
  RespuestaActualizar,
  RespuestaObras,
} from "@/components/mapa/mapa-types";

const CENTRO_CALI: [number, number] = [3.4516, -76.532];

const FILTROS_INICIALES: FiltrosMapaUI = {
  estado: "todos",
  entidad: "todos",
  minValor: "",
  maxValor: "",
  fecha: "todos",
};

function colorEstado(estado: string | null): string {
  const e = (estado ?? "").toLowerCase();
  if (e.includes("ejecuci") || e.includes("aprobado")) return "#047857";
  if (e.includes("terminado") || e.includes("liquidado")) return "#475569";
  return "#d97706";
}

function pinHtml(color: string): string {
  return `<div style="width:22px;height:22px;border-radius:9999px;background:${color};border:2.5px solid #ffffff;box-shadow:0 1px 5px rgba(15,23,42,.45);display:flex;align-items:center;justify-content:center"><span style="width:5px;height:5px;border-radius:9999px;background:#ffffff"></span></div>`;
}

function estadoClaseEstado(estado: string | null): { label: string; clase: string } {
  const e = (estado ?? "").toLowerCase();
  if (e.includes("ejecuci") || e.includes("aprobado"))
    return { label: "En ejecución", clase: "bg-emerald-100 text-emerald-800" };
  if (e.includes("terminado") || e.includes("liquidado"))
    return { label: "Terminada", clase: "bg-slate-200 text-slate-700" };
  return { label: estado ?? "Otro", clase: "bg-amber-100 text-amber-800" };
}

function CapaMarcadores({
  obras,
  onSeleccionar,
}: {
  obras: ObraMarcador[];
  onSeleccionar: (obra: ObraMarcador) => void;
}) {
  const map = useMap();

  useEffect(() => {
    const grupo = L.markerClusterGroup({
      showCoverageOnHover: false,
      maxClusterRadius: 48,
      spiderfyOnMaxZoom: true,
    });
    const marcadores = obras.flatMap((obra) => {
      if (obra.lat === null || obra.lon === null) return [];
      const icono = L.divIcon({
        className: "",
        html: pinHtml(colorEstado(obra.estado)),
        iconSize: [22, 22],
        iconAnchor: [11, 11],
      });
      const marcador = L.marker([obra.lat, obra.lon], { icon: icono });
      marcador.bindTooltip(`<strong>${obra.entidad ?? "Obra"}</strong><br/>${obra.valor !== null ? formatCOP(obra.valor) : ""}`, {
        direction: "top",
        opacity: 0.95,
      });
      marcador.on("click", () => onSeleccionar(obra));
      return [marcador];
    });
    grupo.addLayers(marcadores);
    map.addLayer(grupo);
    return () => {
      map.removeLayer(grupo);
    };
  }, [map, obras, onSeleccionar]);

  return null;
}

function formatearFecha(iso: string | null): string {
  if (!iso) return "Nunca";
  return new Date(iso).toLocaleString("es-CO", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function MapaCali() {
  const { toast } = useToast();
  const [obras, setObras] = useState<ObraMarcador[]>([]);
  const [meta, setMeta] = useState<RespuestaObras["meta"] | null>(null);
  const [filtros, setFiltros] = useState<FiltrosMapaUI>(FILTROS_INICIALES);
  const [seleccionada, setSeleccionada] = useState<ObraMarcador | null>(null);
  const [cargando, setCargando] = useState(true);
  const [sincronizando, setSincronizando] = useState(false);

  const cargar = useCallback(async (f: FiltrosMapaUI) => {
    setCargando(true);
    try {
      const params = new URLSearchParams();
      if (f.estado && f.estado !== "todos") params.set("estado", f.estado);
      if (f.entidad && f.entidad !== "todos") params.set("entidad", f.entidad);
      if (f.minValor) params.set("minValor", f.minValor);
      if (f.maxValor) params.set("maxValor", f.maxValor);
      if (f.fecha && f.fecha !== "todos") params.set("fecha", f.fecha);

      const res = await fetch(`/api/mapa/obras${params.toString() ? `?${params.toString()}` : ""}`);
      if (!res.ok) throw new Error("Respuesta no válida del servidor");
      const json: RespuestaObras = await res.json();
      setObras(json.data);
      setMeta(json.meta);
      setSeleccionada(null);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error al cargar obras",
        description: (error as Error).message,
      });
    } finally {
      setCargando(false);
    }
  }, [toast]);

  useEffect(() => {
    const timer = setTimeout(() => void cargar(FILTROS_INICIALES), 0);
    return () => clearTimeout(timer);
  }, [cargar]);

  const onSeleccionar = useCallback((obra: ObraMarcador) => {
    setSeleccionada(obra);
  }, []);

  const onAplicarFiltros = useCallback(() => {
    void cargar(filtros);
  }, [cargar, filtros]);

  const onLimpiarFiltros = useCallback(() => {
    setFiltros(FILTROS_INICIALES);
    void cargar(FILTROS_INICIALES);
  }, [cargar]);

  const actualizarMapa = useCallback(async () => {
    if (sincronizando) return;
    setSincronizando(true);
    try {
      const res = await fetch("/api/mapa/actualizar", { method: "POST" });
      const json: RespuestaActualizar = await res.json();
      if (!res.ok || !json.success) {
        toast({
          variant: "destructive",
          title: "No se pudo actualizar el mapa",
          description: json.error ?? "Error desconocido",
        });
        } else {
          const r = json.resultado;
          if (r) {
            toast({
              title: "Mapa actualizado",
              description: `${r.nuevas} nuevas · ${r.actualizadas} actualizadas · ${r.geocodificadas} ubicadas · ${r.sin_ubicacion} sin dirección útil`,
            });
          }
        if (json.ultimaSync) {
          setMeta((m) => (m ? { ...m, ultimaSync: json.ultimaSync ?? null } : m));
        }
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error de red al actualizar",
        description: (error as Error).message,
      });
    } finally {
      setSincronizando(false);
      void cargar(FILTROS_INICIALES);
    }
  }, [cargar, sincronizando, toast]);

  const totales = meta?.totales;
  const ultimaSync = meta?.ultimaSync;

  return (
    <div className="flex-1 flex flex-col">
      {/* Encabezado */}
      <div className="mx-auto w-full max-w-[1400px] px-4 pt-6 sm:px-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-xl font-bold text-slate-900">
              <MapPinned className="h-5 w-5 text-emerald-700" />
              Obras de Cali en un mapa
            </h1>
            <p className="mt-0.5 max-w-2xl text-sm text-slate-500">
              Contratos SECOP II por estado, entidad, valor y año. La dirección
              viene de SECOP II y la coordenada es aproximada.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {totales && (
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                <span className="rounded-full bg-emerald-50 px-2.5 py-1 font-semibold text-emerald-800">
                  {totales.resueltas} ubicadas
                </span>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 font-medium text-slate-600">
                  {totales.pendientes} por ubicar
                </span>
                <span className="rounded-full bg-amber-50 px-2.5 py-1 font-medium text-amber-800">
                  {totales.sin_ubicacion} sin dirección útil
                </span>
              </div>
            )}
            <Button onClick={actualizarMapa} disabled={sincronizando}>
              {sincronizando ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Actualizar mapa
            </Button>
          </div>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
          <span className="inline-flex items-center gap-1">
            <Database className="h-3.5 w-3.5" /> Copia local de SECOP II
          </span>
          <span>Actualizado: {formatearFecha(ultimaSync?.finished_at ?? null)}</span>
          {ultimaSync && (
            <span>
              {ultimaSync.nuevas} nuevas · {ultimaSync.actualizadas} actualizadas
            </span>
          )}
        </div>
      </div>

      {/* Filtros */}
      <div className="mx-auto w-full max-w-[1400px] px-4 py-4 sm:px-6">
        <FiltrosMapa
          filtros={filtros}
          estados={meta?.filtros.estados ?? []}
          entidades={meta?.filtros.entidades ?? []}
          onCambio={setFiltros}
          onAplicar={onAplicarFiltros}
          onLimpiar={onLimpiarFiltros}
        />
      </div>

      {/* Mapa */}
      <div className="mx-auto w-full max-w-[1400px] flex-1 px-4 pb-6 sm:px-6">
        <div className="relative h-[calc(100dvh-19rem)] min-h-[480px] overflow-hidden rounded-xl border border-slate-300 shadow-sm">
          {cargando && (
            <div className="absolute inset-0 z-[1100] flex items-center justify-center bg-slate-50/80 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                <RefreshCw className="h-4 w-4 animate-spin" /> Cargando obras…
              </div>
            </div>
          )}

          {!cargando && obras.length === 0 && (
            <div className="absolute inset-0 z-[1100] flex flex-col items-center justify-center gap-3 bg-slate-50/90 px-6 text-center">
              <MapPinned className="h-10 w-10 text-slate-300" />
              <p className="max-w-md text-sm text-slate-600">
                Sin obras ubicadas con estos filtros. Pulsa{" "}
                <strong>Actualizar mapa</strong> para traer contratos de SECOP
                y ubicar sus direcciones.
              </p>
              <Button onClick={actualizarMapa} disabled={sincronizando}>
                <RefreshCw className={`h-4 w-4 ${sincronizando ? "animate-spin" : ""}`} />
                Actualizar mapa
              </Button>
            </div>
          )}

          <MapContainer
            center={CENTRO_CALI}
            zoom={12}
            scrollWheelZoom
            zoomControl
            className="h-full w-full"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <CapaMarcadores obras={obras} onSeleccionar={onSeleccionar} />
          </MapContainer>

          {seleccionada && (
            <PanelDetalleObra obra={seleccionada} onCerrar={() => setSeleccionada(null)} />
          )}
        </div>

        {/* Leyenda */}
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
          <span className="font-medium text-slate-600">Leyenda:</span>
          {["En ejecución", "Terminada", "Otras"].map((tipo) => {
            const color =
              tipo === "En ejecución" ? "#047857" : tipo === "Terminada" ? "#475569" : "#d97706";
            const { label, clase } = estadoClaseEstado(
              tipo === "Otras" ? "Otro" : tipo === "En ejecución" ? "En ejecución" : "Terminado"
            );
            return (
              <span key={tipo} className="inline-flex items-center gap-1.5">
                <span
                  className="h-3 w-3 rounded-full border-2 border-white shadow"
                  style={{ backgroundColor: color }}
                />
                <span className={clase}>{label}</span>
              </span>
            );
          })}
          <span className="ml-auto text-slate-400">Base © OpenStreetMap · Ubicaciones aproximadas</span>
        </div>
      </div>
    </div>
  );
}