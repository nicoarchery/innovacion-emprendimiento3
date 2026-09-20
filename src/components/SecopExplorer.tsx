"use client";

import { useEffect, useState, useMemo } from "react";
import {
  AlertTriangle,
  ArrowUpDown,
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
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Stamp } from "@/components/Stamp";
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
      {/* Tira de fuente SECOP II */}
      <div className="flex flex-col gap-3 border border-tinta/20 bg-ficha p-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center border border-sello/30 bg-accent/50 text-sello">
            <Database className="h-5 w-5" />
          </span>
          <div>
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-sello">
              Datos de datos.gov.co
            </p>
            <h2 className="font-display text-lg font-semibold text-tinta">
              Contratos de obra pública a la vista
            </h2>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => loadContracts(selectedDept)}
          disabled={isLoading}
          className="text-xs gap-1.5"
        >
          <RefreshCw className={cn("h-3.5 w-3.5", isLoading && "animate-spin")} />
          {isLoading ? "Consultando..." : "Actualizar datos"}
        </Button>
      </div>

      {/* Cinta de cifras */}
      <dl className="grid grid-cols-2 gap-x-6 border-y-2 border-tinta/70 py-4 lg:grid-cols-4">
        <div>
          <dt className="flex items-center gap-1.5 text-xs text-tinta/60">
            <Layers className="h-3.5 w-3.5" /> Obras listadas
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
            <AlertTriangle className="h-3.5 w-3.5" /> Difieren más de 15%
          </dt>
          <dd className="mt-0.5 font-mono text-2xl font-bold tabular-nums text-amber-800">
            {stats.atRisk}
          </dd>
        </div>
        <div>
          <dt className="flex items-center gap-1.5 text-xs text-tinta/60">
            <ShieldCheck className="h-3.5 w-3.5" /> Reportes ciudadanos
          </dt>
          <dd className="mt-0.5 font-mono text-2xl font-bold tabular-nums text-tinta">
            {stats.totalVerifications}
          </dd>
        </div>
      </dl>

      {/* Barra de Filtros y Búsqueda */}
      <div className="rounded-[4px] bg-ficha border border-tinta/20 p-4 space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-tinta/40" />
            <Input
              placeholder="Busca por obra, contratista, entidad o municipio..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 text-xs"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Filtro por estado de riesgo */}
            <div className="inline-flex rounded-[3px] border border-tinta/20 bg-papel p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setStatusFilter("all")}
                className={`px-2.5 py-1 rounded-[2px] font-medium transition-colors ${
                  statusFilter === "all" ? "bg-tinta text-papel" : "text-tinta/65"
                }`}
              >
                Todas
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("atRisk")}
                className={`px-2.5 py-1 rounded-[2px] font-medium transition-colors ${
                  statusFilter === "atRisk" ? "bg-amber-100 text-amber-900" : "text-tinta/65"
                }`}
              >
                Requieren revisión
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("onTrack")}
                className={`px-2.5 py-1 rounded-[2px] font-medium transition-colors ${
                  statusFilter === "onTrack" ? "bg-green-100 text-green-900" : "text-tinta/65"
                }`}
              >
                Al día
              </button>
            </div>

            {/* Ordenamiento */}
            <div className="flex items-center gap-1 text-xs text-tinta/55">
              <ArrowUpDown className="h-3.5 w-3.5" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent border-0 text-tinta font-semibold focus:ring-0 text-xs cursor-pointer"
              >
                <option value="gap">Mayor diferencia</option>
                <option value="value">Mayor valor</option>
                <option value="date">Más recientes</option>
              </select>
            </div>
          </div>
        </div>

        {/* Departamentos */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-tinta/50 text-[11px] font-mono font-bold uppercase tracking-[0.1em] flex items-center gap-1 shrink-0 mr-1">
            <Filter className="h-3 w-3" /> Depto:
          </span>
          {DEPARTMENTS.map((dept) => (
            <button
              key={dept}
              onClick={() => setSelectedDept(dept)}
              className={`px-3 py-1 rounded-[2px] whitespace-nowrap transition-colors font-medium border ${
                selectedDept === dept
                  ? "bg-sello text-white border-sello"
                  : "bg-transparent hover:bg-accent/60 text-tinta/70 border-tinta/20"
              }`}
            >
              {dept}
            </button>
          ))}
        </div>
      </div>

      {/* Asientos de contratos */}
      {filteredProjects.length === 0 ? (
        <div className="rounded-[4px] border border-dashed border-tinta/30 p-12 text-center bg-ficha">
          <FileSpreadsheet className="h-10 w-10 text-tinta/25 mx-auto mb-2" />
          <h3 className="font-display text-base font-semibold text-tinta">
            Sin resultados con estos filtros
          </h3>
          <p className="text-xs text-tinta/60 mt-1 max-w-sm mx-auto">
            Cambia de departamento o borra lo que escribiste en la búsqueda.
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
            Borrar filtros
          </Button>
        </div>
      ) : (
        <div className="border-t-2 border-tinta/70">
          {filteredProjects.map((project) => (
            <article
              key={project.id}
              className="grid gap-4 border-b border-tinta/15 py-5 lg:grid-cols-[1fr_280px] lg:gap-8"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="inline-flex items-center gap-1 font-semibold text-sello">
                    <MapPin className="h-3 w-3" />
                    {project.municipality}, {project.department}
                  </span>
                  <span className="font-mono text-[11px] text-tinta/45">
                    {project.reference}
                  </span>
                  <Stamp
                    tone={project.atRisk ? "revision" : "verificado"}
                    className="ml-auto"
                  >
                    {project.atRisk
                      ? `Difiere ${project.gap}% · Revisión`
                      : `Difiere ${project.gap}% · Al día`}
                  </Stamp>
                </div>

                <h3 className="mt-2 font-display text-lg font-semibold leading-snug text-tinta">
                  {project.description}
                </h3>

                <div className="mt-2 space-y-0.5 text-xs text-tinta/60">
                  <p className="truncate">
                    <span className="font-semibold text-tinta/80">Entidad:</span> {project.entityName}
                  </p>
                  <p className="truncate">
                    <span className="font-semibold text-tinta/80">Contratista:</span>{" "}
                    {project.contractorName}
                  </p>
                  <p>
                    <span className="font-semibold text-tinta/80">Valor:</span>{" "}
                    <span className="font-mono font-bold tabular-nums text-tinta">
                      {formatCOP(project.contractValue)}
                    </span>
                  </p>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDetailsModalProject(project)}
                    className="text-xs h-8"
                  >
                    Ver ficha
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setVerifyModalProject(project)}
                    className="text-xs h-8"
                  >
                    Reportar avance
                  </Button>
                </div>
              </div>

              <div className="space-y-2 border border-tinta/15 bg-papel p-3">
                <div>
                  <div className="flex justify-between text-[11px] mb-0.5">
                    <span className="font-medium text-sello">SECOP II</span>
                    <span className="font-mono font-bold tabular-nums text-tinta">{project.secopPct}%</span>
                  </div>
                  <Progress value={project.secopPct} indicatorClassName="bg-sello" />
                </div>
                <div>
                  <div className="flex justify-between text-[11px] mb-0.5">
                    <span className={project.atRisk ? "text-amber-800 font-medium" : "text-green-800 font-medium"}>
                      Terreno
                    </span>
                    <span className="font-mono font-bold tabular-nums text-tinta">{project.fieldPct}%</span>
                  </div>
                  <Progress
                    value={project.fieldPct}
                    indicatorClassName={project.atRisk ? "bg-amber-600" : "bg-green-700"}
                  />
                </div>
              </div>
            </article>
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
