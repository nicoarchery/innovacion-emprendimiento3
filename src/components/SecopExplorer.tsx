"use client";

import { useEffect, useState, useMemo } from "react";
import {
  AlertTriangle,
  ArrowUpDown,
  Building2,
  CheckCircle2,
  Database,
  DollarSign,
  FileSpreadsheet,
  Filter,
  Layers,
  MapPin,
  RefreshCw,
  Search,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { CitizenVerificationModal } from "@/components/CitizenVerificationModal";
import { ProjectDetailsModal } from "@/components/ProjectDetailsModal";
import { formatCOP, SEED_PROJECTS, type ContractProject } from "@/lib/secop";
import { cn } from "@/lib/utils";

const DEPARTMENTS = [
  "Todos",
  "Cesar",
  "Meta",
  "Atlántico",
  "Antioquia",
  "Valle del Cauca",
  "Córdoba",
] as const;

export function SecopExplorer() {
  const [projects, setProjects] = useState<ContractProject[]>(SEED_PROJECTS);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDept, setSelectedDept] = useState<string>("Todos");
  const [statusFilter, setStatusFilter] = useState<"all" | "atRisk" | "onTrack">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"gap" | "value" | "date">("gap");

  const [verifyModalProject, setVerifyModalProject] = useState<ContractProject | null>(null);
  const [detailsModalProject, setDetailsModalProject] = useState<ContractProject | null>(null);

  const loadContracts = async (dept?: string) => {
    setIsLoading(true);
    try {
      const url = new URL("/api/secop", window.location.origin);
      if (dept && dept !== "Todos") {
        url.searchParams.set("department", dept);
      }
      url.searchParams.set("limit", "18");

      const res = await fetch(url.toString());
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setProjects(json.data);
        }
      }
    } catch (err) {
      console.warn("Fallo cargando de /api/secop, usando dataset local:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadContracts(selectedDept);
  }, [selectedDept]);

  const handleProjectVerified = (updated: ContractProject) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === updated.id ? updated : p))
    );
  };

  const filteredProjects = useMemo(() => {
    return projects
      .filter((p) => {
        if (selectedDept !== "Todos" && p.department.toLowerCase() !== selectedDept.toLowerCase()) {
          return false;
        }
        if (statusFilter === "atRisk" && !p.atRisk) {
          return false;
        }
        if (statusFilter === "onTrack" && p.atRisk) {
          return false;
        }
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const match =
            p.description.toLowerCase().includes(q) ||
            p.entityName.toLowerCase().includes(q) ||
            p.contractorName.toLowerCase().includes(q) ||
            p.reference.toLowerCase().includes(q) ||
            p.municipality.toLowerCase().includes(q);
          if (!match) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "gap") return b.gap - a.gap;
        if (sortBy === "value") return b.contractValue - a.contractValue;
        return new Date(b.signDate).getTime() - new Date(a.signDate).getTime();
      });
  }, [projects, selectedDept, statusFilter, searchQuery, sortBy]);

  // Indicadores Agregados
  const stats = useMemo(() => {
    const total = filteredProjects.length;
    const atRisk = filteredProjects.filter((p) => p.atRisk).length;
    const totalValue = filteredProjects.reduce((sum, p) => sum + p.contractValue, 0);
    const totalVerifications = filteredProjects.reduce((sum, p) => sum + p.verifiedCount, 0);
    return { total, atRisk, totalValue, totalVerifications };
  }, [filteredProjects]);

  return (
    <div className="space-y-6">
      {/* Top Banner de Conectividad SECOP II */}
      <div className="rounded-xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-4 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 shrink-0">
            <Database className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Sincronización en Vivo
              </span>
              <span className="text-xs text-slate-400">
                Portal Datos Abiertos Colombia (SODA API)
              </span>
            </div>
            <h2 className="text-base font-bold text-white mt-0.5">
              Auditoría y Trazabilidad de Contratos de Obra Pública
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadContracts(selectedDept)}
            disabled={isLoading}
            className="border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs gap-1.5"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", isLoading && "animate-spin")} />
            {isLoading ? "Consultando..." : "Actualizar SECOP II"}
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="border-slate-200 shadow-xs">
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
              <span>Obras Auditadas</span>
              <Layers className="h-4 w-4 text-indigo-600" />
            </div>
            <div className="text-2xl font-black text-slate-900 mt-1">
              {stats.total}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {selectedDept === "Todos" ? "Todo el territorio" : `Departamento: ${selectedDept}`}
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-xs">
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
              <span>Inversión Rastreada</span>
              <DollarSign className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="text-xl font-black text-emerald-700 mt-1 truncate">
              {formatCOP(stats.totalValue)}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Fondos de obras y OxI
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-xs">
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
              <span>Alertas de Brecha (&gt;15%)</span>
              <AlertTriangle className="h-4 w-4 text-amber-600" />
            </div>
            <div className="text-2xl font-black text-amber-700 mt-1">
              {stats.atRisk}
            </div>
            <p className="text-[11px] text-amber-600 font-medium mt-0.5">
              Requieren intervención en campo
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-xs">
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
              <span>Validaciones Comunitarias</span>
              <ShieldCheck className="h-4 w-4 text-indigo-600" />
            </div>
            <div className="text-2xl font-black text-slate-900 mt-1">
              {stats.totalVerifications}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Evidencias ciudadanas y JAC
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="rounded-xl bg-white border border-slate-200 p-4 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Buscar por objeto, contratista, alcaldía o municipio..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 text-xs"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Filtro por estado de riesgo */}
            <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setStatusFilter("all")}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  statusFilter === "all" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600"
                }`}
              >
                Todas
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("atRisk")}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  statusFilter === "atRisk" ? "bg-amber-100 text-amber-900 shadow-xs" : "text-slate-600"
                }`}
              >
                Con Alerta (&gt;15%)
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("onTrack")}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  statusFilter === "onTrack" ? "bg-emerald-100 text-emerald-900 shadow-xs" : "text-slate-600"
                }`}
              >
                En Línea
              </button>
            </div>

            {/* Ordenamiento */}
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <ArrowUpDown className="h-3.5 w-3.5" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent border-0 text-slate-700 font-semibold focus:ring-0 text-xs cursor-pointer"
              >
                <option value="gap">Mayor Brecha</option>
                <option value="value">Mayor Presupuesto</option>
                <option value="date">Más Recientes</option>
              </select>
            </div>
          </div>
        </div>

        {/* Chips de Departamentos */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-400 text-[11px] font-medium flex items-center gap-1 shrink-0 mr-1">
            <Filter className="h-3 w-3" /> Depto:
          </span>
          {DEPARTMENTS.map((dept) => (
            <button
              key={dept}
              onClick={() => setSelectedDept(dept)}
              className={`px-3 py-1 rounded-full whitespace-nowrap transition-all font-medium ${
                selectedDept === dept
                  ? "bg-indigo-600 text-white shadow-xs font-semibold"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700"
              }`}
            >
              {dept}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de Proyectos / Contratos */}
      {filteredProjects.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 p-12 text-center bg-white">
          <FileSpreadsheet className="h-10 w-10 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-slate-800">
            No se encontraron contratos con los filtros aplicados
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Prueba cambiando el departamento o limpiando los términos en la barra de búsqueda.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedDept("Todos");
              setSearchQuery("");
              setStatusFilter("all");
            }}
            className="mt-4 text-xs"
          >
            Restablecer Filtros
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((project) => (
            <Card
              key={project.id}
              className={`flex flex-col justify-between border transition-all hover:shadow-md ${
                project.atRisk ? "border-amber-200 bg-white" : "border-slate-200 bg-white"
              }`}
            >
              <CardContent className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  {/* Tags de Ubicación y Tipo */}
                  <div className="flex items-center justify-between gap-1 mb-2 text-xs">
                    <span className="font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-1 border border-emerald-200">
                      <MapPin className="h-3 w-3 text-emerald-600" />
                      {project.municipality}, {project.department}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400 truncate max-w-[130px]">
                      {project.reference}
                    </span>
                  </div>

                  {/* Descripción del Objeto */}
                  <h3 className="text-sm font-bold text-slate-900 line-clamp-2 leading-snug">
                    {project.description}
                  </h3>

                  {/* Entidad y Contratista */}
                  <div className="mt-2 text-[11px] text-slate-500 space-y-0.5">
                    <p className="truncate">
                      <span className="font-medium text-slate-700">Entidad:</span> {project.entityName}
                    </p>
                    <p className="truncate">
                      <span className="font-medium text-slate-700">Contratista:</span>{" "}
                      {project.contractorName}
                    </p>
                  </div>
                </div>

                {/* Presupuesto y Motor de Brecha */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Valor Contrato:</span>
                    <span className="font-extrabold text-slate-900">
                      {formatCOP(project.contractValue)}
                    </span>
                  </div>

                  {/* Barras de Progreso Dual */}
                  <div className="space-y-1.5">
                    <div>
                      <div className="flex justify-between text-[11px] mb-0.5">
                        <span className="text-indigo-700 font-medium">SECOP II (Pagos)</span>
                        <span className="font-bold text-slate-700">{project.secopPct}%</span>
                      </div>
                      <Progress value={project.secopPct} indicatorClassName="bg-indigo-600" />
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] mb-0.5">
                        <span className={project.atRisk ? "text-amber-700 font-medium" : "text-emerald-700 font-medium"}>
                          Evidencia Campo
                        </span>
                        <span className="font-bold text-slate-700">{project.fieldPct}%</span>
                      </div>
                      <Progress
                        value={project.fieldPct}
                        indicatorClassName={project.atRisk ? "bg-amber-500" : "bg-emerald-600"}
                      />
                    </div>
                  </div>

                  {/* Badge de Brecha */}
                  <div
                    className={cn(
                      "w-full rounded-md py-1 px-2 text-center text-xs font-semibold flex items-center justify-center gap-1.5",
                      project.atRisk
                        ? "bg-amber-50 text-amber-800 border border-amber-200"
                        : "bg-emerald-50 text-emerald-800 border border-emerald-200"
                    )}
                  >
                    {project.atRisk ? (
                      <>
                        <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                        Brecha del {project.gap}% · Alerta Territorial
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                        Brecha del {project.gap}% · Ejecución en Línea
                      </>
                    )}
                  </div>

                  {/* Botones de Acción */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDetailsModalProject(project)}
                      className="text-xs h-8"
                    >
                      Ficha &amp; ESG
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => setVerifyModalProject(project)}
                      className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs h-8"
                    >
                      Auditar Obra
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modales */}
      <CitizenVerificationModal
        project={verifyModalProject}
        isOpen={!!verifyModalProject}
        onClose={() => setVerifyModalProject(null)}
        onSuccess={handleProjectVerified}
      />

      <ProjectDetailsModal
        project={detailsModalProject}
        isOpen={!!detailsModalProject}
        onClose={() => setDetailsModalProject(null)}
        onOpenVerify={() => {
          if (detailsModalProject) {
            setVerifyModalProject(detailsModalProject);
          }
        }}
      />
    </div>
  );
}
