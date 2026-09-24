"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowUpDown,
  Database,
  DollarSign,
  ExternalLink,
  FileSpreadsheet,
  MapPin,
  MessageSquareText,
  RefreshCw,
  Search,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Stamp } from "@/components/Stamp";
import { ReportesButton } from "@/components/mapa/ReportesButton";
import { ReportesObraModal } from "@/components/mapa/ReportesObraModal";
import { formatCOP } from "@/lib/secop";
import type { ObraMarcador } from "@/components/mapa/mapa-types";
import { cn } from "@/lib/utils";

const UBICACIONES = [
  { id: "todas", label: "Todas" },
  { id: "ubicadas", label: "En el mapa" },
  { id: "sin_ubicar", label: "Sin ubicar" },
] as const;

type UbicacionSeleccion = (typeof UBICACIONES)[number]["id"];

export function SecopExplorer() {
  const [obras, setObras] = useState<ObraMarcador[]>([]);
  const [estados, setEstados] = useState<string[]>([]);
  const [isCargando, setIsCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [estadoFilter, setEstadoFilter] = useState<string>("todos");
  const [ubicacionFilter, setUbicacionFilter] = useState<UbicacionSeleccion>("todas");
  const [sortBy, setSortBy] = useState<"valor" | "fecha" | "reportes">("valor");

  const [reportesModalObra, setReportesModalObra] = useState<ObraMarcador | null>(null);

  const cargar = async () => {
    setIsCargando(true);
    setError(null);
    try {
      const res = await fetch("/api/mapa/obras?todas=1");
      if (!res.ok) throw new Error("La base local no respondió");
      const json = (await res.json()) as {
        success: boolean;
        data: ObraMarcador[];
        meta?: { filtros?: { estados?: string[] } };
        error?: string;
      };
      if (!json.success) throw new Error(json.error ?? "Error desconocido");
      setObras(json.data ?? []);
      const est = json.meta?.filtros?.estados ?? [];
      setEstados(est);
      setEstadoFilter((prev) => (est.includes(prev) ? prev : "todos"));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsCargando(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => void cargar(), 0);
    return () => clearTimeout(timer);
  }, []);

  const filtradas = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return obras
      .filter((o) => {
        if (ubicacionFilter === "ubicadas" && o.estadoUbicacion !== "resuelta") {
          return false;
        }
        if (ubicacionFilter === "sin_ubicar" && o.estadoUbicacion === "resuelta") {
          return false;
        }
        if (estadoFilter !== "todos" && o.estado !== estadoFilter) {
          return false;
        }
        if (q) {
          const target = [
            o.nombre,
            o.entidad,
            o.contratista,
            o.referencia,
            o.id,
            o.barrio,
            o.comuna,
            o.estado,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();
          if (!target.includes(q)) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "valor") return (b.valor ?? 0) - (a.valor ?? 0);
        if (sortBy === "fecha") {
          return (b.fechaInicio ?? "").localeCompare(a.fechaInicio ?? "");
        }
        return (b.reportes?.total ?? 0) - (a.reportes?.total ?? 0);
      });
  }, [obras, searchQuery, estadoFilter, ubicacionFilter, sortBy]);

  const stats = useMemo(() => {
    const total = filtradas.length;
    const totalValue = filtradas.reduce((sum, o) => sum + (o.valor ?? 0), 0);
    const conRetraso = filtradas.filter((o) => (o.reportes?.con_retraso ?? 0) > 0).length;
    const reportes = filtradas.reduce((sum, o) => sum + (o.reportes?.total ?? 0), 0);
    return { total, totalValue, conRetraso, reportes };
  }, [filtradas]);

  return (
    <div className="space-y-6">
      {/* Tira de fuente: base local de obras de Cali */}
      <div className="flex flex-col gap-3 border border-tinta/20 bg-ficha p-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center border border-sello/30 bg-accent/50 text-sello">
            <Database className="h-5 w-5" />
          </span>
          <div>
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-sello">
              Base local de obras · Santiago de Cali
            </p>
            <h2 className="font-display text-lg font-semibold text-tinta">
              Todas las obras públicas, tengan o no ubicación
            </h2>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => void cargar()}
          disabled={isCargando}
          className="text-xs gap-1.5"
        >
          <RefreshCw className={cn("h-3.5 w-3.5", isCargando && "animate-spin")} />
          {isCargando ? "Consultando..." : "Actualizar datos"}
        </Button>
      </div>

      {/* Cinta de cifras */}
      <dl className="grid grid-cols-2 gap-x-6 border-y-2 border-tinta/70 py-4 lg:grid-cols-4">
        <div>
          <dt className="flex items-center gap-1.5 text-xs text-tinta/60">
            <Database className="h-3.5 w-3.5" /> Obras listadas
          </dt>
          <dd className="mt-0.5 font-mono text-2xl font-bold tabular-nums text-tinta">
            {stats.total}
          </dd>
        </div>
        <div>
          <dt className="flex items-center gap-1.5 text-xs text-tinta/60">
            <DollarSign className="h-3.5 w-3.5" /> Valor sumado
          </dt>
          <dd className="mt-0.5 truncate font-mono text-xl font-bold tabular-nums text-tinta">
            {formatCOP(stats.totalValue)}
          </dd>
        </div>
        <div>
          <dt className="flex items-center gap-1.5 text-xs text-amber-800">
            <AlertTriangle className="h-3.5 w-3.5" /> Con retraso reportado
          </dt>
          <dd className="mt-0.5 font-mono text-2xl font-bold tabular-nums text-amber-800">
            {stats.conRetraso}
          </dd>
        </div>
        <div>
          <dt className="flex items-center gap-1.5 text-xs text-tinta/60">
            <ShieldCheck className="h-3.5 w-3.5" /> Reportes ciudadanos
          </dt>
          <dd className="mt-0.5 font-mono text-2xl font-bold tabular-nums text-tinta">
            {stats.reportes}
          </dd>
        </div>
      </dl>

      {/* Barra de filtros y búsqueda */}
      <div className="rounded-[4px] bg-ficha border border-tinta/20 p-4 space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-tinta/40" />
            <Input
              placeholder="Busca por obra, contratista, entidad, barrio o comuna…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 text-xs"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Estado SECOP */}
            <select
              value={estadoFilter}
              onChange={(e) => setEstadoFilter(e.target.value)}
              className="rounded-[3px] border border-tinta/20 bg-papel px-2 py-1.5 text-xs font-medium text-tinta focus:ring-0 cursor-pointer"
            >
              <option value="todos">Estado: todos</option>
              {estados.map((e) => (
                <option key={e} value={e}>
                  {e}
                </option>
              ))}
            </select>

            {/* Ubicación */}
            <div className="inline-flex rounded-[3px] border border-tinta/20 bg-papel p-0.5 text-xs">
              {UBICACIONES.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => setUbicacionFilter(u.id)}
                  className={`px-2.5 py-1 rounded-[2px] font-medium transition-colors ${
                    ubicacionFilter === u.id
                      ? "bg-tinta text-papel"
                      : "text-tinta/65"
                  }`}
                >
                  {u.label}
                </button>
              ))}
            </div>

            {/* Ordenamiento */}
            <div className="flex items-center gap-1 text-xs text-tinta/55">
              <ArrowUpDown className="h-3.5 w-3.5" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="bg-transparent border-0 text-tinta font-semibold focus:ring-0 text-xs cursor-pointer"
              >
                <option value="valor">Mayor valor</option>
                <option value="fecha">Más recientes</option>
                <option value="reportes">Más reportadas</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-[4px] border border-rose-700/30 bg-rose-50 px-4 py-3 text-xs text-rose-800">
          No se pudo cargar la base de obras: {error}
        </div>
      )}

      {/* Asientos de obras */}
      {isCargando && filtradas.length === 0 ? (
        <p className="rounded-[4px] border border-dashed border-tinta/30 bg-ficha p-12 text-center font-mono text-xs uppercase tracking-[0.12em] text-tinta/45">
          Cargando obras…
        </p>
      ) : filtradas.length === 0 ? (
        <div className="rounded-[4px] border border-dashed border-tinta/30 p-12 text-center bg-ficha">
          <FileSpreadsheet className="h-10 w-10 text-tinta/25 mx-auto mb-2" />
          <h3 className="font-display text-base font-semibold text-tinta">
            Sin resultados con estos filtros
          </h3>
          <p className="text-xs text-tinta/60 mt-1 max-w-sm mx-auto">
            Cambia el estado o la ubicación, o borra lo que escribiste en la
            búsqueda.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearchQuery("");
              setEstadoFilter("todos");
              setUbicacionFilter("todas");
            }}
            className="mt-4 text-xs"
          >
            Borrar filtros
          </Button>
        </div>
      ) : (
        <div className="border-t-2 border-tinta/70">
          {filtradas.map((obra) => {
            const reportes = obra.reportes;
            const ubicada = obra.estadoUbicacion === "resuelta";
            return (
              <article
                key={obra.id}
                className="grid gap-4 border-b border-tinta/15 py-5 lg:grid-cols-[1fr_280px] lg:gap-8"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="inline-flex items-center gap-1 font-semibold text-sello">
                      <MapPin className="h-3 w-3" />
                      Cali
                      {obra.barrio ? ` · ${obra.barrio}` : obra.comuna ? ` · ${obra.comuna}` : null}
                    </span>
                    <span className="font-mono text-[11px] text-tinta/45">
                      {obra.id}
                    </span>
                    <Stamp
                      tone={ubicada ? "verificado" : "neutro"}
                      className="ml-auto"
                    >
                      {ubicada ? "En el mapa" : "Sin ubicar"}
                    </Stamp>
                  </div>

                  <h3 className="mt-2 font-display text-lg font-semibold leading-snug text-tinta">
                    {obra.nombre ?? "Obra sin descripción"}
                  </h3>

                  <div className="mt-2 space-y-0.5 text-xs text-tinta/60">
                    <p className="truncate">
                      <span className="font-semibold text-tinta/80">Entidad:</span>{" "}
                      {obra.entidad ?? "—"}
                    </p>
                    <p className="truncate">
                      <span className="font-semibold text-tinta/80">Contratista:</span>{" "}
                      {obra.contratista ?? "—"}
                    </p>
                    <p>
                      <span className="font-semibold text-tinta/80">Valor:</span>{" "}
                      <span className="font-mono font-bold tabular-nums text-tinta">
                        {obra.valor !== null ? formatCOP(obra.valor) : "—"}
                      </span>
                    </p>
                    <p>
                      <span className="font-semibold text-tinta/80">Estado SECOP:</span>{" "}
                      {obra.estado ?? "—"}
                    </p>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <ReportesButton
                      total={reportes?.total ?? 0}
                      onClick={() => setReportesModalObra(obra)}
                    />
                    {obra.urlSecop ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs h-8 gap-1.5"
                        onClick={() => window.open(obra.urlSecop!, "_blank")}
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        SECOP
                      </Button>
                    ) : null}
                  </div>
                </div>

                <div className="space-y-2 border border-tinta/15 bg-papel p-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 font-semibold text-tinta/85">
                      <MessageSquareText className="h-3.5 w-3.5 text-green-800" />
                      Participación
                    </span>
                    <span className="font-mono font-bold tabular-nums text-tinta">
                      {reportes?.total ?? 0} reportes
                    </span>
                  </div>
                  {reportes?.promedio_calificacion !== null && reportes ? (
                    <p className="text-[11px] text-tinta/60">
                      Calificación promedio:{" "}
                      <span className="font-mono font-bold text-tinta">
                        {reportes.promedio_calificacion?.toFixed(1)} / 5
                      </span>
                    </p>
                  ) : null}
                  <div className="flex flex-wrap gap-1.5">
                    {reportes && reportes.en_ejecucion > 0 ? (
                      <Stamp tone="sello">En ejecución ×{reportes.en_ejecucion}</Stamp>
                    ) : null}
                    {reportes && reportes.con_retraso > 0 ? (
                      <Stamp tone="revision">Con retraso ×{reportes.con_retraso}</Stamp>
                    ) : null}
                    {reportes && reportes.paralizadas > 0 ? (
                      <Stamp tone="riesgo">Paralizada ×{reportes.paralizadas}</Stamp>
                    ) : null}
                  </div>
                  <p className="pt-1 text-[11px] leading-snug text-tinta/55">
                    {ubicada
                      ? "Esta obra está sobre el mapa interactivo."
                      : "Aún no logramos ubicarla sobre el mapa, pero los reportes funcionan igual."}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Ventana unificada de reportes (ver + crear) */}
      {reportesModalObra && (
        <ReportesObraModal
          obra={reportesModalObra}
          onClose={() => {
            setReportesModalObra(null);
            void cargar();
          }}
        />
      )}
    </div>
  );
}