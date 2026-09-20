"use client";

import {
  Building2,
  Calendar,
  DollarSign,
  Download,
  ExternalLink,
  FileCheck2,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Stamp } from "@/components/Stamp";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { formatCOP, type ContractProject } from "@/lib/secop";

interface ProjectDetailsModalProps {
  project: ContractProject | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenVerify: () => void;
}

export function ProjectDetailsModal({
  project,
  isOpen,
  onClose,
  onOpenVerify,
}: ProjectDetailsModalProps) {
  const { toast } = useToast();

  if (!project) return null;

  const estimatedBeneficiaries = Math.round((project.contractValue / 1000000) * 1.8);
  const estimatedJobs = Math.max(12, Math.round(project.contractValue / 85000000));

  const handleDownloadPdf = () => {
    toast({
      title: "Ficha en preparación",
      description: `Reunimos contrato, avance y reportes del contrato ${project.reference} en un PDF.`,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <Stamp tone="sello">SECOP II · {project.contractType}</Stamp>
            {project.bpin && (
              <span className="rounded-[2px] border border-tinta/20 bg-papel px-2 py-0.5 font-mono text-tinta/75">
                BPIN: {project.bpin}
              </span>
            )}
            <Stamp
              tone={project.atRisk ? "revision" : "verificado"}
              className="ml-auto"
            >
              {project.atRisk ? `Difiere ${project.gap}%` : "Al día"}
            </Stamp>
          </div>

          <DialogTitle className="mt-2 font-display text-xl text-tinta">
            {project.reference}
          </DialogTitle>
          <DialogDescription className="text-sm text-tinta/65">
            {project.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Ficha del contrato */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-[4px] border border-tinta/20 p-3 bg-papel space-y-2 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-tinta/85">
                <Building2 className="h-4 w-4 text-sello" />
                <span>Entidad y contratista</span>
              </div>
              <div>
                <p className="text-tinta/55">Entidad:</p>
                <p className="font-semibold text-tinta">{project.entityName}</p>
                <p className="text-[11px] text-tinta/55">NIT: {project.entityNit}</p>
              </div>
              <div className="pt-1 border-t border-tinta/20">
                <p className="text-tinta/55">Contratista:</p>
                <p className="font-semibold text-tinta">{project.contractorName}</p>
                <p className="text-[11px] text-tinta/55">Doc: {project.contractorDoc}</p>
              </div>
            </div>

            <div className="rounded-[4px] border border-tinta/20 p-3 bg-papel space-y-2 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-tinta/85">
                <DollarSign className="h-4 w-4 text-green-700" />
                <span>Valor y plazos</span>
              </div>
              <div>
                <p className="text-tinta/55">Valor adjudicado:</p>
                <p className="font-mono text-base font-bold tabular-nums text-tinta">
                  {formatCOP(project.contractValue)}
                </p>
              </div>
              <div className="pt-1 border-t border-tinta/20 grid grid-cols-2 gap-2">
                <div>
                  <p className="text-tinta/55">Firma:</p>
                  <p className="font-medium text-tinta/85 flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-tinta/40" />
                    {project.signDate}
                  </p>
                </div>
                <div>
                  <p className="text-tinta/55">Entrega prevista:</p>
                  <p className="font-medium text-tinta/85 flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-tinta/40" />
                    {project.endDate}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Comparativa SECOP II frente a terreno */}
          <div className="rounded-[4px] border border-tinta/20 p-4 bg-white">
            <h4 className="text-xs font-bold uppercase tracking-wider text-tinta/75 mb-3 flex items-center gap-1.5">
              <FileCheck2 className="h-4 w-4 text-sello" />
              SECOP II frente a terreno
            </h4>

            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-3 bg-accent/50 rounded-[4px] border border-sello/20">
                <span className="text-xs text-sello font-medium block">
                  Registro SECOP II
                </span>
                <span className="mt-1 block font-mono text-2xl font-bold tabular-nums text-sello">
                  {project.secopPct}%
                </span>
                <span className="text-[11px] text-sello">Avance contractual</span>
              </div>

              <div
                className={`p-3 rounded-[4px] border ${
                  project.atRisk
                    ? "bg-amber-50/70 border-amber-200"
                    : "bg-green-50/60 border-green-700/20"
                }`}
              >
                <span
                  className={`text-xs font-medium block ${
                    project.atRisk ? "text-amber-800" : "text-green-800"
                  }`}
                >
                  Avance en terreno
                </span>
                <span
                  className={`mt-1 block font-mono text-2xl font-bold tabular-nums ${
                    project.atRisk ? "text-amber-700" : "text-green-800"
                  }`}
                >
                  {project.fieldPct}%
                </span>
                <span
                  className={`text-[11px] ${
                    project.atRisk ? "text-amber-600" : "text-green-700"
                  }`}
                >
                  {project.verifiedCount} reportes ciudadanos
                </span>
              </div>
            </div>

            {project.lastReportObservation && (
              <div className="mt-3 text-xs bg-papel p-2.5 rounded border border-tinta/20">
                <span className="font-semibold text-tinta/85 block">
                  Último reporte ciudadano ({project.lastReportDate || "reciente"}):
                </span>
                <p className="text-tinta/65 italic mt-0.5">
                  &ldquo;{project.lastReportObservation}&rdquo;
                </p>
              </div>
            )}
          </div>

          {/* Alcance estimado */}
          <div className="rounded-[4px] border border-tinta/20 p-3.5 bg-papel">
            <h4 className="text-xs font-bold text-tinta/85 mb-2 flex items-center gap-1.5">
              <Users className="h-4 w-4 text-green-700" />
              Alcance estimado de la obra
            </h4>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-white p-2 rounded border border-tinta/20">
                <span className="text-[11px] text-tinta/55 block">Cobertura aprox.</span>
                <span className="font-bold text-tinta/85">
                  +{estimatedBeneficiaries.toLocaleString("es-CO")} hab.
                </span>
              </div>
              <div className="bg-white p-2 rounded border border-tinta/20">
                <span className="text-[11px] text-tinta/55 block">Empleo aprox.</span>
                <span className="font-bold text-tinta/85">~{estimatedJobs} puestos</span>
              </div>
              <div className="bg-white p-2 rounded border border-tinta/20">
                <span className="text-[11px] text-tinta/55 block">Ubicación</span>
                <span className="font-bold text-tinta/85 truncate block">
                  {project.municipality}
                </span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="pt-3 gap-2 flex-col sm:flex-row justify-between">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleDownloadPdf}
            className="gap-1.5 text-xs"
          >
            <Download className="h-3.5 w-3.5" />
            Descargar ficha (PDF)
          </Button>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                window.open(
                  `https://www.datos.gov.co/resource/6qex-kahp.json?$limit=5&departamento=${encodeURIComponent(
                    project.department
                  )}`,
                  "_blank"
                )
              }
              className="text-xs gap-1"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Ver en datos.gov.co
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => {
                onClose();
                onOpenVerify();
              }}
              className="bg-primary text-primary-foreground hover:bg-tinta/90 text-xs"
            >
              Reportar avance
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
